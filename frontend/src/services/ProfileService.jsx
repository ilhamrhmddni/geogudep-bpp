// URL dasar API (sesuaikan jika perlu)
const API_URL = "https://server-geogudep-bpp.vercel.app/";

// Mengambil data profil pengguna berdasarkan ID
export const fetchProfile = async (userId) => {
  try {
    // Anda mungkin perlu menyertakan token otentikasi di header jika diperlukan
    // const token = localStorage.getItem('token');
    // const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}user/${userId}` /*, { headers }*/); // Sesuaikan endpoint jika perlu

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      console.error("Server Response Error (fetchProfile):", errorMessage);
      throw new Error(`Gagal mengambil profil: ${errorMessage}`);
    }

    const result = await response.json();
    // Sesuaikan jika data ada di dalam result.data, misal: result.data
    // Pastikan API mengembalikan field yang benar untuk URL foto, misal: photo_path
    return result.data || result; // Sesuaikan berdasarkan struktur response API Anda
  } catch (error) {
    console.error(`Error fetching profile for user ID ${userId}:`, error);
    throw error;
  }
};

// Memperbarui data profil pengguna (termasuk foto) via FormData
export const updateProfile = async (userId, formData) => {
  try {
    // Anda mungkin perlu menyertakan token otentikasi di header jika diperlukan
    // const token = localStorage.getItem('token');
    // const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    // JANGAN set Content-Type manual saat kirim FormData

    // Pastikan endpoint ini sesuai dengan API backend Anda untuk update user/profile
    // dan backend siap menerima multipart/form-data
    const response = await fetch(`${API_URL}user/${userId}`, {
      method: "PUT", // Atau PATCH, sesuaikan dengan backend
      // headers: headers, // Header otentikasi jika perlu
      body: formData, // Kirim objek FormData langsung
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json(); // Backend mungkin kirim error sbg JSON
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      console.error("Server Response Error (updateProfile):", errorMessage);
      // Perbaiki pesan error agar lebih informatif
      throw new Error(
        `Gagal memperbarui profil (Server: ${response.status}): ${errorMessage}`
      );
    }

    // Asumsi response sukses adalah JSON
    const result = await response.json();
    return result;
  } catch (error) {
    // Menangkap error fetch (seperti ERR_CONNECTION_RESET) atau dari throw di atas
    console.error(`Error updating profile for user ID ${userId}:`, error);
    // Jika error adalah TypeError: Failed to fetch, beri pesan yg lebih jelas
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Gagal terhubung ke server. Periksa koneksi atau status server backend."
      );
    }
    throw error; // Lempar ulang error lainnya
  }
};

// Anda bisa menambahkan fungsi lain terkait profil di sini jika perlu
