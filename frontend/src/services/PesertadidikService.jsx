// src/services/PesertadidikService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data peserta didik
export const fetchPesertadidik = async () => {
  try {
    const response = await fetch(`${API_URL}pesertadidik`);

    if (!response.ok) {
      throw new Error("Failed to fetch Peserta Didik data");
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching Peserta Didik:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data peserta didik berdasarkan ID
export const fetchPesertadidikById = async (id) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Peserta Didik data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Peserta Didik by ID:", error);
    throw error;
  }
};

// Fungsi untuk membuat data peserta didik
export const createPesertadidik = async (data) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get error message from response
      throw new Error(`Failed to create Peserta Didik: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Peserta Didik:", error);
    throw error; // Rethrow the error for further handling
  }
};

// Fungsi untuk mengedit data peserta didik
export const editPesertadidik = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Peserta Didik");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Peserta Didik:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data peserta didik
export const deletePesertadidik = async (id) => {
  try {
    const response = await fetch(`${API_URL}pesertadidik/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Peserta Didik");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting Peserta Didik:", error);
    throw error;
  }
};

export const fetchPesertadidikByGudep = async (gudepId) => {
  const response = await fetch(`${API_URL}pesertadidik?gudep_id=${gudepId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Peserta Didik");
  }

  return await response.json(); // Kembalikan data yang diterima dari server
};
