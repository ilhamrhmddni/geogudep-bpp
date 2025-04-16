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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchKwarran();
        setData(result.data || []);
        setError(null);
      } catch (error) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const headers = [
    { key: "no", label: "No", width: "w-1/20" },
    { key: "kode", label: "Kode", width: "w-1/20" },
    { key: "nama", label: "Nama", width: "w-3/20" },
    { key: "ketua_kwarran", label: "Ketua Kwarran", width: "w-5/20" },
    { key: "ketua_dkr", label: "Ketua DKR", width: "w-5/20" },
    { key: "jumlah_gudep", label: <>Jumlah Gudep</>, width: "w-1/20" },
    { key: "email", label: "Email", width: "w-3/20" },
    { key: "actions", label: "Aksi", width: "w-1/20" },
  ];

  const handleEdit = (item) => {
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
        setData((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete data.", "error");
      }
    }
  };

  const filteredData = data
    .map((item, idx) => ({ ...item, no: idx + 1 })) // Tambah nomor urut
    .filter(
      (item) =>
        item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ketua_kwarran?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ketua_dkr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <AddButton
              route={"/admin/kwarran/add"}
              onClick={() => navigate("/admin/kwarran/add")}
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
