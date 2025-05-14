// src/services/LaporanService.jsx

// API_URL Anda, pastikan ini benar mengarah ke backend Anda
// (VITE_API_URL akan diambil dari file .env.development atau .env.production saat build)
const API_URL = import.meta.env.VITE_API_URL || "/api/";

// Fungsi helper untuk menangani error fetch (DARI KODE ANDA, sedikit disesuaikan untuk lebih robust)
async function handleFetchError(response) {
  let errorData;
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      errorData = await response.json(); // Backend diharapkan mengirim JSON error
    } else {
      // Jika bukan JSON, coba baca sebagai teks (misalnya error HTML dari server proxy atau error tak terduga)
      const textError = await response.text();
      errorData = {
        message: `Server Error (${response.status}): ${
          textError || "No additional error message."
        }`,
      };
    }
  } catch (e) {
    // Gagal mem-parse respons error, gunakan status teks dari respons awal
    errorData = {
      message: `Request failed with status ${response.status}. Unable to parse error response.`,
    };
    console.warn("Could not parse error response body:", e);
  }

  // Prioritaskan pesan error dari backend jika ada, jika tidak, buat pesan umum
  const errorMessage =
    (errorData && errorData.message) ||
    `Operasi gagal. Status: ${response.status}`;
  console.error("Fetch Error Details:", errorData); // Log detail error untuk debugging
  throw new Error(errorMessage);
}

// --- FUNGSI YANG TETAP RELEVAN / SEDIKIT MODIFIKASI ---

export const fetchLaporan = async () => {
  try {
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan untuk endpoint ini.
    const response = await fetch(`${API_URL}laporan`, {
      headers: {
        // Minimal Content-Type jika tidak ada Auth yang ditangani global
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) await handleFetchError(response);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const createLaporan = async (data) => {
  try {
    // Endpoint ini publik, jadi biasanya tidak perlu header Auth
    const response = await fetch(`${API_URL}laporan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteLaporan = async (id) => {
  try {
    if (!id) throw new Error("ID Laporan tidak valid untuk delete.");
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan.
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "DELETE",
      headers: {
        // Minimal Content-Type
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) await handleFetchError(response);
    if (response.status === 204)
      return { success: true, message: "Laporan berhasil dihapus." };
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const approveLaporanStatusOnly = async (id, newStatus) => {
  try {
    if (!id) throw new Error("ID Laporan diperlukan.");
    if (!newStatus) throw new Error("Status baru diperlukan.");
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan.
    const response = await fetch(`${API_URL}laporan/${id}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// --- FUNGSI BARU/DIMODIFIKASI UNTUK ALUR PEMBUATAN PDF DI KLIEN ---

export const prepareDataForClientPdfGeneration = async (laporanId) => {
  try {
    if (!laporanId)
      throw new Error("ID Laporan diperlukan untuk persiapan data PDF.");
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan.
    const response = await fetch(
      `${API_URL}laporan/${laporanId}/approve-prepare-data`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) await handleFetchError(response);
    const result = await response.json();
    if (result && result.success && result.data) {
      return result.data;
    } else {
      throw new Error(
        result.message ||
          "Respon server tidak valid setelah persiapan data laporan."
      );
    }
  } catch (error) {
    console.error("Error in prepareDataForClientPdfGeneration:", error);
    throw error;
  }
};

export const prepareDataForDirectClientPdf = async (params) => {
  if (!params || !params.level)
    throw new Error("Parameter 'level' wajib diisi untuk PDF direct.");
  try {
    const backendPayload = {
      level: params.level,
      targetId: params.targetId,
      namaKwarran: params.namaKwarran,
      namaGudep: params.namaGudep,
    };
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan.
    const response = await fetch(`${API_URL}laporan/prepare-direct-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });
    if (!response.ok) await handleFetchError(response);
    const result = await response.json();
    if (result && result.success && result.data) {
      return result.data;
    } else {
      throw new Error(
        result.message ||
          "Respon server tidak valid setelah persiapan data direct."
      );
    }
  } catch (error) {
    console.error("Error in prepareDataForDirectClientPdf:", error);
    throw error;
  }
};

export const updateLaporanAfterClientPdf = async (
  laporanId,
  newStatus,
  clientGeneratedFilename
) => {
  try {
    if (!laporanId || !newStatus)
      throw new Error("ID dan Status Laporan diperlukan untuk update.");
    const payload = { status: newStatus };
    if (clientGeneratedFilename) {
      payload.client_generated_filename = clientGeneratedFilename;
    }
    // ASUMSI: Sistem Anda akan menambahkan header Auth jika diperlukan.
    const response = await fetch(
      `${API_URL}laporan/${laporanId}/update-status-path`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) await handleFetchError(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating laporan after client PDF generation:", error);
    throw error;
  }
};

// --- FUNGSI HELPER UNTUK DIRECT DOWNLOAD (MODIFIKASI UNTUK ALUR KLIEN) ---
// Fungsi ini hanya mengambil data, pembuatan PDF terjadi di komponen.
export const getKwarranReportDataForClient = async (targetId, namaKwarran) => {
  console.log(
    `LaporanService: Mempersiapkan data untuk Kwarran ID ${targetId}, Nama: ${namaKwarran}`
  );
  return await prepareDataForDirectClientPdf({
    level: "kwarran",
    targetId,
    namaKwarran,
  });
};

export const getGudepReportDataForClient = async (targetId, namaGudep) => {
  console.log(
    `LaporanService: Mempersiapkan data untuk Gudep ID ${targetId}, Nama: ${namaGudep}`
  );
  return await prepareDataForDirectClientPdf({
    level: "gudep",
    targetId,
    namaGudep,
  });
};

// Fungsi-fungsi lama yang memicu generate PDF di backend (generateAndDownloadPdfReport, dll.)
// dan fungsi downloadOrViewSavedPdfReport sudah dihapus/dikomentari di versi sebelumnya,
// karena PDF sekarang di-generate dan di-download di sisi klien.
