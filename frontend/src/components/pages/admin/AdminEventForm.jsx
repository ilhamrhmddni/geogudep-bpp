// src/pages/AdminEventForm.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchEventById,
  createEvent,
  editEvent,
} from "../../../services/EventService"; // Update with your service methods
import AdminTemplate from "../../templates/AdminTemplate";

const AdminEventForm = ({ isEdit }) => {
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [penyelenggara, setPenyelenggara] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL

  // Fetch data if it's an edit case
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchEventById(id); // Ensure this function is correct
          const { data } = result; // Ensure data is retrieved correctly
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation popup
    const confirmSubmit = window.confirm(
      isEdit
        ? "Are you sure you want to update the event data?"
        : "Are you sure you want to save this new event?"
    );

    if (confirmSubmit) {
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
          // Update the event data
          await editEvent(id, newData);
        } else {
          // Create a new event
          await createEvent(newData);
        }

        // Redirect after submit
        navigate("/admin/event");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      console.log("Form submission canceled.");
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left">
          <h1 className="text-2xl font-bold mb-6 mx-96">
            {isEdit ? "Edit Event Data" : "Add Event Data"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Nama Event</label>
              <input
                type="text"
                value={nama || ""}
                onChange={(e) => setNama(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Tanggal Mulai</label>
              <input
                type="date"
                value={tanggalMulai || ""}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Tanggal Selesai</label>
              <input
                type="date"
                value={tanggalSelesai || ""}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Tempat</label>
              <input
                type="text"
                value={tempat || ""}
                onChange={(e) => setTempat(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Tingkat</label>
              <input
                type="text"
                value={tingkat || ""}
                onChange={(e) => setTingkat(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Penyelenggara</label>
              <input
                type="text"
                value={penyelenggara || ""}
                onChange={(e) => setPenyelenggara(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#9500FF] transition duration-200"
            >
              {isEdit ? "Update" : "Save"}
            </button>
          </form>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminEventForm;
