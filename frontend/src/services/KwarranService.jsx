// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengedit data Kwarran
export const editKwarran = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}kwarran/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Kwarran");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Kwarran:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data Kwarran
export const deleteKwarran = async (id) => {
  try {
    const response = await fetch(`${API_URL}kwarran/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Kwarran");
    }

    const result = await response.json(); // Mendapatkan respon sukses dari server
    return result;
  } catch (error) {
    console.error("Error deleting Kwarran:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data Kwarran
export const fetchKwarran = async () => {
  try {
    const response = await fetch(`${API_URL}kwarran`);

    if (!response.ok) {
      throw new Error("Failed to fetch Kwarran data");
    }

    const data = await response.json(); // Mengambil data dalam bentuk JSON
    return data;
  } catch (error) {
    console.error("Error fetching Kwarran:", error);
    throw error;
  }
};

export const fetchKwarranId = async (id) => {
  try {
    const response = await fetch(`${API_URL}kwarran/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Kwarran data");
    }

    const data = await response.json();
    return data; // Pastikan data yang dikembalikan sesuai dengan struktur yang diharapkan
  } catch (error) {
    console.error("Error fetching Kwarran by ID:", error);
    throw error;
  }
};

export const createKwarran = async (data) => {
  try {
    const response = await fetch(`${API_URL}kwarran`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating Kwarran:", error);
    throw error;
  }
};
