// src/services/AuthService.js

const API_URL = "http://localhost:3000/";

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Network response was not ok");
    }

    return result;
  } catch (error) {
    console.error("Error during login:", error);
    return {
      success: false,
      message: error.message || "Gagal terhubung ke server",
    };
  }
};

// Tambahkan fungsi logout

export const logout = async () => {
  const token = localStorage.getItem("token"); // Get token from local storage

  if (!token) {
    console.error("Token tidak ditemukan"); // Log if token is not found
    return { success: false, message: "Token tidak ditemukan" }; // Return early
  }

  try {
    const response = await fetch(`${API_URL}auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Send token in the header
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Logout error response:", errorResponse); // Log error response
      throw new Error(errorResponse.message);
    }
    return { success: true, message: "Logout berhasil" }; // Return success
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      success: false,
      message: error.message || "Gagal terhubung ke server",
    };
  }
};
