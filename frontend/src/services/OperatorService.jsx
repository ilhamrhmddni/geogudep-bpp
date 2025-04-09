// src/services/UserService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data User berdasarkan ID
export const fetchUserId = async (id) => {
  try {
    const response = await fetch(`${API_URL}user/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const data = await response.json();
    return data; // Pastikan data yang dikembalikan sesuai dengan struktur yang diharapkan
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// Fungsi untuk mengedit data User
export const editUser = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit user");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data User
export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}user/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    const result = await response.json(); // Mendapatkan respon sukses dari server
    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Fungsi untuk mengambil semua data User
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}user`);

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fungsi untuk membuat User baru
export const createUser = async (data) => {
  try {
    const response = await fetch(`${API_URL}user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const fetchProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}user/${userId}`);
    const result = await response.json(); // Parse JSON

    console.log("API Response:", result); // Debugging: lihat isi response

    if (!response.ok) {
      throw new Error(
        `Error fetching user: ${response.status} ${response.statusText}`
      );
    }

    return result.data; // Ambil hanya bagian "data"
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};
