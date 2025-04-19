import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createEvent,
  editEvent,
  fetchEventById,
} from "../../../services/EventService";
import Label from "../../atoms/FormLabel";
import SelectInput from "../../atoms/SelectInput";
import Input from "../../atoms/TextInput";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminEventForm = ({ isEdit }) => {
  // State untuk menyimpan data form
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [penyelenggara, setPenyelenggara] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Pilihan tingkat event
  const tingkatOptions = [
    { value: "Gugus Depan", label: "Gugus Depan" },
    { value: "Ranting", label: "Ranting" },
    { value: "Cabang", label: "Cabang" },
    { value: "Daerah", label: "Daerah" },
    { value: "Nasional", label: "Nasional" },
    { value: "Internasional", label: "Internasional" },
  ];

  // Fungsi untuk menangani perubahan input
  const handleInputChange = (setState) => (e) => {
    setState(e.target.value);
  };

  // Fungsi untuk memformat tanggal dari string ISO ke format yyyy-mm-dd
  const formatDate = (dateString) => dateString?.split("T")[0] || "";

  // Ambil data event jika mode edit
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const { data } = await fetchEventById(id);
          setNama(data.nama);
          setTanggalMulai(formatDate(data.tanggal_mulai));
          setTanggalSelesai(formatDate(data.tanggal_selesai));
          setTempat(data.tempat);
          setTingkat(data.tingkat);
          setPenyelenggara(data.penyelenggara);
        } catch (error) {
          console.error("Error fetching data:", error);
          Swal.fire("Error!", "Gagal mengambil data event.", "error");
        }
      };
      fetchData();
    }
  }, [id, isEdit]);

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form
    const isFormValid =
      nama &&
      tanggalMulai &&
      tanggalSelesai &&
      tempat &&
      tingkat &&
      penyelenggara;

    if (!isFormValid) {
      return Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pastikan semua data terisi dengan benar.",
      });
    }

    // Validasi tanggal
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      return Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Tanggal mulai tidak boleh lebih lama dari tanggal selesai.",
      });
    }

    // Konfirmasi sebelum menyimpan data
    const confirmResult = await Swal.fire({
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

    if (!confirmResult.isConfirmed) {
      return;
    }

    // Data yang akan dikirim ke API
    const eventData = {
      nama,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      tempat,
      tingkat,
      penyelenggara,
    };

    try {
      // Panggil API untuk menyimpan atau mengedit data
      const action =
        isEdit && id ? editEvent(id, eventData) : createEvent(eventData);
      await action;
      Swal.fire(
        "Sukses!",
        `Data event berhasil ${isEdit ? "diubah" : "disimpan"}.`,
        "success"
      );
      navigate("/admin/event"); // Arahkan kembali ke halaman daftar event
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
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
            {isEdit ? "Ubah Data Event" : "Tambah Data Event"}
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-auto items-center justify-center">
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input nama event */}
              <div className="flex flex-col">
                <Label text="Nama Event" htmlFor="nama" />
                <Input
                  type="text"
                  id="nama"
                  value={nama}
                  onChange={handleInputChange(setNama)}
                  required
                />
              </div>

              {/* Input tanggal mulai */}
              <div className="flex flex-col">
                <Label text="Tanggal Mulai" htmlFor="tanggalMulai" />
                <Input
                  type="date"
                  id="tanggalMulai"
                  value={tanggalMulai}
                  onChange={handleInputChange(setTanggalMulai)}
                  required
                />
              </div>

              {/* Input tanggal selesai */}
              <div className="flex flex-col">
                <Label text="Tanggal Selesai" htmlFor="tanggalSelesai" />
                <Input
                  type="date"
                  id="tanggalSelesai"
                  value={tanggalSelesai}
                  onChange={handleInputChange(setTanggalSelesai)}
                  required
                />
              </div>

              {/* Input tempat */}
              <div className="flex flex-col">
                <Label text="Tempat" htmlFor="tempat" />
                <Input
                  type="text"
                  id="tempat"
                  value={tempat}
                  onChange={handleInputChange(setTempat)}
                  required
                />
              </div>

              {/* Input tingkat */}
              <SelectInput
                label="Tingkat"
                id="tingkat"
                value={tingkat}
                onChange={handleInputChange(setTingkat)}
                options={tingkatOptions}
                required
              />

              {/* Input penyelenggara */}
              <div className="flex flex-col">
                <Label text="Penyelenggara" htmlFor="penyelenggara" />
                <Input
                  type="text"
                  id="penyelenggara"
                  value={penyelenggara}
                  onChange={handleInputChange(setPenyelenggara)}
                  required
                />
              </div>

              {/* Tombol submit */}
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
