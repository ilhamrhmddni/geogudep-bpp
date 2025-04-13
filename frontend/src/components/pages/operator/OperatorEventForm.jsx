import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEvent,
  editEvent,
  fetchEventById,
} from "../../../services/EventService";
import OperatorTemplate from "../../templates/OperatorTemplate";
import Swal from "sweetalert2"; // Import SweetAlert2

const OperatorEventForm = ({ isEdit }) => {
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [tempat, setTempat] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [penyelenggara, setPenyelenggara] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate date logic
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Date Range",
        text: "Tanggal Mulai tidak boleh lebih dari Tanggal Selesai.",
        confirmButtonText: "OK",
      });
      return; // Stop form submission if dates are invalid
    }

    // Use SweetAlert for confirmation
    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Update Event" : "Add Event",
      text: isEdit
        ? "Are you sure you want to update the event data?"
        : "Are you sure you want to save this new event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEdit ? "Yes, update it!" : "Yes, save!",
      cancelButtonText: "Cancel",
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
          await editEvent(id, newData);
        } else {
          await createEvent(newData);
        }

        // Show success message
        Swal.fire({
          icon: "success",
          title: isEdit ? "Event Updated" : "Event Created",
          text: isEdit
            ? "The event has been updated successfully!"
            : "The new event has been created!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/operator/prestasi/add");
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        // Show error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an issue submitting the form. Please try again.",
          confirmButtonText: "OK",
        });
      }
    } else {
      console.log("Form submission canceled.");
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
            {isEdit ? "Edit Event" : "Add Event"}
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
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
                />
              </div>
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
      </div>
    </OperatorTemplate>
  );
};

export default OperatorEventForm;
