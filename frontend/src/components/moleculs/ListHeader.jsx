import React from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../atoms/AddButton";
import Dropdown from "../atoms/Dropdown"; // Import komponen Dropdown
import SearchInput from "../atoms/SearchInput";

// Komponen ListHeader menerima berbagai props untuk mengatur header daftar, termasuk:
// title (judul), searchQuery (nilai pencarian), setSearchQuery (fungsi untuk mengubah pencarian),
// addButtonLabel (label tombol tambah), addButtonRoute (route untuk tombol tambah),
// onAddButtonClick (fungsi custom untuk tombol tambah), dan dropdowns (opsi dropdown).
const ListHeader = ({
  title,
  searchQuery,
  setSearchQuery,
  addButtonLabel,
  addButtonRoute,
  onAddButtonClick,
  dropdowns, // Tambahkan prop dropdowns untuk mendukung dropdown dinamis
}) => {
  const navigate = useNavigate(); // Hook untuk navigasi ke route lain

  // Fungsi untuk menangani klik tombol tambah
  const handleAdd = () => {
    if (onAddButtonClick) {
      onAddButtonClick(); // Panggil fungsi custom jika disediakan
    } else if (addButtonRoute) {
      navigate(addButtonRoute); // Navigasi ke route yang ditentukan
    }
  };

  return (
    // Header dengan styling Tailwind CSS
    <div className="flex bg-purple-600 rounded-2xl items-center justify-between px-6 py-1">
      {/* Judul header */}
      <h2 className="text-xl font-bold whitespace-nowrap text-white">
        {title}
      </h2>
      <div className="flex items-center space-x-2">
        {/* Input pencarian */}
        <SearchInput
          value={searchQuery} // Nilai pencarian
          onChange={(e) => setSearchQuery(e.target.value)} // Fungsi untuk mengubah pencarian
          placeholder={`Cari ${title}...`} // Placeholder dinamis berdasarkan judul
          className="text-black"
        />
        {/* Render dropdown jika tersedia */}
        {dropdowns &&
          dropdowns.map((dropdown) => (
            <Dropdown
              key={dropdown.name} // Key unik untuk setiap dropdown
              options={dropdown.options} // Opsi dropdown
              selected={dropdown.selected} // Nilai yang dipilih
              onChange={dropdown.onChange} // Fungsi untuk menangani perubahan
              placeholder={dropdown.placeholder} // Placeholder dropdown
              className="text-black" // Styling tambahan
            />
          ))}
        {/* Tombol tambah jika label tombol disediakan */}
        {addButtonLabel && (
          <AddButton
            onClick={handleAdd} // Fungsi untuk menangani klik tombol
            label={addButtonLabel} // Label tombol
            icon="add" // Ikon tombol
            className="mx-2"
          />
        )}
      </div>
    </div>
  );
};

export default ListHeader;
