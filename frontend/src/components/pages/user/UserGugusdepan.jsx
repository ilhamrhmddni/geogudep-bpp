import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { fetchGeografis } from "../../../services/GeografisService";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import Dropdown from "../../atoms/Dropdown";
import UserTemplate from "../../templates/UserTemplate";

// Import GeoJSON files
import BalikpapanBarat from "../../../geojson/BalikpapanBarat.json";
import BalikpapanKota from "../../../geojson/BalikpapanKota.json";
import BalikpapanSelatan from "../../../geojson/BalikpapanSelatan.json";
import BalikpapanTengah from "../../../geojson/BalikpapanTengah.json";
import BalikpapanTimur from "../../../geojson/BalikpapanTimur.json";
import BalikpapanUtara from "../../../geojson/BalikpapanUtara.json";

// Fix untuk menampilkan marker icon di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Komponen untuk toggle ukuran peta (fullscreen atau tidak)
const ToggleMapSize = ({ isFullScreen, setIsFullScreen }) => {
  const map = useMap();

  const toggleFullScreen = () => {
    const mapContainer = map.getContainer();
    mapContainer.classList.toggle("full-screen-map");
    setIsFullScreen((prev) => !prev);
    map.invalidateSize(); // Pastikan peta merespons perubahan ukuran
  };

  return (
    <button
      onClick={toggleFullScreen}
      className="absolute top-2 right-2 bg-[#9500FF] text-white font-bold py-2 px-4 rounded cursor-pointer z-50"
      style={{ zIndex: 1000 }}
    >
      {isFullScreen ? (
        <span className="material-icons">fullscreen_exit</span>
      ) : (
        <span className="material-icons">fullscreen</span>
      )}
    </button>
  );
};

// Komponen untuk filters pada peta
const MapFilters = ({
  kwarranOptions,
  selectedKwarran,
  setSelectedKwarran,
  selectedTingkatan,
  setSelectedTingkatan,
  resetFilters,
}) => {
  const tingkatanOptions = [
    { nama: "Siaga" },
    { nama: "Penggalang" },
    { nama: "Penegak/Pandega" },
    { nama: "Pandega" },
  ];

  return (
    <div
      className="absolute bottom-5 left-5 z-50 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-lg"
      style={{ zIndex: 1000 }}
    >
      <h3 className="font-bold text-[#9500FF] text-center text-md">
        Filter Peta
      </h3>
      <div className="bg-[#9500FF] rounded-xl">
        <Dropdown
          options={kwarranOptions}
          selected={selectedKwarran}
          onChange={setSelectedKwarran}
          placeholder="Filter Kwarran"
        />
      </div>
      <div className="bg-[#9500FF] rounded-xl">
        <Dropdown
          options={tingkatanOptions}
          selected={selectedTingkatan}
          onChange={setSelectedTingkatan}
          placeholder="Filter Tingkatan"
        />
      </div>
      <button
        onClick={resetFilters}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2 font-bold py-1 px-3 rounded-xl"
      >
        Reset Filter
      </button>
    </div>
  );
};

// Legenda untuk peta
const MapLegend = () => {
  return (
    <div className="absolute md:visible invisible bottom-10 right-5 z-1000 bg-white p-2 rounded-lg shadow-lg">
      <h4 className="font-bold text-sm mb-2">Legenda Tingkatan</h4>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-xs">Siaga</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-xs">Penggalang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-xs">Penegak/Pandega</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black"></div>
          <span className="text-xs">Pandega</span>
        </div>
      </div>
    </div>
  );
};

// Komponen untuk memindahkan peta ke lokasi pengguna
const FlyToUserLocation = () => {
  const map = useMap();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 15 });

    const handleLocationFound = (e) => {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, 13, { duration: 1 });
    };

    map.on("locationfound", handleLocationFound);

    return () => {
      map.off("locationfound", handleLocationFound);
    };
  }, [map]);

  return null;
};

const UserGugusdepan = () => {
  const [geografisData, setGeografisData] = useState([]);
  const [gugusdepanData, setGugusdepanData] = useState([]);
  const [kwarranData, setKwarranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGugusdepan, setSelectedGugusdepan] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedKwarran, setSelectedKwarran] = useState(""); // State untuk filter Kwarran
  const [selectedTingkatan, setSelectedTingkatan] = useState(""); // State untuk filter Tingkatan
  const [showGeoJSON, setShowGeoJSON] = useState(true); // State untuk toggle GeoJSON
  const [kwarranColors, setKwarranColors] = useState({}); // State untuk menyimpan warna per kwarran
  const [geoJSONSourceData, setGeoJSONSourceData] = useState(null); // State baru

  // GeoJSON data
  const geoJSONData = {
    "Balikpapan Barat": BalikpapanBarat,
    "Balikpapan Kota": BalikpapanKota,
    "Balikpapan Selatan": BalikpapanSelatan,
    "Balikpapan Timur": BalikpapanTimur,
    "Balikpapan Tengah": BalikpapanTengah,
    "Balikpapan Utara": BalikpapanUtara,
  };

  // Mengambil data geografis, gugusdepan, dan kwarran secara paralel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [geoResult, gudepResult, kwarranResult] = await Promise.all([
          fetchGeografis(),
          fetchGugusdepan(),
          fetchKwarran(),
        ]);
        setGeografisData(geoResult.data || []);
        setGugusdepanData(gudepResult.data || []);
        setKwarranData(kwarranResult.data || []);

        // Generate warna unik untuk setiap kwarran
        const colors = {};
        const colorOptions = [
          "#de8685",
          "#89da73",
          "#dc7ac5",
          "#d59a24",
          "#ceee8d",
          "#4dabf7",
        ];

        kwarranResult.data.forEach((kwarran, index) => {
          colors[kwarran.nama] = colorOptions[index % colorOptions.length];
        });

        setKwarranColors(colors);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset filter function
  const resetFilters = () => {
    setSelectedKwarran("");
    setSelectedTingkatan("");
  };

  // Posisi default peta
  const defaultPosition = [-1.2550458, 116.8878243];
  const initialZoom = 12;

  // Fungsi untuk menentukan warna marker berdasarkan tingkatan
  const getMarkerColor = (tingkatan) => {
    switch (tingkatan?.toLowerCase()) {
      case "siaga":
        return "green";
      case "penggalang":
        return "red";
      case "penegak/pandega":
        return "yellow";
      case "pandega":
        return "black";
      default:
        return "blue";
    }
  };

  // Fungsi untuk membuat custom icon marker
  const createCustomIcon = (color) => {
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  // Filter gugusdepan berdasarkan kwarran dan tingkatan yang dipilih
  const filteredGugusdepan = gugusdepanData.filter((gudep) => {
    // Filter untuk Kwarran
    const kwarranMatch =
      !selectedKwarran ||
      (gudep.kwarran_id &&
        kwarranData.find(
          (kwarran) =>
            kwarran.id === gudep.kwarran_id && kwarran.nama === selectedKwarran
        ));

    // Filter untuk Tingkatan
    const tingkatanMatch =
      !selectedTingkatan ||
      (gudep.tingkatan &&
        gudep.tingkatan.toLowerCase() === selectedTingkatan.toLowerCase());

    return kwarranMatch && tingkatanMatch;
  });

  // Filter geografis berdasarkan gugusdepan yang sudah difilter
  const filteredGeografis = geografisData.filter((geo) => {
    const matchedGudep = filteredGugusdepan.find(
      (gudep) => gudep.id === geo.gudep_id
    );
    return matchedGudep !== undefined;
  });

  const geoJSONStyle = (feature) => {
    const kwarranName = feature.properties?.nama; // Nama dari data GeoJSON
    const originalColor = kwarranColors[kwarranName] || "#9500FF";
    const inactiveColor = "#AAAAAA";

    if (selectedKwarran && kwarranName === selectedKwarran) {
      // --- DEBUG LOG MATCH ---
      // --- END DEBUG LOG ---
      return {
        fillColor: originalColor,
        weight: 3,
        opacity: 1,
        color: "#333",
        fillOpacity: 0.6,
      };
    } else if (selectedKwarran && kwarranName !== selectedKwarran) {
      return {
        fillColor: inactiveColor,
        weight: 1,
        opacity: 0.7,
        color: "#888",
        fillOpacity: 0.5,
      };
    } else {
      return {
        fillColor: originalColor,
        weight: 2,
        opacity: 0.7,
        color: "#666",
        fillOpacity: 0.2,
      };
    }
  };

  // Event handlers untuk GeoJSON (Final: Gunakan 'nama', trim, dan toLowerCase, tanpa log)
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.nama) {
      const kwarranNameFromGeoJSON = feature.properties.nama;

      const gudepInKwarran = gugusdepanData.filter((gudep) => {
        const kwarran = kwarranData.find((k) => k.id === gudep.kwarran_id);
        const kwarranNameFromDb = kwarran?.nama;
        const match =
          kwarran &&
          kwarranNameFromDb?.trim().toLowerCase() ===
            kwarranNameFromGeoJSON?.trim().toLowerCase();
        return match;
      });

      const siagaCount = gudepInKwarran.filter(
        (g) => g.tingkatan?.trim().toLowerCase() === "siaga"
      ).length;
      const penggalangCount = gudepInKwarran.filter(
        (g) => g.tingkatan?.trim().toLowerCase() === "penggalang"
      ).length;
      const penegakCount = gudepInKwarran.filter((g) => {
        const tingkatan = g.tingkatan?.trim().toLowerCase();
        return tingkatan === "penegak/pandega" || tingkatan === "penegak";
      }).length;
      const pandegaCount = gudepInKwarran.filter(
        (g) => g.tingkatan?.trim().toLowerCase() === "pandega"
      ).length;

      layer.bindPopup(`
      <div class="">
        <h3 class="font-bold text-lg">Kwarran ${kwarranNameFromGeoJSON}</h3>
        <span><strong>Total Gudep:</strong> ${gudepInKwarran.length}</span><br/>
        <span><strong>Siaga:</strong> ${siagaCount}</span><br/>
        <span><strong>Penggalang:</strong> ${penggalangCount}</span><br/>
        <span><strong>Penegak/Pandega:</strong> ${penegakCount}</span><br/>
        <span><strong>Pandega:</strong> ${pandegaCount}</span>
      </div>
    `);

      layer.on({
        click: (e) => {
          setSelectedKwarran(kwarranNameFromGeoJSON);
        },
      });
    } else {
      // console.warn("Feature processed without 'nama' property:", feature.properties); // Log ini bisa dihapus juga
    }
  };

  // Bulan legenda kwarran
  const KwarranLegend = () => {
    return (
      <div className="absolute md:visible invisible bottom-50 right-5 z-1000 bg-white px-3 py-2 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        <h4 className="font-bold text-sm mb-2">Legenda Kwarran</h4>
        <div className="flex flex-col gap-1">
          {Object.entries(kwarranColors).map(([kwarranName, color]) => (
            <div key={kwarranName} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs">{kwarranName}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <UserTemplate>
      <div className={`md:ml-18 rounded-xl shadow-xl mt-4 md:mt-15 `}>
        <div className="p-4 md:mt-18">
          {/* Info panel showing filter states */}
          {(selectedKwarran || selectedTingkatan) && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">Filter Aktif:</span>
                {selectedKwarran && (
                  <span className="ml-2 bg-[#9500FF] text-white px-2 py-1 rounded">
                    Kwarran: {selectedKwarran}
                  </span>
                )}
                {selectedTingkatan && (
                  <span className="ml-2 bg-[#9500FF] text-white px-2 py-1 rounded">
                    Tingkatan: {selectedTingkatan}
                  </span>
                )}
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Reset
              </button>
            </div>
          )}

          <MapContainer
            center={defaultPosition}
            zoom={initialZoom}
            style={{
              height: isFullScreen ? "100vh" : "500px", // Tinggi peta lebih besar
              width: isFullScreen ? "100vw" : "100%",
            }}
            className={`rounded-xl leaflet-container ${
              isFullScreen ? "full-screen-map " : ""
            }`}
            onClick={() => setSelectedGugusdepan(null)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {loading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 rounded-lg shadow-lg p-6">
                <p className="text-lg font-semibold text-gray-700">
                  Memuat data...
                </p>
              </div>
            )}

            {/* GeoJSON Layers dengan warna berdasarkan kwarran */}
            {showGeoJSON &&
              Object.entries(geoJSONData).map(([key, data]) => (
                <GeoJSON
                  key={key}
                  data={data}
                  style={geoJSONStyle}
                  onEachFeature={onEachFeature}
                />
              ))}

            {/* Markers */}
            {!loading &&
              filteredGeografis.map((geo) => {
                const matchedGudep = gugusdepanData.find(
                  (gudep) => gudep.id === geo.gudep_id
                );
                const lat = parseFloat(geo.latitude);
                const lng = parseFloat(geo.longitude);

                if (!isNaN(lat) && !isNaN(lng) && matchedGudep) {
                  const markerColor = getMarkerColor(matchedGudep.tingkatan);
                  const customIcon = createCustomIcon(markerColor);

                  // Dapatkan nama kwarran untuk gudep ini
                  const kwarran = kwarranData.find(
                    (k) => k.id === matchedGudep.kwarran_id
                  );
                  const kwarranName = kwarran
                    ? kwarran.nama
                    : "Tidak diketahui";

                  return (
                    <Marker
                      key={geo.id}
                      position={[lat, lng]}
                      icon={customIcon}
                      eventHandlers={{
                        click: () => setSelectedGugusdepan(matchedGudep),
                      }}
                    >
                      <Popup>
                        <div className="bg-white rounded-lg text-gray-800 font-semibold">
                          <h4 className="font-bold text-[#9500FF] mb-1">
                            {matchedGudep.pangkalan || "Data Belum Tersedia"}
                          </h4>
                          <b>
                            No. Gudep :{" "}
                            {matchedGudep.no_gudep || "Data Belum Tersedia"}
                          </b>
                          <br />
                          <b>Kwarran: {kwarranName}</b>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}

            {/* Komponen-komponen peta */}
            <ToggleMapSize
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
            <MapFilters
              kwarranOptions={kwarranData}
              selectedKwarran={selectedKwarran}
              setSelectedKwarran={setSelectedKwarran}
              selectedTingkatan={selectedTingkatan}
              setSelectedTingkatan={setSelectedTingkatan}
              resetFilters={resetFilters}
            />
            <MapLegend />
            <KwarranLegend />
            <FlyToUserLocation />
          </MapContainer>

          {/* Detail gudep yang dipilih */}
          {!isFullScreen && selectedGugusdepan && (
            <div className="my-4 space-y-4 px-4 bg-white p-4 rounded-xl shadow">
              <h3 className="text-xl font-bold text-[#9500FF]">
                Detail Gugus Depan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Kwarran:
                  </label>
                  <input
                    type="text"
                    value={
                      kwarranData.find(
                        (kwarran) =>
                          kwarran.id === selectedGugusdepan.kwarran_id
                      )?.nama || "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Tingkatan:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedGugusdepan.tingkatan || "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    No. Gudep:
                  </label>
                  <input
                    type="text"
                    value={selectedGugusdepan.no_gudep || "Data belum tersedia"}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pangkalan:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedGugusdepan.pangkalan || "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Jumlah Putra:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedGugusdepan.jumlah_putra?.toString() ||
                      "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Jumlah Putri:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedGugusdepan.jumlah_putri?.toString() ||
                      "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#9500FF] font-bold mb-2 block">
                  Mabigus:
                </label>
                <input
                  type="text"
                  value={selectedGugusdepan.mabigus || "Data belum tersedia"}
                  readOnly
                  className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pembina:
                  </label>
                  <input
                    type="text"
                    value={selectedGugusdepan.pembina || "Data belum tersedia"}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pelatih:
                  </label>
                  <input
                    type="text"
                    value={selectedGugusdepan.pelatih || "Data belum tersedia"}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Email:
                  </label>
                  <input
                    type="text"
                    value={selectedGugusdepan.email || "Data belum tersedia"}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Tanggal Update:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedGugusdepan.tahun_update
                        ? new Date(
                            selectedGugusdepan.tahun_update
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "Data belum tersedia"
                    }
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          .leaflet-container {
            width: 100%;
            height: 100%;
          }
          .full-screen-map {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 1500 !important; /* Pastikan lebih tinggi dari elemen lain */
            margin: 0 !important;
            padding: 0 !important;
          }
          body.fullscreen-active {
            overflow: hidden; /* Hilangkan scroll saat fullscreen */
          }
        `}
      </style>
    </UserTemplate>
  );
};

export default UserGugusdepan;
