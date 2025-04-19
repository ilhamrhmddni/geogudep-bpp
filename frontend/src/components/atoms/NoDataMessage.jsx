import React from "react";

// Komponen NoDataMessage untuk menampilkan pesan ketika data tidak tersedia
const NoDataMessage = ({ message }) => {
  return (
    // Elemen <div> dengan styling Tailwind CSS untuk menampilkan pesan
    <div className="text-center py-4 text-gray-500 italic">
      {message} {/* Pesan yang diterima melalui prop */}
    </div>
  );
};

export default NoDataMessage;
