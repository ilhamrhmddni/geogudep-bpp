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

// Konfigurasi default untuk ikon marker di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Ikon merah untuk lokasi pengguna
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

// Ikon biru untuk lokasi yang sedang diedit
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Komponen untuk mengontrol peta
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
        map.setView(center, currentZoom, { animate: false });
      } else {
        map.flyTo(center, zoom, { animate: true, duration: 1.5 });
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

  // State untuk menyimpan data form dan lokasi
  const [formData, setFormData] = useState({
    titik_koordinat: "",
    longitude: "",
    latitude: "",
    alamat: "",
  });
  const [position, setPosition] = useState([0, 0]); // Posisi marker
  const [userLocation, setUserLocation] = useState(null); // Lokasi pengguna
  const [initialGudepLocation, setInitialGudepLocation] = useState(null); // Lokasi awal Gudep
  const [isEditable, setIsEditable] = useState(false); // Status edit
  const [hasChanged, setHasChanged] = useState(false); // Status perubahan data
  const [isLoading, setIsLoading] = useState(true); // Status loading
  const [mapCenter, setMapCenter] = useState([0, 0]); // Pusat peta
  const [mapZoom, setMapZoom] = useState(13); // Zoom peta
  const [shouldCenterInEditMode, setShouldCenterInEditMode] = useState(false); // Status pusat peta saat edit
  const mapRef = useRef(null);

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanged(true);
  };

  // Fungsi untuk mengaktifkan mode edit
  const handleEditClick = () => {
    setIsEditable(true);
    setUserLocation(null); // Hilangkan marker merah saat edit
    setShouldCenterInEditMode(false);
    setPosition(initialGudepLocation || [0, 0]); // Set posisi marker ke lokasi awal Gudep
  };

  // Fungsi untuk menyimpan data yang telah diubah
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

  // Fungsi untuk mendapatkan lokasi pengguna saat ini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (positionData) => {
        const { latitude, longitude } = positionData.coords;
        const currentLocation = [latitude, longitude];
        setUserLocation(currentLocation);

        if (isEditable) {
          setPosition(currentLocation);
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

  // Fungsi untuk menangani klik pada peta
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!isEditable) return;
        const { lat, lng } = e.latlng;

        const clickedLocation = [lat, lng];
        setPosition(clickedLocation);
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

  // Ambil data geografis saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchGeografisId(geografisId);
        const data = result.data;

        setFormData({
          titik_koordinat: data.titik_koordinat || "",
          longitude: data.longitude || "",
          latitude: data.latitude || "",
          alamat: data.alamat || "",
        });

        if (data.latitude && data.longitude) {
          const coords = [data.latitude, data.longitude];
          setPosition(coords);
          setInitialGudepLocation(coords);
          setMapCenter(coords);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (geografisId) fetchData();
  }, [geografisId]);

  // Ambil lokasi pengguna saat komponen pertama kali dimuat
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  return (
    <OperatorTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-20 md:mt-0">
        <div className="p-4">
          {/* Header */}
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 px-2">
            <span
              className="items-center md:text-2xl text-xl font-bold md:px-12 m-auto flex justify-center text-white"
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
                  <div className="hidden md:block">Simpan</div>
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="bg-white text-[#9500FF] md:px-4 px-3 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2"
                >
                  <span className="material-icons">edit</span>
                  <div className="hidden md:block">Ubah</div>
                </button>
              )}
            </div>
          </div>

          {/* Peta */}
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

                {/* Marker untuk lokasi awal Gudep */}
                {!isEditable && initialGudepLocation && (
                  <Marker position={initialGudepLocation} icon={blueIcon}>
                    <Popup>Lokasi Gudep</Popup>
                  </Marker>
                )}

                {/* Marker untuk lokasi pengguna */}
                {!isEditable && userLocation && (
                  <Marker position={userLocation} icon={redIcon}>
                    <Popup>Lokasi Saya</Popup>
                  </Marker>
                )}

                {/* Marker untuk lokasi yang sedang diedit */}
                {isEditable && position[0] !== 0 && position[1] !== 0 && (
                  <Marker position={position} icon={blueIcon}>
                    <Popup>Lokasi yang Diedit</Popup>
                  </Marker>
                )}

                <MapClickHandler />
              </MapContainer>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="m-4">
            <div className="flex flex-col md:flex-row gap-4 my-4">
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
