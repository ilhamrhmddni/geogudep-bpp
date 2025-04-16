import axios from "axios";

const API_URL = "http://localhost:3000/";

export const fetchKwarran = async () => {
  try {
    const response = await axios.get(`${API_URL}kwarran`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Kwarran:", error);
    throw error;
  }
};

export const fetchKwarranId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}kwarran/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Kwarran by ID:", error);
    throw error;
  }
};

export const createKwarran = async (data) => {
  try {
    const response = await axios.post(`${API_URL}kwarran`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Kwarran:", error);

    if (error.response && error.response.data) {
      console.error("Server error details:", error.response.data);
      const errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        "Unknown server error";
      throw new Error(errorMessage);
    }

    throw error;
  }
};

export const editKwarran = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}kwarran/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error editing Kwarran:", error);
    throw new Error("Failed to edit Kwarran");
  }
};

export const deleteKwarran = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}kwarran/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Kwarran:", error);
    throw new Error("Failed to delete Kwarran");
  }
};
