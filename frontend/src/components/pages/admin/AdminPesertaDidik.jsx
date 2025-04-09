import React, { useEffect, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import { fetchPesertadidik } from "../../../services/PesertadidikService";
import SearchInput from "../../atoms/SearchInput";
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

  useEffect(() => {
    const fetchData = async () => {
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
    { key: "no_gudep", label: "No. Gudep" },
    { key: "tingkatan", label: "Tingkatan" },
    { key: "nama", label: "Nama Peserta Didik" },
    { key: "gender", label: "Gender" },
    { key: "ttl", label: "Tempat, Tanggal Lahir" },
    { key: "detailtingkatan", label: "Detail Tingkatan" },
  ];

  const enrichedData = data.map((item) => {
    const matchedGudep = gudepList.find((gudep) => gudep.id === item.gudep_id);
    return {
      ...item,
      no_gudep: matchedGudep ? matchedGudep.no_gudep : "-",
      tingkatan: matchedGudep ? matchedGudep.tingkatan : "-",
    };
  });

  const uniqueGudep = Array.from(
    new Set(enrichedData.map((item) => item.no_gudep))
  );

  const tingkatanOptions = [
    "Siaga",
    "Penggalang",
    "Penegak/Pandega",
    "Pandega",
  ];

  const filteredData = enrichedData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detailtingkatan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGudep = selectedGudep ? item.no_gudep === selectedGudep : true;
    const matchesTingkatan = selectedTingkatan
      ? item.tingkatan === selectedTingkatan
      : true;

    return matchesSearch && matchesGudep && matchesTingkatan;
  });

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Peserta Didik
            </span>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={selectedGudep}
              onChange={(e) => setSelectedGudep(e.target.value)}
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
            >
              <option value="" className="text-[#9500FF] font-bold">
                No. Gudep
              </option>
              {uniqueGudep.map((gudep, index) => (
                <option
                  key={index}
                  value={gudep}
                  className="text-[#9500FF] font-bold"
                >
                  {gudep}
                </option>
              ))}
            </select>
            <select
              value={selectedTingkatan}
              onChange={(e) => setSelectedTingkatan(e.target.value)}
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
            >
              <option value="" className="text-[#9500FF] font-bold">
                Tingkatan
              </option>
              {tingkatanOptions.map((tingkatan, index) => (
                <option
                  key={index}
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
            <TableR headers={headers} data={filteredData} />
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminPesertaDidik;
