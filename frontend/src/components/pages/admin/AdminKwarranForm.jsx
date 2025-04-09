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
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [ketuaKwarran, setKetuaKwarran] = useState("");
  const [ketuaDkr, setKetuaDkr] = useState("");
  const [jumlahGudep, setJumlahGudep] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes

  // Fetch data if it's an edit case
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchKwarranId(id);
          const { data } = result;
          setKode(data.kode);
          setNama(data.nama);
          setKetuaKwarran(data.ketua_kwarran);
          setKetuaDkr(data.ketua_dkr);
          setJumlahGudep(data.jumlah_gudep);
          setEmail(data.email);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [id, isEdit]);

  // Handle value changes
  const handleValueChange = (setter) => (e) => {
    setter(e.target.value);
    setIsDirty(true); // Mark as dirty on change
  };

  // Handle navigation away
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
        setIsDirty(false); // Reset dirty state
        navigate("/admin/kwarran"); // Navigate to the desired route
      }
    } else {
      navigate("/admin/kwarran"); // Navigate directly if no unsaved changes
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to be submitted
    const newData = {
      kode,
      nama,
      ketua_kwarran: ketuaKwarran,
      ketua_dkr: ketuaDkr,
      jumlah_gudep: jumlahGudep,
      email,
    };

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Update Kwarran" : "Create Kwarran",
      text: isEdit
        ? "Are you sure you want to update the Kwarran data?"
        : "Are you sure you want to save this new Kwarran?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "No, cancel",
    });

    if (confirmSubmit.isConfirmed) {
      try {
        if (isEdit && id) {
          await editKwarran(id, newData);
        } else {
          await createKwarran(newData);
        }

        Swal.fire("Success!", "Data has been saved.", "success");
        setIsDirty(false); // Reset dirty state after saving
        navigate("/admin/kwarran");
      } catch (error) {
        console.error("Error submitting form:", error);
        Swal.fire("Error!", "There was an error saving the data.", "error");
      }
    } else {
      console.log("Form submission canceled.");
    }
  };

  // Handle beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const confirmationMessage =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = confirmationMessage; // For most browsers
        return confirmationMessage; // For some older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <AdminTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left">
          <h1 className="text-2xl font-bold mb-6 mx-96">
            {isEdit ? "Edit Data Kwarran" : "Tambah Data Kwarran"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold ">Kode</label>
              <input
                type="text"
                value={kode || ""}
                onChange={handleValueChange(setKode)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Name</label>
              <input
                type="text"
                value={nama || ""}
                onChange={handleValueChange(setNama)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Ketua Kwarran</label>
              <input
                type="text"
                value={ketuaKwarran || ""}
                onChange={handleValueChange(setKetuaKwarran)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Ketua DKR</label>
              <input
                type="text"
                value={ketuaDkr || ""}
                onChange={handleValueChange(setKetuaDkr)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Jumlah Gudep</label>
              <input
                type="number"
                value={jumlahGudep || ""}
                onChange={handleValueChange(setJumlahGudep)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={email || ""}
                onChange={handleValueChange(setEmail)}
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

export default AdminKwarranForm;
