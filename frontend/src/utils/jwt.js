// src/utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

export const decodeToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.error("Gagal decode token:", error);
    return null;
  }
};
