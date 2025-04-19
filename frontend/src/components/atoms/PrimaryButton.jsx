import React from "react";

// Komponen PrimaryButton untuk menampilkan tombol utama dengan styling
const PrimaryButton = ({ text, type = "button", onClick }) => {
  return (
    // Elemen <button> dengan styling Tailwind CSS
    <button
      type={type} // Tipe tombol, default adalah "button"
      onClick={onClick} // Fungsi yang dipanggil saat tombol diklik
      className="bg-white text-[#9500FF] px-8 py-2 rounded-full font-bold hover:bg-[#9500FF] hover:text-white transition-all cursor-pointer"
    >
      {text} {/* Teks tombol yang diterima melalui prop */}
    </button>
  );
};

export default PrimaryButton;
