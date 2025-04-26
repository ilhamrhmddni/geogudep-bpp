import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../organisms/Header";
import SidebarMenu from "../organisms/SidebarMenu";

const AdminTemplate = ({ children }) => {
  // State untuk mengatur apakah sidebar terbuka atau tidak
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );

  // Mengambil lokasi saat ini dari router
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Mengupdate path saat lokasi berubah
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // Fungsi untuk toggle sidebar dan menyimpan status ke localStorage
  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    localStorage.setItem("sidebarOpen", newValue);
  };

  // Daftar item menu untuk sidebar
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

  return (
    <div className="h-screen flex">
      {/* SidebarMenu menerima props untuk status dan fungsi toggle */}
      <SidebarMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={currentPath}
      />
      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? "md:ml-[210px]" : ""
        }`}
      >
        {/* Header untuk menampilkan judul halaman */}
        <Header title="Dashboard Admin" />
        {/* Konten utama halaman */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminTemplate;
