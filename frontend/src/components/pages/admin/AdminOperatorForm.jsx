import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
// Pastikan path import service ini benar sesuai struktur proyek Anda
import {
  createUser,
  editUser,
  fetchUserId,
} from "../../../services/OperatorService";
// Pastikan path import template ini benar
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperatorForm = ({ isEdit }) => {
  // State untuk form
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState(""); // Password Baru
  const [confirmPassword, setConfirmPassword] = useState(""); // Konfirmasi Password Baru
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk kontrol UI
  const [showChangePassword, setShowChangePassword] = useState(!isEdit);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fungsi untuk reset form
  const resetForm = useCallback(() => {
    setUsername("");
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowChangePassword(!isEdit);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setLoading(false);
    setError(null);
  }, [isEdit]);

  // Fungsi untuk fetch data operator berdasarkan ID (hanya jika mode Edit)
  const fetchOperatorData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserId(id);
      setUsername(response.data.username);
      // !!! PERINGATAN KEAMANAN !!!
      setOldPassword(response.data.password || "");
      setShowChangePassword(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data operator.");
      Swal.fire("Error!", "Gagal mengambil data operator.", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Effect untuk fetch data saat komponen dimount atau ID/isEdit berubah
  useEffect(() => {
    if (isEdit && id) {
      fetchOperatorData();
    } else if (!isEdit) {
      resetForm();
    }
  }, [isEdit, id, fetchOperatorData, resetForm]);

  // Fungsi untuk toggle form (section) ubah password
  const handleToggleChangePassword = useCallback(() => {
    setShowChangePassword((prev) => {
      const nextState = !prev;
      if (!nextState) {
        setPassword("");
        setConfirmPassword("");
      }
      return nextState;
    });
  }, []);

  // Fungsi untuk toggle visibilitas password LAMA
  const handleToggleOldPassword = useCallback(() => {
    setShowOldPassword((prev) => !prev);
  }, []);

  // Fungsi untuk toggle visibilitas password BARU (dan konfirmasinya)
  const handleToggleNewPassword = useCallback(() => {
    setShowNewPassword((prev) => !prev);
  }, []);

  // Fungsi untuk submit form (Tambah atau Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi username
    if (!username.trim()) {
      Swal.fire("Peringatan", "Username tidak boleh kosong.", "warning");
      return;
    }

    // Validasi hanya jika section ganti password ditampilkan/aktif
    if (showChangePassword) {
      // Validasi Password Lama
      if (isEdit && !oldPassword.trim()) {
        Swal.fire(
          "Peringatan",
          "Password lama harus ada untuk mengganti password.",
          "warning"
        );
        return;
      }
      // Validasi Password Baru
      if (!password) {
        Swal.fire("Peringatan", "Password baru tidak boleh kosong.", "warning");
        return;
      }
      // Validasi Konfirmasi Password Baru
      if (password !== confirmPassword) {
        Swal.fire(
          "Peringatan",
          "Password baru dan konfirmasi password tidak cocok.",
          "warning"
        );
        return;
      }
    }

    setLoading(true);

    // Siapkan data payload
    let userData = {
      username: username.trim(),
    };
    if (isEdit && showChangePassword) {
      userData = { ...userData, oldPassword: oldPassword, password: password };
    } else if (!isEdit) {
      userData = { ...userData, password: password };
    }

    // --- DEBUGGING LOG ---
    console.log("Data yang akan dikirim ke API:", userData);
    // --- END DEBUGGING LOG ---

    // Konfirmasi Aksi
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Operator" : "Simpan Operator Baru",
      text: isEdit
        ? `Apakah kamu yakin ingin mengubah data ${
            showChangePassword ? "dan password " : ""
          }operator ini?`
        : "Apakah kamu yakin ingin menyimpan operator baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      setLoading(false);
      return;
    }

    // Proses pengiriman data
    try {
      if (isEdit && id) {
        await editUser(id, userData); // Kirim userData
        Swal.fire("Sukses!", "Data operator berhasil diubah.", "success").then(
          () => navigate("/admin/operator")
        );
      } else {
        await createUser(userData); // Kirim userData
        Swal.fire("Sukses!", "Operator baru telah disimpan.", "success").then(
          () => navigate("/admin/operator")
        );
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      setError(errorMessage);
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Render komponen
  return (
    <AdminTemplate>
      <div className="flex flex-col mt-20 md:mt-0">
        {/* Header */}
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          <div
            className="flex items-center gap-4 font-bold text-lg md:text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer hover:bg-[#7a00cc] transition-colors"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            <span className="hidden md:inline">Kembali</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Ubah Data Operator" : "Tambah Data Operator"}
          </h1>
        </div>

        {/* Form Kontainer */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24 mb-8">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="flex flex-col">
                <label
                  htmlFor="username"
                  className="mb-1 font-semibold text-purple-600"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] read-only:bg-gray-100"
                  required
                  readOnly={isEdit}
                  autoComplete="username"
                />
              </div>
              {/* Password Lama (Edit Mode) */}
              {isEdit && (
                // Kontainer utama (tetap flex-col untuk label di atas)
                <div className="flex flex-col">
                  <label
                    htmlFor="oldPassword"
                    className="mb-1 font-semibold text-purple-600"
                  >
                    Password Lama
                  </label>
                  {/* Kontainer baru untuk mengatur input dan tombol 'Ganti Password' (SELALU BARIS) */}
                  {/* Kelas diubah: tidak ada lagi flex-col, md:flex-row, md:items-center, md:space-x-4 */}
                  <div className="flex items-center space-x-4 mt-1">
                    {" "}
                    {/* Selalu flex row, items-center, dan space-x-4 */}
                    {/* Grup Input + Tombol Lihat (dibuat flex-grow agar mengisi ruang) */}
                    <div className="relative flex-grow">
                      {/* Input Field Password Lama */}
                      <input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full pr-10 bg-gray-100 ${
                          showChangePassword
                            ? "disabled:cursor-not-allowed"
                            : ""
                        }`}
                        autoComplete="current-password"
                        readOnly={!showChangePassword}
                        disabled={showChangePassword}
                      />
                      {/* Tombol Toggle Lihat/Sembunyikan */}
                      <button
                        type="button"
                        onClick={handleToggleOldPassword}
                        disabled={showChangePassword}
                        className={`absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-[#9500FF] ${
                          showChangePassword
                            ? "disabled:cursor-not-allowed disabled:opacity-50"
                            : ""
                        }`}
                        aria-label={showOldPassword ? "Sembunyikan" : "Lihat"}
                      >
                        <span className="material-icons text-lg">
                          {showOldPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>{" "}
                    {/* Akhir dari div relative (input group) */}
                    {/* Tombol Toggle Ganti Password (selalu di samping kanan input group) */}
                    <button
                      type="button"
                      onClick={handleToggleChangePassword}
                      // Kelas whitespace-nowrap DIHAPUS dari sini
                      className={`text-sm font-semibold py-1 md:py-3 px-3 rounded w-max ${
                        // Tetap gunakan w-max agar lebar tidak terlalu besar
                        showChangePassword
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {showChangePassword
                        ? "Batal Ganti Password"
                        : "Ganti Password"}
                    </button>
                  </div>{" "}
                  {/* Akhir dari div flex (selalu baris) */}
                </div> // Akhir dari div flex flex-col utama
              )}{" "}
              {/* Akhir dari {isEdit && (...)} */}
              {/* Password Baru & Konfirmasi */}
              {showChangePassword && (
                <div className="flex flex-col space-y-4">
                  {/* Password Baru */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="newPassword"
                      className="mb-1 font-semibold text-purple-600"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleToggleNewPassword}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-[#9500FF]"
                        aria-label={showNewPassword ? "Sembunyikan" : "Lihat"}
                      >
                        <span className="material-icons text-lg">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Konfirmasi Password Baru */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 font-semibold text-purple-600"
                    >
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleToggleNewPassword}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-[#9500FF]"
                        aria-label={showNewPassword ? "Sembunyikan" : "Lihat"}
                      >
                        <span className="material-icons text-lg">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Tombol Submit */}
              <button
                type="submit"
                className={`w-full bg-[#9500FF] text-white font-bold p-3 mt-6 rounded-md hover:bg-[#7a00cc] transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan Operator Baru"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminOperatorForm;
