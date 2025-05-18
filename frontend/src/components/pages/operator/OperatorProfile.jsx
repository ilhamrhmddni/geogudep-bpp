import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchProfile, updateProfile } from "../../../services/ProfileService"; // Gunakan ProfileService
import { decodeToken } from "../../../utils/jwt";
import Label from "../../atoms/FormLabel";
import Input from "../../atoms/TextInput"; // Menggunakan komponen Input atom

// --- PERUBAHAN: Import Template ---
import OperatorTemplate from "../../templates/OperatorTemplate"; // Ganti dengan OperatorTemplate

const OperatorProfile = () => {
  // --- PERUBAHAN: Nama Komponen ---
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
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);

  const navigate = useNavigate();
  const decodedToken = useMemo(() => decodeToken(), []);
  const userId = decodedToken?.user_id;

  // --- (Fungsi fetchProfileData, useEffect, handleInputChange, handlePhotoChange, handleUserUpdate - SAMA PERSIS DENGAN AdminProfile ---
  const fetchProfileData = useCallback(async (id) => {
    if (!id) {
      setError("User ID tidak ditemukan dari token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile(id);
      setUserData(data);
      const currentPhotoUrl = data.photo_path || null;
      setExistingPhotoUrl(currentPhotoUrl);
      setPhotoPreview(currentPhotoUrl);
    } catch (err) {
      setError(err.message || "Gagal mengambil data profil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData(userId);
  }, [userId, fetchProfileData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
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
        setPhotoPreview(existingPhotoUrl || null);
        setPhoto(null);
      }
    },
    [existingPhotoUrl]
  );

  const handleUserUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!userId) {
        Swal.fire("Error", "User ID tidak ditemukan.", "error");
        return;
      }

      Swal.fire({
        title: "Ubah Profil",
        text: "Apakah Anda yakin ingin memperbarui profil?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a00cc",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, lanjutkan!",
        cancelButtonText: "Batal",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          setError(null);
          try {
            const formData = new FormData();
            formData.append("username", userData.username);
            formData.append("email", userData.email);
            formData.append("fullname", userData.fullname);
            formData.append("asal", userData.asal);
            formData.append("no_telp", userData.no_telp);
            if (photo) {
              formData.append("profilePicture", photo, photo.name); // Pastikan nama field backend cocok
            }
            await updateProfile(userId, formData);
            await fetchProfileData(userId);
            Swal.fire("Berhasil!", "Profil Anda telah diperbarui.", "success");
          } catch (err) {
            setError(
              err.message || "Terjadi kesalahan saat memperbarui profil."
            );
            Swal.fire("Gagal!", err.message || "Terjadi kesalahan.", "error");
          } finally {
            setLoading(false);
          }
        }
      });
    },
    [userId, userData, photo, fetchProfileData]
  );
  // --- (Akhir fungsi-fungsi) ---

  return (
    // --- PERUBAHAN: Menggunakan OperatorTemplate ---
    <OperatorTemplate>
      <div className="flex flex-col mt-20 md:mt-0">
        {/* Header */}
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          <div
            className="flex items-center gap-4 font-bold text-lg md:text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            <span className="hidden md:inline">Kembali</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] mt-4 md:mt-0">
            Ubah Profil
          </h1>
        </div>

        {/* Konten Utama & Tata Letak (Sama seperti AdminProfile) */}
        <div className="flex flex-col md:flex-row items-center justify-center mt-8 md:mt-4 md:p-0">
          {/* Bagian Foto Profil */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-start mb-8 md:mb-0 px-4 md:ml-24">
            {" "}
            {/* Sesuaikan ml jika perlu */}
            <label className="font-bold text-[#9500FF] text-xl mb-4">
              Foto Profil
            </label>
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-48 h-48 rounded-full object-cover mb-4 border-4 border-[#9500FF]"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-[#9500FF]">
                <span className="text-gray-500">No Photo</span>
              </div>
            )}
            <input
              id="photoInputOperator" // ID unik jika diperlukan
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
            />
            {photo && (
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(existingPhotoUrl || null);
                }}
                className="text-xs text-red-600 hover:underline mt-1 self-center"
              >
                Hapus foto dipilih
              </button>
            )}
          </div>

          {/* Bagian Form Edit Profil */}
          <div className="w-full md:w-2/3 px-4">
            <form
              onSubmit={handleUserUpdate}
              className="space-y-4 bg-white p-6 md:p-8 rounded-lg shadow-md"
            >
              {/* Username (readonly) */}
              <div className="flex flex-col">
                <Label text="Username" htmlFor="usernameOp" />{" "}
                {/* ID unik jika perlu */}
                <input
                  type="text"
                  id="usernameOp"
                  name="username"
                  value={userData.username || ""}
                  onChange={handleInputChange}
                  className="border rounded-md border-gray-300 px-8 py-3 w-full bg-gray-100 cursor-not-allowed"
                  readOnly
                  required
                />
              </div>
              {/* Email */}
              <div className="flex flex-col">
                <Label text="Email" htmlFor="emailOp" />
                <Input
                  type="email"
                  id="emailOp"
                  name="email"
                  placeholder="Masukkan Email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* Nama Lengkap */}
              <div className="flex flex-col">
                <Label text="Nama Lengkap" htmlFor="fullnameOp" />
                <Input
                  type="text"
                  id="fullnameOp"
                  name="fullname"
                  placeholder="Masukkan Nama Lengkap"
                  value={userData.fullname}
                  onChange={handleInputChange}
                />
              </div>
              {/* Asal */}
              <div className="flex flex-col">
                <Label text="Asal" htmlFor="asalOp" />
                <Input
                  type="text"
                  id="asalOp"
                  name="asal"
                  placeholder="Masukkan Asal"
                  value={userData.asal}
                  onChange={handleInputChange}
                />
              </div>
              {/* No Telp */}
              <div className="flex flex-col">
                <Label text="No Telp" htmlFor="no_telpOp" />
                <Input
                  type="number"
                  id="no_telpOp"
                  name="no_telp"
                  placeholder="Masukkan No Telp"
                  value={userData.no_telp}
                  onChange={handleInputChange}
                />
              </div>
              {/* Tombol Update */}
              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Update Profile"}
              </button>
              {error && (
                <p className="text-red-500 mt-2 text-center">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
      {/* --- PERUBAHAN: Menggunakan OperatorTemplate --- */}
    </OperatorTemplate>
  );
};

// --- PERUBAHAN: Nama Komponen ---
export default OperatorProfile;
