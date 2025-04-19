import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  editGeografis,
  fetchGeografisId,
} from "../../../services/GeografisService";
import { decodeToken } from "../../../utils/jwt";
import OperatorTemplate from "../../templates/OperatorTemplate";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapController = ({ center, zoom, isEditable, shouldCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (
      center &&
      center[0] !== 0 &&
      center[1] !== 0 &&
      (!isEditable || shouldCenter)
    ) {
      if (isEditable) {
        const currentZoom = map.getZoom();
        map.setView(center, currentZoom, {
          animate: false,
        });
      } else {
        map.flyTo(center, zoom, {
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [center, zoom, map, isEditable, shouldCenter]);

  return null;
};

const OperatorGeografis = () => {
  const navigate = useNavigate();
  const decoded = decodeToken();
  const geografisId = decoded?.geografis_id;
  const gudepId = decoded?.gudep_id;

  const [formData, setFormData] = useState({
    titik_koordinat: "",
    longitude: "",
    latitude: "",
    alamat: "",
  });

  const [position, setPosition] = useState([0, 0]); // Posisi marker (bisa awal Gudep atau yang dipilih saat edit)
  const [userLocation, setUserLocation] = useState(null); // Lokasi pengguna saat ini (merah)
  const [initialGudepLocation, setInitialGudepLocation] = useState(null); // Lokasi awal Gudep (biru, hanya saat tidak edit)
  const [isEditable, setIsEditable] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(13);
  const [shouldCenterInEditMode, setShouldCenterInEditMode] = useState(false);
  const mapRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanged(true);
  };

  const handleEditClick = () => {
    console.log("🛠️ Edit mode aktif");
    console.log("ℹ️ formData saat edit:", { ...formData });
    setIsEditable(true);
    setUserLocation(null); // Hilangkan marker merah saat edit
    setShouldCenterInEditMode(false);
    setPosition(initialGudepLocation || [0, 0]); // Set posisi marker ke lokasi awal Gudep saat mulai edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanged) return;

    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan perubahan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const updatedData = { ...formData, gudepId };

      try {
        await editGeografis(geografisId, updatedData);
        setMapCenter([formData.latitude, formData.longitude]);

        Swal.fire("Berhasil", "Data geografis berhasil diperbarui", "success");
        setIsEditable(false);
        setHasChanged(false);
        navigate("/operator/geografis");
      } catch (error) {
        console.error("Error updating geografis:", error);
        Swal.fire("Error", "Gagal memperbarui data geografis", "error");
      }
    }
  };

  const handleGetCurrentLocation = () => {
    console.log("📍 Tombol 'Lokasi Saya' ditekan");
    if (!navigator.geolocation) {
      Swal.fire("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (positionData) => {
        const { latitude, longitude } = positionData.coords;
        console.log("Lokasi ditemukan:", latitude, longitude);

        const currentLocation = [latitude, longitude];
        setUserLocation(currentLocation);

        if (isEditable) {
          setPosition(currentLocation); // Set posisi yang diedit ke lokasi saat ini
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
            titik_koordinat: `${latitude}, ${longitude}`,
          }));
          setHasChanged(true);
          setMapCenter(currentLocation);
          setShouldCenterInEditMode(true);
        } else {
          setPosition(currentLocation);
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
            titik_koordinat: `${latitude}, ${longitude}`,
          }));
          setMapCenter(currentLocation);
        }

        setTimeout(() => {
          setShouldCenterInEditMode(false);
        }, 100);
      },
      (error) => {
        Swal.fire("Gagal mengambil lokasi", error.message, "error");
      }
    );
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!isEditable) {
          console.log("⛔ Klik map diabaikan karena belum editable");
          return;
        }
        const { lat, lng } = e.latlng;
        console.log("📍 Klik di peta:", lat, lng);

        const clickedLocation = [lat, lng];
        setPosition(clickedLocation); // Update posisi marker saat klik di peta
        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
          titik_koordinat: `${lat}, ${lng}`,
        }));

        setHasChanged(true);
      },
    });
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchGeografisId(geografisId);
        const data = result.data;

        console.log("✅ Data geografis berhasil diambil:", data);
        setFormData({
          titik_koordinat: data.titik_koordinat || "",
          longitude: data.longitude || "",
          latitude: data.latitude || "",
          alamat: data.alamat || "",
        });

        if (data.latitude && data.longitude) {
          const coords = [data.latitude, data.longitude];
          setPosition(coords);
          setInitialGudepLocation(coords); // Simpan lokasi awal Gudep
          setMapCenter(coords);
          console.log("🧭 Set posisi awal:", coords, "formData:", {
            ...formData,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (geografisId) fetchData();
  }, [geografisId]);

  useEffect(() => {
    // Ambil lokasi awal pengguna saat komponen mount
    handleGetCurrentLocation();
  }, []);

  return (
    <OperatorTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 px-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Geografis
            </span>
            <div className="flex gap-2 px-4 py-2">
              {isEditable ? (
                <button
                  onClick={handleSubmit}
                  className="bg-[#9500FF] text-white px-4 py-2 rounded-2xl border-2 border-white cursor-pointer font-bold flex gap-2"
                >
                  <span className="material-icons">save</span>
                  Simpan
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="bg-white text-[#9500FF] px-4 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2"
                >
                  <span className="material-icons">edit</span>
                  Ubah
                </button>
              )}
            </div>
          </div>

          {!isLoading && (
            <div className="m-4">
              <MapContainer
                center={position}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapController
                  center={mapCenter}
                  zoom={mapZoom}
                  isEditable={isEditable}
                  shouldCenter={shouldCenterInEditMode}
                />

                {/* Marker untuk lokasi awal Gudep (hanya tampil saat tidak edit) */}
                {!isEditable && initialGudepLocation && (
                  <Marker position={initialGudepLocation} icon={blueIcon}>
                    <Popup>Lokasi Gudep</Popup>
                  </Marker>
                )}

                {/* Marker untuk lokasi pengguna (merah) */}
                {!isEditable && userLocation && (
                  <Marker position={userLocation} icon={redIcon}>
                    <Popup>Lokasi Saya</Popup>
                  </Marker>
                )}

                {/* Marker untuk lokasi yang sedang diedit (biru) */}
                {isEditable && position[0] !== 0 && position[1] !== 0 && (
                  <Marker position={position} icon={blueIcon}>
                    <Popup>Lokasi yang Diedit</Popup>
                  </Marker>
                )}

                <MapClickHandler />
              </MapContainer>
            </div>
          )}

          <form onSubmit={handleSubmit} className="m-4">
            <div className="flex gap-4 my-4">
              <div className="flex-1">
                <label className="text-[#9500FF] font-bold block mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  readOnly={!isEditable}
                  className={`rounded p-3 w-full border border-gray-300 ${
                    !isEditable ? "bg-gray-100" : ""
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className="text-[#9500FF] font-bold block mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  readOnly={!isEditable}
                  className={`rounded p-3 w-full border border-gray-300 ${
                    !isEditable ? "bg-gray-100" : ""
                  }`}
                />
              </div>
            </div>

            <div className="my-4">
              <label className="text-[#9500FF] font-bold block mb-2">
                Titik Koordinat
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="titik_koordinat"
                  value={formData.titik_koordinat}
                  onChange={handleChange}
                  readOnly={!isEditable}
                  className={`rounded p-3 w-full border border-gray-300 ${
                    !isEditable ? "bg-gray-100" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="bg-[#9500FF] text-white p-2 ml-2 rounded-md hover:bg-[#7c00cc] font-bold h-full py-3"
                  style={{ whiteSpace: "nowrap" }}
                >
                  📍 Lokasi
                </button>
              </div>
            </div>

            <div className="my-4">
              <label className="text-[#9500FF] font-bold block mb-2">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                readOnly={!isEditable}
                required
                className={`rounded p-3 w-full border border-gray-300 ${
                  !isEditable ? "bg-gray-100" : ""
                }`}
              />
            </div>
          </form>
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorGeografis;
