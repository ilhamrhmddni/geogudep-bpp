import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteEventGudep,
  fetchEventGudeps,
} from "../../../services/PrestasiService";
import { decodeToken } from "../../../utils/jwt";
import TableR from "../../moleculs/TableR"; // Komponen tabel
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPrestasi = () => {
  // State untuk menyimpan data prestasi
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // State untuk status loading
  const [error, setError] = useState(null); // State untuk pesan error
  const [searchQuery, setSearchQuery] = useState(""); // State untuk pencarian
  const navigate = useNavigate();

  // Decode token untuk mendapatkan gudep_id
  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  // Fungsi untuk mengambil data prestasi dari API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!gudepId) {
        throw new Error("Gudep ID not found in token.");
      }
      const result = await fetchEventGudeps();
      const filteredData = result.data.filter(
        (item) => item.gudep_id === gudepId
      );
      setData(filteredData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  }, [gudepId]);

  // Panggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Header untuk tabel
  const headers = [
    { key: "no", label: "No", width: "w-1/12" },
    { key: "nama_event", label: "Nama Event", width: "w-2/12" },
    { key: "tingkat", label: "Tingkat", width: "w-1/12" },
    { key: "tahun", label: "Tahun", width: "w-1/12" },
    { key: "keterangan", label: "Keterangan", width: "w-5/12" },
    { key: "actions", label: "Aksi", width: "w-1/12" },
  ];

  // Fungsi untuk navigasi ke halaman edit prestasi
  const handleEditPrestasi = useCallback(
    (id) => {
      navigate(`/operator/prestasi/edit/${id}`);
    },
    [navigate]
  );

  // Fungsi untuk menghapus data prestasi
  const handleDeletePrestasi = useCallback(async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah kamu yakin ingin menghapus prestasi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await deleteEventGudep(id); // Panggil API untuk menghapus data
        setData((prev) => prev.filter((item) => item.id !== id)); // Hapus data dari state
        Swal.fire("Berhasil!", "Data prestasi berhasil dihapus.", "success");
      } catch (error) {
        console.error("Error deleting achievement:", error);
        Swal.fire("Error!", "Gagal menghapus data prestasi.", "error");
      }
    }
  }, []);

  // Transformasi data untuk ditampilkan di tabel
  const transformedData = React.useMemo(() => {
    return data.map((item, index) => ({
      no: index + 1,
      tingkat: item.eventes?.tingkat || "-",
      tahun: item.eventes?.tanggal_mulai
        ? new Date(item.eventes.tanggal_mulai).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
          })
        : "-",
      nama_event: item.eventes?.nama || "-",
      keterangan: item.keterangan || "-",
      actions: (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handleEditPrestasi(item.id)}
            aria-label="Edit"
            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <span className="material-icons">edit</span>
          </button>
          <button
            onClick={() => handleDeletePrestasi(item.id)}
            aria-label="Hapus"
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
          >
            <span className="material-icons">delete</span>
          </button>
        </div>
      ),
    }));
  }, [data, handleEditPrestasi, handleDeletePrestasi]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Filter data berdasarkan query pencarian
  const filteredData = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return transformedData.filter((item) => {
      return (
        item.nama_event.toLowerCase().includes(searchLower) ||
        item.keterangan.toLowerCase().includes(searchLower)
      );
    });
  }, [searchQuery, transformedData]);

  return (
    <OperatorTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-20 md:mt-0">
        <div className="p-4">
          {/* Header */}
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 px-2">
            <span
              className="items-center md:text-2xl text-xl font-bold md:px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Prestasi
            </span>
            <div className="flex gap-2 px-4 py-2">
              <button
                onClick={() => navigate("/operator/prestasi/add")}
                className="bg-white text-[#9500FF] md:px-4 px-3 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2"
              >
                <span className="material-icons">add</span>
                <div className="hidden md:block">Tambah Data</div>
              </button>
            </div>
          </div>

          {/* Loading, Error, or Table */}
          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4">Data tidak ditemukan.</p>
          ) : (
            <div className="mt-4 overflow-x-auto visible">
              <TableR headers={headers} data={filteredData} />
            </div>
          )}
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPrestasi;
