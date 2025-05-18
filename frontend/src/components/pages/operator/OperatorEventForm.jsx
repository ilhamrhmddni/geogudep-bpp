import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 untuk notifikasi
import {
  createEvent,
  editEvent,
  fetchEventById,
} from "../../../services/EventService";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorEventForm = ({ isEdit }) => {
  // State untuk menyimpan data form
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [penyelenggara, setPenyelenggara] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari parameter URL

  // Ambil data event jika mode edit
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchEventById(id);
          const { data } = result;
          setNama(data.nama);
          setTanggalMulai(
            data.tanggal_mulai ? data.tanggal_mulai.split("T")[0] : ""
          );
          setTanggalSelesai(
            data.tanggal_selesai ? data.tanggal_selesai.split("T")[0] : ""
          );
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

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi logika tanggal
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      await Swal.fire({
        icon: "error",
        title: "Tanggal Tidak Valid",
        text: "Tanggal Mulai tidak boleh lebih dari Tanggal Selesai.",
        confirmButtonText: "OK",
      });
      return; // Hentikan submit jika tanggal tidak valid
    }

    // Konfirmasi sebelum menyimpan data
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Event" : "Tambah Event",
      text: isEdit
        ? "Apakah Anda yakin ingin mengubah data event ini?"
        : "Apakah Anda yakin ingin menyimpan event baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: isEdit ? "Ya, ubah!" : "Ya, simpan!",
      cancelButtonText: "Batal",
    });

    if (confirmSubmit.isConfirmed) {
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
          await editEvent(id, newData); // Panggil API untuk mengedit data
        } else {
          await createEvent(newData); // Panggil API untuk membuat data baru
        }

        // Tampilkan pesan sukses
        Swal.fire({
          icon: "success",
          title: isEdit ? "Event Diubah" : "Event Ditambahkan",
          text: isEdit
            ? "Data event berhasil diubah!"
            : "Event baru berhasil ditambahkan!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/operator/prestasi/add"); // Redirect ke halaman prestasi
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        // Tampilkan pesan error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
          confirmButtonText: "OK",
        });
      }
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
          <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {isEdit ? "Edit Event" : "Tambah Event"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Nama Event */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Nama Event
                </label>
                <input
                  type="text"
                  value={nama || ""}
                  onChange={(e) => setNama(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  placeholder="Masukkan nama event"
                />
              </div>

              {/* Input Tanggal Mulai */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai || ""}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Tanggal Selesai */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={tanggalSelesai || ""}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              {/* Input Tempat */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Tempat
                </label>
                <input
                  type="text"
                  value={tempat || ""}
                  onChange={(e) => setTempat(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  placeholder="Masukkan tempat event"
                />
              </div>

              {/* Input Tingkat */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Tingkat
                </label>
                <select
                  value={tingkat || ""}
                  onChange={(e) => setTingkat(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                >
                  <option value="" disabled>
                    Pilih tingkat
                  </option>
                  <option value="Ranting">Ranting</option>
                  <option value="Cabang">Cabang</option>
                  <option value="Daerah">Daerah</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Internasional">Internasional</option>
                </select>
              </div>

              {/* Input Penyelenggara */}
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-purple-600">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={penyelenggara || ""}
                  onChange={(e) => setPenyelenggara(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                  placeholder="Masukkan Penyelenggara Event"
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200"
              >
                {isEdit ? "Ubah" : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorEventForm;
