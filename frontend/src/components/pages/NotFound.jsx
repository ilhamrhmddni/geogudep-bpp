import { jwtDecode } from "jwt-decode"; // Import untuk decoding token JWT
import React from "react";
import { useNavigate } from "react-router-dom"; // Hook untuk navigasi

const NotFound = () => {
  const navigate = useNavigate();

  // Fungsi untuk menangani tombol "Kembali"
  const handleBack = () => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage
    let role = "";

    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode token untuk mendapatkan role
        role = decoded?.role || ""; // Ambil role dari token
      } catch (error) {
        console.error("Token tidak valid:", error);
        localStorage.removeItem("token"); // Hapus token jika tidak valid
      }
    }

    // Pemetaan role ke rute yang sesuai
    const routes = {
      admin: "/admin/kwarran",
      operator: "/operator/gugusdepan",
    };

    navigate(routes[role] || "/login"); // Navigasi ke rute berdasarkan role
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#9500FF] bg-[length:60%] md:bg-[length:50%] bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/bg-siluet.png')" }} // Gaya latar belakang
    >
      <div className="w-full max-w-md flex flex-col md:space-y-24 my-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="w-24 h-24 bg-[url('/logo.png')] bg-contain bg-no-repeat bg-center"></div>
          {/* Judul dan deskripsi */}
          <h2 className="text-2xl font-bold text-center text-white">
            404 Not Found
          </h2>
          <p className="text-lg text-white">
            Halaman yang Anda cari tidak ditemukan.
          </p>
          {/* Tombol kembali */}
          <div className="mt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white text-[#9500FF] rounded hover:bg-[#9500FF] hover:text-white transition duration-200 ease-in-out"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
