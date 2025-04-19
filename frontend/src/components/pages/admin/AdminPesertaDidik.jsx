import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import { fetchPesertadidik } from "../../../services/PesertadidikService";
import DetailCell from "../../atoms/DetailCell";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import FilterHeader from "../../moleculs/FilterHeader"; // Import FilterHeader
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminPesertaDidik = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [kwarranList, setKwarranList] = useState([]);
  const [gudepList, setGudepList] = useState([]);
  const [selectedGudep, setSelectedGudep] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pesertaResult, kwarranResult, gudepResult] = await Promise.all([
        fetchPesertadidik(),
        fetchKwarran(),
        fetchGugusdepan(),
      ]);

      setData(Array.isArray(pesertaResult.data) ? pesertaResult.data : []);
      setKwarranList(kwarranResult.data || []);
      setGudepList(gudepResult.data || []);
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
  const handleGudepChange = useCallback((value) => setSelectedGudep(value), []);
  const handleTingkatanChange = useCallback(
    (value) => setSelectedTingkatan(value),
    []
  );

  const enrichedData = useMemo(() => {
    return data.map((item) => {
      const matchedGudep = gudepList.find(
        (gudep) => gudep.id === item.gudep_id
      );
      return {
        ...item,
        no_gudep: matchedGudep?.no_gudep ?? "-",
        tingkatan: matchedGudep?.tingkatan ?? "-",
        ttlFormatted: FormatDate(item.ttl),
      };
    });
  }, [data, gudepList]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return enrichedData.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(query) ||
        item.detailtingkatan?.toLowerCase().includes(query) ||
        item.no_gudep?.toLowerCase().includes(query);

      const matchesGudep =
        selectedGudep === "" || item.no_gudep === selectedGudep;
      const matchesTingkatan =
        selectedTingkatan === "" || item.tingkatan === selectedTingkatan;

      return matchesSearch && matchesGudep && matchesTingkatan;
    });
  }, [enrichedData, searchQuery, selectedGudep, selectedTingkatan]);

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      no: index + 1,
      no_gudep: item.no_gudep,
      tingkatan: item.tingkatan,
      nama: item.nama,
      gender: item.gender,
      ttl: (
        <DetailCell
          title="Lihat"
          details={[{ label: "TTL", value: item.ttlFormatted }]}
        />
      ),
      detailtingkatan: item.detailtingkatan,
    }));
  }, [filteredData]);

  const gudepOptions = useMemo(() => {
    return [...new Set(enrichedData.map((item) => item.no_gudep))]
      .filter(Boolean)
      .map((gudep) => ({ id: gudep, nama: gudep }));
  }, [enrichedData]);

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
      { key: "no_gudep", label: "No. Gudep", width: "w-1/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-1/20" },
      { key: "nama", label: "Nama Peserta Didik", width: "w-3/20" },
      { key: "gender", label: "Gender", width: "w-1/20" },
      { key: "ttl", label: "Tanggal Lahir", width: "w-1/20" },
      { key: "detailtingkatan", label: "Detail Tingkatan", width: "w-1/20" },
    ],
    []
  );

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <FilterHeader
            title="Data Peserta Didik"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            dropdowns={[
              {
                name: "gudep",
                options: gudepOptions,
                selected: selectedGudep,
                onChange: handleGudepChange,
                placeholder: "No. Gudep",
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

export default AdminPesertaDidik;
