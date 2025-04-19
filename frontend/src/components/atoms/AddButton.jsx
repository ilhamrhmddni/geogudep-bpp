// src/components/atoms/AddButton.js
import React from "react";

// Komponen AddButton untuk menampilkan tombol dengan ikon "add" atau ikon custom
const AddButton = ({ onClick, icon = "add" }) => {
  return (
    // Tombol dengan styling Tailwind CSS dan efek hover
    <button
      onClick={onClick} // Fungsi yang dipanggil saat tombol diklik
      className="bg-[#9500FF] text-white rounded-md mx-2 border-2 cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out flex items-center"
    >
      {/* Ikon material dengan warna putih */}
      <span className="material-icons m-2" style={{ color: "white" }}>
        {icon} {/* Ikon default adalah "add", bisa diganti melalui prop */}
      </span>
    </button>
  );
};

export default AddButton;
