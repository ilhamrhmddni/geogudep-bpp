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
import decodeToken from "../../../utils/jwt";
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

  const [position, setPosition] = useState([0, 0]);
  const [userLocation, setUserLocation] = useState(null);
  const [oldPosition, setOldPosition] = useState(null);
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
    setIsEditable(true);
    setUserLocation(null);
    setShouldCenterInEditMode(false);
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
        setUserLocation(null);
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

        if (isEditable) {
          setOldPosition([latitude, longitude]);
          setPosition([latitude, longitude]);
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
            titik_koordinat: `${latitude}, ${longitude}`,
          }));
          setHasChanged(true);
          setMapCenter([latitude, longitude]);
          setShouldCenterInEditMode(true);
        } else {
          setUserLocation([latitude, longitude]);
          setPosition([latitude, longitude]);
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
            titik_koordinat: `${latitude}, ${longitude}`,
          }));
          setMapCenter([latitude, longitude]);
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

        setOldPosition([lat, lng]);
        setPosition([lat, lng]);
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
          setOldPosition(coords);
          setMapCenter(coords);
          console.log("🧭 Set posisi awal:", coords);
        }

        if (!isEditable) {
          setUserLocation(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (geografisId) fetchData();
  }, [geografisId, isEditable]);

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
                  Edit
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

                {oldPosition && (
                  <Marker position={oldPosition} icon={blueIcon}>
                    <Popup>Lokasi Gudep</Popup>
                  </Marker>
                )}

                {!isEditable && userLocation && (
                  <Marker position={userLocation} icon={redIcon}>
                    <Popup>Lokasi Saya Sekarang</Popup>
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
                  readOnly
                  className="rounded p-3 w-full border border-gray-300 bg-gray-100"
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
                  readOnly
                  className="rounded p-3 w-full border border-gray-300 bg-gray-100"
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
                  readOnly
                  className="rounded p-3 w-full border border-gray-300 bg-gray-100"
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
