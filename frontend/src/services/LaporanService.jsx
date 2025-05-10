// src/services/LaporanService.js

// URL dasar API (Pastikan VITE_API_URL terdefinisi di .env Anda)
const API_URL = import.meta.env.VITE_API_URL || "/api/"; // Menambahkan fallback

// Helper function untuk menangani response error dari fetch
async function handleFetchError(response) {
  let errorData = { message: `Request failed with status ${response.status}` };
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      errorData = await response.json();
    } else {
      // Coba baca sebagai teks jika bukan JSON
      const textError = await response.text();
      // Berikan pesan yang lebih informatif jika ada HTML error (seperti halaman 404 default)
      if (textError && textError.toLowerCase().includes("<html")) {
        errorData.message = `Server error ${response.status} (HTML response). Check backend route/logic.`;
      } else if (textError) {
        errorData.message = textError;
      }
    }
  } catch (e) {
    console.warn("Could not parse error response body:", e);
  }

  if (response.status === 404) {
    throw new Error(
      errorData.message || "Endpoint atau data tidak ditemukan (404)."
    );
  }
  throw new Error(errorData.message || `Operasi gagal (${response.status})`);
}

// Fungsi untuk mengambil semua data laporan tersimpan
export const fetchLaporan = async () => {
  try {
    const response = await fetch(`${API_URL}laporan`);
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Laporan:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data laporan tersimpan berdasarkan ID
export const fetchLaporanById = async (id) => {
  try {
    if (!id || id === "undefined")
      throw new Error("ID Laporan tidak valid untuk fetch.");
    const response = await fetch(`${API_URL}laporan/${id}`);
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Laporan by ID:", error);
    throw error;
  }
};

// Fungsi untuk membuat entri data laporan baru (permintaan laporan)
export const createLaporan = async (data) => {
  try {
    const response = await fetch(`${API_URL}laporan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error creating Laporan:", error);
    throw error;
  }
};

// Fungsi untuk generate PDF dari Laporan ID yang sudah ada
export const streamPdfLaporan = async (laporanId) => {
  try {
    if (!laporanId)
      throw new Error("ID Laporan diperlukan untuk streaming PDF.");
    const response = await fetch(
      `${API_URL}laporan/${laporanId}/approve-generate`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      await handleFetchError(response); // Akan melempar error jika status tidak OK
    }

    // Proses jika response OK (PDF diterima)
    const blob = await response.blob();
    if (blob.size < 100) {
      console.warn(
        "Received PDF blob is very small or empty, size:",
        blob.size
      );
    }

    const fileURL = window.URL.createObjectURL(blob);
    const fileLink = document.createElement("a");
    fileLink.href = fileURL;

    const contentDisposition = response.headers.get("content-disposition");
    let fileName = `laporan-${laporanId}-${Date.now()}.pdf`; // Default
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (fileNameMatch && fileNameMatch.length === 2)
        fileName = fileNameMatch[1];
    }

    fileLink.setAttribute("download", fileName);
    document.body.appendChild(fileLink);
    fileLink.click();
    document.body.removeChild(fileLink);
    window.URL.revokeObjectURL(fileURL);
    return { success: true, message: "PDF berhasil diunduh." };
  } catch (error) {
    console.error("Error in streamPdfLaporan service:", error);
    throw error; // Lempar error agar bisa ditangani oleh komponen UI
  }
};

// Fungsi untuk menghapus data laporan tersimpan berdasarkan ID
export const deleteLaporan = async (id) => {
  try {
    if (!id || id === "undefined")
      throw new Error("ID Laporan tidak valid untuk delete.");
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) await handleFetchError(response);
    if (response.status === 204)
      return { message: "Laporan berhasil dihapus." };
    return await response.json();
  } catch (error) {
    console.error("Error deleting Laporan:", error);
    throw error;
  }
};

export const approveLaporanStatusOnly = async (id, newStatus) => {
  try {
    if (!id) throw new Error("ID Laporan diperlukan.");
    if (!newStatus) throw new Error("Status baru diperlukan.");

    const response = await fetch(`${API_URL}laporan/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }), // Kirim status baru di body
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error approving/updating status laporan:", error);
    throw error;
  }
};

/**
 *
 * Helper function untuk generate nama file yang lebih deskriptif.
 */

// Fungsi untuk memformat tanggal dengan format dd-mm-yyyy
const feFormatTanggalFallback = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Bulan mulai dari 0
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
};

const generateFilename = (params) => {
  const tanggalFormatted = feFormatTanggalFallback();
  let judulLaporanFE = "Laporan";

  if (params.level === "semua") {
    judulLaporanFE = "Laporan Seluruh Kwarran & Gudep";
  } else if (params.level === "kwarran") {
    const kwarranDisplayName = params.namaKwarran || `${params.targetId}`;
    judulLaporanFE = `Laporan Kwarran ${kwarranDisplayName}`;
  } else if (params.level === "gudep") {
    const gudepDisplayName = params.namaGudep || `${params.targetId}`;
    judulLaporanFE = `Laporan Gudep ${gudepDisplayName}`;
  } else {
    judulLaporanFE = `Laporan ${params.level || "Umum"}${
      params.targetId ? ` ID ${params.targetId}` : ""
    }`;
  }

  return `${judulLaporanFE} ( ${tanggalFormatted} ).pdf`;
};

/**
 * Modifikasi generateDirectPdfReport untuk menggunakan fungsi generateFilename
 */
export const generateDirectPdfReport = async (params) => {
  if (!params || !params.level) {
    console.error(
      "❌ Parameter 'level' wajib diisi untuk generateDirectPdfReport."
    );
    throw new Error("Parameter 'level' wajib diisi.");
  }

  try {
    const backendParams = { level: params.level, targetId: params.targetId };
    const response = await fetch(`${API_URL}laporan/generate-direct-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendParams),
    });

    if (!response.ok) {
      let errorMessage = `Gagal mengambil PDF. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Jika parsing JSON gagal, biarkan errorMessage default
      }
      console.error(`❌ Error dari server: ${errorMessage}`);
      await handleFetchError(response);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    let downloadFilename;

    // Coba ambil nama file dari header Content-Disposition (dari server)
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("attachment")) {
      const filenameMatch = disposition.match(
        /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i
      );
      if (filenameMatch && filenameMatch[1]) {
        downloadFilename = decodeURIComponent(filenameMatch[1]);
        console.log("Menggunakan nama file dari server:", downloadFilename);
      }
    }

    // Jika nama file dari server tidak ditemukan, buat nama file dengan generateFilename
    if (!downloadFilename) {
      console.log(
        "Nama file dari server tidak ditemukan, menggunakan fallback."
      );
      downloadFilename = generateFilename(params);
    }

    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ Gagal download langsung PDF:", error.message || error);
  }
};

// Fungsi untuk mengunduh PDF Kwarran atau Gudep
export const downloadPdfKwarran = async (targetId, namaKwarran) => {
  await generateDirectPdfReport({ level: "kwarran", targetId, namaKwarran });
};

export const downloadPdfGudep = async (targetId, namaGudep) => {
  await generateDirectPdfReport({ level: "gudep", targetId, namaGudep });
};
