import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { fetchGeografis } from "../../../services/GeografisService";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import UserTemplate from "../../templates/UserTemplate";

// Fix for marker icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ToggleMapSize = ({ isFullScreen, setIsFullScreen }) => {
  const map = useMap();

  const toggleFullScreen = () => {
    const mapContainer = map.getContainer();
    mapContainer.classList.toggle("full-screen-map");
    setIsFullScreen((prev) => !prev);
  };

  return (
    <button
      onClick={toggleFullScreen}
      className="absolute top-2 right-2 bg-[#9500FF] text-white font-bold py-2 px-4 rounded cursor-pointer z-50 opacity-100"
      style={{
        zIndex: 1000, // Ensure high z-index
      }}
    >
      {isFullScreen ? (
        <span className="material-icons">fullscreen_exit</span>
      ) : (
        <span className="material-icons">fullscreen</span>
      )}
    </button>
  );
};

const FlyToUserLocation = () => {
  const map = useMap();
  const [userLocation, setUserLocation] = useState(null);
  const [locationFound, setLocationFound] = useState(false);

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 15 });

    const handleLocationFound = (e) => {
      setUserLocation(e.latlng);
      setLocationFound(true);
      // Fly to user location with zoom animation when location is found
      map.flyTo(e.latlng, 13, {
        duration: 5, // Animation duration in seconds
      });
    };

    map.on("locationfound", handleLocationFound);

    return () => {
      map.off("locationfound", handleLocationFound);
    };
  }, [map]);

  useEffect(() => {
    if (locationFound && userLocation) {
      map.flyTo(userLocation, 13, {
        duration: 3, // Animation duration in seconds
      });
    }
  }, [map, userLocation, locationFound]);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [geoResult, gudepResult, kwarranResult] = await Promise.all([
          fetchGeografis(),
          fetchGugusdepan(),
          fetchKwarran(),
        ]);
        setTimeout;
        setGeografisData(geoResult.data || []);
        setGugusdepanData(gudepResult.data || []);
        setKwarranData(kwarranResult.data || []);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set initial zoom level to be very far
  const defaultPosition = [-1.2550458, 116.8878243];
  const initialZoom = 5; // Adjust this value as needed

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
        return "blue"; // Warna default jika tingkatan tidak sesuai
    }
  };

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

  return (
    <UserTemplate>
      <div className={`ml-18 rounded-xl shadow-xl ${isFullScreen ? "" : ""}`}>
        <div className="p-4">
          <MapContainer
            center={defaultPosition}
            zoom={initialZoom} // Use the initial zoom level
            style={{
              height: isFullScreen ? "80vh" : "400px",
              width: "100%",
              position: "relative",
              overflow: "hidden",
            }}
            className={`my-4 rounded-xl leaflet-container ${
              isFullScreen ? "full-screen-map" : ""
            }`}
            onClick={() => setSelectedGugusdepan(null)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {loading}
            {loading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-70 rounded-lg shadow-lg p-6">
                <p className="text-lg font-semibold text-gray-700">
                  Memuat data...
                </p>
                {/* Anda bisa menambahkan indikator loading yang lebih menarik di sini */}
              </div>
            )}
            {!loading &&
              geografisData.length > 0 &&
              gugusdepanData.length > 0 &&
              geografisData.map((geo) => {
                const matchedGudep = gugusdepanData.find(
                  (gudep) => gudep.id === geo.gudep_id
                );
                const lat = parseFloat(geo.latitude);
                const lng = parseFloat(geo.longitude);

                if (!isNaN(lat) && !isNaN(lng) && matchedGudep) {
                  const markerColor = getMarkerColor(matchedGudep.tingkatan);
                  const customIcon = createCustomIcon(markerColor);

                  return (
                    <Marker
                      key={geo.id}
                      position={[lat, lng]}
                      icon={customIcon}
                      eventHandlers={{
                        click: (e) => {
                          e.originalEvent.stopPropagation();
                          setSelectedGugusdepan(matchedGudep);
                        },
                      }}
                    >
                      <Popup>
                        <div className="bg-white rounded-lg text-gray-800 font-semibold">
                          <b>Pangkalan:</b>{" "}
                          {matchedGudep.pangkalan || "Data Belum Tersedia"}
                          <br />
                          <b>No. Gudep:</b>{" "}
                          {matchedGudep.no_gudep || "Data Belum Tersedia"}
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            <ToggleMapSize
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
            <FlyToUserLocation />
          </MapContainer>

          {!isFullScreen && !selectedGugusdepan && !loading && (
            <div className="my-4 space-y-4 px-4">
              <p className="text-center text-gray-600">
                Pilih gugus depan pada peta untuk melihat detail.
              </p>
            </div>
          )}

          {!isFullScreen && selectedGugusdepan && !loading && (
            <div
              className="my-4 space-y-4 px-4"
              onClick={(e) => e.stopPropagation()}
            >
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
            height: 100%; /* Ensure it fills its parent initially */
          }
          .full-screen-map {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 1000 !important; /* Ensure it's on top of other elements */
            margin: 0 !important; /* Reset any potential margins */
            padding: 0 !important; /* Reset any potential paddings */
          }
        `}
      </style>
    </UserTemplate>
  );
};

export default UserGugusdepan;
