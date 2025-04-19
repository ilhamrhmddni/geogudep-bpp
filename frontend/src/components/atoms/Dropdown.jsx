// Dropdown.jsx
import React from "react";

// Komponen Dropdown untuk menampilkan daftar pilihan
const Dropdown = ({
  options, // Array opsi dropdown
  selected, // Nilai yang dipilih
  onChange, // Fungsi untuk menangani perubahan nilai dropdown
  placeholder, // Placeholder untuk dropdown
}) => {
  return (
    // Elemen <select> dengan styling Tailwind CSS
    <select
      value={selected} // Nilai yang dipilih
      onChange={(e) => onChange(e.target.value)} // Panggil fungsi onChange saat nilai berubah
      className="p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
    >
      {/* Placeholder sebagai opsi default */}
      <option value="" className="text-[#9500FF] font-bold">
        {placeholder}
      </option>

      {/* Render opsi dropdown */}
      {options.map((option) => (
        <option
          key={option.key || option.id || option.value || option.nama} // Gunakan key unik untuk setiap opsi
          value={option.value || option.nama || option.id} // Nilai opsi
          className="text-[#9500FF] font-bold"
        >
          {option.label || option.nama || option.id} {/* Label opsi */}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
