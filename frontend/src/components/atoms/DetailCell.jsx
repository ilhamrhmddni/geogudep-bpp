// src/components/pages/admin/AdminGugusdepan/DetailCell.jsx
import React from "react";

// Komponen DetailCell untuk menampilkan teks dengan detail tambahan yang muncul saat hover
const DetailCell = ({ title, details }) => {
  return (
    // Container utama dengan styling Tailwind CSS
    <div className="relative group cursor-pointer">
      {/* Teks utama yang dapat di-hover */}
      <span className="text-blue-600 underline">{title}</span>

      {/* Kontainer detail yang muncul saat hover */}
      <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-3 w-64 top-full left-1/2 transform -translate-x-1/2 mt-2">
        {/* Render setiap detail dalam bentuk paragraf */}
        {details.map((detail, index) => (
          <p key={index}>
            <strong>{detail.label}:</strong> {/* Label detail */}
            {detail.value || "-"}{" "}
            {/* Nilai detail, fallback ke "-" jika kosong */}
          </p>
        ))}
      </div>
    </div>
  );
};

export default DetailCell;
