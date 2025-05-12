// src/services/LaporanService.js
const API_URL = import.meta.env.VITE_API_URL || "/api/";

async function handleFetchError(response) {
  let errorData = { message: `Request failed with status ${response.status}` };
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      errorData = await response.json();
    } else {
      const textError = await response.text();
      errorData.message = textError || errorData.message;
    }
  } catch (e) {
    console.warn("Could not parse error response body:", e);
  }
  const finalErrorMessage =
    errorData.message || `Operasi gagal (${response.status})`;
  const detail =
    errorData.errorDetail ||
    (errorData.message !== finalErrorMessage ? errorData.message : undefined);
  const errorToThrow = new Error(finalErrorMessage);
  if (detail && typeof detail === "object")
    errorToThrow.detail = JSON.stringify(detail);
  else if (detail) errorToThrow.detail = detail;
  errorToThrow.status = response.status;
  throw errorToThrow;
}

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

export const deleteLaporan = async (id) => {
  try {
    if (!id || id === "undefined")
      throw new Error("ID Laporan tidak valid untuk delete.");
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) await handleFetchError(response);
    return await response.json(); // Backend sekarang kirim JSON untuk sukses delete
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

export const generateAndDownloadPdfReport = async (laporanId) => {
  try {
    if (!laporanId)
      throw new Error("ID Laporan diperlukan untuk generate PDF.");
    const response = await fetch(
      `${API_URL}laporan/${laporanId}/approve-generate-pdf`, // Endpoint PDF
      { method: "PUT", headers: { "Content-Type": "application/json" } }
    );
    if (!response.ok) await handleFetchError(response);
    const result = await response.json();
    if (result && result.downloadUrl) {
      window.open(result.downloadUrl, "_blank");
      return {
        success: true,
        message: "Laporan PDF dari Dropbox sedang dibuka/diunduh.",
        url: result.downloadUrl,
      };
    } else {
      throw new Error(
        result.message ||
          "Respon server tidak menyertakan URL unduhan PDF Dropbox."
      );
    }
  } catch (error) {
    console.error(
      "Error in generateAndDownloadPdfReport (Dropbox) service:",
      error.message,
      error.detail || error
    );
    throw error;
  }
};

export const generateDirectPdfReportAndDownload = async (params) => {
  if (!params || !params.level)
    throw new Error("Parameter 'level' wajib diisi.");
  try {
    const backendParams = { level: params.level, targetId: params.targetId };
    console.log("FE Service mengirim (direct PDF report):", backendParams);
    const response = await fetch(`${API_URL}laporan/generate-direct-pdf`, {
      // Endpoint PDF
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendParams),
    });
    if (!response.ok) await handleFetchError(response);
    const result = await response.json();
    if (result && result.downloadUrl) {
      window.open(result.downloadUrl, "_blank");
      return {
        success: true,
        message: "Laporan PDF dari Dropbox sedang dibuka/diunduh.",
        url: result.downloadUrl,
      };
    } else {
      throw new Error(
        result.message ||
          "Respon server tidak menyertakan URL unduhan PDF Dropbox."
      );
    }
  } catch (error) {
    console.error(
      "❌ Gagal download langsung PDF (Dropbox):",
      error.message,
      error.detail || error
    );
    throw error;
  }
};

export const downloadOrViewSavedPdfReport = async (laporanId) => {
  try {
    if (!laporanId) throw new Error("ID Laporan diperlukan.");
    const adhocDownloadUrl = `${API_URL}laporan/adhoc-download-pdf/${laporanId}`; // Endpoint PDF
    window.open(adhocDownloadUrl, "_blank");
    return {
      success: true,
      message: "Proses unduh/tampilan laporan PDF dari Dropbox dimulai.",
    };
  } catch (error) {
    console.error(
      "Error triggering adhoc PDF report download (Dropbox):",
      error
    );
    throw error;
  }
};

export const downloadPdfKwarran = async (targetId, namaKwarran) => {
  // Nama fungsi untuk PDF
  return await generateDirectPdfReportAndDownload({
    level: "kwarran",
    targetId,
    namaKwarran,
  });
};
export const downloadPdfGudep = async (targetId, namaGudep) => {
  // Nama fungsi untuk PDF
  return await generateDirectPdfReportAndDownload({
    level: "gudep",
    targetId,
    namaGudep,
  });
};
