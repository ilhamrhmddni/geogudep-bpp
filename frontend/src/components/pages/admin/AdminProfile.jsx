import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { editUser, fetchProfile } from "../../../services/OperatorService";
import decodeToken from "../../../utils/jwt";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminProfile = () => {
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
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const decoded = decodeToken();
    if (!decoded) {
      setError("Token invalid or not found");
      return;
    }

    const userId = decoded.user_id;
    fetchUserData(userId);
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const data = await fetchProfile(userId);
      setUserData(data);
      setPhotoPreview(data.photo_path || null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Ubah Profil",
      text: "Apakah Anda yakin ingin memperbarui profil?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        setError(null);

        try {
          const decoded = decodeToken();
          if (!decoded) {
            setError("Token invalid or not found");
            return;
          }

          const userId = decoded.user_id;
          const formData = new FormData();
          formData.append("username", userData.username);
          formData.append("email", userData.email);
          formData.append("fullname", userData.fullname);
          formData.append("asal", userData.asal);
          formData.append("no_telp", userData.no_telp);
          if (photo) {
            formData.append("photo", photo);
          }

          await editUser(userId, formData);
          Swal.fire("Berhasil!", "Profil Anda telah diperbarui.", "success");
        } catch (error) {
          setError(error.message);
          Swal.fire("Gagal!", error.message, "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <AdminTemplate>
      <div className="flex flex-col">
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <div
            className="flex items-center gap-4 font-bold text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            Kembali
          </div>

          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            Edit Profil
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-20 flex gap-8">
            {/* Left Side: Form */}
            <div className="w-1/2 pr-4">
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
                  <label className="mb-1 font-semibold">Full Name</label>
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
                  <label className="mb-1 font-semibold">Origin</label>
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
                  <label className="mb-1 font-semibold">Phone Number</label>
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
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </div>

            {/* Right Side: Profile Photo */}
            <div className="w-1/2 pl-4 flex flex-col items-center justify-center">
              <label className="font-bold text-[#9500FF] text-2xl mb-4">
                Profile Photo
              </label>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-50 h-50 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-50 h-50 rounded-full bg-gray-200 mb-4"></div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mb-4"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminProfile;
