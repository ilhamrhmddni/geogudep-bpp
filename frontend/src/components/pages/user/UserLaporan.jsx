import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 untuk notifikasi
import { createLaporan } from "../../../services/LaporanService";
import HeaderUser from "../../organisms/HeaderUser";
import UserTemplate from "../../templates/UserTemplate";

const UserLaporan = () => {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    nama: "",
    asal: "",
    noHp: "",
    email: "",
  });
  const [loading, setLoading] = useState(false); // State untuk status loading
  const [error, setError] = useState(null); // State untuk pesan error
  const navigate = useNavigate();

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Konfirmasi sebelum menyimpan data
    const confirmSubmit = await Swal.fire({
      title: "Simpan Laporan Baru",
      text: "Apakah kamu yakin ingin menyimpan laporan baru ini?",
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
      await createLaporan(formData); // Panggil API untuk menyimpan data
      Swal.fire("Sukses!", "Laporan baru telah disimpan.", "success").then(
        () => navigate("/laporan") // Redirect ke halaman laporan
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Terjadi kesalahan saat menyimpan data laporan.");
      Swal.fire(
        "Error!",
        "Terjadi kesalahan saat menyimpan data laporan.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserTemplate>
      <HeaderUser />
      <div className="flex flex-col mt-8">
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          <h1 className="text-3xl font-bold flex-grow text-center text-[#9500FF]">
            Tambah Data Laporan
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
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
              {/* Input Nama */}
              <div className="flex flex-col">
                <label htmlFor="nama" className="mb-1 font-bold text-[#9500FF]">
                  Nama
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              {/* Input Asal */}
              <div className="flex flex-col">
                <label htmlFor="asal" className="mb-1 font-bold text-[#9500FF]">
                  Asal
                </label>
                <input
                  type="text"
                  id="asal"
                  name="asal"
                  value={formData.asal}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              {/* Input No. HP */}
              <div className="flex flex-col">
                <label htmlFor="noHp" className="mb-1 font-bold text-[#9500FF]">
                  No. HP
                </label>
                <input
                  type="text"
                  id="noHp"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              {/* Input Email */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-1 font-bold text-[#9500FF]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              {/* Tombol Simpan */}
              <button
                type="submit"
                className={`w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserLaporan;
