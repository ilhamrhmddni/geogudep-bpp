import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEvents } from "../../../services/EventService";
import {
  createEventGudep,
  editEventGudep,
  fetchEventGudepById,
} from "../../../services/PrestasiService";
import decodeToken from "../../../utils/jwt"; // Pastikan path-nya sesuai
import AddButton from "../../atoms/AddButton";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPrestasiForm = ({ isEdit }) => {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Ambil gudep_id dari token
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
        console.error("Terjadi kesalahan saat memuat data:", error);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEventId || !gudepId) {
      alert("Pastikan semua data terisi dengan benar.");
      return;
    }

    const confirmSubmit = window.confirm(
      isEdit
        ? "Apakah kamu yakin ingin mengubah data prestasi ini?"
        : "Apakah kamu yakin ingin menyimpan prestasi baru ini?"
    );

    if (!confirmSubmit) {
      console.log("Form submission dibatalkan.");
      return;
    }

    const newData = {
      keterangan,
      event_id: selectedEventId,
      gudep_id: gudepId,
    };

    console.log("Data yang akan dikirim:", newData);

    try {
      if (isEdit && id) {
        await editEventGudep(id, newData);
      } else {
        await createEventGudep(newData);
      }

      navigate("/operator/prestasi");
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan data:", error);
    }
  };

  return (
    <OperatorTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isEdit ? "Ubah Prestasi" : "Tambah Prestasi"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Nama Event</label>
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
              <label className="mb-1 font-semibold">Keterangan</label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#9500FF] text-white py-2 rounded-md hover:bg-[#7a00cc]"
            >
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPrestasiForm;
