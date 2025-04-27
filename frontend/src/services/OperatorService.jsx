// URL dasar API
const API_URL = "https://server-geogudep-bpp.vercel.app/";

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
export const editUser = async (id, userData) => {
  try {
    // Opsional: Log data yang akan dikirim dari service
    // console.log("Service editUser sending data:", JSON.stringify(userData));

    const response = await fetch(`${API_URL}user/${id}`, {
      method: "PUT", // Pastikan method PUT (atau PATCH) sesuai dengan backend Anda
      headers: {
        "Content-Type": "application/json", // <-- HEADER DITAMBAHKAN
      },
      body: JSON.stringify(userData), // <-- BODY DI-JSON.stringify()
    });

    // Penanganan response error yang sedikit lebih baik
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Coba baca error sebagai JSON dari backend
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData); // Ambil message jika ada
      } catch (e) {
        // Jika error bukan JSON, baca sebagai teks biasa
        errorMessage = await response.text();
      }
      console.error("Server Response Error (editUser):", errorMessage);
      throw new Error(`Gagal memperbarui profil user: ${errorMessage}`);
    }

    // Jika sukses, diasumsikan response berupa JSON
    const result = await response.json();
    return result;
  } catch (error) {
    // Menangkap error dari fetch atau dari throw di atas
    console.error("Error in editUser service function:", error);
    throw error; // Lempar ulang error agar bisa ditangkap oleh komponen (handleSubmit)
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
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // Ensure userData is serialized correctly
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage);
      throw new Error(`Failed to create user: ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
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
