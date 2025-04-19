import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import ListHeader from "../../moleculs/ListHeader"; // Import ListHeader
import TableCRUD from "../../moleculs/TableCRUD";
import OperatorTemplate from "../../templates/OperatorTemplate";

import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import {
  deletePesertadidik,
  fetchPesertadidik,
} from "../../../services/PesertadidikService";
import { decodeToken } from "../../../utils/jwt";

const OperatorPesertaDidik = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!gudepId) throw new Error("Gudep ID tidak ditemukan di token.");
      const response = await fetchPesertadidik(gudepId);
      setData(response.data.filter((item) => item.gudep_id === gudepId));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, [gudepId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );

  const handleEdit = useCallback(
    (item) => {
      navigate(`/operator/pesertadidik/edit/${item.id}`);
    },
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
          const peserta = data.find((item) => item.id === id);
          const gender = peserta?.gender;

          await deletePesertadidik(id);
          Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");

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

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      no: index + 1,
      nama: item.nama,
      gender: item.gender,
      ttl: new Date(item.ttl).toLocaleDateString("id-ID"),
      detailtingkatan: item.detailtingkatan,
      actions: item, // Kirim item untuk digunakan di TableCRUD
    }));
  }, [filteredData]);

  return (
    <OperatorTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Peserta Didik"
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            addButtonLabel="Tambah Peserta Didik"
            addButtonRoute="/operator/pesertadidik/add"
          />

          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4 ">Data tidak ditemukan.</p>
          ) : (
            <TableCRUD
              headers={headers}
              data={transformedData}
              rowActions={rowActions}
              onEdit={handleEdit} // Pastikan ini juga diteruskan jika TableCRUD membutuhkannya secara terpisah
              onDelete={handleDelete} // Pastikan ini juga diteruskan jika TableCRUD membutuhkannya secara terpisah
            />
          )}
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidik;
