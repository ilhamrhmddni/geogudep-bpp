// src/services/AuthService.js

const API_URL = "http://localhost:3000/"; // Base URL untuk API

// Fungsi untuk login pengguna
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify({ username, password }), // Kirim data username dan password
    });

    const result = await response.json(); // Parse response JSON

    if (!response.ok) {
      // Jika response tidak OK, lempar error dengan pesan spesifik dari server
      throw new Error(result.message || "Network response was not ok");
    }

    return result; // Return hasil response
  } catch (error) {
    console.error("Error during login:", error); // Log error
    return {
      success: false,
      message: error.message || "Gagal terhubung ke server", // Return pesan error
    };
  }
};

// Fungsi untuk logout pengguna
export const logout = async () => {
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  if (!token) {
    console.error("Token tidak ditemukan"); // Log jika token tidak ditemukan
    return { success: false, message: "Token tidak ditemukan" }; // Return pesan error
  }

  try {
    const response = await fetch(`${API_URL}auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Kirim token di header
        "Content-Type": "application/json", // Header untuk JSON
      },
    });

    if (!response.ok) {
      // Jika response tidak OK, parse error response
      const errorResponse = await response.json();
      console.error("Logout error response:", errorResponse); // Log error response
      throw new Error(errorResponse.message); // Lempar error
    }

    return { success: true, message: "Logout berhasil" }; // Return pesan sukses
  } catch (error) {
    console.error("Error during logout:", error); // Log error
    return {
      success: false,
      message: error.message || "Gagal terhubung ke server", // Return pesan error
    };
  }
};
