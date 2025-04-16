import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import Swal from "sweetalert2";
import { deleteUser, fetchUsers } from "../../../services/OperatorService"; // Assuming the service file is set up
import AddButton from "../../atoms/AddButton";
import SearchInput from "../../atoms/SearchInput";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperator = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // To handle errors
  const navigate = useNavigate(); // Hook for navigating to another route

  // Fetching operator data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchUsers(); // Get data from the service
        setData(result.data); // Store data in state
        setError(null); // Clear any previous error
      } catch (error) {
        setError("Error fetching data."); // Set error if the fetch fails
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch only on the first render

  const headers = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "fullname", label: "Full Name" },
    { key: "asal", label: "Asal" },
    { key: "no_telp", label: "No. Telepon" },
    { key: "actions", label: "Action" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    // Navigate to the edit page with item id
    navigate(`/admin/operator/edit/${item.id}`); // Assuming you have an edit page for operators
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Kamu Yakin?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal", // Menambahkan teks tombol batal dalam bahasa Indonesia
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        setData((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
      } catch (error) {
        Swal.fire("Error!", "Gagal menghapus data.", "error");
      }
    }
  };

  // Filter and sort data
  const filteredData = data
    .filter(
      (item) =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.asal?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) => item.role !== "admin");

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Operator
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />
            <AddButton route="/admin/operator/add" />
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

export default AdminOperator;
