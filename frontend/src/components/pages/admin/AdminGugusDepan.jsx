import React, { useEffect, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import SearchInput from "../../atoms/SearchInput";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchGugusdepan();
        setData(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchKwarranData = async () => {
      try {
        const result = await fetchKwarran();
        setKwarranList(result.data || []);
      } catch (error) {
        console.error("Error fetching Kwarran data:", error);
      }
    };

    fetchKwarranData();
  }, []);

  const headers = [
    { key: "no", label: "No", width: "w-1/20" },
    { key: "no_gudep", label: "No. Gudep", width: "w-1/20" },
    { key: "kwarran_nama", label: "Kwarran", width: "w-2/20" },
    { key: "tingkatan", label: "Tingkatan", width: "w-1/20" },
    { key: "pangkalan", label: "Pangkalan", width: "w-2/20" },
    { key: "jumlah_putra", label: "Jumlah Putra", width: "w-1/20" },
    { key: "jumlah_putri", label: "Jumlah Putri", width: "w-1/20" },
    { key: "email", label: "Email", width: "w-3/20" },
    { key: "detail", label: "Detail", width: "w-1/20" },
    { key: "tahun_update", label: "Tanggal Update", width: "w-1/20" },
  ];

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleKwarranChange = (e) => setSelectedKwarran(e.target.value);
  const handleTingkatanChange = (e) => setSelectedTingkatan(e.target.value);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredData = data
    .filter((item) => {
      const matchesSearch =
        (item.no_gudep ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.mabigus ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.pembina ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.pelatih ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKwarran = selectedKwarran
        ? kwarranList.find((k) => k.id === item.kwarran_id)?.nama ===
          selectedKwarran
        : true;

      const matchesTingkatan = selectedTingkatan
        ? item.tingkatan === selectedTingkatan
        : true;

      const isNotAdmin = item.useres?.role !== "admin";

      return matchesSearch && matchesKwarran && matchesTingkatan && isNotAdmin;
    })
    .map((item) => ({
      ...item,
      kwarran_nama:
        kwarranList.find((k) => k.id === item.kwarran_id)?.nama || "-",
      tahun_update: formatDate(item.tahun_update),
    }));

  // Custom cell renderer for the "detail" column to show popup on hover
  const renderDetailCell = (item) => {
    return (
      <div className="relative group cursor-pointer">
        <span className="text-blue-600 underline">Lihat</span>
        <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-3 w-64 top-full left-1/2 transform -translate-x-1/2 mt-2">
          <p>
            <strong>Mabigus:</strong> {item.mabigus || "-"}
          </p>
          <p>
            <strong>Pembina:</strong> {item.pembina || "-"}
          </p>
          <p>
            <strong>Pelatih:</strong> {item.pelatih || "-"}
          </p>
        </div>
      </div>
    );
  };

  // Prepare data for TableR, replacing "detail" key with the popup component
  const tableData = filteredData.map((item) => ({
    ...item,
    detail: renderDetailCell(item),
  }));

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Gugusdepan
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />

            <select
              value={selectedKwarran}
              onChange={handleKwarranChange}
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
            >
              <option value="" className="text-[#9500FF] font-bold">
                Kwarran
              </option>
              {kwarranList.map((kwarran) => (
                <option
                  key={kwarran.id}
                  value={kwarran.nama}
                  className="text-[#9500FF] font-bold"
                >
                  {kwarran.nama}
                </option>
              ))}
            </select>

            <select
              value={selectedTingkatan}
              onChange={handleTingkatanChange}
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
            >
              <option value="" className="text-[#9500FF] font-bold">
                Tingkatan
              </option>
              <option value="Siaga" className="text-[#9500FF] font-bold">
                Siaga
              </option>
              <option value="Penggalang" className="text-[#9500FF] font-bold">
                Penggalang
              </option>
              <option
                value="Penegak/Pandega"
                className="text-[#9500FF] font-bold"
              >
                Penegak/Pandega
              </option>
              <option value="Pandega" className="text-[#9500FF] font-bold">
                Pandega
              </option>
            </select>
          </div>

          {loading && <p className="text-center mt-4">Loading data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {tableData.length === 0 && !loading ? (
            <p className="text-center mt-4">Data tidak ditemukan</p>
          ) : (
            <TableR headers={headers} data={tableData} />
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminGugusdepan;
