import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createKwarran,
  editKwarran,
  fetchKwarranId,
} from "../../../services/KwarranService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminKwarranForm = ({ isEdit }) => {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    ketua_kwarran: "",
    ketua_dkr: "",
    email: "",
    jumlah_gudep: 0, // Pastikan jumlah_gudep adalah angka
  });
  const [isDirty, setIsDirty] = useState(false); // Menandai apakah ada perubahan pada form
  const navigate = useNavigate();
  const { id } = useParams();

  // Fungsi untuk mengambil data Kwarran berdasarkan ID
  const fetchData = useCallback(async () => {
    try {
      const result = await fetchKwarranId(id);
      setFormData({
        kode: result.data.kode || "",
        nama: result.data.nama || "",
        ketua_kwarran: result.data.ketua_kwarran || "",
        ketua_dkr: result.data.ketua_dkr || "",
        email: result.data.email || "",
        jumlah_gudep: parseInt(result.data.jumlah_gudep, 10) || 0, // Pastikan jumlah_gudep adalah integer
      });
    } catch (error) {
      Swal.fire("Error!", "Gagal mengambil data Kwarran.", "error");
    }
  }, [id]);

  // Panggil fetchData jika dalam mode edit
  useEffect(() => {
    if (isEdit && id) {
      fetchData();
    }
  }, [isEdit, id, fetchData]);

  // Fungsi untuk menangani perubahan nilai input
  const handleValueChange = useCallback(
    (field) => (e) => {
      let value = e.target.value;

      // Pastikan jumlah_gudep selalu berupa angka
      if (field === "jumlah_gudep") {
        value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true); // Tandai form sebagai "dirty"
    },
    []
  );

  // Fungsi untuk menangani navigasi dengan konfirmasi jika ada perubahan
  const handleNavigation = useCallback(async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: "Perubahan Belum Disimpan",
        text: "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Tinggalkan",
        cancelButtonText: "Tidak, Tetap di Sini",
      });
      if (result.isConfirmed) {
        setIsDirty(false);
        navigate("/admin/kwarran");
      }
    } else {
      navigate("/admin/kwarran");
    }
  }, [isDirty, navigate]);

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pastikan jumlah_gudep adalah integer
    const formattedData = {
      ...formData,
      jumlah_gudep: parseInt(formData.jumlah_gudep, 10) || 0,
    };

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Perbarui Kwarran" : "Buat Kwarran Baru",
      text: isEdit
        ? "Apakah Anda yakin ingin memperbarui data Kwarran?"
        : "Apakah Anda yakin ingin menyimpan Kwarran baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    });

    if (confirmSubmit.isConfirmed) {
      try {
        if (isEdit && id) {
          await editKwarran(id, formattedData);
        } else {
          await createKwarran(formattedData);
        }
        Swal.fire("Berhasil!", "Data berhasil disimpan.", "success");
        setIsDirty(false);
        navigate("/admin/kwarran");
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data.";
        Swal.fire("Error!", message, "error");
      }
    }
  };

  // Tambahkan event listener untuk konfirmasi sebelum meninggalkan halaman
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const confirmationMessage =
          "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?";
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <AdminTemplate>
      <div className="flex flex-col mt-20 md:mt-0">
        {/* Header */}
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          <div
            className="flex items-center gap-4 font-bold text-lg md:text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={handleNavigation}
          >
            <span className="material-icons text-white">arrow_back</span>
            <span className="hidden md:inline">Kembali</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Ubah Data Kwarran" : "Tambah Data Kwarran"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Kode */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Kode
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={handleValueChange("kode")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Nama */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={handleValueChange("nama")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Ketua Kwarran */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Ketua Kwarran
                </label>
                <input
                  type="text"
                  value={formData.ketua_kwarran}
                  onChange={handleValueChange("ketua_kwarran")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Ketua DKR */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Ketua DKR
                </label>
                <input
                  type="text"
                  value={formData.ketua_dkr}
                  onChange={handleValueChange("ketua_dkr")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Email */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleValueChange("email")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200"
              >
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminKwarranForm;
