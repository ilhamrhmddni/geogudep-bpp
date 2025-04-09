import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile, editUser } from "../../../services/OperatorService"; // Sesuaikan path
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorProfile = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    fullname: "",
    asal: "",
    no_telp: "",
    photo_path: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      setError("User ID not found in localStorage");
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await fetchProfile(storedUserId);
        setUserData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm(
      "Apakah Anda yakin ingin memperbarui profil?"
    );
    if (!confirmUpdate) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const storedUserId = localStorage.getItem("user_id");
      await editUser(storedUserId, userData);
      setSuccessMessage("Profil berhasil diperbarui!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OperatorTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24 flex gap-">
          <div className="w-1/2 pr-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Edit Profil</h1>
            <form onSubmit={handleUserUpdate} className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Username</label>
                <input
                  type="text"
                  value={userData.username || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  value={userData.email || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  value={userData.fullname || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, fullname: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">Asal</label>
                <input
                  type="text"
                  value={userData.asal || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, asal: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-semibold">No. Telepon</label>
                <input
                  type="text"
                  value={userData.no_telp || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, no_telp: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#9500FF] transition duration-200"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profil"}
              </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {successMessage && (
              <p className="text-green-500 mt-2">{successMessage}</p>
            )}
          </div>
          <div className="w-1/2 pl-4 flex flex-col items-center justify-center bg-[#9500FF] rounded-2xl">
            <label className="font-bold text-white text-2xl mb-8">
              Foto Profil
            </label>
            {userData.photo_path && (
              <img
                src={userData.photo_path}
                alt="Foto Profil"
                className="w-50 h-50 rounded-full object-cover mb-4"
              />
            )}
            <input
              type="text"
              value={userData.photo_path || ""}
              onChange={(e) =>
                setUserData({ ...userData, photo_path: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-1/2 bg-white"
            />
            <button className="bg-gray-300 text-black font-bold p-3 my-4 rounded-md hover:bg-gray-400 transition duration-200">
              Tambahkan Foto
            </button>
          </div>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorProfile;
