import { Menu, X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../../services/AuthService";

const SidebarMenu = ({
  isOpen,
  toggleMenu,
  menuItems,
  currentPath,
  rightIcon,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        localStorage.clear();
        navigate("/login");
        Swal.fire({
          icon: "success",
          title: "Logout Berhasil",
          text: "Anda telah berhasil logout.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Logout Gagal",
          text: result.message || "Terjadi kesalahan saat logout.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Terjadi kesalahan saat logout: " + error.message,
      });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#9500FF] shadow-lg p-4 z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-[210px]"
      }`}
      style={{ width: "280px", display: "flex", flexDirection: "column" }}
    >
      <div
        className="w-auto h-16 bg-no-repeat "
        style={{ backgroundImage: "url('/logo2.png')" }}
      ></div>

      <button
        onClick={toggleMenu}
        className="absolute top-6 right-4 p-2 text-white rounded z-50 transition-all duration-300"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className="mt-10 space-y-3 text-md font-bold flex-grow">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center cursor-pointer text-[#9500FF] hover:bg-white hover:text-[#9500FF] rounded-full p-2 pl-4 ${
              currentPath.startsWith(item.path)
                ? "bg-white text-[#9500FF]"
                : "text-white"
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="flex-grow">{item.name}</span>
            <span className="material-icons">{item.icon}</span>
          </li>
        ))}
      </ul>

      <div className="md:mt-48 lg:mt-54 xl:mt-88">{rightIcon}</div>

      <div
        className="fixed bottom-0 left-0 w-full p-4 z-30 flex justify-center items-center transition-transform duration-300 mb-8"
        style={{ transform: "translateX(0px)" }}
      >
        <button
          onClick={handleLogout}
          className="bg-[#9500FF] text-white px-12 py-2 font-bold transition-transform hover:bg-white hover:text-[#9500FF] cursor-pointer rounded-full flex gap-4"
        >
          Keluar
          <span className="material-icons">logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarMenu;
