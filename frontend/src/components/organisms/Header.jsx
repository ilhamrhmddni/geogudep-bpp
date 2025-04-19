import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../../utils/jwt"; // Fungsi untuk mendekode token JWT

const Header = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("/default-profile.png");
  const [isImageError, setIsImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noGudep, setNoGudep] = useState(null);

  const decodedToken = decodeToken();
  const { username, role, user_id } = decodedToken || {};

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!user_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/user/${user_id}`);
        const result = await response.json();

        if (response.ok) {
          const path = result?.data?.photo_path;
          const gudep = result?.data?.gudepes?.no_gudep;

          if (path && path.trim() && path !== "null")
            setProfilePic(path.trim());
          if (gudep) setNoGudep(gudep);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePic();
  }, [user_id]);

  const handleNavigate = () => {
    const routes = {
      admin: "/admin/profile",
      operator: "/operator/profile",
    };
    navigate(routes[role] || "/");
  };

  return (
    <header className="hidden md:flex bg-white text-[#9500FF] p-4 items-center justify-between shadow-md">
      {/* Bagian kiri header */}
      <div className="text-xl font-bold truncate md:ml-20">
        Sistem Informasi Geografis Pemetaan Gugus Depan
      </div>

      {/* Bagian kanan header */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-semibold truncate">{username}</p>
          <p className="text-sm truncate">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
            {noGudep ? ` - ${noGudep}` : ""}
          </p>
        </div>
        <button
          onClick={handleNavigate}
          className="rounded-full border border-white p-1"
        >
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : (
            <img
              src={isImageError ? "/default-profile.png" : profilePic}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              onError={() => setIsImageError(true)}
            />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
