// src/services/EventService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data event
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_URL}event`);

    if (!response.ok) {
      throw new Error("Failed to fetch Event data");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching Events:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data event berdasarkan ID
export const fetchEventById = async (id) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Event data");
    }

    const data = await response.json();
    return data; // Pastikan data yang dikembalikan sesuai dengan struktur yang diharapkan
  } catch (error) {
    console.error("Error fetching Event by ID:", error);
    throw error;
  }
};

// Fungsi untuk membuat data event
export const createEvent = async (data) => {
  try {
    const response = await fetch(`${API_URL}event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create Event");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Event:", error);
    throw error;
  }
};

// Fungsi untuk mengedit data event
export const editEvent = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Event");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Event:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data event
export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_URL}event/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Event");
    }

    const result = await response.json(); // Mendapatkan respon sukses dari server
    return result;
  } catch (error) {
    console.error("Error deleting Event:", error);
    throw error;
  }
};
