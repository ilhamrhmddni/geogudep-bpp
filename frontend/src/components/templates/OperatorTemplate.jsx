import { useState } from "react";
import { useLocation } from "react-router-dom"; // Gunakan hook untuk mendapatkan lokasi saat ini
import Header from "../organisms/Header";
import SidebarMenu from "../organisms/SidebarMenu";

const OperatorTemplate = ({ children }) => {
  // State untuk mengatur apakah sidebar terbuka atau tidak
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );

  // Mengambil lokasi saat ini dari router
  const location = useLocation();

  // Fungsi untuk toggle sidebar dan menyimpan status ke localStorage
  const toggleMenu = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    localStorage.setItem("sidebarOpen", newValue);
  };

  // Daftar item menu untuk sidebar
  const menuItems = [
    { name: "Data Gugus Depan", icon: "school", path: "/operator/gugusdepan" },
    { name: "Data Geografis", icon: "map", path: "/operator/geografis" },
    { name: "Data Prestasi", icon: "star", path: "/operator/prestasi" },
    {
      name: "Data Peserta Didik",
      icon: "people",
      path: "/operator/pesertadidik",
    },
  ];

  return (
    <div className="h-screen flex bg-gray-100">
      {/* SidebarMenu menerima props untuk status dan fungsi toggle */}
      <SidebarMenu
        isOpen={isOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        currentPath={location.pathname} // Gunakan lokasi dari router
      />
      <div
        className={`transition-all duration-300 w-full ${
          isOpen ? "md:ml-[210px]" : ""
        }`}
      >
        {/* Header hanya muncul di tablet dan desktop */}
        <div className="hidden md:block">
          <Header title="Dashboard Operator" />
        </div>
        {/* Konten utama halaman */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default OperatorTemplate;
