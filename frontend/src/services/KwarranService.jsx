import axios from "axios"; // Import axios untuk melakukan HTTP request

const API_URL = "http://localhost:3000/"; // URL dasar API

// Fungsi untuk mengambil semua data Kwarran
export const fetchKwarran = async () => {
  try {
    const response = await axios.get(`${API_URL}kwarran`); // GET request ke endpoint kwarran
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.error("Error fetching Kwarran:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data Kwarran berdasarkan ID
export const fetchKwarranId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}kwarran/${id}`); // GET request dengan ID
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.error("Error fetching Kwarran by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data Kwarran baru
export const createKwarran = async (data) => {
  try {
    const response = await axios.post(`${API_URL}kwarran`, data); // POST request untuk membuat data baru
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.error("Error creating Kwarran:", error); // Log error jika terjadi

    // Jika error berasal dari server, ambil detail error
    if (error.response && error.response.data) {
      console.error("Server error details:", error.response.data); // Log detail error dari server
      const errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        "Unknown server error"; // Ambil pesan error dari server
      throw new Error(errorMessage); // Lempar error dengan pesan dari server
    }

    throw error; // Lempar error jika bukan berasal dari server
  }
};

// Fungsi untuk mengedit data Kwarran berdasarkan ID
export const editKwarran = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}kwarran/${id}`, data); // PUT request untuk mengupdate data
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.error("Error editing Kwarran:", error); // Log error jika terjadi
    throw new Error("Gagal mengedit data Kwarran"); // Lempar error dengan pesan khusus
  }
};

// Fungsi untuk menghapus data Kwarran berdasarkan ID
export const deleteKwarran = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}kwarran/${id}`); // DELETE request untuk menghapus data
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.error("Error deleting Kwarran:", error); // Log error jika terjadi
    throw new Error("Gagal menghapus data Kwarran"); // Lempar error dengan pesan khusus
  }
};
