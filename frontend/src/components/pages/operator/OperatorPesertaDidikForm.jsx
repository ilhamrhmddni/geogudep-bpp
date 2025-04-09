import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import {
  createPesertadidik,
  editPesertadidik,
  fetchPesertadidikById,
} from "../../../services/PesertadidikService";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPesertaDidikForm = ({ isEdit }) => {
  const [formData, setFormData] = useState({
    nama: "",
    gender: "",
    ttl: "",
    detailtingkatan: "",
    gudep_id: localStorage.getItem("gudep_id") || "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmSubmit = window.confirm(
      isEdit
        ? "Apakah kamu yakin ingin mengubah data peserta didik ini?"
        : "Apakah kamu yakin ingin menyimpan data peserta didik baru?"
    );

    if (confirmSubmit) {
      try {
        let result;

        if (isEdit && id) {
          const gugusData = await fetchGugusdepanId(formData.gudep_id);
          const jumlahPutraLama = gugusData.data.jumlah_putra || 0;
          const jumlahPutriLama = gugusData.data.jumlah_putri || 0;

          const jumlahPutraBaru = formData.gender === "Laki-laki" ? 1 : 0;
          const jumlahPutriBaru = formData.gender === "Perempuan" ? 1 : 0;

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

          result = await editPesertadidik(id, formData);
        } else {
          result = await createPesertadidik(formData);

          const gugusData = await fetchGugusdepanId(formData.gudep_id);
          const jumlahPutraLama = gugusData.data.jumlah_putra || 0;
          const jumlahPutriLama = gugusData.data.jumlah_putri || 0;

          const jumlahPutraBaru = formData.gender === "Laki-laki" ? 1 : 0;
          const jumlahPutriBaru = formData.gender === "Perempuan" ? 1 : 0;

          await editGugusdepan(formData.gudep_id, {
            jumlah_putra: jumlahPutraLama + jumlahPutraBaru,
            jumlah_putri: jumlahPutriLama + jumlahPutriBaru,
          });
        }

        Swal.fire("Sukses!", "Data peserta didik telah disimpan.", "success");
        navigate("/operator/pesertadidik");
      } catch (error) {
        console.error("Error saving data:", error);
        Swal.fire("Error!", "Gagal menyimpan data peserta didik.", "error");
      }
    }
  };

  return (
    <OperatorTemplate>
      <div className="flex flex-col items-center justify-center px-4 py-6">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center text-[#9500FF] mb-6">
            {isEdit ? "Edit Peserta Didik" : "Tambah Peserta Didik"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9500FF] font-semibold mb-1">
                Nama
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>

            <div>
              <label className="block text-[#9500FF] font-semibold mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              >
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9500FF] font-semibold mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="ttl"
                value={formData.ttl}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>

            <div>
              <label className="block text-[#9500FF] font-semibold mb-1">
                Detail Tingkatan
              </label>
              <input
                type="text"
                name="detailtingkatan"
                value={formData.detailtingkatan}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#9500FF] text-white py-3 rounded-xl font-semibold hover:bg-[#7a00cc] transition-colors"
            >
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidikForm;
