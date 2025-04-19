import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import ListHeader from "../../moleculs/ListHeader";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

import { deleteEvent, fetchEvents } from "../../../services/EventService";

const AdminEvent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/20" },
      { key: "nama", label: "Nama Event", width: "w-4/20" },
      { key: "tanggal_mulai", label: "Tanggal Mulai", width: "w-2/20" },
      { key: "tanggal_selesai", label: "Tanggal Selesai", width: "w-2/20" },
      { key: "tempat", label: "Tempat", width: "w-3/20" },
      { key: "tingkat", label: "Tingkat", width: "w-2/20" },
      { key: "penyelenggara", label: "Penyelenggara", width: "w-3/20" },
      { key: "actions", label: "Aksi", width: "w-1/20" },
    ],
    []
  );

  const handleEdit = useCallback(
    (item) => navigate(`/admin/event/edit/${item.id}`),
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
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
    },
    [deleteEvent, setData]
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data
      .filter((item) => {
        return (
          (item.nama ?? "").toLowerCase().includes(query) ||
          (item.tempat ?? "").toLowerCase().includes(query)
        );
      })
      .map((item, index) => ({
        ...item,
        no: index + 1,
        tanggal_mulai: FormatDate(item.tanggal_mulai),
        tanggal_selesai: FormatDate(item.tanggal_selesai),
      }));
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Event"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addButtonLabel="Tambah Event"
            addButtonRoute="/admin/event/add"
          />

          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data tidak ditemukan." />
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
