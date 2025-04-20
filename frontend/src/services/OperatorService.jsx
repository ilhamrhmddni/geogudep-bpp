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

// Fungsi untuk mengedit data User
export const editUser = async (id, userData) => {
  try {
    // Penting: Gunakan JSON.stringify() untuk mengubah objek JavaScript ke JSON
    const response = await fetch(`${API_URL}user/${id}`, {
      method: "PUT",
      body: userData, // Kirim FormData langsung tanpa header Content-Type
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage);
      throw new Error(`Failed to update user profile: ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating user profile:", error);
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
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
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
