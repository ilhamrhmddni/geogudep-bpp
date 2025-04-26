import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Predefined constants
const DEFAULT_POSITION = [-1.2550458, 116.8878243]; // Center of Balikpapan
const INITIAL_ZOOM = 12;
const KWARRAN_COLORS = [
  "#de8685",
  "#89da73",
  "#dc7ac5",
  "#d59a24",
  "#ceee8d",
  "#4dabf7",
];

// GeoJSON data mapping
const GEO_JSON_DATA = {
  Barat: BalikpapanBarat,
  Kota: BalikpapanKota,
  Selatan: BalikpapanSelatan,
  Timur: BalikpapanTimur,
  Tengah: BalikpapanTengah,
  Utara: BalikpapanUtara,
};

// Define tingkatan options once
const TINGKATAN_OPTIONS = [
  { nama: "Siaga" },
  { nama: "Penggalang" },
  { nama: "Penegak/Pandega" },
];

// Map toggle fullscreen component
const ToggleMapSize = ({ isFullScreen, setIsFullScreen }) => {
  const map = useMap();

  const toggleFullScreen = useCallback(() => {
    const mapContainer = map.getContainer();
    mapContainer.classList.toggle("full-screen-map");
    setIsFullScreen((prev) => !prev);
    map.invalidateSize();

    document.body.classList.toggle("fullscreen-active", !isFullScreen);
  }, [map, isFullScreen, setIsFullScreen]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.body.classList.remove("fullscreen-active");
    };
  }, []);

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

// Map filters component
const MapFilters = ({
  kwarranOptions,
  selectedKwarran,
  setSelectedKwarran,
  selectedTingkatan,
  setSelectedTingkatan,
  resetFilters,
}) => {
  return (
    <div className="absolute md:bottom-25 bottom-10 right-5 z-1000 flex flex-row gap-2 bg-white p-2 rounded-lg shadow-lg md:flex-col m-auto">
      <h3 className="font-bold text-[#9500FF] text-center text-md whitespace-nowrap hidden md:block ">
        Filter Peta
      </h3>
      <div className="bg-[#9500FF] rounded-xl my-2 md:my-0">
        <Dropdown
          options={kwarranOptions}
          selected={selectedKwarran}
          onChange={setSelectedKwarran}
          placeholder="Filter Kwarran"
        />
      </div>
      <div className="bg-[#9500FF] rounded-xl my-2 md:my-0">
        <Dropdown
          options={TINGKATAN_OPTIONS}
          selected={selectedTingkatan}
          onChange={setSelectedTingkatan}
          placeholder="Filter Tingkatan"
        />
      </div>
      <button
        onClick={resetFilters}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2 font-bold py-1 px-3 rounded-xl hidden md:block"
      >
        Reset Filter
      </button>
    </div>
  );
};

// Legend component
const MapLegend = () => (
  <div
    className="absolute md:visible invisible bottom-5 left-5 z-1000 bg-white p-2 rounded-lg shadow-lg"
    style={{ zIndex: 1000 }}
  >
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
    </div>
  </div>
);

// Kwarran legend component
const KwarranLegend = ({ kwarranColors }) => {
  if (Object.keys(kwarranColors).length === 0) return null;

  return (
    <div className="absolute md:visible invisible bottom-35 left-5 z-1000 bg-white px-3 py-2 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      <h4 className="font-bold text-sm mb-2">Legenda Kwarran</h4>
      <div className="flex flex-col gap-1">
        {Object.entries(kwarranColors).map(([kwarranName, color]) => (
          <div key={kwarranName} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-gray-400"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-xs">{kwarranName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Detail Gudep panel component
const DetailGudepPanel = ({ selectedGugusdepan, kwarranData }) => {
  if (!selectedGugusdepan) return null;

  const kwarranName =
    kwarranData.find((k) => k.id === selectedGugusdepan.kwarran_id)?.nama ||
    "Belum Tersedia";

  return (
    <div className="my-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-[#9500FF] mb-4">
        Detail Gugus Depan
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Kwarran:
            </label>
            <input
              type="text"
              value={kwarranName}
              readOnly
              className="input-display-style"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Tingkatan:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.tingkatan || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              No. Gudep:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.no_gudep || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Pangkalan:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.pangkalan || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Jumlah Putra:
            </label>
            <input
              type="text"
              value={
                selectedGugusdepan.jumlah_putra?.toString() ?? "Belum Tersedia"
              }
              readOnly
              className="input-display-style"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Jumlah Putri:
            </label>
            <input
              type="text"
              value={
                selectedGugusdepan.jumlah_putri?.toString() ?? "Belum Tersedia"
              }
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Mabigus:
          </label>
          <input
            type="text"
            value={selectedGugusdepan.mabigus || "Belum Tersedia"}
            readOnly
            className="input-display-style"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Pembina:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.pembina || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Pelatih:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.pelatih || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Email:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.email || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Tgl Update Data:
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
                  : "Belum Tersedia"
              }
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
const UserGugusdepan = () => {
  // Data states
  const [geografisData, setGeografisData] = useState([]);
  const [gugusdepanData, setGugusdepanData] = useState([]);
  const [kwarranData, setKwarranData] = useState([]);
  const [kwarranColors, setKwarranColors] = useState({});

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedGugusdepan, setSelectedGugusdepan] = useState(null);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [geoResult, gudepResult, kwarranResult] = await Promise.all([
          fetchGeografis(),
          fetchGugusdepan(),
          fetchKwarran(),
        ]);

        // Validate and set state
        const fetchedGeografis = geoResult?.data || [];
        const fetchedGudep = gudepResult?.data || [];
        const fetchedKwarran = kwarranResult?.data || [];

        setGeografisData(fetchedGeografis);
        setGugusdepanData(fetchedGudep);
        setKwarranData(fetchedKwarran);

        // Generate colors for kwarrans
        if (Array.isArray(fetchedKwarran)) {
          const colors = {};
          fetchedKwarran.forEach((kwarran, index) => {
            if (kwarran?.nama) {
              colors[kwarran.nama] =
                KWARRAN_COLORS[index % KWARRAN_COLORS.length];
            }
          });
          setKwarranColors(colors);
        }
      } catch (err) {
        setError("Error fetching data. Please check console.");
        console.error("Error fetching data:", err);
        // Set empty states on error
        setGeografisData([]);
        setGugusdepanData([]);
        setKwarranData([]);
        setKwarranColors({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset filters function
  const resetFilters = useCallback(() => {
    setSelectedKwarran("");
    setSelectedTingkatan("");
    setSelectedGugusdepan(null);
  }, []);

  // Create custom icon marker function
  const createCustomIcon = useCallback((tingkatan) => {
    const lowerTingkatan = tingkatan?.toLowerCase() || "";
    let color = "blue"; // Default

    if (lowerTingkatan === "siaga") color = "green";
    else if (lowerTingkatan === "penggalang") color = "red";
    else if (
      lowerTingkatan === "penegak/pandega" ||
      lowerTingkatan === "penegak"
    )
      color = "yellow";

    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, []);

  // Filter gugusdepan based on selected filters
  const filteredGugusdepan = useMemo(() => {
    return gugusdepanData.filter((gudep) => {
      // Find kwarran for this gudep
      const gudepKwarran = kwarranData.find((k) => k.id === gudep.kwarran_id);
      const gudepKwarranName = gudepKwarran?.nama || "";

      // Filter by Kwarran
      const kwarranMatch =
        !selectedKwarran || gudepKwarranName === selectedKwarran;

      // Filter by Tingkatan
      const tingkatanMatch =
        !selectedTingkatan ||
        (gudep.tingkatan &&
          (gudep.tingkatan.toLowerCase() === selectedTingkatan.toLowerCase() ||
            (selectedTingkatan.toLowerCase() === "penegak/pandega" &&
              ["penegak", "pandega", "penegak/pandega"].includes(
                gudep.tingkatan.toLowerCase()
              ))));

      return kwarranMatch && tingkatanMatch;
    });
  }, [gugusdepanData, kwarranData, selectedKwarran, selectedTingkatan]);

  // Filter geografis based on filtered gugusdepan
  const filteredGeografis = useMemo(() => {
    return geografisData.filter((geo) =>
      filteredGugusdepan.some((gudep) => gudep.id === geo.gudep_id)
    );
  }, [geografisData, filteredGugusdepan]);

  // Style function for GeoJSON layers
  const geoJSONStyle = useCallback(
    (feature) => {
      const kwarranNameFromGeoJSON = feature?.properties?.nama;
      const originalColor = kwarranColors[kwarranNameFromGeoJSON] || "#cccccc";
      const inactiveColor = "#AAAAAA";

      // If a filter is active
      if (selectedKwarran) {
        if (kwarranNameFromGeoJSON === selectedKwarran) {
          return {
            fillColor: originalColor,
            weight: 3,
            opacity: 1,
            color: "#333",
            fillOpacity: 0.6,
          };
        } else {
          return {
            fillColor: inactiveColor,
            weight: 1,
            opacity: 0.7,
            color: "#888",
            fillOpacity: 0.4,
          };
        }
      } else {
        return {
          fillColor: originalColor,
          weight: 2,
          opacity: 1,
          color: "#666",
          fillOpacity: 0.3,
        };
      }
    },
    [kwarranColors, selectedKwarran]
  );

  // Event handlers for GeoJSON layers
  const onEachFeature = useCallback(
    (feature, layer) => {
      if (feature?.properties?.nama) {
        const kwarranNameFromGeoJSON = feature.properties.nama;

        // Find gudep belonging to this kwarran
        const gudepInKwarran = gugusdepanData.filter((gudep) => {
          const kwarran = kwarranData.find((k) => k.id === gudep.kwarran_id);
          return (
            kwarran?.nama?.trim().toLowerCase() ===
            kwarranNameFromGeoJSON?.trim().toLowerCase()
          );
        });

        // Calculate counts
        const siagaCount = gudepInKwarran.filter(
          (g) => g.tingkatan?.trim().toLowerCase() === "siaga"
        ).length;

        const penggalangCount = gudepInKwarran.filter(
          (g) => g.tingkatan?.trim().toLowerCase() === "penggalang"
        ).length;

        const penegakPandegaCount = gudepInKwarran.filter((g) => {
          const tingkatan = g.tingkatan?.trim().toLowerCase();
          return tingkatan === "penegak/pandega" || tingkatan === "penegak";
        }).length;

        // Bind popup
        layer.bindPopup(`
        <div>
          <h3 class="font-bold text-lg">Kwarran ${kwarranNameFromGeoJSON}</h3>
          <span><strong>Total Gudep:</strong> ${gudepInKwarran.length}</span><br/>
          <span><strong>Siaga:</strong> ${siagaCount}</span><br/>
          <span><strong>Penggalang:</strong> ${penggalangCount}</span><br/>
          <span><strong>Penegak/Pandega:</strong> ${penegakPandegaCount}</span><br/>
        </div>
      `);

        // Set click handler
        layer.on({
          click: () => setSelectedKwarran(kwarranNameFromGeoJSON),
        });
      }
    },
    [gugusdepanData, kwarranData, setSelectedKwarran]
  );

  // Format kwarran options for dropdown
  const kwarranOptions = useMemo(() => {
    return kwarranData.map((k) => ({ nama: k.nama }));
  }, [kwarranData]);

  // Render markers helper function
  const renderMarkers = useCallback(() => {
    return filteredGeografis.map((geo) => {
      // Find matching gudep
      const matchedGudep = filteredGugusdepan.find(
        (gudep) => gudep.id === geo.gudep_id
      );
      if (!matchedGudep) return null;

      // Parse coordinates
      let lat = NaN,
        lng = NaN;
      if (geo.titik_koordinat) {
        const coords = geo.titik_koordinat
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          lat = coords[0];
          lng = coords[1];
        }
      } else if (geo.latitude && geo.longitude) {
        lat = parseFloat(geo.latitude);
        lng = parseFloat(geo.longitude);
      }

      if (isNaN(lat) || isNaN(lng)) return null;

      // Get kwarran name
      const kwarran = kwarranData.find((k) => k.id === matchedGudep.kwarran_id);
      const kwarranName = kwarran?.nama || "Tidak diketahui";

      // Create marker
      return (
        <Marker
          key={geo.id || matchedGudep.id}
          position={[lat, lng]}
          icon={createCustomIcon(matchedGudep.tingkatan)}
          eventHandlers={{
            click: () => setSelectedGugusdepan(matchedGudep),
          }}
        >
          <Popup>
            <div className="text-sm">
              <h4 className="font-bold text-[#6a00b8] mb-1 text-base">
                {matchedGudep.pangkalan || "Nama Pangkalan Belum Ada"}
              </h4>
              <b>No. Gudep:</b> {matchedGudep.no_gudep || "-"}
              <br />
              <b>Kwarran:</b> {kwarranName}
              <br />
              <b>Tingkatan:</b> {matchedGudep.tingkatan || "-"}
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [filteredGeografis, filteredGugusdepan, kwarranData, createCustomIcon]);

  // Helper to render GeoJSON layers
  const renderGeoJSONLayers = useCallback(() => {
    return Object.entries(GEO_JSON_DATA).map(([key, data]) => (
      <GeoJSON
        key={key}
        data={data}
        style={geoJSONStyle}
        onEachFeature={onEachFeature}
      />
    ));
  }, [geoJSONStyle, onEachFeature]);

  // Render function
  return (
    <UserTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-4 md:mt-15">
        <div className="p-4 md:mt-18">
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-96">
              <p className="text-lg font-semibold text-gray-500">
                Memuat data peta...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Map - only render when data is loaded */}
          {!loading && !error && (
            <MapContainer
              center={DEFAULT_POSITION}
              zoom={INITIAL_ZOOM}
              style={{
                height: isFullScreen ? "100vh" : "500px",
                width: "100%",
              }}
              className={`rounded-xl leaflet-container ${
                isFullScreen ? "full-screen-map" : ""
              }`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* GeoJSON Layers */}
              {renderGeoJSONLayers()}

              {/* Markers */}
              {renderMarkers()}
              <KwarranLegend kwarranColors={kwarranColors} />
              {/* Map Controls */}
              <ToggleMapSize
                isFullScreen={isFullScreen}
                setIsFullScreen={setIsFullScreen}
              />
              <MapFilters
                kwarranOptions={kwarranOptions}
                selectedKwarran={selectedKwarran}
                setSelectedKwarran={setSelectedKwarran}
                selectedTingkatan={selectedTingkatan}
                setSelectedTingkatan={setSelectedTingkatan}
                resetFilters={resetFilters}
              />
              <MapLegend />
            </MapContainer>
          )}

          {/* Gudep Detail Panel - only show when not fullscreen */}
          {!isFullScreen && selectedGugusdepan && (
            <DetailGudepPanel
              selectedGugusdepan={selectedGugusdepan}
              kwarranData={kwarranData}
            />
          )}
        </div>
      </div>

      <style jsx global="true">{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          border-radius: 0.75rem;
        }
        .full-screen-map {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 1500 !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        body.fullscreen-active {
          overflow: hidden !important;
        }
        .input-display-style {
          display: block;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          background-color: #f3f4f6;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #374151;
          cursor: default;
        }
        .leaflet-bottom.leaflet-left {
          bottom: 10px;
        }
        .leaflet-top.leaflet-right {
          top: 10px;
        }
      `}</style>
    </UserTemplate>
  );
};

export default UserGugusdepan;
