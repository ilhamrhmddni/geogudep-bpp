import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert untuk notifikasi
import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import {
  createPesertadidik,
  editPesertadidik,
  fetchPesertadidikById,
} from "../../../services/PesertadidikService";
import { decodeToken } from "../../../utils/jwt";
import OperatorTemplate from "../../templates/OperatorTemplate";

// Decode token untuk mendapatkan gudep_id
const tokenData = decodeToken();
const gudepId = tokenData?.gudep_id;

const OperatorPesertaDidikForm = ({ isEdit }) => {
  // State untuk menyimpan data form
  const [formData, setFormData] = useState({
    nama: "",
    gender: "",
    ttl: "",
    detailtingkatan: "",
    gudep_id: gudepId,
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari parameter URL

  // Ambil data peserta didik jika mode edit
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchPesertadidikById(id);
          const { data } = result;
          setFormData({
            nama: data.nama || "",
            gender: data.gender || "",
            ttl: data.ttl || "",
            detailtingkatan: data.detailtingkatan || "",
            gudep_id: data.gudep_id || "",
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          Swal.fire("Error!", "Gagal mengambil data peserta didik.", "error");
        }
      };

      fetchData();
    }
  }, [id, isEdit]);

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Konfirmasi sebelum menyimpan data
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Peserta Didik" : "Simpan Peserta Didik Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data peserta didik ini?"
        : "Apakah kamu yakin ingin menyimpan data peserta didik baru?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9500FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      return;
    }

    try {
      if (isEdit && id) {
        // Ambil data gugusdepan untuk update jumlah putra/putri
        const gugusData = await fetchGugusdepanId(formData.gudep_id);
        const jumlahPutraLama = gugusData.data.jumlah_putra || 0;
        const jumlahPutriLama = gugusData.data.jumlah_putri || 0;

        const jumlahPutraBaru = formData.gender === "Laki-laki" ? 1 : 0;
        const jumlahPutriBaru = formData.gender === "Perempuan" ? 1 : 0;

        // Update jumlah putra/putri di gugusdepan
        await editGugusdepan(formData.gudep_id, {
          jumlah_putra:
            jumlahPutraLama +
            jumlahPutraBaru -
            (formData.gender === "Laki-laki" ? 0 : 1),
          jumlah_putri:
            jumlahPutriLama +
            jumlahPutriBaru -
            (formData.gender === "Perempuan" ? 0 : 1),
        });

        // Update data peserta didik
        await editPesertadidik(id, formData);
      } else {
        // Tambahkan data peserta didik baru
        await createPesertadidik(formData);

        // Ambil data gugusdepan untuk update jumlah putra/putri
        const gugusData = await fetchGugusdepanId(formData.gudep_id);
        const jumlahPutraLama = gugusData.data.jumlah_putra || 0;
        const jumlahPutriLama = gugusData.data.jumlah_putri || 0;

        const jumlahPutraBaru = formData.gender === "Laki-laki" ? 1 : 0;
        const jumlahPutriBaru = formData.gender === "Perempuan" ? 1 : 0;

        // Update jumlah putra/putri di gugusdepan
        await editGugusdepan(formData.gudep_id, {
          jumlah_putra: jumlahPutraLama + jumlahPutraBaru,
          jumlah_putri: jumlahPutriLama + jumlahPutriBaru,
        });
      }

      Swal.fire("Sukses!", "Data peserta didik telah disimpan.", "success");
      navigate("/operator/pesertadidik"); // Redirect ke halaman daftar peserta didik
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire("Error!", "Gagal menyimpan data peserta didik.", "error");
    }
  };

  return (
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
          <h1 className="text-xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Edit Peserta Didik" : "Tambah Peserta Didik"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  placeholder="Masukkan Nama Peserta Didik"
                />
              </div>

              {/* Input Gender */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                >
                  <option value="">Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Input Tanggal Lahir */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="ttl"
                  value={formData.ttl}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              {/* Input Detail Tingkatan */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Detail Tingkatan
                </label>
                <input
                  type="text"
                  name="detailtingkatan"
                  value={formData.detailtingkatan}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  placeholder="Masukkan Detail Tingkatan Peserta Didik"
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
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidikForm;
