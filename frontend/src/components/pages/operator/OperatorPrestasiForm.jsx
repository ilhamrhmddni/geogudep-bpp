import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchEvents } from "../../../services/EventService";
import {
  createEventGudep,
  editEventGudep,
  fetchEventGudepById,
} from "../../../services/PrestasiService";
import decodeToken from "../../../utils/jwt";
import AddButton from "../../atoms/AddButton";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPrestasiForm = ({ isEdit }) => {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const userData = decodeToken();
  const gudepId = userData?.gudep_id;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEventId || !gudepId) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pastikan semua data terisi dengan benar.",
      });
      return;
    }

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Prestasi" : "Simpan Prestasi Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data prestasi ini?"
        : "Apakah kamu yakin ingin menyimpan prestasi baru ini?",
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
      keterangan,
      event_id: selectedEventId,
      gudep_id: gudepId,
    };

    console.log("Data to be sent:", newData);

    try {
      if (isEdit && id) {
        await editEventGudep(id, newData);
        Swal.fire("Sukses!", "Data prestasi berhasil diubah.", "success");
      } else {
        await createEventGudep(newData);
        Swal.fire("Sukses!", "Prestasi baru telah disimpan.", "success");
      }

      navigate("/operator/prestasi");
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Error saving data:", error);
    }
  };

  return (
    <OperatorTemplate>
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
            {isEdit ? "Ubah Data Prestasi" : "Tambah Data Prestasi"}
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Nama Event
                </label>
                <div className="flex items-center">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] mr-2 w-full"
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
                  <AddButton route="/operator/event/add" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Keterangan
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
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
    </OperatorTemplate>
  );
};

export default OperatorPrestasiForm;
