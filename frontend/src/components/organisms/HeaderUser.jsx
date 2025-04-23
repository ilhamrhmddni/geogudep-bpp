// src/components/organisms/HeaderUser.jsx

import React from "react";

// Terima prop isSidebarOpen
const HeaderUser = ({ isSidebarOpen }) => {
  return (
    // Header tetap fixed
    <header className="w-full p-4 bg-white text-[#9500FF] md:flex items-center shadow-md fixed top-0 left-0 right-0 z-1100 hidden">
      {/* Wrapper konten untuk padding & alignment */}
      {/* Padding kiri menyesuaikan sidebar, alignment teks juga menyesuaikan */}
      <div
        className={`flex-1 flex items-center transition-all duration-300 text-center ${
          isSidebarOpen ? "md:pl-[300px] xl:pl-[280px]" : "md:pl-6" // Padding kiri berubah
        }`}
      >
        {/* Kontainer untuk teks agar bisa diatur alignmentnya */}
        {/* Hapus justify-center dari header, atur di sini jika perlu atau biarkan default (kiri) */}
        <div
          className={`flex items-center gap-2 w-full ${
            isSidebarOpen ? "justify-center" : "justify-center" // Center jika open, atau start jika close di md+
          }`}
        >
          {/* Judul Aplikasi */}
          <span className="text-xl font-bold ">
            {" "}
            {/* Hapus text-center & ml dari sini */}
            Sistem Informasi Geografis Pemetaan Gugus Depan Kota Balikpapan
          </span>
        </div>
      </div>
    </header>
  );
};

export default HeaderUser;
