import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import decodeToken from "./../../utils/jwt";

const Header = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("/default-profile.png");
  const [isImageError, setIsImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noGudep, setNoGudep] = useState(null);

  const decodedToken = decodeToken(); // Dekode token untuk mendapatkan data pengguna
  const { username, role, user_id } = decodedToken || {}; // Ambil data pengguna

  const formatRole = (role) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!user_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/user/${user_id}`);
        const result = await response.json();

        const path = result?.data?.photo_path;
        const gudep = result?.data?.gudepes?.no_gudep;

        if (response.ok) {
          if (path && path.trim() && path !== "null") {
            setProfilePic(path.trim());
          }
          if (gudep) {
            setNoGudep(gudep);
          }
        } else {
          console.warn("⚠️ Gagal mengambil data user:", result?.error);
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePic();
  }, [user_id]);

  const handleNavigate = () => {
    switch (role) {
      case "admin":
        navigate("/admin/profile");
        break;
      case "operator":
        navigate("/operator/profile");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <header className="w-full p-4 bg-white text-[#9500FF] flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 ml-20">
        <span className="text-xl font-bold">
          Sistem Informasi Geografis Pemetaan Gugus Depan Kota Balikpapan
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <p className="text-md font-semibold ">{username}</p>
          <p className="text-[12px] text-[#9500FF]">
            {formatRole(role)}
            {noGudep ? ` - ${noGudep}` : ""}
          </p>
        </div>
        <button
          onClick={handleNavigate}
          className="rounded-full border border-white p-1 transition-transform hover:border-gray-200"
        >
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : (
            <img
              src={isImageError ? "/default-profile.png" : profilePic}
              alt={`${username}'s profile picture`}
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => {
                setIsImageError(true);
                console.warn("⚠️ Gambar gagal dimuat, menggunakan default.");
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
