// src/services/PesertadidikService.js

// URL dasar API
const API_URL = import.meta.env.VITE_API_URL;

// Fungsi untuk mengambil semua data peserta didik
export const fetchPesertadidik = async () => {
  try {
    const response = await fetch(`${API_URL}pesertadidik`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data peserta didik");
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Peserta Didik:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data peserta didik berdasarkan ID
export const fetchPesertadidikById = async (id) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data peserta didik berdasarkan ID");
    }

    return await response.json(); // Mengembalikan data dalam format JSON
  } catch (error) {
    console.error("Error fetching Peserta Didik by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data peserta didik baru
export const createPesertadidik = async (data) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      const errorText = await response.text(); // Ambil pesan error dari response
      throw new Error(`Gagal membuat data peserta didik: ${errorText}`);
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Peserta Didik:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengedit data peserta didik berdasarkan ID
export const editPesertadidik = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(item), // Kirim data yang akan diupdate
    });

    if (!response.ok) {
      throw new Error("Gagal mengedit data peserta didik");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Peserta Didik:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data peserta didik berdasarkan ID
export const deletePesertadidik = async (id) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus data peserta didik");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Peserta Didik:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data peserta didik berdasarkan ID Gugus Depan
export const fetchPesertadidikByGudep = async (gudepId) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik?gudep_id=${gudepId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
    });

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil data peserta didik berdasarkan Gugus Depan"
      );
    }

    return await response.json(); // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Peserta Didik by Gudep:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
