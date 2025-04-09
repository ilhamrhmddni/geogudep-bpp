import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteKwarran, fetchKwarran } from "../../../services/KwarranService";
import AddButton from "../../atoms/AddButton";
import SearchInput from "../../atoms/SearchInput";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminKwarran = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchKwarran();
        setData(result.data);
        setError(null);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const headers = [
    { key: "kode", label: "Kode" },
    { key: "nama", label: "Nama" },
    { key: "ketua_kwarran", label: "Ketua Kwarran" },
    { key: "ketua_dkr", label: "Ketua DKR" },
    {
      key: "jumlah_gudep",
      label: (
        <>
          Jumlah <br /> Gudep
        </>
      ),
    },
    { key: "email", label: "Email" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    setIsDirty(true); // Mark as dirty when editing
    navigate(`/admin/kwarran/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteKwarran(id);
        setData(data.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting item", error);
      }
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ketua_kwarran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ketua_dkr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const confirmationMessage =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = confirmationMessage; // For most browsers
        return confirmationMessage; // For some browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleNavigation = async (path) => {
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
        navigate(path); // Proceed with navigation
      }
    } else {
      navigate(path); // Directly navigate if no unsaved changes
    }
  };

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Kwarran
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />
            <AddButton
              route={"/admin/kwarran/add"}
              onClick={() => handleNavigation("/admin/kwarran/add")}
            />
          </div>

          {loading && <p className="text-center mt-4">Loading data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}
          {filteredData.length === 0 && !loading ? (
            <p className="text-center mt-4">Data tidak ditemukan</p>
          ) : (
            <TableCRUD
              headers={headers}
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminKwarran;
