import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const DEFAULT_POSITION = [-1.2550458, 116.8878243];
const INITIAL_ZOOM = 12;
const KWARRAN_COLORS = [
  "#de8685",
  "#89da73",
  "#dc7ac5",
  "#d59a24",
  "#ceee8d",
  "#4dabf7",
];
const GEO_JSON_DATA = {
  Barat: BalikpapanBarat,
  Kota: BalikpapanKota,
  Selatan: BalikpapanSelatan,
  Timur: BalikpapanTimur,
  Tengah: BalikpapanTengah,
  Utara: BalikpapanUtara,
};
const TINGKATAN_OPTIONS = [
  { nama: "Siaga" },
  { nama: "Penggalang" },
  { nama: "Penegak/Pandega" },
  { nama: "Pandega" },
];

const ToggleMapSize = ({ isFullScreen, setIsFullScreen }) => {
  const map = useMap();
  const toggleFullScreen = useCallback(() => {
    const mapContainer = map.getContainer();
    mapContainer.classList.toggle("full-screen-map");
    setIsFullScreen((prev) => !prev);
    map.invalidateSize();
    document.body.classList.toggle("fullscreen-active", !isFullScreen);
  }, [map, isFullScreen, setIsFullScreen]);

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

const DetailGudepPanel = ({ selectedGugusdepan, kwarranData }) => {
  if (!selectedGugusdepan) return null;

  const kwarranName =
    kwarranData.find((k) => k.id === selectedGugusdepan.kwarran_id)?.nama ||
    "Belum Tersedia";

  // Menentukan nama yang akan ditampilkan untuk Gugus Depan di judul panel
  const gudepDisplayName =
    selectedGugusdepan.pangkalan || selectedGugusdepan.no_gudep || "Terpilih"; // Teks pengganti jika pangkalan dan no_gudep tidak ada

  return (
    <div className="my-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-[#9500FF] mb-4">
        Detail Data Gugus Depan {gudepDisplayName}
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
              {selectedGugusdepan.tingkatan === "Penegak/Pandega" ||
              selectedGugusdepan.tingkatan === "Pandega"
                ? "Ambalan/Racana:"
                : "Jumlah Barung/Regu:"}
            </label>
            <input
              type="text"
              value={selectedGugusdepan.ambalan || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Tingkatan:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.tingkatan || "Belum Tersedia"}
              readOnly
              className="input-display-style w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Jumlah Putra:
              </label>
              <input
                type="text"
                value={
                  selectedGugusdepan.jumlah_putra?.toString() ??
                  "Belum Tersedia"
                }
                readOnly
                className="input-display-style w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Jumlah Putri:
              </label>
              <input
                type="text"
                value={
                  selectedGugusdepan.jumlah_putri?.toString() ??
                  "Belum Tersedia"
                }
                readOnly
                className="input-display-style w-full"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
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
              Email:
            </label>
            <input
              type="text"
              value={selectedGugusdepan.email || "Belum Tersedia"}
              readOnly
              className="input-display-style"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

const UserGugusdepan = () => {
  const [geografisData, setGeografisData] = useState([]);
  const [gugusdepanData, setGugusdepanData] = useState([]);
  const [kwarranData, setKwarranData] = useState([]);
  const [kwarranColors, setKwarranColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedGugusdepan, setSelectedGugusdepan] = useState(null);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");

  // HAPUS state latMap, longMap dan useEffect terkait karena tidak digunakan dengan benar untuk link popup
  // const [latMap, setLatMap] = useState(null);
  // const [longMap, setLongMap] = useState(null);
  // useEffect(() => { /* ... logika dengan variabel 'koordinat' yang tidak jelas ... */ }, [koordinat]);

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
        setGeografisData(geoResult?.data || []);
        setGugusdepanData(gudepResult?.data || []);
        const fetchedKwarran = kwarranResult?.data || [];
        setKwarranData(fetchedKwarran);
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

  const resetFilters = useCallback(() => {
    setSelectedKwarran("");
    setSelectedTingkatan("");
    setSelectedGugusdepan(null);
  }, []);

  const createCustomIcon = useCallback((tingkatan) => {
    const lowerTingkatan = tingkatan?.toLowerCase() || "";
    let color = "blue";
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

  const filteredGugusdepan = useMemo(() => {
    return gugusdepanData.filter((gudep) => {
      const gudepKwarran = kwarranData.find((k) => k.id === gudep.kwarran_id);
      const gudepKwarranName = gudepKwarran?.nama || "";
      const kwarranMatch =
        !selectedKwarran || gudepKwarranName === selectedKwarran;
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

  const filteredGeografis = useMemo(() => {
    return geografisData.filter((geo) =>
      filteredGugusdepan.some((gudep) => gudep.id === geo.gudep_id)
    );
  }, [geografisData, filteredGugusdepan]);

  const geoJSONStyle = useCallback(
    (feature) => {
      const kwarranNameFromGeoJSON = feature?.properties?.nama;
      const originalColor = kwarranColors[kwarranNameFromGeoJSON] || "#cccccc";
      const inactiveColor = "#AAAAAA";
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

  const onEachFeature = useCallback(
    (feature, layer) => {
      if (feature?.properties?.nama) {
        const kwarranNameFromGeoJSON = feature.properties.nama;
        const gudepInKwarran = gugusdepanData.filter((gudep) => {
          const kwarran = kwarranData.find((k) => k.id === gudep.kwarran_id);
          return (
            kwarran?.nama?.trim().toLowerCase() ===
            kwarranNameFromGeoJSON?.trim().toLowerCase()
          );
        });
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
        layer.bindPopup(`
        <div>
          <h3 class="font-bold text-lg">Kwarran ${kwarranNameFromGeoJSON}</h3>
          <span><strong>Total Gudep:</strong> ${gudepInKwarran.length}</span><br/>
          <span><strong>Siaga:</strong> ${siagaCount}</span><br/>
          <span><strong>Penggalang:</strong> ${penggalangCount}</span><br/>
          <span><strong>Penegak/Pandega:</strong> ${penegakPandegaCount}</span><br/>
        </div>
      `);
        layer.on({ click: () => setSelectedKwarran(kwarranNameFromGeoJSON) });
      }
    },
    [gugusdepanData, kwarranData, setSelectedKwarran]
  );

  const kwarranOptions = useMemo(() => {
    return kwarranData.map((k) => ({ nama: k.nama }));
  }, [kwarranData]);

  const renderMarkers = useCallback(() => {
    return filteredGeografis.map((geo) => {
      const matchedGudep = filteredGugusdepan.find(
        (gudep) => gudep.id === geo.gudep_id
      );
      if (!matchedGudep) return null;

      // Untuk debugging jika konten popup masih sama:
      // console.log("Render Marker untuk geo.gudep_id:", geo.gudep_id, "matchedGudep ID:", matchedGudep.id, "Pangkalan:", matchedGudep.pangkalan);

      let buttonLat = NaN;
      let buttonLng = NaN;
      if (
        typeof matchedGudep.latitude === "number" &&
        typeof matchedGudep.longitude === "number"
      ) {
        buttonLat = matchedGudep.latitude;
        buttonLng = matchedGudep.longitude;
      } else if (
        matchedGudep.geografises &&
        typeof matchedGudep.geografises.titik_koordinat === "string"
      ) {
        const coordsStr = matchedGudep.geografises.titik_koordinat;
        const coordsArray = coordsStr
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (
          coordsArray.length === 2 &&
          !isNaN(coordsArray[0]) &&
          !isNaN(coordsArray[1])
        ) {
          buttonLat = coordsArray[0];
          buttonLng = coordsArray[1];
        }
      }

      let markerLat = NaN;
      let markerLng = NaN;
      if (geo.titik_koordinat) {
        const coords = geo.titik_koordinat
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          markerLat = coords[0];
          markerLng = coords[1];
        }
      } else if (geo.latitude && geo.longitude) {
        markerLat = parseFloat(geo.latitude);
        markerLng = parseFloat(geo.longitude);
      }
      if (isNaN(markerLat) || isNaN(markerLng)) return null;

      const kwarran = kwarranData.find((k) => k.id === matchedGudep.kwarran_id);
      const kwarranName = kwarran?.nama || "Tidak diketahui";

      return (
        <Marker
          key={geo.id || matchedGudep.id}
          position={[markerLat, markerLng]}
          icon={createCustomIcon(matchedGudep.tingkatan)}
          eventHandlers={{
            click: () => setSelectedGugusdepan(matchedGudep),
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="flex flex-row justify-center items-start gap-2">
                {" "}
                {/* Mengatur judul dan tombol berdampingan */}
                <h4 className="font-bold text-[#6a00b8] mb-1 text-base flex-grow">
                  {" "}
                  {/* flex-grow agar judul mengambil sisa ruang jika perlu */}
                  {matchedGudep.no_gudep || "No. Gudep Belum Ada"}
                </h4>
                {!isNaN(buttonLat) && !isNaN(buttonLng) && (
                  <div className="flex-shrink-0">
                    {" "}
                    {/* Mencegah tombol mengecil jika judul panjang, mt-2 dihapus untuk alignment yg lebih baik dengan items-start */}
                    <a
                      href={`https://maps.google.com/?q=${buttonLat},${buttonLng}`} // Menggunakan URL dari snippet Anda
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="px-2 bg-[#9500FF] text-white rounded hover:bg-[#590396] transition cursor-pointer flex items-center justify-center" // 'flex items-center' ditambahkan untuk alignment ikon yang lebih baik
                        title="Lihat di Maps"
                      >
                        <span className="material-icons align-middle text-base leading-none">
                          {" "}
                          {/* text-base dan leading-none untuk ukuran ikon */}
                          near_me
                        </span>
                      </button>
                    </a>
                  </div>
                )}
              </div>
              <b>Pangkalan:</b> {matchedGudep.pangkalan || "-"}
              <br />
              <b>Kwarran:</b> {kwarranName}
              <br />
              <b>Tingkatan:</b> {matchedGudep.tingkatan || "-"}
              <br />
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [
    filteredGeografis,
    filteredGugusdepan,
    kwarranData,
    createCustomIcon,
    setSelectedGugusdepan,
  ]); // Menambahkan setSelectedGugusdepan

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

  return (
    <UserTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-4 md:mt-15">
        <div className="p-4 md:mt-18">
          {loading && (
            <div className="flex justify-center items-center h-96">
              <p className="text-lg font-semibold text-gray-500">
                Memuat data peta...
              </p>
            </div>
          )}
          {error && !loading && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
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
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {renderGeoJSONLayers()}
              {renderMarkers()}
              <KwarranLegend kwarranColors={kwarranColors} />
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
          {!isFullScreen && selectedGugusdepan && (
            <DetailGudepPanel
              selectedGugusdepan={selectedGugusdepan}
              kwarranData={kwarranData}
            />
          )}
        </div>
      </div>
      <style jsx global="true">{`
        /* ... (style Anda yang sudah ada) ... */
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
