import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
// Pastikan path import service ini benar sesuai struktur proyek Anda
import { fetchUserId } from "../../../services/OperatorService";
// Pastikan path import template ini benar
import { createUser, updateUser } from "../../../services/OperatorService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperatorForm = ({ isEdit }) => {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  // Updated handleSubmit function for AdminOperatorForm.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi username
    if (!username.trim()) {
      Swal.fire("Peringatan", "Username tidak boleh kosong.", "warning");
      setLoading(false);
      return;
    }

    // Validasi hanya jika ganti password diaktifkan
    if (showChangePassword) {
      if (isEdit && !oldPassword.trim()) {
        Swal.fire(
          "Peringatan",
          "Password lama harus ada untuk mengganti password.",
          "warning"
        );
        setLoading(false);
        return;
      }

      if (!password) {
        Swal.fire("Peringatan", "Password baru tidak boleh kosong.", "warning");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        Swal.fire(
          "Peringatan",
          "Password baru dan konfirmasi password tidak cocok.",
          "warning"
        );
        setLoading(false);
        return;
      }
    }

    // Di sini lanjutkan dengan proses submit ke backend atau logic lainnya
    try {
      // Panggil API sesuai kebutuhan (create/update user)
      if (isEdit) {
        await updateUser(id, {
          username,
          ...(showChangePassword && password ? { password } : {}),
        });
        Swal.fire("Berhasil", "Data operator berhasil diperbarui", "success");
      } else {
        await createUser({ username, password });
        Swal.fire("Berhasil", "Operator baru berhasil ditambahkan", "success");
      }

      navigate("/admin/operator");
    } catch (err) {
      console.error("Error submitting form:", err);

      let errorMessage = "Terjadi kesalahan saat menyimpan data.";

      // Check for direct error message first (this handles our custom error from createUser)
      if (err.message === "Username sudah terdaftar") {
        errorMessage = "Username sudah digunakan. Silakan pilih username lain.";
      }
      // Then check response data as fallback
      else if (err.response && err.response.data) {
        const serverMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message;

        if (serverMessage === "Username sudah terdaftar") {
          errorMessage =
            "Username sudah digunakan. Silakan pilih username lain.";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      }

      setError(errorMessage);
      setLoading(false);
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-col mt-20 md:mt-0">
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
              {isEdit && (
                <div className="flex flex-col">
                  <label
                    htmlFor="oldPassword"
                    className="mb-1 font-semibold text-purple-600"
                  >
                    Password Lama
                  </label>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="relative flex-grow">
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
                    <button
                      type="button"
                      onClick={handleToggleChangePassword}
                      className={`text-sm font-semibold py-1 md:py-3 px-3 rounded w-max ${
                        showChangePassword
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {showChangePassword
                        ? "Batal Ganti Password"
                        : "Ganti Password"}
                    </button>
                  </div>
                </div>
              )}
              {showChangePassword && (
                <div className="flex flex-col space-y-4">
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
