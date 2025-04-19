import React from "react";
import Dropdown from "../atoms/Dropdown";
import SearchInput from "../atoms/SearchInput";

// Komponen FilterHeader untuk menampilkan header dengan fitur pencarian dan filter dropdown
const FilterHeader = ({
  title, // Judul header
  searchQuery, // Query pencarian
  onSearchChange, // Fungsi untuk menangani perubahan pencarian
  dropdowns, // Array konfigurasi dropdown
}) => {
  return (
    // Container header dengan styling Tailwind CSS
    <div className="flex bg-purple-600 rounded-2xl items-center justify-between px-6 py-1">
      {/* Judul header */}
      <span className="text-xl font-bold whitespace-nowrap text-white">
        {title}
      </span>

      {/* Input pencarian */}
      <SearchInput
        value={searchQuery} // Nilai pencarian
        onChange={onSearchChange} // Fungsi untuk menangani perubahan pencarian
        className="text-black"
        placeholder={`Cari ${title}...`} // Placeholder dinamis berdasarkan judul
      />

      {/* Dropdown filter */}
      {dropdowns &&
        dropdowns.map((dropdown, index) => (
          <Dropdown
            key={dropdown.name || `dropdown-${index}`} // Gunakan key unik untuk setiap dropdown
            options={dropdown.options.map((option) => ({
              ...option,
              key: option.id || option.value || option.nama, // Tambahkan key unik untuk setiap opsi
            }))}
            selected={dropdown.selected} // Nilai yang dipilih
            onChange={dropdown.onChange} // Fungsi untuk menangani perubahan dropdown
            placeholder={dropdown.placeholder} // Placeholder dropdown
          />
        ))}
    </div>
  );
};

export default FilterHeader;
