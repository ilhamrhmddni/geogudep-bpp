import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import DetailCell from "../../atoms/DetailCell";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import FilterHeader from "../../moleculs/FilterHeader"; // Import FilterHeader
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminGugusdepan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [kwarranList, setKwarranList] = useState([]);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError("Gagal mengambil data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleKwarranChange = useCallback(
    (value) => setSelectedKwarran(value),
    []
  );
  const handleTingkatanChange = useCallback(
    (value) => setSelectedTingkatan(value),
    []
  );

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const searchMatch =
          (item.no_gudep ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.mabigus ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.pembina ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.pelatih ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

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
          item.useres?.role !== "admin"
        );
      })
      .map((item, index) => ({
        ...item,
        no: index + 1,
        kwarran_nama:
          kwarranList.find((k) => k.id === item.kwarran_id)?.nama || "-",
        tahun_update: FormatDate(item.tahun_update),
        jumlah: (
          <DetailCell
            title="Lihat"
            details={[
              { label: "Putra", value: item.jumlah_putra },
              { label: "Putri", value: item.jumlah_putri },
            ]}
          />
        ),
        detail: (
          <DetailCell
            title="Lihat"
            details={[
              { label: "Mabigus", value: item.mabigus },
              { label: "Pembina", value: item.pembina },
              { label: "Pelatih", value: item.pelatih },
            ]}
          />
        ),
      }));
  }, [data, searchQuery, selectedKwarran, selectedTingkatan, kwarranList]);

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <FilterHeader
            title="Data Gugusdepan"
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            dropdowns={[
              {
                name: "kwarran",
                options: kwarranList,
                selected: selectedKwarran,
                onChange: handleKwarranChange,
                placeholder: "Kwarran",
              },
              {
                name: "tingkatan",
                options: [
                  { id: "Siaga", nama: "Siaga" },
                  { id: "Penggalang", nama: "Penggalang" },
                  { id: "Penegak/Pandega", nama: "Penegak/Pandega" },
                  { id: "Pandega", nama: "Pandega" },
                ],
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
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Gugusdepan tidak ditemukan." />
            ) : (
              <TableR headers={headers} data={filteredData} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminGugusdepan;
