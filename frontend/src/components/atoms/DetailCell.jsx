// src/components/pages/admin/AdminGugusdepan/DetailCell.jsx
import React from "react";

const DetailCell = ({ title, details }) => {
  return (
    <div className="relative group cursor-pointer">
      <span className="text-blue-600 underline">{title}</span>
      <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-3 w-64 top-full left-1/2 transform -translate-x-1/2 mt-2">
        {details.map((detail, index) => (
          <p key={index}>
            <strong>{detail.label}:</strong> {detail.value || "-"}
          </p>
        ))}
      </div>
    </div>
  );
};

export default DetailCell;
