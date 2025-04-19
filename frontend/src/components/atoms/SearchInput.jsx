// src/components/atoms/SearchInput.js
import React from "react";

// Komponen SearchInput untuk menampilkan input pencarian
const SearchInput = ({ value, onChange, placeholder = "Cari Data ..." }) => {
  return (
    // Kontainer utama dengan styling fleksibel menggunakan Tailwind CSS
    <div className="w-full flex flex-auto">
      {/* Elemen input teks untuk pencarian */}
      <input
        type="text" // Tipe input adalah teks
        value={value} // Nilai input terikat ke prop value
        onChange={onChange} // Fungsi yang dipanggil saat nilai input berubah
        placeholder={placeholder} // Placeholder default atau yang diterima melalui prop
        className="p-2 border-0 rounded-md w-full m-2 bg-white" // Styling input
      />
    </div>
  );
};

export default SearchInput;
