import React from "react";

// Komponen InputDefault untuk menampilkan input teks dengan styling default
const InputDefault = ({
  type = "text", // Tipe input, default adalah "text"
  name, // Nama input
  placeholder, // Placeholder untuk input
  value, // Nilai input
  onChange, // Fungsi untuk menangani perubahan nilai input
}) => {
  return (
    // Elemen <input> dengan styling Tailwind CSS
    <input
      type={type} // Tipe input
      name={name} // Nama input
      placeholder={placeholder} // Placeholder input
      value={value} // Nilai input
      onChange={onChange} // Fungsi yang dipanggil saat nilai berubah
      className="border rounded-md border-gray-300 px-8 py-3 w-full bg-white" // Styling input
    />
  );
};

export default InputDefault;
