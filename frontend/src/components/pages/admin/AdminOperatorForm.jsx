import React, { useCallback, useEffect, useState } from "react";
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

  // Fungsi untuk reset form
  const resetForm = useCallback(() => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowChangePassword(true);
    setShowViewPassword(false);
    setCurrentPassword("");
    setLoading(false);
  }, []);

  // Fungsi untuk fetch data operator berdasarkan ID
  const fetchOperatorData = useCallback(async () => {
    try {
      const response = await fetchUserId(id);
      setUsername(response.data.username);
      setCurrentPassword(response.data.password || "");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data operator.");
      Swal.fire("Error!", "Gagal mengambil data operator.", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch data ketika komponen dimount
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isEdit && id) {
      fetchOperatorData();
    } else {
      resetForm();
    }
  }, [isEdit, id, fetchOperatorData, resetForm]);

  // Fungsi untuk toggle form ubah password
  const handleToggleChangePassword = useCallback(() => {
    setShowChangePassword(!showChangePassword);
    setPassword("");
    setConfirmPassword("");
  }, [showChangePassword]);

  // Fungsi untuk toggle visibilitas password
  const handleToggleViewPassword = useCallback(() => {
    setShowViewPassword(!showViewPassword);
  }, [showViewPassword]);

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validasi username
    if (!username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Username tidak boleh kosong.",
      });
      setLoading(false);
      return;
    }

    // Validasi password dan konfirmasi password
    if (showChangePassword && password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Password baru dan konfirmasi password tidak cocok.",
      });
      setLoading(false);
      return;
    }

    // Ensure username is passed correctly
    const userData = {
      username: username.trim(),
      ...(showChangePassword && password ? { password } : {}),
    };

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
      if (isEdit && id) {
        await editUser(id, userData);
        Swal.fire("Sukses!", "Data operator berhasil diubah.", "success").then(
          () => navigate("/admin/operator")
        );
      } else {
        await createUser(userData); // Pass userData as an object
        Swal.fire("Sukses!", "Operator baru telah disimpan.", "success").then(
          () => navigate("/admin/operator")
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
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Ubah Data Operator" : "Tambah Data Operator"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            {/* Tampilkan pesan error jika ada */}
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
              {/* Input username */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
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

              {/* Input password */}
              {showChangePassword && (
                <>
                  <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-purple-600">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-purple-600">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </>
              )}

              {/* Tombol submit */}
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
