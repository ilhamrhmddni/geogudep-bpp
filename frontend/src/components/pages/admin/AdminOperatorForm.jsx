import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createUser,
  editUser,
  fetchUserId,
} from "../../../services/OperatorService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperatorForm = ({ isEdit }) => {
  // State untuk form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showViewPassword, setShowViewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch data ketika component dimount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (isEdit && id) {
        // Mode edit: ambil data operator dari API
        try {
          const response = await fetchUserId(id);
          setUsername(response.data.username);
          setCurrentPassword(response.data.password || "");
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to fetch operator data.");
          Swal.fire("Error!", "Failed to fetch operator data.", "error");
        } finally {
          setLoading(false);
        }
      } else {
        // Mode tambah: reset form
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setShowChangePassword(true); // Di mode tambah, selalu tampilkan password field
        setShowViewPassword(false);
        setCurrentPassword("");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  // Toggle tampilan form ubah password
  const handleToggleChangePassword = () => {
    setShowChangePassword(!showChangePassword);
    // Reset password fields ketika toggle
    setPassword("");
    setConfirmPassword("");
  };

  // Toggle tampilan password (show/hide)
  const handleToggleViewPassword = () => {
    setShowViewPassword(!showViewPassword);
  };

  // Handler submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Cek apakah password dan konfirmasi password sama
    if (showChangePassword && password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Password baru dan konfirmasi password tidak cocok.",
      });
      setLoading(false);
      return;
    }

    // Konfirmasi sebelum submit
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Operator" : "Simpan Operator Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data operator ini?"
        : "Apakah kamu yakin ingin menyimpan operator baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9500FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      setLoading(false);
      return;
    }

    try {
      const userData = new FormData(); // Buat FormData

      userData.append("username", username);
      if (showChangePassword && password) {
        userData.append("password", password); // Tambahkan password jika ada
      }

      console.log("Data yang akan dikirim:", userData);

      if (isEdit && id) {
        // Mode edit: update data operator
        const result = await editUser(id, userData);
        console.log("Hasil update:", result);

        Swal.fire("Sukses!", "Data operator berhasil diubah.", "success").then(
          () => {
            navigate("/admin/operator");
          }
        );
      } else {
        // Mode tambah: buat operator baru
        const result = await createUser(userData);
        console.log("Hasil create:", result);

        Swal.fire("Sukses!", "Operator baru telah disimpan.", "success").then(
          () => {
            navigate("/admin/operator");
          }
        );
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Terjadi kesalahan saat menyimpan data.");
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-col">
        {/* Header section with back button */}
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <div
            className="flex items-center gap-4 font-bold text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            Kembali
          </div>
          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            {isEdit ? "Ubah Data Operator" : "Tambah Data Operator"}
          </h1>
        </div>

        {/* Form section */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            {/* Error message display */}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden username field for accessibility */}
              <input
                type="hidden"
                autoComplete="username"
                value={username}
                name="username"
              />

              {/* Username field */}
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  readOnly={isEdit}
                  autoComplete="username"
                />
              </div>

              {/* Password fields for Add mode */}
              {!isEdit && (
                <>
                  <div className="flex flex-col">
                    <label className="mb-1 font-bold text-[#9500FF]">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                      autoComplete="new-password"
                      required={!isEdit}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 font-bold text-[#9500FF]">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                      autoComplete="new-password"
                      required={!isEdit}
                    />
                  </div>
                </>
              )}

              {/* Password fields for Edit mode */}
              {isEdit && (
                <>
                  {/* Current password display */}
                  <div className="flex flex-col">
                    <label className="mb-1 font-bold text-[#9500FF]">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showViewPassword ? "text" : "password"}
                        value={currentPassword}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full"
                        readOnly
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={handleToggleViewPassword}
                      >
                        <span className="material-icons">
                          {showViewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Toggle button to show/hide change password form */}
                  {!showChangePassword && (
                    <button
                      type="button"
                      className="text-[#9500FF] hover:text-[#7a00cc] font-semibold"
                      onClick={handleToggleChangePassword}
                    >
                      Ubah Password
                    </button>
                  )}

                  {/* Change password form */}
                  {showChangePassword && (
                    <>
                      <div className="flex flex-col">
                        <label className="mb-1 font-bold text-[#9500FF]">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                          autoComplete="new-password"
                          required={showChangePassword}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-bold text-[#9500FF]">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                          autoComplete="new-password"
                          required={showChangePassword}
                        />
                      </div>

                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 font-semibold mt-2"
                        onClick={handleToggleChangePassword}
                      >
                        Batal Ubah Password
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className={`w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminOperatorForm;
