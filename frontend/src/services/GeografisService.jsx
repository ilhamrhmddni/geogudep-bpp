// src/services/GeografisService.js

// URL dasar API
const API_URL = "https://server-geogudep-bpp.vercel.app/";

// Fungsi untuk mengambil semua data geografis
export const fetchGeografis = async () => {
  try {
    const response = await fetch(`${API_URL}geografis`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Geografis");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data; // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Geografis:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data geografis berdasarkan ID
export const fetchGeografisId = async (id) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Geografis berdasarkan ID");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data; // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Geografis by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data geografis baru
export const createGeografis = async (data) => {
  try {
    const response = await fetch(`${API_URL}geografis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      throw new Error("Gagal membuat data Geografis");
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Geografis:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit data geografis berdasarkan ID
export const editGeografis = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(item), // Kirim data yang akan diupdate
    });

    if (!response.ok) {
      throw new Error("Gagal mengedit data Geografis");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Geografis:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data geografis berdasarkan ID
export const deleteGeografis = async (id) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus data Geografis");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Geografis:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
