import React from "react";
import { useNavigate } from "react-router-dom";

const HeaderUser = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login"); // Arahkan ke halaman login
  };

  return (
    <header className="w-full p-4 bg-white text-[#9500FF] flex items-center justify-between shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 ml-20">
        <span className="text-xl font-bold">
          Sistem Informasi Geografis Pemetaan Gugus Depan Kota Balikpapan
        </span>
      </div>

      {/* Tombol Login */}
      <div className="flex items-center gap-3 mx-4">
        <button
          onClick={handleLogin}
          className="bg-[#9500FF] text-white rounded px-6 py-2 transition-transform hover:bg-[#7a00b3] cursor-pointer"
        >
          Login sebagai Operator
        </button>
      </div>
    </header>
  );
};

export default HeaderUser;
