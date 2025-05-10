import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGeografis } from "../../../services/GeografisService";
import DetailCell from "../../atoms/DetailCell";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";
import AdminHeader from "../../atoms/AdminHeader"; // Import standardized header

const AdminGeografis = () => {
  // State untuk menyimpan query pencarian, data geografis, status loading, dan error
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data geografis dari API
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true); // Set status loading menjadi true
      const result = await fetchGeografis(); // Panggil API
      setData(Array.isArray(result.data) ? result.data : []); // Set data jika berhasil
      setError(null); // Reset error jika ada
    } catch (err) {
      setError(`Gagal mengambil data: ${err.message}`); // Set pesan error jika gagal
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false); // Set status loading menjadi false
    }
  }, []);

  // Panggil fungsi fetchInitialData saat komponen pertama kali dirender
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Header tabel untuk data geografis
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "no_gudep", label: "No. Gudep", width: "w-2/12" },
      { key: "latitude", label: "Latitude", width: "w-2/12" },
      { key: "longitude", label: "Longitude", width: "w-2/12" },
      { key: "titik_koordinat", label: "Titik Koordinat", width: "w-2/12" },
      { key: "alamat", label: "Alamat", width: "w-3/12" },
      { key: "maps_link", label: "Aksi", width: "w-2/12" },
    ],
    []
  );

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Filter data berdasarkan query pencarian
  const filteredData = useMemo(() => {
    return data
      .map((item, index) => {
        const noGudepValue = item.gudepes?.no_gudep || "-";
        const latitudeValue = item.latitude || null;
        const longitudeValue = item.longitude || null;

        return {
          ...item,
          no: index + 1, // Tambahkan nomor urut
          no_gudep: noGudepValue === "ADMIN" ? "-" : noGudepValue, // Filter "ADMIN"
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
                disabled={!latitudeValue || !longitudeValue} // Disable jika koordinat tidak ada
                title="Lihat di Maps"
              >
                <span className="material-icons align-middle">near_me</span>
              </button>
            </a>
          ),
        };
      })
      .filter((item) => {
        const searchMatch =
          (item.alamat ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) || // Filter berdasarkan alamat
          (item.latitude ?? "").toString().includes(searchQuery) || // Filter berdasarkan latitude
          (item.longitude ?? "").toString().includes(searchQuery) || // Filter berdasarkan longitude
          (item.no_gudep ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()); // Filter berdasarkan no_gudep

        return searchMatch && item.gudepes?.no_gudep !== "ADMIN"; // Exclude data dengan no_gudep "ADMIN"
      });
  }, [data, searchQuery]);

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          {/* Standardized Header */}
          <AdminHeader
            title="Data Geografis"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
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
