import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGeografis } from "../../../services/GeografisService";
import DetailCell from "../../atoms/DetailCell";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import ListHeader from "../../moleculs/ListHeader"; // Menggunakan ListHeader
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminGeografis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchGeografis();
      setData(Array.isArray(result.data) ? result.data : []);
      setError(null);
    } catch (err) {
      setError(`Gagal mengambil data: ${err.message}`);
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
      { key: "latitude", label: "Latitude", width: "w-1/20" },
      { key: "longitude", label: "Longitude", width: "w-1/20" },
      { key: "titik_koordinat", label: "Titik Koordinat", width: "w-1/20" },
      { key: "alamat", label: "Alamat", width: "w-8/20" },
      { key: "maps_link", label: "Aksi", width: "w-1/20" },
    ],
    []
  );

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );

  const filteredData = useMemo(() => {
    return data
      .map((item, index) => {
        const noGudepValue = item.gudepes?.no_gudep || "-";
        const latitudeValue = item.latitude || null;
        const longitudeValue = item.longitude || null;

        return {
          ...item,
          no: index + 1,
          no_gudep: noGudepValue === "ADMIN" ? "-" : noGudepValue,
          titik_koordinat: (
            <DetailCell
              title="Lihat"
              details={[
                { label: "Titik Koordinat", value: item.titik_koordinat },
              ]}
            />
          ),
          maps_link: (
            <a
              href={`https://www.google.com/maps?q=${latitudeValue},${longitudeValue}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="px-2 bg-[#9500FF] text-white rounded hover:bg-[#590396] transition cursor-pointer"
                disabled={!latitudeValue || !longitudeValue}
                title="Lihat di Maps"
              >
                <span className="material-icons">near_me</span>
              </button>
            </a>
          ),
        };
      })
      .filter((item) => {
        const searchMatch =
          (item.alamat ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.latitude ?? "").toString().includes(searchQuery) ||
          (item.longitude ?? "").toString().includes(searchQuery) ||
          (item.no_gudep ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return searchMatch && item.gudepes?.no_gudep !== "ADMIN";
      });
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <ListHeader
            title="Data Geografis"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} // Perbaikan: menggunakan setSearchQuery
          />

          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data geografis tidak ditemukan." />
            ) : (
              <TableR headers={headers} data={filteredData} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminGeografis;
