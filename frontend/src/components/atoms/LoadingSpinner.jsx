import React from "react";

// Komponen LoadingSpinner untuk menampilkan animasi loading
const LoadingSpinner = () => {
  return (
    // Kontainer utama dengan styling untuk memusatkan spinner
    <div className="flex justify-center items-center py-4">
      {/* Elemen spinner dengan animasi spin menggunakan Tailwind CSS */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );
};

export default LoadingSpinner;
