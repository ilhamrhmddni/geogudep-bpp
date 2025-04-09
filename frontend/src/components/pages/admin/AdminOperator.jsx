import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import AdminTemplate from "../../templates/AdminTemplate";
import TableCRUD from "../../moleculs/TableCRUD";
import SearchInput from "../../atoms/SearchInput";
import AddButton from "../../atoms/AddButton";
import { deleteUser, fetchUsers } from "../../../services/OperatorService"; // Assuming the service file is set up

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
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    // Navigate to the edit page with item id
    navigate(`/admin/operator/edit/${item.id}`); // Assuming you have an edit page for operators
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id); // Call the delete function from service
      setData(data.filter((item) => item.id !== id)); // Update local state after delete
    } catch (error) {
      console.error("Error deleting item", error);
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

          {/* Loading state */}
          {loading && <p className="text-center mt-4">Loading data...</p>}

          {/* Error state */}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {/* Displaying the table or message if no data found */}
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
