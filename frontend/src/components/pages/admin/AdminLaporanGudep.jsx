// src/pages/AdminLaporanGudep.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { editLaporan, fetchLaporan } from "../../../services/LaporanService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import FilterHeader from "../../moleculs/FilterHeader"; // Import FilterHeader
import TableRU from "../../moleculs/TableRU";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminLaporanGudep = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchLaporan();
      setData(Array.isArray(result.data) ? result.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleStatusChange = useCallback(
    (value) => setSelectedStatus(value),
    []
  );

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

  const headers = useMemo(
    () => [
      { key: "nama", label: "Nama" },
      { key: "asal", label: "Asal" },
      { key: "no_hp", label: "No. HP" },
      { key: "email", label: "Email" },
    ],
    []
  );

  const handleApprove = useCallback(
    async (id) => {
      try {
        const response = await editLaporan(id);
        if (!response) {
          throw new Error("No response from server");
        }
        const result = await fetchLaporan();
        setData(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error approving laporan:", error.message);
      }
    },
    [fetchLaporan, setData]
  );

  const statusOptions = useMemo(
    () => [
      { id: "", nama: "Semua Status" },
      { id: "diproses", nama: "Diproses" },
      { id: "selesai", nama: "Selesai" },
    ],
    []
  );

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <FilterHeader
            title="Data Laporan"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            dropdowns={[
              {
                name: "status",
                options: statusOptions,
                selected: selectedStatus,
                onChange: handleStatusChange,
                placeholder: "Status",
              },
            ]}
          />

          <div className="mt-4">
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
