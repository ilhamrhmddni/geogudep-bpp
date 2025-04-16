import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import AddButton from "../../atoms/AddButton";
import SearchInput from "../../atoms/SearchInput";
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
import decodeToken from "../../../utils/jwt";

const OperatorPesertaDidik = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!gudepId) throw new Error("Gudep ID tidak ditemukan di token.");

        const response = await fetchPesertadidik(gudepId);
        const fetchedData = Array.isArray(response.data)
          ? response.data.filter((item) => item.gudep_id === gudepId)
          : [];

        setData(fetchedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gudepId]);

  const headers = [
    { key: "no", label: "No", width: "w-1/12" },
    { key: "nama", label: "Nama Peserta Didik", width: "w-5/12" },
    { key: "gender", label: "Jenis Kelamin", width: "w-1/12" },
    { key: "ttl", label: "Tanggal Lahir", width: "w-2/12" },
    { key: "detailtingkatan", label: "Detail Tingkatan", width: "w-2/12" },
    { key: "actions", label: "Aksi", width: "w-1/12" },
  ];

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleEdit = (item) => {
    navigate(`/operator/pesertadidik/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
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
        const jumlahPutra = gugusData.data.jumlah_putra || 0;
        const jumlahPutri = gugusData.data.jumlah_putri || 0;

        await editGugusdepan(gudepId, {
          jumlah_putra: gender === "Laki-laki" ? jumlahPutra - 1 : jumlahPutra,
          jumlah_putri: gender === "Perempuan" ? jumlahPutri - 1 : jumlahPutri,
        });

        const updatedResponse = await fetchPesertadidik(gudepId);
        const updatedData = Array.isArray(updatedResponse.data)
          ? updatedResponse.data.filter((item) => item.gudep_id === gudepId)
          : [];

        setData(updatedData);
      } catch (err) {
        console.error("Gagal menghapus peserta:", err);
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  const filteredData = data
    .filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(query) ||
        item.detailtingkatan.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Laki-laki (prioritas) harus muncul dulu
      if (a.gender === "Laki-laki" && b.gender === "Perempuan") return -1;
      if (a.gender === "Perempuan" && b.gender === "Laki-laki") return 1;
      return 0; // sisanya tetap urutan aslinya
    });

  return (
    <OperatorTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Peserta Didik
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />
            <AddButton route="/operator/pesertadidik/add" />
          </div>

          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {!loading && filteredData.length === 0 ? (
            <p className="text-center mt-4 ">Data tidak ditemukan.</p>
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
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidik;
