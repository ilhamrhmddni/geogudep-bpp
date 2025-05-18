// src/components/pages/UserLaporan.jsx (Versi fetch API, 2 Dropdown <select>)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService"; // Sesuaikan path
import { fetchKwarran } from "../../../services/KwarranService"; // Sesuaikan path
import { createLaporan } from "../../../services/LaporanService"; // Sesuaikan path
import UserTemplate from "../../templates/UserTemplate"; // Sesuaikan path

// Opsi untuk dropdown Level (tetap)
const levelOptions = [
  { value: "semua", label: "Seluruh Data" },
  { value: "kwarran", label: "Per-Kwarran" },
  { value: "gudep", label: "Spesifik Gudep" },
];

const UserLaporan = () => {
  // State form
  const [formData, setFormData] = useState({
    nama: "",
    asal: "",
    noHp: "",
    email: "",
    level: "",
    targetId: "",
  });

  // State untuk opsi dropdown
  const [kwarranOptions, setKwarranOptions] = useState([]);
  const [gudepOptions, setGudepOptions] = useState([]);

  // State untuk loading & error form submit
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // State untuk loading & error data dropdown
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const navigate = useNavigate();

  // Di dalam komponen UserLaporan

  // useEffect untuk Fetch Data Dropdown
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        console.log("Fetching Kwarran and Gudep data for dropdowns...");
        const [kwarranResult, gudepResult] = await Promise.all([
          fetchKwarran(),
          fetchGugusdepan(),
        ]);

        console.log("Kwarran API Result:", kwarranResult);
        console.log("Gudep API Result:", gudepResult); // Lihat struktur asli gudepResult.data

        // Transformasi data Kwarran (tidak berubah)
        const transformedKwarran = (kwarranResult?.data || []).map((k) => ({
          value: k.id,
          label: k.nama,
        }));
        setKwarranOptions(transformedKwarran);
        console.log("Kwarran options set:", transformedKwarran);

        // --- FILTER & TRANSFORMASI GUDEP ---
        const allGudepData = gudepResult?.data || [];

        // 1. FILTER: Hapus item jika no_gudep adalah "ADMIN"
        const filteredGudepApiData = allGudepData.filter(
          (gudep) => gudep.no_gudep !== "ADMIN"
        );
        console.log(
          "Filtered Gudep API Data (ADMIN excluded):",
          filteredGudepApiData
        );

        // 2. TRANSFORMASI: Map data yang SUDAH DIFILTER
        const transformedGudep = filteredGudepApiData
          .map((g) => {
            // Pastikan id dan label ada
            if (!g.id || !(g.nama || g.no_gudep)) {
              console.warn("Item Gudep (setelah filter) tidak lengkap:", g);
              return null;
            }
            return {
              id: g.id,
              value: g.id, // Tetap pakai ID asli Gudep sbg value
              label: `${g.nama || "No Gudep : "} ${g.no_gudep || g.id}`,
            };
          })
          .filter(Boolean); // Hapus null jika ada

        setGudepOptions(transformedGudep);
        console.log(
          "Gudep options set (ADMIN excluded, using ID as value):",
          transformedGudep
        );
        // --- AKHIR FILTER & TRANSFORMASI GUDEP ---
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setOptionsError("Gagal memuat data Kwarran/Gudep.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadDropdownData();
  }, []); // Dependency tetap kosong

  // Handler input & select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "level") {
        newState.targetId = "";
      }
      return newState;
    });
  };

  // Fungsi handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validasi dasar
    if (!formData.level) {
      Swal.fire(
        "Peringatan!",
        "Silakan pilih Level Laporan terlebih dahulu.",
        "warning"
      );
      return;
    }
    if (
      (formData.level === "kwarran" || formData.level === "gudep") &&
      !formData.targetId
    ) {
      Swal.fire(
        "Peringatan!",
        `Silakan pilih ${
          formData.level === "kwarran" ? "Kwarran" : "Gudep"
        } spesifik.`,
        "warning"
      );
      return;
    }

    setLoadingSubmit(true);

    const confirmSubmit = await Swal.fire({
      /* ... Konfirmasi Swal ... */ title: "Simpan Permintaan Laporan",
      text: "Apakah Anda yakin ingin menyimpan permintaan laporan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      setLoadingSubmit(false);
      return;
    }

    try {
      console.log("Mengirim data laporan:", formData);
      await createLaporan(formData);

      Swal.fire(
        "Sukses!",
        "Permintaan laporan baru telah disimpan.",
        "success"
      ).then(() => {
        // Reset form
        setFormData({
          nama: "",
          asal: "",
          noHp: "",
          email: "",
          level: "",
          targetId: "",
        });
        navigate("/laporan");
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat menyimpan data laporan.";
      setSubmitError(errorMessage);
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <UserTemplate>
      <div className="flex flex-col mt-4 md:mt-16">
        <div className="flex items-center p-4 m-auto w-full md:ml-20 md:mt-4">
          <h1 className="text-3xl font-bold flex-grow text-center text-[#9500FF]">
            Permintaan Laporan
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            {/* Tampilkan Error */}
            {submitError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error Submit!</strong>{" "}
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
            {optionsError && (
              <div
                className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Peringatan!</strong>{" "}
                <span className="block sm:inline">{optionsError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama, Asal, NoHp, Email */}
              <div className="flex flex-col">
                {" "}
                <label htmlFor="nama" className="mb-1 font-bold text-[#9500FF]">
                  Nama Pelapor
                </label>{" "}
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />{" "}
              </div>
              <div className="flex flex-col">
                {" "}
                <label htmlFor="asal" className="mb-1 font-bold text-[#9500FF]">
                  Asal (Instansi/Pribadi)
                </label>{" "}
                <input
                  type="text"
                  id="asal"
                  name="asal"
                  value={formData.asal}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />{" "}
              </div>
              <div className="flex flex-col">
                {" "}
                <label htmlFor="noHp" className="mb-1 font-bold text-[#9500FF]">
                  No. HP
                </label>{" "}
                <input
                  type="number"
                  id="noHp"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />{" "}
              </div>
              <div className="flex flex-col">
                {" "}
                <label
                  htmlFor="email"
                  className="mb-1 font-bold text-[#9500FF]"
                >
                  Email
                </label>{" "}
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />{" "}
              </div>

              {/* DROPDOWN 1: LEVEL */}
              <div className="flex flex-col">
                <label
                  htmlFor="level"
                  className="mb-1 font-bold text-[#9500FF]"
                >
                  Data yang di request :
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  disabled={loadingOptions}
                >
                  <option value="" disabled>
                    {loadingOptions
                      ? "Memuat level..."
                      : "-- Pilih Level Laporan --"}
                  </option>
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* DROPDOWN 2: TARGET SPESIFIK (Kondisional) */}
              {(formData.level === "kwarran" || formData.level === "gudep") && (
                <div className="flex flex-col">
                  <label
                    htmlFor="targetId"
                    className="mb-1 font-bold text-[#9500FF]"
                  >
                    {formData.level === "kwarran"
                      ? "Pilih Kwarran"
                      : "Pilih Gudep"}
                  </label>
                  <select
                    id="targetId"
                    name="targetId"
                    value={formData.targetId}
                    onChange={handleChange}
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                    required
                    disabled={
                      loadingOptions ||
                      (formData.level === "kwarran" &&
                        kwarranOptions.length === 0) ||
                      (formData.level === "gudep" && gudepOptions.length === 0)
                    }
                  >
                    <option value="" disabled>
                      {loadingOptions
                        ? `Memuat ${
                            formData.level === "kwarran" ? "Kwarran" : "Gudep"
                          }...`
                        : `-- Pilih ${
                            formData.level === "kwarran" ? "Kwarran" : "Gudep"
                          } --`}
                    </option>
                    {/* Opsi dinamis berdasarkan level */}
                    {formData.level === "kwarran" &&
                      kwarranOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    {formData.level === "gudep" &&
                      gudepOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  {/* Tampilkan pesan jika opsi tidak ada setelah loading selesai */}
                  {!loadingOptions &&
                    formData.level === "kwarran" &&
                    kwarranOptions.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Data Kwarran tidak ditemukan.
                      </p>
                    )}
                  {!loadingOptions &&
                    formData.level === "gudep" &&
                    gudepOptions.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Data Gudep tidak ditemukan.
                      </p>
                    )}
                </div>
              )}

              {/* Tombol Simpan */}
              <button
                type="submit"
                className={`w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200 ${
                  loadingSubmit ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loadingSubmit || loadingOptions}
              >
                {loadingSubmit ? "Menyimpan..." : "Kirim Permintaan Laporan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserLaporan;
