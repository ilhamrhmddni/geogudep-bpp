import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import AddButton from "../../atoms/AddButton";
import SearchInput from "../../atoms/SearchInput";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

import { deleteEvent, fetchEvents } from "../../../services/EventService";

const AdminEvent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchEvents();
        setData(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const headers = [
    { key: "no", label: "No", width: "w-1/20" },
    { key: "nama", label: "Nama Event", width: "w-4/20" },
    { key: "tanggal_mulai", label: "Tanggal Mulai", width: "w-2/20" },
    { key: "tanggal_selesai", label: "Tanggal Selesai", width: "w-2/20" },
    { key: "tempat", label: "Tempat", width: "w-3/20" },
    { key: "tingkat", label: "Tingkat", width: "w-2/20" },
    { key: "penyelenggara", label: "Penyelenggara", width: "w-3/20" },
    { key: "actions", label: "Aksi", width: "w-1/20" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    navigate(`/admin/event/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await deleteEvent(id);
        Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
        setData((prevData) => prevData.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Gagal menghapus event:", err);
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredData = data
    .filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        (item.nama ?? "").toLowerCase().includes(query) ||
        (item.tempat ?? "").toLowerCase().includes(query)
      );
    })
    .map((item, index) => ({
      ...item,
      no: index + 1,
      tanggal_mulai: formatDate(item.tanggal_mulai),
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
            <AddButton route="/admin/event/add" />
          </div>

          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4">Data tidak ditemukan.</p>
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
