const API_URL = import.meta.env.VITE_API_URL;

// Fungsi untuk mengedit data Gugusdepan berdasarkan ID
export const editGugusdepan = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(item), // Kirim data yang akan diupdate
    });

    if (!response.ok) {
      throw new Error("Gagal mengedit data Gugusdepan");
    }

    return await response.json(); // Mengembalikan data hasil update dari server
  } catch (error) {
    console.error("Error editing Gugusdepan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk menghapus data Gugusdepan berdasarkan ID
export const deleteGugusdepan = async (id) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus data Gugusdepan");
    }

    return await response.json(); // Mengembalikan respon sukses dari server
  } catch (error) {
    console.error("Error deleting Gugusdepan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil semua data Gugusdepan
export const fetchGugusdepan = async () => {
  try {
    const response = await fetch(`${API_URL}gudep`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Gugusdepan");
    }

    return await response.json(); // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Gugusdepan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mengambil data Gugusdepan berdasarkan ID
export const fetchGugusdepanId = async (id) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data Gugusdepan berdasarkan ID");
    }

    return await response.json(); // Mengembalikan data yang diterima dari server
  } catch (error) {
    console.error("Error fetching Gugusdepan by ID:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk membuat data Gugusdepan baru
export const createGugusdepan = async (data) => {
  try {
    const response = await fetch(`${API_URL}gudep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Header untuk JSON
      },
      body: JSON.stringify(data), // Kirim data dalam format JSON
    });

    if (!response.ok) {
      throw new Error("Gagal membuat data Gugusdepan");
    }

    return await response.json(); // Mengembalikan data hasil dari server
  } catch (error) {
    console.error("Error creating Gugusdepan:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};

// Fungsi untuk mempersiapkan data Gugusdepan sebelum dibuat atau diupdate
export const prepareGugusdepanData = async (gudepData, userId, kwarranId) => {
  try {
    // Ambil data pengguna berdasarkan userId
    const userResponse = await fetch(`${API_URL}user/${userId}`);
    const userData = await userResponse.json();

    // Ambil data kwarran berdasarkan kwarranId
    const kwarranResponse = await fetch(`${API_URL}kwarran/${kwarranId}`);
    const kwarranData = await kwarranResponse.json();

    // Siapkan objek data akhir
    const finalData = {
      ...gudepData,
      username: userData.username, // Tambahkan username pengguna
      kwarran_nama: kwarranData.nama, // Tambahkan nama kwarran
      tahun_update: new Date(), // Set tanggal update saat ini
      jumlah_putra: gudepData.jumlah_putra || 0, // Pastikan nilai default
      jumlah_putri: gudepData.jumlah_putri || 0, // Pastikan nilai default
    };

    return finalData; // Kembalikan data yang sudah diproses
  } catch (error) {
    console.error("Error preparing Gugusdepan data:", error); // Log error jika terjadi
    throw error; // Lempar error agar bisa ditangani di komponen pemanggil
  }
};
