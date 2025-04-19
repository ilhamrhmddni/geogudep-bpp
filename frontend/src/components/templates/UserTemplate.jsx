import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarMenuUser from "../organisms/SidebarMenuUser";

const UserTemplate = ({ children }) => {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );
  const location = useLocation();

  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    localStorage.setItem("sidebarOpen", newValue);
  };

  const menuItems = [
    { name: "Dashboard", icon: "home", path: "/" },
    { name: "Data Gugus Depan", icon: "map", path: "/gugusdepan" },
    { name: "Form Laporan", icon: "star", path: "/laporan" },
  ];

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* SidebarMenuUser menerima props untuk status dan fungsi toggle */}
      <SidebarMenuUser
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={location.pathname}
      />
      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? "md:ml-[210px]" : ""
        }`}
      >
        {/* Konten utama halaman */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default UserTemplate;
