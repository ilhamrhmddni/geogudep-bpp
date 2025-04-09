import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { fetchGeografis } from "../../../services/GeografisService";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService"; // Import the kwarran service
import UserTemplate from "../../templates/UserTemplate";

// Import marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for marker icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const UserGugusdepan = () => {
  const [geografisData, setGeografisData] = useState([]);
  const [gugusdepanData, setGugusdepanData] = useState([]);
  const [kwarranData, setKwarranData] = useState([]); // State for kwarran data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGugusdepan, setSelectedGugusdepan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [geoResult, gudepResult, kwarranResult] = await Promise.all([
          fetchGeografis(),
          fetchGugusdepan(),
          fetchKwarran(), // Fetch kwarran data
        ]);
        setGeografisData(geoResult.data || []);
        setGugusdepanData(gudepResult.data || []);
        setKwarranData(kwarranResult.data || []); // Set kwarran data
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const defaultPosition = [-1.2550458, 116.8878243];

  return (
    <UserTemplate>
      <div className="p-4 ml-20 mx-6">
        {loading && <p className="text-center">Loading data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {geografisData.map((geo) => {
              const matchedGudep = gugusdepanData.find(
                (gudep) => gudep.id === geo.gudep_id
              );
              const lat = parseFloat(geo.latitude);
              const lng = parseFloat(geo.longitude);

              if (!isNaN(lat) && !isNaN(lng)) {
                return (
                  <Marker
                    key={geo.id}
                    position={[lat, lng]}
                    eventHandlers={{
                      click: () => setSelectedGugusdepan(matchedGudep),
                    }}
                  >
                    <Popup>
                      <div className="bg-white rounded-lg text-gray-800 font-semibold">
                        {matchedGudep
                          ? matchedGudep.no_gudep
                          : "Tidak Diketahui"}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        )}

        {selectedGugusdepan && (
          <div className="m-2 mt-4">
            <div>
              <div className="flex flex-col mt-4">
                <label className="text-[#9500FF] font-bold mb-2">
                  Kwarran:
                </label>
                <span className="border rounded p-1 w-full text-left">
                  {kwarranData.find(
                    (kwarran) => kwarran.id === selectedGugusdepan.kwarran_id
                  )?.nama || "Tidak tersedia"}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[#9500FF] font-bold mb-2">
                No. Gudep:
              </label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.no_gudep || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">
                Tingkatan:
              </label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.tingkatan || "Tidak tersedia"}``
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Putra:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.jumlah_putra || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Putri:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.jumlah_putri || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Email:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.email || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label
                className="text-[#9500FF] font-bold mb-2"
                style={{ whiteSpace: "nowrap" }}
              >
                Tanggal Update:
              </label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.tahun_update
                  ? new Date(
                      selectedGugusdepan.tahun_update
                    ).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Mabigus:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.mabigus || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Pembina:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.pembina || "Tidak tersedia"}
              </span>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-[#9500FF] font-bold mb-2">Pelatih:</label>
              <span className="border rounded p-1 w-full text-left">
                {selectedGugusdepan.pelatih || "Tidak tersedia"}
              </span>
            </div>
          </div>
        )}
      </div>
    </UserTemplate>
  );
};

export default UserGugusdepan;
