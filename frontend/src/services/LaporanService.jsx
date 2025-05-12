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
      const textError = await response.text();
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

// Fungsi untuk generate HTML dari Laporan ID yang sudah ada dan mengunduhnya
export const generateAndDownloadHtmlReport = async (laporanId) => {
  try {
    if (!laporanId)
      throw new Error("ID Laporan diperlukan untuk generate HTML.");

    // Panggil endpoint backend yang baru
    const response = await fetch(
      `${API_URL}laporan/${laporanId}/approve-generate-html`, // Endpoint diubah
      {
        method: "PUT", // Metode tetap PUT sesuai definisi rute backend
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      await handleFetchError(response);
    }

    // Backend akan merespons dengan JSON yang berisi filePath
    const result = await response.json();
    if (result && result.filePath) {
      // Buat link untuk mengunduh file HTML yang disimpan di server
      // Asumsi server statis dikonfigurasi untuk menyajikan dari 'generated_html_reports' di /reports
      // atau Anda bisa menggunakan API_URL jika path absolutnya diketahui
      const fileUrlFromServer = `${API_URL.replace("/api/", "/")}${
        result.filePath
      }`; // Sesuaikan jika API_URL berbeda dari base URL server

      const fileLink = document.createElement("a");
      fileLink.href = fileUrlFromServer; // Langsung ke file di server

      // Ekstrak nama file dari filePath
      const fileName =
        result.filePath.split("/").pop() ||
        `laporan-${laporanId}-${Date.now()}.html`;

      fileLink.setAttribute("download", fileName);
      fileLink.setAttribute("target", "_blank"); // Opsional: buka di tab baru jika tidak langsung download
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);

      return {
        success: true,
        message:
          "Laporan HTML berhasil di-generate. Link unduhan/tampilan telah dipicu.",
        filePath: result.filePath,
      };
    } else {
      throw new Error("Respon dari server tidak menyertakan path file HTML.");
    }
  } catch (error) {
    console.error("Error in generateAndDownloadHtmlReport service:", error);
    throw error;
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
      // No Content, berhasil dihapus
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
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error approving/updating status laporan:", error);
    throw error;
  }
};

const feFormatTanggalFallback = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

// Diubah untuk menghasilkan nama file .html
const generateHtmlFilename = (params) => {
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
  return `${judulLaporanFE} ( ${tanggalFormatted} ).html`; // Ekstensi .html
};

// Diubah untuk generate HTML
export const generateDirectHtmlReportAndDownload = async (params) => {
  if (!params || !params.level) {
    console.error(
      "❌ Parameter 'level' wajib diisi untuk generateDirectHtmlReportAndDownload."
    );
    throw new Error("Parameter 'level' wajib diisi.");
  }

  try {
    const backendParams = { level: params.level, targetId: params.targetId };
    const response = await fetch(`${API_URL}laporan/generate-direct-html`, {
      // Endpoint diubah
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendParams),
    });

    if (!response.ok) {
      await handleFetchError(response);
    }

    // Backend akan merespons dengan JSON yang berisi filePath
    const result = await response.json();
    if (result && result.filePath) {
      // Asumsi server statis dikonfigurasi untuk menyajikan dari 'generated_html_reports' di /reports
      // atau Anda bisa menggunakan API_URL jika path absolutnya diketahui dan dapat diakses
      const fileUrlFromServer = `${API_URL.replace("/api/", "/")}${
        result.filePath
      }`; // Sesuaikan jika API_URL berbeda dari base URL server

      const fileLink = document.createElement("a");
      fileLink.href = fileUrlFromServer;

      // Ekstrak nama file dari filePath atau generate fallback
      const fileName =
        result.filePath.split("/").pop() || generateHtmlFilename(params);

      fileLink.setAttribute("download", fileName);
      fileLink.setAttribute("target", "_blank");
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);

      return {
        success: true,
        message:
          "Laporan HTML berhasil di-generate dan link unduhan telah dipicu.",
        filePath: result.filePath,
      };
    } else {
      throw new Error("Respon dari server tidak menyertakan path file HTML.");
    }
  } catch (error) {
    console.error("❌ Gagal download langsung HTML:", error.message || error);
    throw error;
  }
};

// Fungsi helper untuk mengunduh/menampilkan file HTML berdasarkan path dari server
export const downloadOrViewSavedHtmlReport = async (laporanId) => {
  try {
    if (!laporanId) throw new Error("ID Laporan diperlukan.");
    const response = await fetch(
      `${API_URL}laporan/adhoc-download-html/${laporanId}`,
      {
        method: "GET", // Sesuai dengan rute backend
      }
    );

    if (!response.ok) {
      await handleFetchError(response);
    }

    // Karena backend akan mengirim file langsung, kita tangani sebagai blob
    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    const fileLink = document.createElement("a");
    fileLink.href = fileURL;

    let fileName = `laporan_adhoc_${laporanId}.html`; // Default
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (fileNameMatch && fileNameMatch.length === 2)
        fileName = fileNameMatch[1];
    }

    fileLink.setAttribute("download", fileName);
    // Jika Anda ingin membuka di tab baru daripada mengunduh:
    // fileLink.setAttribute("target", "_blank");
    // fileLink.removeAttribute("download");

    document.body.appendChild(fileLink);
    fileLink.click();
    document.body.removeChild(fileLink);
    window.URL.revokeObjectURL(fileURL);

    return {
      success: true,
      message: "Laporan HTML berhasil diunduh/ditampilkan.",
    };
  } catch (error) {
    console.error("Error downloading/viewing adhoc HTML report:", error);
    throw error;
  }
};

// Fungsi helper untuk memanggil generateDirectHtmlReportAndDownload
export const downloadHtmlKwarran = async (targetId, namaKwarran) => {
  return await generateDirectHtmlReportAndDownload({
    level: "kwarran",
    targetId,
    namaKwarran,
  });
};

export const downloadHtmlGudep = async (targetId, namaGudep) => {
  return await generateDirectHtmlReportAndDownload({
    level: "gudep",
    targetId,
    namaGudep,
  });
};
