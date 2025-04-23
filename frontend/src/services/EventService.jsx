// src/services/EventService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data event
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_URL}event`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Event");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data; // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Events:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data event berdasarkan ID
export const fetchEventById = async (id) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Event berdasarkan ID");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data; // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Event by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data event baru
export const createEvent = async (data) => {
  try {
    const response = await fetch(`${API_URL}event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      throw new Error("Gagal membuat Event baru");
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Event:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit data event berdasarkan ID
export const editEvent = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(item), // Kirim data yang akan diupdate
    });

    if (!response.ok) {
      throw new Error("Gagal mengedit Event");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Event:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data event berdasarkan ID
export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus Event");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Event:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
