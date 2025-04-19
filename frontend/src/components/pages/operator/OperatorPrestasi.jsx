import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteEventGudep,
  fetchEventGudeps,
} from "../../../services/PrestasiService";
import { decodeToken } from "../../../utils/jwt";
import ListHeader from "../../moleculs/ListHeader"; // Import ListHeader
import TableR from "../../moleculs/TableR";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorPrestasi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headers = [
    { key: "no", label: "No", width: "w-1/12" },
    { key: "nama_event", label: "Nama Event", width: "w-2/12" },
    { key: "tingkat", label: "Tingkat", width: "w-1/12" },
    { key: "tahun", label: "Tahun", width: "w-1/12" },
    { key: "keterangan", label: "Keterangan", width: "w-5/12" },
    { key: "actions", label: "Aksi", width: "w-1/12" },
  ];

  const handleEditPrestasi = useCallback(
    (id) => {
      navigate(`/operator/prestasi/edit/${id}`);
    },
    [navigate]
  );

  const handleDeletePrestasi = useCallback(async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah kamu yakin ingin menghapus prestasi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await deleteEventGudep(id);
        setData((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Berhasil!", "Data prestasi berhasil dihapus.", "success");
      } catch (error) {
        console.error("Error deleting achievement:", error);
        Swal.fire("Error!", "Gagal menghapus data prestasi.", "error");
      }
    }
  }, []);

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

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

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
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Prestasi"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addButtonLabel="Tambah Data"
            addButtonRoute="/operator/prestasi/add"
          />

          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4">Data tidak ditemukan.</p>
          ) : (
            <TableR headers={headers} data={filteredData} />
          )}
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPrestasi;
