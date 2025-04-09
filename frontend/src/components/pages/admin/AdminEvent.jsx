// src/pages/AdminEvent.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import AdminTemplate from "../../templates/AdminTemplate";
import TableCRUD from "../../moleculs/TableCRUD"; // Update to use TableCRUD
import SearchInput from "../../atoms/SearchInput";
import AddButton from "../../atoms/AddButton"; // Import the AddButton component
import { fetchEvents, deleteEvent } from "../../../services/EventService"; // Update to include CRUD services

const AdminEvent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigating to another route

  // Fetching Event data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchEvents();
        setData(Array.isArray(result.data) ? result.data : []);
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
    { key: "nama", label: "Nama Event" },
    { key: "tanggal_mulai", label: "Tanggal Mulai" },
    { key: "tanggal_selesai", label: "Tanggal Selesai" },
    { key: "tempat", label: "Tempat" },
    { key: "tingkat", label: "Tingkat" },
    { key: "penyelenggara", label: "Penyelenggara" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    navigate(`/admin/event/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        setData(data.filter((item) => item.id !== id)); // Update local state
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
  };

  const filteredData = data
    .filter((item) => {
      const matchesSearch =
        (item.nama ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tempat ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .map((item) => ({
      ...item,
      tanggal_mulai: formatDate(item.tanggal_mulai), // Format the date for display
      tanggal_selesai: formatDate(item.tanggal_selesai),
    }));

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Event
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />
            <AddButton
              route={"/admin/event/add"} // Assuming you have a route for adding events
            />
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

export default AdminEvent;
