import React from "react";

// Komponen ErrorMessage untuk menampilkan pesan error
const ErrorMessage = ({ message }) => {
  return (
    // Elemen <div> dengan styling Tailwind CSS untuk menampilkan pesan error
    <div className="text-center py-4 text-red-500 font-semibold">
      {message} {/* Pesan error yang diterima melalui prop */}
    </div>
  );
};

export default ErrorMessage;
