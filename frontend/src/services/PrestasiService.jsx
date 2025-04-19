// src/services/EventGudepService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil semua data prestasi
export const fetchEventGudeps = async () => {
  try {
    const response = await fetch(`${API_URL}prestasi`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data prestasi");
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Event Gudep:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data prestasi berdasarkan ID
export const fetchEventGudepById = async (eventgudep_id) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${eventgudep_id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data prestasi berdasarkan ID");
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Event Gudep by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menambah data prestasi baru
export const createEventGudep = async (data) => {
  try {
    const response = await fetch(`${API_URL}prestasi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      const responseBody = await response.json(); // Ambil pesan error dari response
      throw new Error(`Gagal membuat data prestasi: ${responseBody.message}`);
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Event Gudep:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit data prestasi berdasarkan ID
export const editEventGudep = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(item), // Kirim data yang akan diupdate
    });

    if (!response.ok) {
      throw new Error("Gagal mengedit data prestasi");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Event Gudep:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data prestasi berdasarkan ID
export const deleteEventGudep = async (id) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus data prestasi");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Event Gudep:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
