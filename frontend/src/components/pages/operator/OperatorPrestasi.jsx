import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteEventGudep,
  fetchEventGudeps,
} from "../../../services/PrestasiService";
import decodeToken from "../../../utils/jwt";
import AddButton from "../../atoms/AddButton";
import SearchInput from "../../atoms/SearchInput";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!gudepId) {
          throw new Error("Gudep ID not found in token.");
        }

        const result = await fetchEventGudeps();
        const filteredData = result.data.filter(
          (item) => item.gudep_id === gudepId
        );

        setData(filteredData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gudepId]);

  const headers = [
    { key: "nama_event", label: "Nama Event" },
    { key: "tingkat", label: "Tingkat" },
    { key: "tahun", label: "Tahun" },
    { key: "keterangan", label: "Keterangan" },
    { key: "actions", label: "Aksi" },
  ];

  const handleAddPrestasi = () => {
    navigate("/operator/prestasi/add");
  };

  const handleEditPrestasi = (id) => {
    navigate(`/operator/prestasi/edit/${id}`);
  };

  const handleDeletePrestasi = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus prestasi ini?"
    );
    if (confirmDelete) {
      try {
        await deleteEventGudep(id);
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting achievement:", error);
        setError("Gagal menghapus data prestasi.");
      }
    }
  };

  const transformedData = data.map((item) => ({
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = transformedData.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.nama_event.toLowerCase().includes(searchLower) ||
      item.keterangan.toLowerCase().includes(searchLower)
    );
  });

  return (
    <OperatorTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex justify-between items-center bg-[#9500FF] rounded-2xl pl-8 mx-2">
            <h1 className="text-2xl font-bold text-white mx-auto">
              Data Prestasi
            </h1>

            <div className="flex items-center gap-2 mx-4">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-72"
              />
              <AddButton route="/operator/prestasi/add" />
            </div>
          </div>

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
