import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SidebarMenuUser = ({
  isOpen, // Status apakah sidebar terbuka
  toggleMenu, // Fungsi untuk membuka/menutup sidebar
  menuItems, // Daftar item menu
  currentPath, // Path saat ini untuk menandai menu aktif
  rightIcon, // Ikon tambahan di bagian kanan sidebar
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk dropdown menu di mobile

  // Fungsi untuk mengarahkan ke halaman login
  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      {/* Sidebar untuk desktop dan tablet */}
      <div
        className={`hidden md:block fixed top-0 left-0 h-full bg-[#9500FF] shadow-lg p-4 z-1200 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-[210px]"
        }`}
        style={{ width: "280px" }}
      >
        {/* Logo yang sebagian terlihat */}
        <div
          className="w-auto h-16 bg-no-repeat"
          style={{ backgroundImage: "url('/logo2.png')" }}
          onClick={handleLogoClick}
        ></div>

        {/* Tombol Toggle di Dalam Sidebar */}
        <button
          onClick={toggleMenu}
          className="absolute top-6 right-4 p-2 text-white rounded z-50 transition-all duration-300"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X size={24} className="font-bold" /> // Ikon untuk menutup sidebar
          ) : (
            <Menu size={24} className="font-bold" /> // Ikon untuk membuka sidebar
          )}
        </button>

        {/* Daftar menu */}
        <ul className="mt-10 space-y-2 text-md font-bold">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`flex justify-between items-center cursor-pointer text-[#9500FF] hover:bg-white hover:text-[#9500FF] rounded-full p-2 pl-4 ${
                currentPath === item.path
                  ? "bg-white text-[#9500FF]" // Menandai menu aktif
                  : "text-white"
              }`}
              onClick={() => navigate(item.path)} // Navigasi ke path menu
            >
              <span className="flex-grow">{item.name}</span>
              {/* Menampilkan ikon di sebelah kanan nama menu */}
              <span className="material-icons">{item.icon}</span>
            </li>
          ))}
        </ul>

        {/* Tombol Login di Sidebar */}
        <div className="fixed bottom-0 left-0 w-full p-4 z-30 flex justify-center items-center transition-transform duration-300 mb-8">
          <button
            onClick={handleLogin}
            className="bg-[#9500FF] text-white px-8 py-2 font-bold transition-transform hover:bg-white hover:text-[#9500FF] cursor-pointer rounded-full flex gap-4"
          >
            Login Operator
            <span className="material-icons">person</span>
          </button>
        </div>

        {/* Menampilkan ikon tambahan di kanan */}
        <div className="md:mt-48 lg:mt-54 xl:mt-88 flex-grow">{rightIcon}</div>
      </div>

      {/* Dropdown menu untuk mobile */}
      <div className="md:hidden bg-[#9500FF] text-white p-4 shadow-md fixed top-0 left-0 w-full z-[1100]">
        <div className="flex justify-between items-center">
          {/* Logo Website */}
          <div
            className="w-32 h-10 bg-no-repeat bg-contain"
            style={{ backgroundImage: "url('/logo2.png')" }}
            onClick={handleLogoClick}
          ></div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <ul className="mt-8 space-y-2 text-md font-bold">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`flex items-center cursor-pointer p-2 rounded ${
                  currentPath === item.path
                    ? "bg-white text-[#9500FF]"
                    : "hover:bg-white hover:text-[#9500FF]"
                }`}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false); // Tutup menu setelah navigasi
                }}
              >
                {/* Display icon */}
                <span className="material-icons mr-2">{item.icon}</span>
                {item.name}
              </li>
            ))}
            <li>
              <button
                onClick={handleLogin}
                className="w-full  text-white px-4 py-2 font-bold rounded mt-4 items-center flex justify-center gap-2"
              >
                Login Operator
                <span className="material-icons">login</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </>
  );
};

export default SidebarMenuUser;
