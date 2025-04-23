// src/components/templates/UserTemplate.jsx

import React, { useState } from "react"; // useEffect ditambahkan jika perlu fetch data di sini nantinya
import { useLocation } from "react-router-dom";
import HeaderUser from "../organisms/HeaderUser"; // <-- Import HeaderUser
import SidebarMenuUser from "../organisms/SidebarMenuUser"; // <-- Import SidebarMenuUser

const UserTemplate = ({ children }) => {
  // State untuk sidebar, ambil dari localStorage atau default false
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    // Pastikan defaultnya false jika localStorage tidak ada/invalid
    return savedState === "true";
  });
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => {
      const newValue = !prevIsOpen;
      localStorage.setItem("sidebarOpen", newValue);
      return newValue;
    });
  };

  // Menu items untuk user (contoh)
  const menuItems = [
    { name: "Dashboard", icon: "home", path: "/" },
    { name: "Data Gugus Depan", icon: "map", path: "/gugusdepan" },
    { name: "Form Laporan", icon: "description", path: "/laporan" }, // Ganti ikon jika perlu
  ];

  return (
    // Main flex container
    <div className="flex min-h-screen bg-gray-100">
      {" "}
      {/* Latar belakang abu-abu muda */}
      {/* Sidebar */}
      <SidebarMenuUser
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={location.pathname}
      />
      {/* Wrapper untuk Header dan Konten Utama */}
      <div
        // Margin kiri kondisional HANYA di layar md+, sesuai lebar sidebar (280px)
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? "md:ml-[210px]" : "ml-0"
        }`}
      >
        {/* Render HeaderUser dan kirim prop isSidebarOpen */}
        <HeaderUser isSidebarOpen={isOpen} />

        {/* Konten Utama Halaman */}
        {/* Beri padding atas seukuran tinggi HeaderUser */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-20">
          {" "}
          {/* Sesuaikan pt-20 jika tinggi header berbeda */}
          {children} {/* Konten halaman spesifik */}
        </main>
      </div>
    </div>
  );
};

export default UserTemplate;
