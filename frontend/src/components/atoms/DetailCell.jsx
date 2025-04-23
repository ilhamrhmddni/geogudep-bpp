// src/components/pages/admin/AdminGugusdepan/DetailCell.jsx
import React, { useEffect, useRef, useState } from "react"; // Tambahkan useEffect, useRef

// Komponen DetailCell versi klik dengan penutup otomatis saat klik di luar:
// - State 'isOpen' dikelola di dalam komponen ini.
// - Popup muncul/hilang saat tombol di klik.
// - Popup juga tertutup jika diklik di luar area komponen.
// - Posisi masih diatur via CSS berdasarkan prop 'position'.
const DetailCell = ({ title, details, position = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null); // Ref untuk div pembungkus komponen

  // Tentukan kelas CSS untuk posisi popup (tidak berubah)
  const positionClass =
    position === "top" ? "bottom-full mb-2" : "top-full mt-2";

  // Fungsi untuk toggle popup saat tombol diklik
  const handleTogglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Efek untuk menambahkan/menghapus event listener klik di luar
  useEffect(() => {
    // Fungsi yang akan dijalankan saat ada klik di dokumen
    function handleClickOutside(event) {
      // Cek apakah ref sudah ada dan klik terjadi di LUAR area ref
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false); // Tutup popup jika klik di luar
      }
    }

    // Tambahkan event listener hanya jika popup sedang terbuka (isOpen === true)
    if (isOpen) {
      // Gunakan mousedown karena lebih cepat menangkap event daripada click
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Hapus listener jika popup tertutup
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Fungsi cleanup: Hapus listener saat komponen unmount atau saat isOpen berubah (sebelum effect baru dijalankan)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Effect ini bergantung pada state 'isOpen'

  return (
    // Container utama, tambahkan ref di sini
    <div ref={wrapperRef} className="relative cursor-pointer inline-block">
      {/* Elemen Pemicu (Trigger) - Tombol */}
      <button
        type="button"
        className="bg-[#9500FF] hover:bg-[#7a00cc] text-white font-bold py-1 px-2 rounded text-sm"
        onClick={handleTogglePopup} // Klik tombol akan toggle popup
      >
        <span
          className="material-icons align-middle"
          style={{ fontSize: "1.25rem" }}
        >
          {" "}
          {/* Sesuaikan fontSize jika perlu */}
          visibility{" "}
          {/* Nama ikon (ganti jika ingin ikon lain, misal 'info', 'more_horiz') */}
        </span>
      </button>

      {/* Kontainer detail popup */}
      {/* Dirender secara kondisional berdasarkan state 'isOpen' */}
      {isOpen && (
        <div
          className={`
            absolute z-50 /* z-index tinggi */
            bg-white border border-gray-300 rounded shadow-lg p-3 w-64 /* Tampilan popup */
            left-1/2 transform -translate-x-1/2  /* Posisi horizontal tengah */
            ${positionClass}                      /* Posisi vertikal dinamis (atas/bawah) */
          `}
          // Tidak perlu onMouseEnter/Leave jika tidak ada interaksi khusus di popup
        >
          {details.map((detail, index) => (
            <p key={index} className="text-sm">
              <strong>{detail.label}:</strong> {detail.value || "-"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailCell;
