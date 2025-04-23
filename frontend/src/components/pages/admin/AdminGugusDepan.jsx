import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import AdminHeader from "../../atoms/AdminHeader";
// Pastikan path import ini mengarah ke DetailCell versi TERBARU (portal, button trigger)
import DetailCell from "../../atoms/DetailCell";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminGugusdepan = () => {
  // State (tidak ada perubahan di sini)
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [kwarranList, setKwarranList] = useState([]);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchInitialData (tidak ada perubahan di sini)
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [gugusdepanResult, kwarranResult] = await Promise.all([
        fetchGugusdepan(),
        fetchKwarran(),
      ]);
      setData(
        Array.isArray(gugusdepanResult.data) ? gugusdepanResult.data : []
      );
      setKwarranList(kwarranResult.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect untuk fetchInitialData (tidak ada perubahan di sini)
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Headers (tidak ada perubahan di sini)
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/20" },
      { key: "no_gudep", label: "No. Gudep", width: "w-2/20" },
      { key: "kwarran_nama", label: "Kwarran", width: "w-2/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-1/20" },
      { key: "pangkalan", label: "Pangkalan", width: "w-2/20" },
      { key: "ambalan", label: "Ambalan", width: "w-2/20" },
      { key: "jumlah", label: "Jumlah", width: "w-1/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "detail", label: "Detail", width: "w-1/20" },
      { key: "tahun_update", label: "Tanggal Update", width: "w-1/20" },
    ],
    []
  );

  // Handlers (handleSearchChange, handleKwarranChange, handleTingkatanChange - tidak ada perubahan)
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  const handleKwarranChange = useCallback((value) => {
    setSelectedKwarran(value);
  }, []);
  const handleTingkatanChange = useCallback((value) => {
    setSelectedTingkatan(value);
  }, []);

  // Filter dan Map data - BAGIAN INI DIUBAH
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // 1. Filter data terlebih dahulu
    const intermediateData =
      data?.filter((item) => {
        const searchMatch =
          (item.no_gudep ?? "").toLowerCase().includes(query) ||
          (item.mabigus ?? "").toLowerCase().includes(query) ||
          (item.pembina ?? "").toLowerCase().includes(query) ||
          (item.pelatih ?? "").toLowerCase().includes(query);

        const kwarranMatch = selectedKwarran
          ? kwarranList.find((k) => k.id === item.kwarran_id)?.nama ===
            selectedKwarran
          : true;

        const tingkatanMatch = selectedTingkatan
          ? item.tingkatan === selectedTingkatan
          : true;

        return (
          searchMatch &&
          kwarranMatch &&
          tingkatanMatch &&
          item.useres?.role !== "admin" // Pastikan filter role tetap ada jika diperlukan
        );
      }) || []; // Pastikan hasilnya selalu array

    // Dapatkan jumlah total baris SETELAH difilter
    const totalRows = intermediateData.length;
    // Tentukan berapa baris terakhir yang dianggap 'dekat bawah'
    const threshold = 2; // Misalnya, 2 baris terakhir

    // 2. Map data yang sudah difilter untuk menambahkan properti dan DetailCell
    return intermediateData.map((item, index) => {
      // Hitung apakah baris ini dekat dengan bagian bawah
      const isNearBottom = index >= totalRows - threshold;
      // Tentukan nilai prop 'position' berdasarkan isNearBottom
      const positionValue = isNearBottom ? "top" : "bottom";

      // Kembalikan objek item yang sudah dimodifikasi
      return {
        ...item, // Sertakan semua properti asli item
        no: index + 1, // Hitung nomor urut berdasarkan indeks setelah filter
        kwarran_nama:
          kwarranList.find((k) => k.id === item.kwarran_id)?.nama || "-",
        tahun_update: FormatDate(item.tahun_update), // Format tanggal
        // Gunakan DetailCell untuk kolom 'jumlah'
        jumlah: (
          <DetailCell
            title="Lihat" // Teks untuk tombol trigger
            details={[
              { label: "Putra", value: item.jumlah_putra },
              { label: "Putri", value: item.jumlah_putri },
            ]}
            position={positionValue} // << Kirim prop posisi
          />
        ),
        // Gunakan DetailCell untuk kolom 'detail'
        detail: (
          <DetailCell
            title="Lihat" // Teks untuk tombol trigger
            details={[
              { label: "Mabigus", value: item.mabigus },
              { label: "Pembina", value: item.pembina },
              { label: "Pelatih", value: item.pelatih },
            ]}
            position={positionValue} // << Kirim prop posisi
          />
        ),
      };
    });
  }, [data, searchQuery, selectedKwarran, selectedTingkatan, kwarranList]); // Dependencies useMemo tetap sama

  // FilterDropdowns (tidak ada perubahan di sini)
  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={kwarranList.map((k) => ({ id: k.nama, nama: k.nama }))}
        selected={selectedKwarran}
        onChange={handleKwarranChange}
        placeholder="Pilih Kwarran"
      />
      <Dropdown
        options={[
          { id: "Siaga", nama: "Siaga" },
          { id: "Penggalang", nama: "Penggalang" },
          { id: "Penegak/Pandega", nama: "Penegak/Pandega" },
          { id: "Pandega", nama: "Pandega" },
        ]}
        selected={selectedTingkatan}
        onChange={handleTingkatanChange}
        placeholder="Pilih Tingkatan"
      />
    </div>
  );

  // Return statement JSX (tidak ada perubahan di sini)
  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Gugusdepan"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterDropdowns}
          />
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filteredData.length === 0 ? (
            <NoDataMessage message="Data Gugusdepan tidak ditemukan." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <TableR headers={headers} data={filteredData} />
            </div>
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminGugusdepan;
