import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteKwarran, fetchKwarran } from "../../../services/KwarranService";
// Impor fungsi yang sudah disesuaikan untuk HTML
import { downloadHtmlKwarran } from "../../../services/LaporanService";
import AdminHeader from "../../atoms/AdminHeader";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableCRUD from "../../moleculs/TableCRUD";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminKwarran = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State untuk report generation loading
  const [reportLoadingId, setReportLoadingId] = useState(null);

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
      { key: "kode", label: "Kode", width: "w-1/12" }, // Adjusted width
      { key: "nama", label: "Nama", width: "w-2/12" },
      { key: "ketua_kwarran", label: "Ketua Kwarran", width: "w-2/12" }, // Adjusted width
      { key: "ketua_dkr", label: "Ketua DKR", width: "w-2/12" },
      { key: "jumlah_gudep", label: "Jml Gudep", width: "w-1/12" }, // Adjusted label
      { key: "email", label: "Email", width: "w-2/12" },
      { key: "actions", label: "Aksi CRUD", width: "w-1/12" }, // Adjusted width
      { key: "download", label: "Unduh Laporan", width: "w-1/12" },
    ],
    []
  );

  // Fungsi untuk mengunduh laporan HTML
  const handleDownloadHtml = async (targetId, namaKwarran) => {
    setReportLoadingId(targetId); // Set loading state
    try {
      // Panggil service yang sudah diupdate untuk HTML
      await downloadHtmlKwarran(targetId, namaKwarran);
      Swal.fire("Berhasil", "Laporan HTML berhasil diunduh!", "success");
    } catch (err) {
      console.error("❌ Gagal download Laporan HTML:", err);
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh Laporan HTML.",
        "error"
      );
    } finally {
      setReportLoadingId(null); // Reset loading state
    }
  };

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
        confirmButtonColor: "#7a00cc",
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
    [setData] // Hanya setData karena fetchData tidak dipanggil langsung di sini
  );

  // Filter data
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data
      ?.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      )
      .map((item, index) => ({
        ...item,
        no: index + 1,
        jumlah_gudep: item.jumlah_gudep ?? 0, // Pastikan ada nilai default jika null
        // Render tombol download di sini, bukan di TableCRUD
        download: (
          <button
            onClick={() => handleDownloadHtml(item.id, item.nama)} // Panggil handleDownloadHtml
            className="material-icons bg-[#9500FF] text-white p-1 rounded hover:bg-[#7a00cc]"
            disabled={reportLoadingId === item.id} // Gunakan reportLoadingId
          >
            {reportLoadingId === item.id ? "..." : "download"}
          </button>
        ),
      }));
  }, [data, searchQuery, reportLoadingId]); // Tambahkan reportLoadingId sebagai dependency

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Kwarran"
            showSearch={true}
            showAddButton={true}
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onAddClick={() => navigate("/admin/kwarran/add")}
          />
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
                // Tombol download sudah dirender di dalam filteredData,
                // jadi tidak perlu prop onDownload khusus di TableCRUD
                // kecuali TableCRUD Anda didesain untuk menerima kolom 'download'
                // atau memiliki prop onDownload terpisah.
                // Jika TableCRUD menangani render kolom aksi secara internal, Anda mungkin perlu menyesuaikannya.
              />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminKwarran;
