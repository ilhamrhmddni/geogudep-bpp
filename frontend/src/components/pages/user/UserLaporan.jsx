import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import { createLaporan } from "../../../services/LaporanService";
import UserTemplate from "../../templates/UserTemplate";

const UserLaporan = () => {
  const [nama, setNama] = useState("");
  const [asal, setAsal] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation popup
    const confirmSubmit = window.confirm(
      "Are you sure you want to save this new Laporan?"
    );

    if (confirmSubmit) {
      const newData = {
        nama,
        asal,
        no_hp: noHp,
        email,
      };

      try {
        // Create a new Laporan
        await createLaporan(newData);

        // Show success alert for 3 seconds
        await Swal.fire({
          title: "Success!",
          text: "Laporan has been saved successfully.",
          icon: "success",
          timer: 3000, // Auto close after 3 seconds
          showConfirmButton: false, // Hide the OK button
        });

        // Reset all fields to null and navigate after the alert closes
        setNama("");
        setAsal("");
        setNoHp("");
        setEmail("");
        navigate("/laporan"); // Adjust the redirect path as needed
      } catch (error) {
        console.error("Error submitting form:", error);
        // Show error alert
        await Swal.fire({
          title: "Error!",
          text: "There was an error saving the Laporan.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      console.log("Form submission canceled.");
    }
  };

  return (
    <UserTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left ml-18 w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Tambah Data Laporan
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Nama</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Asal</label>
              <input
                type="text"
                value={asal}
                onChange={(e) => setAsal(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">No. HP</label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00b3] transition duration-200"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserLaporan;
