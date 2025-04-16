import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { editUser, fetchProfile } from "../../../services/OperatorService";
import decodeToken from "../../../utils/jwt";
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
      setPhotoPreview(data.photo_path || null); // Mengatur preview foto dengan path yang benar
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
        setSuccessMessage("");

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
            formData.append("photo_path", photo); // Foto yang diupload
          }

          const updatedUser = await editUser(userId, formData);

          // Ambil data pengguna lagi untuk memastikan semua informasi terbaru ditampilkan
          await fetchUserData(userId); // Memanggil fungsi untuk mengambil data pengguna

          setSuccessMessage("Profil berhasil diperbarui!");
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
    <OperatorTemplate>
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
                  <label className="mb-1 font-semibold text-[#9500FF]">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userData.username || ""}
                    onChange={(e) =>
                      setUserData({ ...userData, username: e.target.value })
                    }
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] bg-gray-100 "
                    required
                    disabled
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold text-[#9500FF]">
                    Email
                  </label>
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
                  <label className="mb-1 font-semibold text-[#9500FF]">
                    Full Name
                  </label>
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
                  <label className="mb-1 font-semibold text-[#9500FF]">
                    Asal
                  </label>
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
                  <label className="mb-1 font-semibold text-[#9500FF]">
                    No Telp
                  </label>
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
                  className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md  hover:bg-[#7a00cc] cursor-pointer transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 mt-2">{successMessage}</p>
                )}
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
                  alt="Foto Profil"
                  className="w-80 h-80 rounded-full object-cover mb-4 border-4 border-[#9500FF]"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-gray-500">Tidak ada foto</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className=" text-[#9500FF] rounded-md cursor-pointer "
              />
            </div>
          </div>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorProfile;
