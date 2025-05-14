import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../../services/AuthService";
import { decodeToken } from "../../utils/jwt";

const SidebarMenu = ({
  isOpen,
  toggleMenu,
  menuItems,
  currentPath,
  rightIcon,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isImageError, setIsImageError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const decodedToken = decodeToken();
    const { username, role, user_id } = decodedToken || {};
    setUsername(username || "Pengguna");
    setRole(role || "User");

    // Fetch profile picture only if not already cached
    const cachedProfilePic = localStorage.getItem("profilePic");
    if (cachedProfilePic) {
      setProfilePic(cachedProfilePic);
    } else if (user_id) {
      const fetchProfilePic = async () => {
        try {
          const response = await fetch(`${API_URL}user/${user_id}`);
          const result = await response.json();
          if (response.ok) {
            const path = result?.data?.photo_path;
            if (path && path.trim() && path !== "null") {
              setProfilePic(path.trim());
              localStorage.setItem("profilePic", path.trim()); // Cache the profile picture
            }
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      };

      fetchProfilePic();
    }
  }, []);

  const handleLogoClick = () => {
    if (["admin"].includes(role)) {
      navigate("/admin/kwarran");
    }
    if (["operator"].includes(role)) {
      navigate("/operator/gugusdepan");
    } else {
      console.warn("Akses ditolak: Role tidak diizinkan.");
    }
  };

  // Logout function
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
    <>
      {/* Sidebar untuk desktop dan tablet */}
      <div
        className={`hidden md:block fixed top-0 left-0 h-full bg-[#9500FF] shadow-lg p-4 z-100 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-[210px]"
        }`}
        style={{ width: "280px" }}
      >
        {/* Logo */}
        <div
          className="w-auto h-16 bg-no-repeat cursor-pointer"
          style={{ backgroundImage: "url('/logo2.png')" }}
          onClick={handleLogoClick}
          title="Kembali ke dashboard"
        />

        {/* Tombol Toggle di Dalam Sidebar */}
        <button
          onClick={toggleMenu}
          className="absolute top-6 right-4 p-2 text-white rounded z-50 transition-all duration-300"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Daftar menu */}
        <ul className="mt-10 space-y-2 text-md font-bold">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`flex justify-between items-center cursor-pointer text-[#9500FF] hover:bg-white hover:text-[#9500FF] rounded-full p-2 pl-4 ${
                currentPath === item.path
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

        {/* Tombol Logout di Sidebar */}
        <div className="fixed bottom-0 left-0 w-full p-4 z-30 flex justify-center items-center transition-transform duration-300 mb-8">
          <button
            onClick={handleLogout}
            className="bg-[#9500FF] text-white px-8 py-2 font-bold transition-transform hover:bg-white hover:text-[#9500FF] cursor-pointer rounded-full flex gap-4"
          >
            Keluar
            <span className="material-icons">logout</span>
          </button>
        </div>

        {/* Menampilkan ikon tambahan di kanan */}
        <div className="md:mt-48 lg:mt-54 xl:mt-88 flex-grow">{rightIcon}</div>
      </div>

      {/* Dropdown menu untuk mobile */}
      <div className="block md:hidden bg-[#9500FF] text-white p-4 shadow-md fixed top-0 left-0 w-full z-[1100]">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="w-32 h-10 bg-no-repeat bg-contain cursor-pointer"
            style={{ backgroundImage: "url('/logo2.png')" }}
            onClick={handleLogoClick}
          />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="mt-4">
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-4">
              <div
                className={`${
                  role === "admin" ? "w-8 h-8" : "w-24 h-24"
                } bg-gray-300 rounded-full flex items-center justify-center text-[#9500FF] font-bold`}
              >
                <img
                  src={isImageError ? "" : profilePic}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setIsImageError(true)}
                />
              </div>
              <div className="text-center">
                <p className="text-[#9500FF] font-bold text-lg">{username}</p>
                <button
                  onClick={() => {
                    const profilePath = `/${role}/profile`; // Ensure the path is correctly formatted
                    navigate(profilePath); // Navigate to the profile page
                    setIsMobileMenuOpen(false); // Close the mobile menu
                  }}
                  className="text-sm text-[#9500FF] hover:underline hover:cursor-pointer"
                >
                  Lihat Profile
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <ul className="space-y-2 text-md font-bold">
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
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="material-icons mr-2">{item.icon}</span>
                  {item.name}
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-white px-4 py-2 font-bold rounded mt-4 items-center flex justify-center gap-2"
                >
                  Keluar
                  <span className="material-icons">logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarMenu;
