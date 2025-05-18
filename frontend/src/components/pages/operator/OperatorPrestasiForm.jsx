import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchEvents } from "../../../services/EventService";
import {
  createEventGudep,
  editEventGudep,
  fetchEventGudepById,
} from "../../../services/PrestasiService";
import { decodeToken } from "../../../utils/jwt";
import AddButton from "../../atoms/AddButton";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPrestasiForm = ({ isEdit }) => {
  // State untuk menyimpan data form
  const [selectedEventId, setSelectedEventId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari parameter URL

  // Decode token untuk mendapatkan gudep_id
  const userData = decodeToken();
  const gudepId = userData?.gudep_id;

  // Fungsi untuk mengambil data event dan data prestasi jika mode edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEdit && id) {
          const result = await fetchEventGudepById(id);
          const { data } = result;
          setSelectedEventId(data.event_id);
          setKeterangan(data.keterangan);
        }

        const eventsResult = await fetchEvents();
        setEvents(eventsResult.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [id, isEdit]);

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!selectedEventId || !gudepId) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pastikan semua data terisi dengan benar.",
      });
      return;
    }

    // Konfirmasi sebelum menyimpan data
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Prestasi" : "Simpan Prestasi Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data prestasi ini?"
        : "Apakah kamu yakin ingin menyimpan prestasi baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      return;
    }

    const newData = {
      keterangan,
      event_id: selectedEventId,
      gudep_id: gudepId,
    };

    try {
      if (isEdit && id) {
        await editEventGudep(id, newData); // Panggil API untuk mengedit data
        Swal.fire("Sukses!", "Data prestasi berhasil diubah.", "success");
      } else {
        await createEventGudep(newData); // Panggil API untuk membuat data baru
        Swal.fire("Sukses!", "Prestasi baru telah disimpan.", "success");
      }

      navigate("/operator/prestasi"); // Redirect ke halaman daftar prestasi
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Error saving data:", error);
    }
  };

  return (
    <OperatorTemplate>
      <div className="flex flex-col mt-20 md:mt-0">
        {/* Header */}
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          <div
            className="flex items-center gap-4 font-bold text-lg md:text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer justify-center"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            <span className="hidden md:visible">Kembali</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Ubah Data Prestasi" : "Tambah Data Prestasi"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama Event */}
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Nama Event
                </label>
                <div className="flex flex-row items-center gap-2">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full"
                    required
                  >
                    <option value="" disabled>
                      Pilih Kegiatan
                    </option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.nama}
                      </option>
                    ))}
                  </select>
                  <AddButton
                    route="/operator/event/add"
                    onClick={(e) => {
                      e.stopPropagation(); // Pastikan klik tidak memengaruhi elemen lain
                      navigate("/operator/event/add");
                    }}
                  />
                </div>
              </div>

              {/* Input Keterangan */}
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Keterangan
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  placeholder="Masukkan Prestasi keseluruhan dalam Event tersebut"
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

export default OperatorPrestasiForm;
