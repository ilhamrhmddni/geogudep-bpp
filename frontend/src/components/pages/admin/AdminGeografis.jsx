import React, { useEffect, useState } from "react";
import { fetchGeografis } from "../../../services/GeografisService";
import { fetchKwarran } from "../../../services/KwarranService";
import SearchInput from "../../atoms/SearchInput";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminGeografis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [kwarranList, setKwarranList] = useState([]);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchGeografis();
        console.log("Data Geografis:", result.data); // Log data yang diterima
        setData(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
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
    { key: "no_gudep", label: "No. Gudep" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
    { key: "titik_koordinat", label: "Titik Koordinat" },
    { key: "alamat", label: "Alamat" },
    { key: "maps_link", label: "Aksi" },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKwarranChange = (e) => {
    setSelectedKwarran(e.target.value);
  };

  const filteredData = data
    .map((item) => {
      const noGudepValue = item.gudepes?.no_gudep || null;
      const latitudeValue = item.latitude || null;
      const longitudeValue = item.longitude || null;

      return {
        ...item,
        no_gudep: noGudepValue ? noGudepValue : "-",
        maps_link: (
          <a
            href={`https://www.google.com/maps?q=$${latitudeValue},${longitudeValue}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="px-3 py-1 bg-[#9500FF] text-white rounded hover:bg-[#590396] transition cursor-pointer"
              disabled={!latitudeValue || !longitudeValue}
            >
              📍 Lihat di Maps
            </button>
          </a>
        ),
        titik_koordinat:
          latitudeValue && longitudeValue
            ? `${latitudeValue}, ${longitudeValue}`
            : "-",
      };
    })
    .filter((item) => {
      const matchesSearch =
        (item.alamat ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.latitude ?? "").toString().includes(searchQuery) ||
        (item.longitude ?? "").toString().includes(searchQuery) ||
        (item.no_gudep === "Data belum tersedia"
          ? false
          : (item.no_gudep ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

      const matchesKwarran = selectedKwarran
        ? item.Gudep?.kwarran_id === selectedKwarran
        : true;

      const isNotAdmin = item.gudepes?.no_gudep !== "ADMIN";

      return matchesSearch && matchesKwarran && isNotAdmin;
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
              Data Geografis
            </span>
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari berdasarkan alamat, latitude, atau longitude"
            />
            <select
              className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
              value={selectedKwarran}
              onChange={handleKwarranChange}
            >
              <option value="" className="text-[#9500FF] font-bold ">
                Kwarran
              </option>
              {kwarranList.map((kwarran) => (
                <option
                  key={kwarran.id}
                  value={kwarran.id}
                  className="text-[#9500FF] font-bold"
                >
                  {kwarran.nama}
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

export default AdminGeografis;
