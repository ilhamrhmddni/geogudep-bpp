import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { editUser, fetchProfile } from "../../../services/OperatorService";
import { decodeToken } from "../../../utils/jwt";
import Label from "../../atoms/FormLabel";
import Input from "../../atoms/TextInput";
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

  // Gunakan useMemo agar decodeToken tidak menyebabkan render berulang
  const decodedToken = useMemo(() => decodeToken(), []);
  const userId = decodedToken?.user_id;

  const fetchUserData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile(id);
      setUserData(data);
      setPhotoPreview(data.photo_path || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("✅ useEffect berjalan sekali di awal");

    if (!userId) {
      setError("Token invalid or not found");
      return;
    }

    fetchUserData(userId);
  }, [userId, fetchUserData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  }, []);

  const handlePhotoChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      setPhoto(file);

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(userData.photo_path || null);
        setPhoto(null);
      }
    },
    [userData.photo_path]
  );

  const handleUserUpdate = useCallback(
    async (e) => {
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
            if (!userId) {
              setError("Token invalid or not found");
              return;
            }

            const formData = new FormData();
            formData.append("username", userData.username);
            formData.append("email", userData.email);
            formData.append("fullname", userData.fullname);
            formData.append("asal", userData.asal);
            formData.append("no_telp", userData.no_telp);
            if (photo) {
              formData.append("photo_path", photo);
            }

            await editUser(userId, formData);
            await fetchUserData(userId); // Refresh user data
            setSuccessMessage("Profil berhasil diperbarui!");
            Swal.fire("Berhasil!", "Profil Anda telah diperbarui.", "success");
          } catch (err) {
            setError(err.message);
            Swal.fire("Gagal!", err.message, "error");
          } finally {
            setLoading(false);
          }
        }
      });
    },
    [userId, userData, photo, fetchUserData]
  );

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
                  <Label text="Username" htmlFor="username" />
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={userData.username || ""}
                    onChange={handleInputChange}
                    className="bg-gray-100"
                    disabled
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label text="Email" htmlFor="email" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label text="Full Name" htmlFor="fullname" />
                  <Input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={userData.fullname || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label text="Asal" htmlFor="asal" />
                  <Input
                    type="text"
                    id="asal"
                    name="asal"
                    value={userData.asal || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col">
                  <Label text="No Telp" htmlFor="no_telp" />
                  <Input
                    type="text"
                    id="no_telp"
                    name="no_telp"
                    value={userData.no_telp || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] cursor-pointer transition duration-200"
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
              <Label text="Profile Photo" />
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
                className="text-[#9500FF] rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorProfile;
