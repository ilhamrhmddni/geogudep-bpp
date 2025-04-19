import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteKwarran, fetchKwarran } from "../../../services/KwarranService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import ListHeader from "../../moleculs/ListHeader";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminKwarran = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetching Kwarran data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchKwarran();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError("Gagal mengambil data Kwarran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Empty dependency array to fetch only on the first render

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/20" },
      { key: "kode", label: "Kode", width: "w-1/20" },
      { key: "nama", label: "Nama", width: "w-3/20" },
      { key: "ketua_kwarran", label: "Ketua Kwarran", width: "w-5/20" },
      { key: "ketua_dkr", label: "Ketua DKR", width: "w-5/20" },
      { key: "jumlah_gudep", label: "Jumlah Gudep", width: "w-1/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "actions", label: "Aksi", width: "w-1/20" },
    ],
    []
  );

  const handleEdit = useCallback(
    (item) => {
      navigate(`/admin/kwarran/edit/${item.id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        try {
          await deleteKwarran(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data Kwarran telah dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus data.",
          });
        }
      }
    },
    [deleteKwarran, setData]
  ); // useCallback dependency

  // Filter and sort data
  const filteredData = useMemo(() => {
    return (data || []) // Ensure data is not undefined
      .map((item, index) => ({ ...item, no: index + 1 }))
      .filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
  }, [data, searchQuery]); // useMemo dependency

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Kwarran"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addButtonLabel="Kwarran"
            addButtonRoute="/admin/kwarran/add"
          />
          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Kwarran tidak ditemukan." />
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

export default AdminKwarran;
