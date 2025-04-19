import React, { useState } from "react";
import SidebarMenuUser from "../organisms/SidebarMenuUser"; // Mengimpor Sidebar

const UserTemplate = ({ children }) => {
  // Ambil langsung dari localStorage saat inisialisasi state
  const initialOpen = localStorage.getItem("sidebarOpen") === "true";
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    localStorage.setItem("sidebarOpen", newValue.toString());
  };

  // Array menu dengan ikon
  const menuItems = [
    {
      name: "Dashboard",
      icon: "home", // Nama ikon dari Google Icons
      path: "/",
    },
    {
      name: "Data Gugus Depan",
      icon: "map", // Nama ikon dari Google Icons
      path: "/gugusdepan",
    },
    {
      name: "Form Laporan",
      icon: "star", // Nama ikon dari Google Icons
      path: "/laporan",
    },
  ];

  // Mendapatkan path saat ini
  const currentPath = window.location.pathname;

  return (
    <div className="h-screen flex">
      {/* Sidebar Menu */}
      <SidebarMenuUser
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={currentPath}
      />
      {/* Konten utama */}
      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? "ml-[210px]" : "ml-0"
        }`}
        style={{
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Konten halaman utama */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default UserTemplate;
