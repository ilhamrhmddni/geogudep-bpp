import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteKwarran, fetchKwarran } from "../../../services/KwarranService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";
import AdminHeader from "../../atoms/AdminHeader";

const AdminKwarran = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data Kwarran
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchKwarran();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching Kwarran data:", err);
      setError("Gagal mengambil data Kwarran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Table headers
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "kode", label: "Kode", width: "w-2/12" },
      { key: "nama", label: "Nama", width: "w-2/12" },
      { key: "ketua_kwarran", label: "Ketua Kwarran", width: "w-3/12" },
      { key: "ketua_dkr", label: "Ketua DKR", width: "w-2/12" },
      { key: "jumlah_gudep", label: "Jumlah Gudep", width: "w-1/12" },
      { key: "email", label: "Email", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-2/12" },
    ],
    []
  );

  // Edit handler
  const handleEdit = useCallback(
    (item) => navigate(`/admin/kwarran/edit/${item.id}`),
    [navigate]
  );

  // Delete handler
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
          console.error("Error deleting Kwarran:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus data.",
          });
        }
      }
    },
    [setData]
  );

  // Filter data
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (
      data
        ?.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(query)
          )
        )
        .map((item, index) => ({ ...item, no: index + 1 })) || []
    );
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Kwarran"
            showSearch={true}
            showAddButton={true}
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onAddClick={() => navigate("/admin/kwarran/add")}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
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
