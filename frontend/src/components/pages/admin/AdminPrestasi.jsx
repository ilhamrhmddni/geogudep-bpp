import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchEventGudeps } from "../../../services/PrestasiService";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import FilterHeader from "../../moleculs/FilterHeader"; // Import FilterHeader
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminPrestasi = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGudep, setSelectedGudep] = useState("");

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleTingkatanChange = useCallback(
    (value) => setSelectedTingkatan(value),
    []
  );
  const handleGudepChange = useCallback((value) => setSelectedGudep(value), []);

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

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      no: index + 1,
      no_gudep: item.gudepes?.no_gudep ?? "-",
      tingkatan: item.gudepes?.tingkatan ?? "-",
      nama_event: item.eventes?.nama ?? "-",
      keterangan: item.keterangan ?? "-",
    }));
  }, [filteredData]);

  const gudepOptions = useMemo(() => {
    return [...new Set(data.map((item) => item.gudepes?.no_gudep))]
      .filter(Boolean)
      .map((gudep) => ({ id: gudep, nama: gudep })); // Format untuk FilterHeader
  }, [data]);

  const tingkatanOptions = useMemo(
    () => [
      { id: "Siaga", nama: "Siaga" },
      { id: "Penggalang", nama: "Penggalang" },
      { id: "Penegak/Pandega", nama: "Penegak/Pandega" },
      { id: "Pandega", nama: "Pandega" },
    ],
    []
  );

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/20" },
      { key: "no_gudep", label: "No. Gudep", width: "w-2/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-2/20" },
      { key: "nama_event", label: "Nama Event", width: "w-4/20" },
      { key: "keterangan", label: "Keterangan", width: "w-8/20" },
    ],
    []
  );

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <FilterHeader
            title="Data Prestasi"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            dropdowns={[
              {
                name: "gudep",
                options: gudepOptions,
                selected: selectedGudep,
                onChange: handleGudepChange,
                placeholder: "Gudep",
              },
              {
                name: "tingkatan",
                options: tingkatanOptions,
                selected: selectedTingkatan,
                onChange: handleTingkatanChange,
                placeholder: "Tingkatan",
              },
            ]}
          />

          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : transformedData.length === 0 ? (
              <NoDataMessage message="Data tidak ditemukan" />
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
