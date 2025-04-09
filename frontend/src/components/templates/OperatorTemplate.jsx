import React, { useState } from "react";
import Header from "../organisms/Header";
import SidebarMenu from "../organisms/SidebarMenu"; // Mengimpor Sidebar

const OperatorTemplate = ({ children }) => {
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
      name: "Data Gugus Depan",
      icon: "school", // Nama ikon dari Google Icons
      path: "/operator/gugusdepan",
    },
    {
      name: "Data Geografis",
      icon: "map", // Nama ikon dari Google Icons
      path: "/operator/geografis",
    },
    {
      name: "Data Prestasi",
      icon: "star", // Nama ikon dari Google Icons
      path: "/operator/prestasi",
    },
    {
      name: "Data Peserta Didik",
      icon: "people", // Nama ikon dari Google Icons
      path: "/operator/pesertadidik",
    },
  ];

  // Mendapatkan path saat ini
  const currentPath = window.location.pathname;

  return (
    <div className="h-screen flex">
      {/* Sidebar Menu */}
      <SidebarMenu
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
        <Header title="Dashboard Operator" />
        {/* Konten halaman utama */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default OperatorTemplate;
