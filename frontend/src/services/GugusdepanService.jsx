const API_URL = "http://localhost:3000/";

// Function to edit Gugusdepan data
export const editGugusdepan = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Gugusdepan");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Gugusdepan:", error);
    throw error;
  }
};

// Function to delete Gugusdepan data
export const deleteGugusdepan = async (id) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Gugusdepan");
    }

    const result = await response.json(); // Get success response from server
    return result;
  } catch (error) {
    console.error("Error deleting Gugusdepan:", error);
    throw error;
  }
};

// Function to fetch all Gugusdepan data
export const fetchGugusdepan = async () => {
  try {
    const response = await fetch(`${API_URL}gudep`);

    if (!response.ok) {
      throw new Error("Failed to fetch Gugusdepan data");
    }

    const data = await response.json(); // Get data in JSON format
    return data;
  } catch (error) {
    console.error("Error fetching Gugusdepan:", error);
    throw error;
  }
};

// Function to fetch Gugusdepan by ID
export const fetchGugusdepanId = async (id) => {
  try {
    const response = await fetch(`${API_URL}gudep/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Gugusdepan data");
    }

    const data = await response.json();
    return data; // Ensure the returned data matches the expected structure
  } catch (error) {
    console.error("Error fetching Gugusdepan by ID:", error);
    throw error;
  }
};

// Function to create a new Gugusdepan
export const createGugusdepan = async (data) => {
  try {
    const response = await fetch(`${API_URL}gudep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating Gugusdepan:", error);
    throw error;
  }
};

// Function to prepare data for creating or editing Gugusdepan
export const prepareGugusdepanData = async (gudepData, userId, kwarranId) => {
  try {
    // Fetch user data
    const userResponse = await fetch(`${API_URL}user/${userId}`);
    const userData = await userResponse.json();

    // Fetch kwarran data
    const kwarranResponse = await fetch(`${API_URL}kwarran/${kwarranId}`);
    const kwarranData = await kwarranResponse.json();

    // Prepare the final data object
    const finalData = {
      ...gudepData,
      username: userData.username, // Add username
      kwarran_nama: kwarranData.nama, // Add kwarran name
      tahun_update: new Date(), // Set the current date as the last update time
      jumlah_putra: gudepData.jumlah_putra || 0, // Ensure default value
      jumlah_putri: gudepData.jumlah_putri || 0, // Ensure default value
    };

    return finalData;
  } catch (error) {
    console.error("Error preparing Gugusdepan data:", error);
    throw error;
  }
};
