// src/services/EventGudepService.js

// URL dasar API
const API_URL = "http://localhost:3000/";

// Fungsi untuk mengambil data event_gudep
export const fetchEventGudeps = async () => {
  try {
    const response = await fetch(`${API_URL}prestasi`);

    if (!response.ok) {
      throw new Error("Failed to fetch Event Gudep data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Event Gudep:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data event_gudep berdasarkan ID
export const fetchEventGudepById = async (eventgudep_id) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${eventgudep_id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch Event Gudep data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Event Gudep by ID:", error);
    throw error;
  }
};

// Fungsi untuk menambah data event_gudep
export const createEventGudep = async (data) => {
  try {
    const response = await fetch(`${API_URL}prestasi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Log the response for debugging purposes
    const responseBody = await response.json(); // Read the response body
    console.log("Response Body:", responseBody); // Log the response body

    if (!response.ok) {
      // If the response is not OK, throw an error with the message from the response
      throw new Error(`Failed to create Event Gudep: ${responseBody.message}`);
    }

    return responseBody; // Return the response data if the request was successful
  } catch (error) {
    console.error("Error creating Event Gudep:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

// Fungsi untuk mengedit data event_gudep
export const editEventGudep = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Failed to edit Event Gudep");
    }

    const updatedItem = await response.json();
    return updatedItem;
  } catch (error) {
    console.error("Error editing Event Gudep:", error);
    throw error;
  }
};

// Fungsi untuk menghapus data event_gudep
export const deleteEventGudep = async (id) => {
  try {
    const response = await fetch(`${API_URL}prestasi/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete Event Gudep");
    }

    return await response.json(); // Optionally return the response if needed
  } catch (error) {
    console.error("Error deleting Event Gudep:", error);
    throw error;
  }
};
