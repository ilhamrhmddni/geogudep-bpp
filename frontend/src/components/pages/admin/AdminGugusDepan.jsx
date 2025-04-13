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

  // Fetch Gugusdepan data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchGugusdepan();
        console.log("Data Gugusdepan:", result.data);
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

  // Fetch Kwarran data from API
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
    { key: "no_gudep", label: "No. Gudep" },
    { key: "kwarran_nama", label: "Kwarran" },
    { key: "tingkatan", label: "Tingkatan" },
    { key: "pangkalan", label: "Pangkalan" }, // Added Pangkalan header
    { key: "jumlah_putra", label: "Jumlah Putra" },
    { key: "jumlah_putri", label: "Jumlah Putri" },
    { key: "email", label: "Email" },
    { key: "tahun_update", label: "Tanggal Update" },
    { key: "mabigus", label: "Mabigus" },
    { key: "pembina", label: "Pembina" },
    { key: "pelatih", label: "Pelatih" },
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
      console.log("Item sebelum filter:", item);

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

      // Ensure that the role of the user is not admin
      const isNotAdmin = item.useres?.role !== "admin";

      console.log("Matches:", {
        matchesSearch,
        matchesKwarran,
        matchesTingkatan,
        isNotAdmin,
      });

      return matchesSearch && matchesKwarran && matchesTingkatan && isNotAdmin;
    })
    .map((item) => {
      console.log("Item setelah filter:", item);
      return {
        ...item,
        kwarran_nama:
          kwarranList.find((k) => k.id === item.kwarran_id)?.nama || "-",
        tahun_update: formatDate(item.tahun_update),
      };
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
              Data Gugusdepan
            </span>
            <SearchInput value={searchQuery} onChange={handleSearchChange} />

            {/* Dropdown Kwarran */}
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

            {/* Dropdown Tingkatan */}
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

          {/* Loading & Error Messages */}
          {loading && <p className="text-center mt-4">Loading data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {/* Display table or message if no data found */}
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

export default AdminGugusdepan;
