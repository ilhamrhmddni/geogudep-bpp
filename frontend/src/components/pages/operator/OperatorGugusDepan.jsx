import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import decodeToken from "../../../utils/jwt";
import OperatorTemplate from "../../templates/OperatorTemplate";

const OperatorGugusdepan = () => {
  const [data, setData] = useState(null);
  const [kwarranList, setKwarranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jumlahPutra, setJumlahPutra] = useState(0);
  const [jumlahPutri, setJumlahPutri] = useState(0);
  const [noGudep, setNoGudep] = useState("");
  const [pangkalan, setPangkalan] = useState(""); // Pangkalan state
  const [isEditable, setIsEditable] = useState(false);

  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  if (!gudepId) throw new Error("Gudep ID not found in token.");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchGugusdepanId(gudepId);
        setData(result.data);
        setJumlahPutra(result.data.jumlah_putra || 0);
        setJumlahPutri(result.data.jumlah_putri || 0);
        setNoGudep(result.data.no_gudep || "");
        setPangkalan(result.data.pangkalan || ""); // Initialize pangkalan
        setError(null);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gudepId]);

  useEffect(() => {
    const fetchKwarranData = async () => {
      try {
        const result = await fetchKwarran();
        setKwarranList(result.data);
      } catch (error) {
        console.error("Error fetching Kwarran data:", error);
      }
    };

    fetchKwarranData();
  }, []);

  const handleEditClick = () => setIsEditable(true);

  const handleSubmit = async () => {
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await editGugusdepan(gudepId, {
            ...data,
            jumlah_putra: jumlahPutra,
            jumlah_putri: jumlahPutri,
            no_gudep: noGudep,
            pangkalan: pangkalan, // Include pangkalan in the submission
          });

          Swal.fire("Sukses!", "Data Anda telah disimpan.", "success");

          const updatedResult = await fetchGugusdepanId(gudepId);
          setData(updatedResult.data);
          setJumlahPutra(updatedResult.data.jumlah_putra || 0);
          setJumlahPutri(updatedResult.data.jumlah_putri || 0);
          setNoGudep(updatedResult.data.no_gudep || "");
          setPangkalan(updatedResult.data.pangkalan || ""); // Update pangkalan
          setIsEditable(false);
        } catch (error) {
          Swal.fire("Error!", "Gagal menyimpan data.", "error");
          console.error("Error saving data:", error);
        }
      }
    });
  };

  return (
    <OperatorTemplate>
      <div className="ml-18 rounded-xl shadow-xl">
        <div className="p-4">
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 px-2">
            <span
              className="items-center text-2xl font-bold px-12 m-auto flex justify-center text-white"
              style={{ whiteSpace: "nowrap" }}
            >
              Data Gugus Depan
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

          {loading && <p className="text-center mt-4">Loading data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {data && (
            <div className="my-4 space-y-4 px-4 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Jumlah Putra:
                  </label>
                  <input
                    type="number"
                    value={jumlahPutra}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Jumlah Putri:
                  </label>
                  <input
                    type="number"
                    value={jumlahPutri}
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
                    value={noGudep}
                    onChange={(e) => setNoGudep(e.target.value)}
                    className="rounded-xl p-3 w-full border border-gray-300"
                    placeholder="Masukkan No. Gudep"
                    readOnly={!isEditable}
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pangkalan:
                  </label>
                  <input
                    type="text"
                    value={pangkalan} // Controlled input for Pangkalan
                    onChange={(e) => setPangkalan(e.target.value)}
                    className="rounded-xl p-3 w-full border border-gray-300"
                    readOnly={!isEditable}
                    placeholder="Masukkan Pangkalan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Kwarran:
                  </label>
                  <select
                    value={data.kwarran_id || ""}
                    onChange={(e) =>
                      setData({ ...data, kwarran_id: e.target.value })
                    }
                    className="rounded-xl p-3 w-full border border-gray-300"
                    disabled={!isEditable}
                  >
                    <option value="">Pilih Kwarran</option>
                    {kwarranList.map((kwarran) => (
                      <option key={kwarran.id} value={kwarran.id}>
                        {kwarran.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Tingkatan:
                  </label>
                  <select
                    value={data.tingkatan || ""}
                    onChange={(e) =>
                      setData({ ...data, tingkatan: e.target.value })
                    }
                    className="rounded-xl p-3 w-full border border-gray-300"
                    disabled={!isEditable}
                  >
                    <option value="">Pilih Tingkatan</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                    <option value="Penegak/Pandega">Penegak/Pandega</option>
                    <option value="Pandega">Pandega</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#9500FF] font-bold mb-2 block">
                  Mabigus:
                </label>
                <input
                  type="text"
                  value={data.mabigus || ""}
                  onChange={(e) =>
                    setData({ ...data, mabigus: e.target.value })
                  }
                  className="rounded-xl p-3 w-full border border-gray-300"
                  readOnly={!isEditable}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pembina:
                  </label>
                  <input
                    type="text"
                    value={data.pembina || ""}
                    onChange={(e) =>
                      setData({ ...data, pembina: e.target.value })
                    }
                    className="rounded-xl p-3 w-full border border-gray-300"
                    readOnly={!isEditable}
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pelatih:
                  </label>
                  <input
                    type="text"
                    value={data.pelatih || ""}
                    onChange={(e) =>
                      setData({ ...data, pelatih: e.target.value })
                    }
                    className="rounded-xl p-3 w-full border border-gray-300"
                    readOnly={!isEditable}
                  />
                </div>
              </div>
            </div>
          )}

          {!data && !loading && (
            <p className="text-center mt-4">Data tidak ditemukan</p>
          )}
        </div>
      </div>
    </OperatorTemplate>
  );
};

export default OperatorGugusdepan;
