// src/pages/AdminLaporanGudep.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { editLaporan, fetchLaporan } from "../../../services/LaporanService";
import AdminHeader from "../../atoms/AdminHeader"; // Import standardized header
import Dropdown from "../../atoms/Dropdown"; // Import Dropdown component
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableRU from "../../moleculs/TableRU";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminLaporanGudep = () => {
  // State untuk menyimpan query pencarian, data laporan, status loading, error, dan filter status
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fungsi untuk mengambil data laporan dari API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchLaporan();
      setData(Array.isArray(result.data) ? result.data : []); // Pastikan data tidak undefined
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Panggil fetchData saat komponen pertama kali dimount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fungsi untuk menangani perubahan filter status
  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value);
  }, []);

  // Filter data berdasarkan query pencarian dan status
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchesSearch =
        (item.nama ?? "").toLowerCase().includes(query) ||
        (item.asal ?? "").toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, selectedStatus]);

  // Header tabel untuk daftar laporan
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "nama", label: "Nama", width: "w-3/12" },
      { key: "asal", label: "Asal", width: "w-2/12" },
      { key: "no_hp", label: "No. HP", width: "w-2/12" },
      { key: "email", label: "Email", width: "w-2/12" },
      { key: "actions", label: "Aksi", width: "w-2/12" },
    ],
    []
  );

  // Fungsi untuk menyetujui laporan
  const handleApprove = useCallback(
    async (id) => {
      try {
        const response = await editLaporan(id);
        if (!response) {
          throw new Error("No response from server");
        }
        const result = await fetchLaporan();
        setData(Array.isArray(result.data) ? result.data : []); // Perbarui data setelah approve
      } catch (error) {
        console.error("Error approving laporan:", error.message);
      }
    },
    [fetchLaporan]
  );

  // Opsi untuk dropdown filter status
  const statusOptions = useMemo(
    () => [
      { id: "Menunggu", nama: "Menunggu" },
      { id: "Setujui", nama: "Setujui" },
      { id: "Kirim", nama: "Kirim" },
      { id: "Selesai", nama: "Selesai" },
    ],
    []
  );

  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      {" "}
      {/* Hidden on mobile */}
      <Dropdown
        options={statusOptions}
        selected={selectedStatus}
        onChange={handleStatusChange}
        placeholder="Pilih Status"
      />
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Laporan"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterDropdowns}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data laporan tidak ditemukan." />
            ) : (
              <TableRU
                headers={headers}
                data={filteredData}
                onApprove={handleApprove}
              />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminLaporanGudep;
