import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import TableCRUD from "../../moleculs/TableCRUD"; // Komponen tabel CRUD
import OperatorTemplate from "../../templates/OperatorTemplate";

import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import {
  deletePesertadidik,
  fetchPesertadidikByGudep,
} from "../../../services/PesertadidikService";
import { decodeToken } from "../../../utils/jwt";

const OperatorPesertaDidik = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(""); // State untuk pencarian
  const [data, setData] = useState([]); // State untuk data peserta didik
  const [loading, setLoading] = useState(true); // State untuk status loading
  const [error, setError] = useState(null); // State untuk pesan error

  // Decode token untuk mendapatkan gudep_id
  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  // Fungsi untuk mengambil data peserta didik dari API
  // Di dalam OperatorPesertaDidik.jsx

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!gudepId) throw new Error("Gudep ID tidak ditemukan di token.");

      // --- PANGGIL FUNGSI YANG LEBIH SPESIFIK ---
      const response = await fetchPesertadidikByGudep(gudepId);
      // -----------------------------------------

      // Asumsikan response.data sudah berisi array yang terfilter dari backend
      setData(response.data || []); // Langsung set data, tidak perlu filter lagi
    } catch (err) {
      console.error("Error fetching data by Gudep:", err); // Sesuaikan pesan log
      setError("Gagal mengambil data peserta didik untuk Gugus Depan ini."); // Pesan error lebih spesifik
    } finally {
      setLoading(false);
    }
  }, [gudepId]); // Dependency tetap gudepId

  // Panggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Header untuk tabel
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "nama", label: "Nama Peserta Didik", width: "w-5/12" },
      { key: "gender", label: "Jenis Kelamin", width: "w-1/12" },
      { key: "ttl", label: "Tanggal Lahir", width: "w-2/12" },
      { key: "detailtingkatan", label: "Detail Tingkatan", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-1/12" },
    ],
    []
  );

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );

  // Fungsi untuk navigasi ke halaman edit peserta didik
  const handleEdit = useCallback(
    (item) => {
      navigate(`/operator/pesertadidik/edit/${item.id}`);
    },
    [navigate]
  );

  // Fungsi untuk menghapus data peserta didik
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
          const peserta = data.find((item) => item.id === id);
          const gender = peserta?.gender;

          await deletePesertadidik(id); // Panggil API untuk menghapus data
          Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");

          // Update jumlah putra/putri di gugusdepan
          const gugusData = await fetchGugusdepanId(gudepId);
          await editGugusdepan(gudepId, {
            jumlah_putra:
              gender === "Laki-laki"
                ? (gugusData.data.jumlah_putra || 0) - 1
                : gugusData.data.jumlah_putra || 0,
            jumlah_putri:
              gender === "Perempuan"
                ? (gugusData.data.jumlah_putri || 0) - 1
                : gugusData.data.jumlah_putri || 0,
          });

          fetchData(); // Refresh data setelah menghapus
        } catch (err) {
          console.error("Gagal menghapus peserta:", err);
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error");
        }
      }
    },
    [data, fetchData, gudepId]
  );

  // Filter data berdasarkan query pencarian
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data
      .filter(
        (item) =>
          item.nama.toLowerCase().includes(query) ||
          item.detailtingkatan.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (a.gender === "Laki-laki" && b.gender === "Perempuan") return -1;
        if (a.gender === "Perempuan" && b.gender === "Laki-laki") return 1;
        return 0;
      });
  }, [data, searchQuery]);

  // Aksi untuk setiap baris tabel
  const rowActions = useMemo(
    () => [
      {
        label: "Edit",
        icon: "edit",
        onClick: handleEdit,
      },
      {
        label: "Hapus",
        icon: "delete",
        onClick: handleDelete,
        color: "red",
      },
    ],
    [handleDelete, handleEdit]
  );

  // Transformasi data untuk ditampilkan di tabel
  // Di dalam OperatorPesertaDidik.jsx

  // Transformasi data untuk ditampilkan di tabel
  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      // --- TAMBAHKAN KEMBALI 'id' DI LEVEL ATAS ---
      id: item.id, // Pastikan ID asli ada di sini
      // ---------------------------------------
      no: index + 1,
      nama: item.nama,
      gender: item.gender,
      ttl: new Date(item.ttl).toLocaleDateString("id-ID"),
      detailtingkatan: item.detailtingkatan,
      // 'actions: item' tidak lagi diperlukan di sini jika tidak dipakai TableCRUD
      // actions: item, // Anda bisa hapus baris ini jika tidak dipakai lagi
    }));
  }, [filteredData]); // filteredData adalah data asli peserta didik

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
              Data Peserta Didik
            </span>
            <div className="flex gap-2 px-4 py-2">
              <button
                onClick={() => navigate("/operator/pesertadidik/add")}
                className="bg-white text-[#9500FF] md:px-4 px-3 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2"
              >
                <span className="material-icons">add</span>
                <div className="hidden md:block">Tambah Peserta Didik</div>
              </button>
            </div>
          </div>

          {/* Loading, Error, or Table */}
          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4">Data tidak ditemukan.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <TableCRUD
                headers={headers}
                data={transformedData}
                rowActions={rowActions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidik;
