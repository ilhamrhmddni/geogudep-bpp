import axios from "axios";
// URL dasar API
const API_URL = import.meta.env.VITE_API_URL;

// Fungsi untuk mengambil data User berdasarkan ID
export const fetchUserId = async (id) => {
  try {
    const response = await fetch(`${API_URL}user/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error; // Throw error untuk penanganan di komponen
  }
};

// Fungsi untuk mengedit data User (DIPERBAIKI)
export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_URL}user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage);
      throw new Error(`Failed to update user: ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
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

    const result = await response.json();
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fungsi untuk membuat User baru
// OperatorService.jsx
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}user`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Special handling for existing username
      if (
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message === "Username sudah terdaftar"
      ) {
        const customError = new Error("Username sudah terdaftar");
        customError.isUsernameExists = true;
        throw customError;
      }
      // Return the specific error message from the server
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Network Error");
  }
};

export const fetchProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}user/${userId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error fetching user: ${response.status} ${response.statusText}`
      );
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};
