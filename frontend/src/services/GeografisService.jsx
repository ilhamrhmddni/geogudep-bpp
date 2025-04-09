// src/services/GeografisService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data geografis
export const fetchGeografis = async () => {
  try {
    const response = await fetch(`${API_URL}geografis`);

    if (!response.ok) {
      throw new Error("Failed to fetch Geografis data");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching Geografis:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data geografis berdasarkan ID
export const fetchGeografisId = async (id) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Geografis data");
    }

    const data = await response.json();
    return data; // Pastikan data yang dikembalikan sesuai dengan struktur yang diharapkan
  } catch (error) {
    console.error("Error fetching Geografis by ID:", error);
    throw error;
  }
};

// Fungsi untuk membuat data geografis
export const createGeografis = async (data) => {
  try {
    const response = await fetch(`${API_URL}geografis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create Geografis");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Geografis:", error);
    throw error;
  }
};

// Fungsi untuk mengedit data geografis
export const editGeografis = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Geografis");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Geografis:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data geografis
export const deleteGeografis = async (id) => {
  try {
    const response = await fetch(`${API_URL}geografis/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Geografis");
    }

    const result = await response.json(); // Mendapatkan respon sukses dari server
    return result;
  } catch (error) {
    console.error("Error deleting Geografis:", error);
    throw error;
  }
};
