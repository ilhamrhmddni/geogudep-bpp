import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteUser, fetchUsers } from "../../../services/OperatorService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import ListHeader from "../../moleculs/ListHeader";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperator = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetching operator data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchUsers();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError("Gagal mengambil data Operator.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Empty dependency array to fetch only on the first render

  const headers = useMemo(
    () => [
      { key: "username", label: "Username", width: "w-2/12" },
      { key: "email", label: "Email", width: "w-3/12" },
      { key: "fullname", label: "Full Name", width: "w-3/12" },
      { key: "asal", label: "Asal", width: "w-2/12" },
      { key: "no_telp", label: "No. Telepon", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-1/12" },
    ],
    []
  );

  const handleEdit = useCallback(
    (item) => {
      navigate(`/admin/operator/edit/${item.id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Kamu Yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        try {
          await deleteUser(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Gagal menghapus data.",
          });
        }
      }
    },
    [deleteUser, setData]
  ); // useCallback dependency

  // Filter and sort data
  const filteredData = useMemo(() => {
    return (data || []) // Ensure data is not undefined
      .filter(
        (item) =>
          item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.asal?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((item) => item.role !== "admin")
      .map((item, index) => ({ ...item, no: index + 1 }));
  }, [data, searchQuery]); // useMemo dependency

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Operator"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addButtonLabel="Operator"
            addButtonRoute="/admin/operator/add"
          />
          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Operator tidak ditemukan." />
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

export default AdminOperator;
