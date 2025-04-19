import React from "react";

// Komponen SelectInput untuk menampilkan dropdown dengan opsi yang dapat dipilih
const SelectInput = ({
  value, // Nilai yang dipilih
  onChange, // Fungsi untuk menangani perubahan nilai
  options, // Array opsi untuk dropdown
  className, // Kelas tambahan untuk styling
  label, // Label untuk dropdown
  ...props // Properti tambahan
}) => {
  return (
    // Kontainer utama dengan styling fleksibel menggunakan Tailwind CSS
    <div className="flex flex-col">
      {/* Render label jika tersedia */}
      {label && (
        <label className="mb-1 font-bold text-[#9500FF]">{label}</label>
      )}
      {/* Elemen <select> untuk dropdown */}
      <select
        value={value} // Nilai yang dipilih
        onChange={onChange} // Fungsi yang dipanggil saat nilai berubah
        className={`p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] ${className}`} // Styling default dengan opsi tambahan
        {...props} // Spread operator untuk menerima properti tambahan
      >
        {/* Render opsi dropdown */}
        {options.map((option) => (
          <option
            key={option.value || option} // Key unik untuk setiap opsi
            value={option.value || option} // Nilai opsi
          >
            {option.label || option} {/* Label opsi */}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
