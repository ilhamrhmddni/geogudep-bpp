// src/templates/AdminTemplate.js
import React, { useState } from "react";
import Header from "../organisms/Header";
import SidebarMenu from "../organisms/SidebarMenu";

// Ambil langsung dari localStorage saat inisialisasi state
const AdminTemplate = ({ children }) => {
  const initialOpen = localStorage.getItem("sidebarOpen") === "true";
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    localStorage.setItem("sidebarOpen", newValue.toString());
  };

  const menuItems = [
    { name: "Kwarran", icon: "splitscreen", path: "/admin/kwarran" },
    { name: "Operator", icon: "person", path: "/admin/operator" },
    { name: "Gugus Depan", icon: "school", path: "/admin/gugusdepan" },
    { name: "Geografis", icon: "map", path: "/admin/geografis" },
    { name: "Event", icon: "event", path: "/admin/event" },
    { name: "Prestasi", icon: "star", path: "/admin/prestasi" },
    { name: "Peserta Didik", icon: "people", path: "/admin/pesertadidik" },
    { name: "Laporan Gudep", icon: "assignment", path: "/admin/laporangudep" },
  ];

  const currentPath = window.location.pathname;

  return (
    <div className="h-screen flex">
      <SidebarMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={currentPath}
      />

      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? "ml-[210px]" : ""
        }`}
      >
        <Header title="Dashboard Admin" />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminTemplate;
