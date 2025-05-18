import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteUser, fetchUsers } from "../../../services/OperatorService";
import AdminHeader from "../../atoms/AdminHeader"; // Import the new component
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperator = () => {
  // State untuk menyimpan query pencarian, data operator, status loading, dan error
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fungsi untuk mengambil data operator dari API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchUsers();
      setData(result.data || []); // Pastikan data tidak undefined
      setError(null);
    } catch (err) {
      setError("Gagal mengambil data Operator.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Panggil fetchData saat komponen pertama kali dimount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Header tabel untuk daftar operator
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "username", label: "Username", width: "w-2/12" },
      { key: "email", label: "Email", width: "w-2/12" },
      { key: "fullname", label: "Nama Lengkap", width: "w-3/12" },
      { key: "asal", label: "Asal", width: "w-2/12" },
      { key: "no_telp", label: "No. Telepon", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-2/12" },
    ],
    []
  );

  // Fungsi untuk navigasi ke halaman edit operator
  const handleEdit = useCallback(
    (item) => {
      navigate(`/admin/operator/edit/${item.id}`);
    },
    [navigate]
  );

  // Fungsi untuk navigasi ke halaman tambah operator
  const handleAddOperator = useCallback(() => {
    navigate("/admin/operator/add");
  }, [navigate]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fungsi untuk menghapus operator
  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Kamu Yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a00cc",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        try {
          await deleteUser(id);
          setData((prev) => prev.filter((item) => item.id !== id)); // Hapus data dari state
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
    [setData]
  );

  // Filter dan urutkan data berdasarkan query pencarian
  const filteredData = useMemo(() => {
    return (data || [])
      .filter(
        (item) =>
          item.role !== "admin" && // Hanya tampilkan data dengan role selain admin
          (item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.asal?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((item, index) => ({ ...item, no: index + 1 })); // Tambahkan nomor urut
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Operator"
            showSearch={true}
            showAddButton={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            onAddClick={handleAddOperator}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
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
