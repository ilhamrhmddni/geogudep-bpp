import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchEventGudeps } from "../../../services/PrestasiService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR"; // Komponen tabel
import AdminTemplate from "../../templates/AdminTemplate";
import AdminHeader from "../../atoms/AdminHeader"; // Import standardized header

const AdminPrestasi = () => {
  // State untuk menyimpan data dan filter
  const [searchQuery, setSearchQuery] = useState(""); // Query pencarian
  const [selectedTingkatan, setSelectedTingkatan] = useState(""); // Filter tingkatan
  const [selectedGudep, setSelectedGudep] = useState(""); // Filter Gudep
  const [data, setData] = useState([]); // Data prestasi
  const [loading, setLoading] = useState(true); // Status loading
  const [error, setError] = useState(null); // Pesan error

  // Fungsi untuk mengambil data prestasi dari API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchEventGudeps();
      setData(Array.isArray(result.data) ? result.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Panggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fungsi untuk menangani perubahan filter tingkatan
  const handleTingkatanChange = useCallback((value) => {
    setSelectedTingkatan(value);
  }, []);

  // Fungsi untuk menangani perubahan filter Gudep
  const handleGudepChange = useCallback((value) => {
    setSelectedGudep(value);
  }, []);

  // Filter data berdasarkan query pencarian dan filter
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchesSearch =
        (item.eventes?.nama ?? "").toLowerCase().includes(query) ||
        (item.keterangan ?? "").toLowerCase().includes(query) ||
        (item.gudepes?.no_gudep ?? "").toLowerCase().includes(query);

      const matchesTingkatan =
        selectedTingkatan === "" ||
        item.gudepes?.tingkatan === selectedTingkatan;

      const matchesGudep =
        selectedGudep === "" || item.gudepes?.no_gudep === selectedGudep;

      return matchesSearch && matchesTingkatan && matchesGudep;
    });
  }, [data, searchQuery, selectedTingkatan, selectedGudep]);

  // Transformasi data untuk ditampilkan di tabel
  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      no: index + 1,
      no_gudep: item.gudepes?.no_gudep ?? "-",
      tingkatan: item.gudepes?.tingkatan ?? "-",
      nama_event: item.eventes?.nama ?? "-",
      keterangan: item.keterangan ?? "-",
    }));
  }, [filteredData]);

  // Opsi untuk dropdown filter Gudep
  const gudepOptions = useMemo(() => {
    return [...new Set(data.map((item) => item.gudepes?.no_gudep))]
      .filter(Boolean)
      .map((gudep) => ({ id: gudep, nama: gudep })); // Format untuk FilterHeader
  }, [data]);

  // Opsi untuk dropdown filter Tingkatan
  const tingkatanOptions = useMemo(
    () => [
      { id: "Siaga", nama: "Siaga" },
      { id: "Penggalang", nama: "Penggalang" },
      { id: "Penegak/Pandega", nama: "Penegak/Pandega" },
      { id: "Pandega", nama: "Pandega" },
    ],
    []
  );

  // Header untuk tabel
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "no_gudep", label: "No. Gudep", width: "w-2/12" },
      { key: "tingkatan", label: "Tingkatan", width: "w-2/12" },
      { key: "nama_event", label: "Nama Event", width: "w-3/12" },
      { key: "keterangan", label: "Keterangan", width: "w-4/12" },
    ],
    []
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Prestasi"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            dropdowns={[
              {
                name: "Gudep",
                options: gudepOptions,
                selected: selectedGudep,
                onChange: handleGudepChange,
                placeholder: "Pilih Gudep",
              },
              {
                name: "Tingkatan",
                options: tingkatanOptions,
                selected: selectedTingkatan,
                onChange: handleTingkatanChange,
                placeholder: "Pilih Tingkatan",
              },
            ]}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : transformedData.length === 0 ? (
              <NoDataMessage message="Data Prestasi tidak ditemukan." />
            ) : (
              <TableR headers={headers} data={transformedData} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminPrestasi;
