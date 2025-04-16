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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const confirmSubmit = await Swal.fire({
      title: "Simpan Laporan Baru",
      text: "Apakah kamu yakin ingin menyimpan laporan baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9500FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      console.log("Form submission canceled.");
      setLoading(false);
      return;
    }

    const newData = {
      nama,
      asal,
      no_hp: noHp,
      email,
    };

    try {
      await createLaporan(newData);
      Swal.fire("Sukses!", "Laporan baru telah disimpan.", "success").then(
        () => {
          navigate("/laporan"); // Adjust the redirect path as needed
        }
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Terjadi kesalahan saat menyimpan data laporan.");
      Swal.fire(
        "Error!",
        "Terjadi kesalahan saat menyimpan data laporan.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserTemplate>
      <div className="flex flex-col">
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            Tambah Data Laporan
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="nama" className="mb-1 font-bold text-[#9500FF]">
                  Nama
                </label>
                <input
                  type="text"
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="asal" className="mb-1 font-bold text-[#9500FF]">
                  Asal
                </label>
                <input
                  type="text"
                  id="asal"
                  value={asal}
                  onChange={(e) => setAsal(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="noHp" className="mb-1 font-bold text-[#9500FF]">
                  No. HP
                </label>
                <input
                  type="text"
                  id="noHp"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-1 font-bold text-[#9500FF]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserLaporan;
