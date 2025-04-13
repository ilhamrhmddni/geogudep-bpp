import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createEvent,
  editEvent,
  fetchEventById,
} from "../../../services/EventService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminEventForm = ({ isEdit }) => {
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [penyelenggara, setPenyelenggara] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch data if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchEventById(id);
          const { data } = result;
          setNama(data.nama);
          setTanggalMulai(data.tanggal_mulai?.split("T")[0] || "");
          setTanggalSelesai(data.tanggal_selesai?.split("T")[0] || "");
          setTempat(data.tempat);
          setTingkat(data.tingkat);
          setPenyelenggara(data.penyelenggara);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !nama ||
      !tanggalMulai ||
      !tanggalSelesai ||
      !tempat ||
      !tingkat ||
      !penyelenggara
    ) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pastikan semua data terisi dengan benar.",
      });
      return;
    }

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Event" : "Simpan Event Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data event ini?"
        : "Apakah kamu yakin ingin menyimpan event baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9500FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      console.log("Form submission canceled.");
      return;
    }

    const newData = {
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      tempat,
      tingkat,
      penyelenggara,
    };

    try {
      if (isEdit && id) {
        await editEvent(id, newData);
        Swal.fire("Sukses!", "Data event berhasil diubah.", "success");
      } else {
        await createEvent(newData);
        Swal.fire("Sukses!", "Event baru telah disimpan.", "success");
      }

      navigate("/admin/event");
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-col">
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <div
            className="flex items-center gap-4 font-bold text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            Kembali
          </div>
          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            {isEdit ? "Ubah Data Event" : "Tambah Data Event"}
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Nama Event
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Tempat</label>
                <input
                  type="text"
                  value={tempat}
                  onChange={(e) => setTempat(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Tingkat</label>
                <input
                  type="text"
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={penyelenggara}
                  onChange={(e) => setPenyelenggara(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

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

export default AdminEventForm;
