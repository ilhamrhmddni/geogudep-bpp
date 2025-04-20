// src/services/LaporanService.js

// URL dasar API
const API_URL = "https://server-geogudep-bpp.vercel.app/";

// Fungsi untuk mengambil semua data laporan
export const fetchLaporan = async () => {
  try {
    const response = await fetch(`${API_URL}laporan`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data laporan");
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
    const response = await fetch(`${API_URL}laporan/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data laporan berdasarkan ID");
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
    const response = await fetch(`${API_URL}laporan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      throw new Error("Gagal membuat data laporan");
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit status laporan menjadi "selesai"
export const editLaporan = async (id) => {
  try {
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify({ status: "selesai" }), // Ubah status menjadi "selesai"
    });

    if (!response.ok) {
      throw new Error("Gagal mengubah status laporan");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data laporan berdasarkan ID
export const deleteLaporan = async (id) => {
  try {
    const response = await fetch(`${API_URL}laporan/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus data laporan");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Laporan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
