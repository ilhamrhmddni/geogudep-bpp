// src/services/LaporanService.js (Pastikan path sesuai)

// URL dasar API
const API_URL = "https://server-geogudep-bpp.vercel.app/"; // Pastikan URL backend benar

// Fungsi untuk mengambil semua data laporan
export const fetchLaporan = async () => {
  try {
    const response = await fetch(`${API_URL}laporan`);

    if (!response.ok) {
      // Coba baca pesan error dari body jika ada
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        /* abaikan jika body bukan json */
      }
      throw new Error(errorData?.message || "Gagal mengambil data laporan");
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data laporan berdasarkan ID
export const fetchLaporanById = async (id) => {
  try {
    // Pastikan ID tidak undefined sebelum fetch
    if (!id || id === "undefined") {
      throw new Error("ID Laporan tidak valid untuk fetch.");
    }
    const response = await fetch(`${API_URL}laporan/${id}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        /* abaikan jika body bukan json */
      }
      // Beri pesan error lebih spesifik jika 404
      if (response.status === 404) {
        throw new Error(errorData?.message || "Laporan tidak ditemukan.");
      }
      throw new Error(
        errorData?.message || "Gagal mengambil data laporan berdasarkan ID"
      );
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Laporan by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data laporan baru
export const createLaporan = async (data) => {
  try {
    console.log("Sending data to createLaporan API:", data); // Log data yang dikirim
    const response = await fetch(`${API_URL}laporan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        /* abaikan jika body bukan json */
      }
      console.error("API Error Response (create):", errorData); // Log error response
      throw new Error(errorData?.message || "Gagal membuat data laporan");
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit status laporan menjadi "selesai" (atau status lain)
// Mungkin lebih fleksibel jika menerima status sebagai argumen?
// export const editLaporanStatus = async (id, newStatus) => {
// src/services/LaporanService.js (Fungsi yang diperbaiki)

export const approveAndGenerateLaporan = async (id) => {
  try {
    if (!id || id === "undefined") throw new Error("ID Laporan tidak valid.");
    console.log(`SERVICE: Triggering approve & generate for Laporan ID: ${id}`);
    const response = await fetch(`${API_URL}laporan/${id}/approve-generate`, {
      method: "PUT", // Menggunakan PUT sesuai definisi route
      headers: { "Content-Type": "application/json" },
      // Body bisa kosong jika tidak perlu kirim data tambahan
    });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {}
      if (response.status === 404)
        throw new Error(errorData?.message || "Laporan tidak ditemukan.");
      throw new Error(
        errorData?.message || "Gagal memproses persetujuan & pembuatan PDF."
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error approving/generating report:", error);
    throw error;
  }
};

// Fungsi untuk Kirim Email
export const sendLaporanEmail = async (id) => {
  try {
    if (!id || id === "undefined") throw new Error("ID Laporan tidak valid.");
    console.log(`SERVICE: Triggering email send for Laporan ID: ${id}`);
    const response = await fetch(`${API_URL}laporan/${id}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {}
      if (response.status === 404)
        throw new Error(errorData?.message || "Laporan tidak ditemukan.");
      throw new Error(errorData?.message || "Gagal mengirim email laporan.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending report email:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data laporan berdasarkan ID
export const deleteLaporan = async (id) => {
  try {
    // Pastikan ID tidak undefined
    if (!id || id === "undefined") {
      throw new Error("ID Laporan tidak valid untuk delete.");
    }
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        /* abaikan jika body bukan json */
      }
      if (response.status === 404) {
        throw new Error(
          errorData?.message || "Laporan tidak ditemukan untuk dihapus."
        );
      }
      throw new Error(errorData?.message || "Gagal menghapus data laporan");
    }

    // DELETE mungkin tidak selalu return body, cek status 200 atau 204 No Content
    if (response.status === 204) {
      return { message: "Laporan berhasil dihapus." }; // Return object sukses jika 204
    }
    return await response.json(); // Mengembalikan respon sukses dari server jika ada body (misal status 200)
  } catch (error) {
    console.error("Error deleting Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
