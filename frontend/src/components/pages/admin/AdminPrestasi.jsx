import React, { useEffect, useState } from "react";
import { fetchEventGudeps } from "../../../services/PrestasiService";
import SearchInput from "../../atoms/SearchInput";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminPrestasi = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState(""); // State untuk filter tingkatan
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGudep, setSelectedGudep] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchEventGudeps();
        console.log(result); // Log struktur data
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

  const headers = [
    { key: "no_gudep", label: "No Gudep" },
    { key: "tingkatan", label: "Tingkatan" },
    { key: "nama_event", label: "Nama Event" },
    { key: "keterangan", label: "Keterangan" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTingkatanChange = (e) => {
    setSelectedTingkatan(e.target.value);
  };

  const handleGudepChange = (e) => {
    setSelectedGudep(e.target.value);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.eventes?.nama ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.keterangan ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.gudepes?.no_gudep ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesTingkatan =
      selectedTingkatan === "" || item.gudepes?.tingkatan === selectedTingkatan;

    const matchesGudep =
      selectedGudep === "" || item.gudepes?.no_gudep === selectedGudep;

    return matchesSearch && matchesTingkatan && matchesGudep;
  });

  console.log("Filtered Data:", filteredData);

  const transformedData = filteredData.map((item) => ({
    no_gudep: item.gudepes?.no_gudep ?? "-",
    tingkatan: item.gudepes?.tingkatan ?? "-",
    nama_event: item.eventes?.nama ?? "-",
    keterangan: item.keterangan ?? "-",
  }));

  const gudepOptions = [
    ...new Set(data.map((item) => item.gudepes?.no_gudep)),
  ].filter(Boolean);

  // Fixed options for Tingkatan
  const tingkatanOptions = [
    "Siaga",
    "Penggalang",
    "Penegak/Pandega",
    "Pandega",
  ];

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 items-center">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Prestasi
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />
            <select
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold"
              value={selectedGudep}
              onChange={handleGudepChange}
            >
              <option value="" className="text-[#9500FF] font-bold">
                Semua Gudep
              </option>
              {gudepOptions.map((gudep) => (
                <option
                  key={gudep}
                  value={gudep}
                  className="text-[#9500FF] font-bold"
                >
                  {gudep}
                </option>
              ))}
            </select>

            <select
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold"
              value={selectedTingkatan}
              onChange={handleTingkatanChange}
            >
              <option value="" className="text-[#9500FF] font-bold">
                Semua Tingkatan
              </option>
              {tingkatanOptions.map((tingkatan) => (
                <option
                  key={tingkatan}
                  value={tingkatan}
                  className="text-[#9500FF] font-bold"
                >
                  {tingkatan}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-center mt-4">Loading data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}
          {filteredData.length === 0 && !loading ? (
            <p className="text-center mt-4">Data tidak ditemukan</p>
          ) : (
            <TableR headers={headers} data={transformedData} />
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminPrestasi;
