import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import AdminHeader from "../../atoms/AdminHeader"; // Import the new component
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

import { deleteEvent, fetchEvents } from "../../../services/EventService";

const AdminEvent = () => {
  const navigate = useNavigate();

  // State untuk menyimpan query pencarian, data event, status loading, dan error
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data event dari API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Set status loading menjadi true
      const result = await fetchEvents(); // Panggil API
      setData(Array.isArray(result.data) ? result.data : []); // Set data jika berhasil
      setError(null); // Reset error jika ada
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Gagal mengambil data."); // Set pesan error jika gagal
    } finally {
      setLoading(false); // Set status loading menjadi false
    }
  }, []);

  // Panggil fungsi fetchData saat komponen pertama kali dirender
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Header tabel untuk data event
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "nama", label: "Nama Event", width: "w-3/12" },
      { key: "tanggal_mulai", label: "Tanggal Mulai", width: "w-2/12" },
      { key: "tanggal_selesai", label: "Tanggal Selesai", width: "w-2/12" },
      { key: "tempat", label: "Tempat", width: "w-2/12" },
      { key: "tingkat", label: "Tingkat", width: "w-2/12" },
      { key: "penyelenggara", label: "Penyelenggara", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-2/12" },
    ],
    []
  );

  // Fungsi untuk menangani aksi edit
  const handleEdit = useCallback(
    (item) => navigate(`/admin/event/edit/${item.id}`),
    [navigate]
  );

  // Fungsi untuk menangani aksi hapus
  const handleDelete = useCallback(
    async (id) => {
      const confirmDelete = await Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a00cc",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, hapus!",
      });

      if (confirmDelete.isConfirmed) {
        try {
          await deleteEvent(id); // Panggil API untuk menghapus data
          Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
          setData((prevData) => prevData.filter((item) => item.id !== id)); // Hapus data dari state
        } catch (err) {
          console.error("Gagal menghapus event:", err);
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error");
        }
      }
    },
    [setData]
  );

  // Fungsi untuk menangani tambah event
  const handleAddEvent = useCallback(() => {
    navigate("/admin/event/add");
  }, [navigate]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Filter data berdasarkan query pencarian
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data
      .filter((item) => {
        return (
          (item.nama ?? "").toLowerCase().includes(query) || // Filter berdasarkan nama event
          (item.tempat ?? "").toLowerCase().includes(query) // Filter berdasarkan tempat
        );
      })
      .map((item, index) => ({
        ...item,
        no: index + 1, // Tambahkan nomor urut
        tanggal_mulai: FormatDate(item.tanggal_mulai), // Format tanggal mulai
        tanggal_selesai: FormatDate(item.tanggal_selesai), // Format tanggal selesai
      }));
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Event"
            showSearch={true}
            showAddButton={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            onAddClick={handleAddEvent}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Event tidak ditemukan." />
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
      </div>
    </AdminTemplate>
  );
};

export default AdminEvent;
