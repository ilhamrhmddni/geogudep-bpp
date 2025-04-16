import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createKwarran,
  editKwarran,
  fetchKwarranId,
} from "../../../services/KwarranService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminKwarranForm = ({ isEdit }) => {
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    ketua_kwarran: "",
    ketua_dkr: "",
    email: "",
    jumlah_gudep: 0, // Set as a number to avoid type issues
  });
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchKwarranId(id);
          setFormData({
            kode: result.data.kode || "",
            nama: result.data.nama || "",
            ketua_kwarran: result.data.ketua_kwarran || "",
            ketua_dkr: result.data.ketua_dkr || "",
            email: result.data.email || "",
            jumlah_gudep: parseInt(result.data.jumlah_gudep) || 0, // Convert to integer
          });
        } catch (error) {
          Swal.fire("Error!", "Failed to fetch data.", "error");
        }
      };
      fetchData();
    }
  }, [id, isEdit]);

  // Updated handler to ensure jumlah_gudep is always a number
  const handleValueChange = (field) => (e) => {
    let value = e.target.value;

    // Convert jumlah_gudep to number
    if (field === "jumlah_gudep") {
      value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    }

    setFormData({ ...formData, [field]: value });
    setIsDirty(true);
  };

  const handleNavigation = async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you really want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, leave",
        cancelButtonText: "No, stay here",
      });
      if (result.isConfirmed) {
        setIsDirty(false);
        navigate("/admin/kwarran");
      }
    } else {
      navigate("/admin/kwarran");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a copy with properly formatted data
    const formattedData = {
      ...formData,
      jumlah_gudep: parseInt(formData.jumlah_gudep, 10) || 0, // Ensure it's an integer
    };

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Perbarui Kwarran" : "Membuat Kwarran",
      text: isEdit
        ? "Apakah Anda yakin ingin memperbarui data Kwarran?"
        : "Apakah Anda yakin ingin menyimpan Kwarran baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    });

    if (confirmSubmit.isConfirmed) {
      try {
        console.log("Submitting data:", formattedData);
        if (isEdit && id) {
          await editKwarran(id, formattedData);
        } else {
          await createKwarran(formattedData);
        }
        Swal.fire("Success!", "Data has been saved.", "success");
        setIsDirty(false);
        navigate("/admin/kwarran");
      } catch (error) {
        console.error("Error creating Kwarran:", error.response || error);
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data.";
        Swal.fire("Error!", message, "error");
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const confirmationMessage =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <AdminTemplate>
      <div className="flex flex-col">
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <div
            className="flex items-center gap-4 font-bold text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={handleNavigation}
          >
            <span className="material-icons text-white">arrow_back</span>
            Kembali
          </div>
          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            {isEdit ? "Ubah Data Kwarran" : "Tambah Data Kwarran"}
          </h1>
        </div>
        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Kode</label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={handleValueChange("kode")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Nama</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={handleValueChange("nama")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Ketua Kwarran
                </label>
                <input
                  type="text"
                  value={formData.ketua_kwarran}
                  onChange={handleValueChange("ketua_kwarran")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Ketua DKR
                </label>
                <input
                  type="text"
                  value={formData.ketua_dkr}
                  onChange={handleValueChange("ketua_dkr")}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleValueChange("email")}
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

export default AdminKwarranForm;
