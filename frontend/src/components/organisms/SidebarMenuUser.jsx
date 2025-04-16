import { Menu, X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const SidebarMenuUser = ({
  isOpen,
  toggleMenu,
  menuItems,
  currentPath,
  rightIcon,
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login"); // Arahkan ke halaman login
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#9500FF] shadow-lg p-4 z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-[210px]"
      }`}
      style={{ width: "280px" }}
    >
      {/* Logo yang sebagian terlihat */}
      <div
        className="w-auto h-16 bg-no-repeat"
        style={{ backgroundImage: "url('/logo2.png')" }}
      ></div>

      {/* Tombol Toggle di Dalam Sidebar */}
      <button
        onClick={toggleMenu}
        className={`absolute top-6 right-4 p-2 text-white rounded z-50 transition-all duration-300`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X size={24} className="font-bold" />
        ) : (
          <Menu size={24} className="font-bold" />
        )}
      </button>

      {/* Daftar menu */}
      <ul className="mt-10 space-y-3 text-md font-bold">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center cursor-pointer text-[#9500FF] hover:bg-white hover:text-[#9500FF] rounded-full p-2 pl-4 ${
              currentPath === item.path
                ? "bg-white text-[#9500FF]"
                : "text-white"
            }`} // Menambahkan kelas untuk item aktif
            onClick={() => navigate(item.path)}
          >
            <span className="flex-grow">{item.name}</span>
            {/* Menampilkan ikon di sebelah kanan nama menu */}
            <span className="material-icons">{item.icon}</span>
          </li>
        ))}
      </ul>

      {/* Tombol Login di Sidebar */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 z-30 flex justify-center items-center transition-transform duration-300 mb-8"
        style={{ transform: "translateX(0px)" }}
      >
        <button
          onClick={handleLogin}
          className="bg-[#9500FF] text-white px-8 py-2 font-bold transition-transform hover:bg-white hover:text-[#9500FF] cursor-pointer rounded-full flex gap-4"
        >
          Login Operator
          <span className="material-icons">person</span>
        </button>
      </div>

      {/* Menampilkan ikon di kanan */}
      <div className="md:mt-48 lg:mt-54 xl:mt-88 flex-grow">{rightIcon}</div>
    </div>
  );
};

export default SidebarMenuUser;
