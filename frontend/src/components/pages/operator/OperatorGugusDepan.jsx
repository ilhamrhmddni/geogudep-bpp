import html2pdf from "html2pdf.js";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import { decodeToken } from "../../../utils/jwt";
import OperatorTemplate from "../../templates/OperatorTemplate";

import { prepareDataForDirectClientPdf } from "../../../services/LaporanService";
import { renderGudepHTMLForClient } from "../../../utils/clientSideReportRenderer"; // Adjust the path as necessary

const OperatorGugusdepan = () => {
  // State untuk menyimpan data Gugusdepan
  const [data, setData] = useState(null);
  const [kwarranList, setKwarranList] = useState([]); // Daftar Kwarran
  const [loading, setLoading] = useState(true); // Status loading
  const [error, setError] = useState(null); // Pesan error
  const [jumlahPutra, setJumlahPutra] = useState(0); // Jumlah putra
  const [jumlahPutri, setJumlahPutri] = useState(0); // Jumlah putri
  const [noGudep, setNoGudep] = useState(""); // Nomor Gudep
  const [tingkatan, setTingkatan] = useState(""); // Tingkatan
  const [labelAmbalan, setLabelAmbalan] = useState(null); // Label ambalan
  const [pangkalan, setPangkalan] = useState(""); // Nama pangkalan
  const [ambalan, setAmbalan] = useState(""); // Nama ambalan
  const [isEditable, setIsEditable] = useState(false); // Status edit
  const [reportLoadingId, setReportLoadingId] = useState(null); // State to track loading for PDF generation

  // Decode token untuk mendapatkan gudep_id
  const tokenData = decodeToken();
  const gudepId = tokenData?.gudep_id;

  if (!gudepId) throw new Error("Gudep ID tidak ditemukan di token.");

  const getClientSidePdfFileName = (
    level,
    targetEntityInfo,
    clientTimestamp = new Date()
  ) => {
    const now = clientTimestamp;
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    let baseName = "Laporan_";
    let entityName = "";
    if (level === "gudep" && targetEntityInfo) {
      entityName = `Gudep_${(
        targetEntityInfo.pangkalan ||
        targetEntityInfo.no_gudep ||
        `ID_${targetEntityInfo.id}`
      ).replace(/[^\w.-]+/g, "_")}`;
    } else {
      entityName = `${level || "Unknown"}_${targetEntityInfo?.id || "NoID"}`;
    }
    baseName += entityName.replace(/[^\w.-]+/g, "_");
    return `${baseName}_${timestamp}.pdf`;
  };

  const generatePdfFromHtmlViaClient = async (
    htmlString,
    pdfGenOptions,
    targetEntityInfo
  ) => {
    if (
      !htmlString ||
      typeof htmlString !== "string" ||
      htmlString.trim() === ""
    ) {
      throw new Error("Konten HTML untuk PDF kosong atau tidak valid.");
    }
    const element = document.createElement("div");
    element.innerHTML = htmlString;

    const pdfFilename = getClientSidePdfFileName(
      pdfGenOptions.level,
      targetEntityInfo,
      new Date()
    );
    const finalPdfOptions = {
      margin: pdfGenOptions.orientation === "landscape" ? [10, 12, 10, 12] : 15,
      filename: pdfFilename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: pdfGenOptions.orientation || "portrait",
      },
      pagebreak: { mode: ["css", "legacy", "avoid-all"] },
    };
    delete finalPdfOptions.level;

    console.log("Opsi html2pdf (Gudep):", finalPdfOptions);
    try {
      await html2pdf().set(finalPdfOptions).from(element).save();
      return pdfFilename;
    } catch (genError) {
      console.error("Error saat generate PDF Gudep dengan html2pdf:", genError);
      throw genError;
    }
  };

  // Ambil data Gugusdepan berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchGugusdepanId(gudepId);
        setData(result.data);
        setJumlahPutra(result.data.jumlah_putra || 0);
        setJumlahPutri(result.data.jumlah_putri || 0);
        setNoGudep(result.data.no_gudep || "");
        setPangkalan(result.data.pangkalan || "");
        setAmbalan(result.data.ambalan || "");
        setTingkatan(result.data.tingkatan || "");
        setError(null);
      } catch (error) {
        setError("Gagal mengambil data Gugusdepan.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gudepId]);

  // Ambil data Kwarran
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

  useEffect(() => {
    const lower = tingkatan.toLowerCase();
    if (lower === "siaga" || lower === "penggalang") {
      setLabelAmbalan("Jumlah Barung / Regu :");
    } else {
      setLabelAmbalan("Ambalan / Racana :");
    }
  }, [tingkatan]);

  const handleDownloadClientPdfForGudep = useCallback(async () => {
    if (!data || !data.id) {
      Swal.fire("Error", "Item Gudep invalid.", "error");
      return;
    }
    setReportLoadingId(data.id);
    Swal.fire({
      title: "Memproses...",
      text: `Siapkan data PDF untuk ${data.pangkalan || data.no_gudep}...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const prepared = await prepareDataForDirectClientPdf({
        level: "gudep",
        targetId: data.id,
        namaGudep: data.pangkalan || data.no_gudep,
      });
      if (!prepared || !prepared.reportRenderData)
        throw new Error("Data render PDF Gudep tidak diterima.");
      Swal.update({ text: "Data diterima. Membuat PDF..." });

      const htmlString = renderGudepHTMLForClient(prepared.reportRenderData);
      const pdfGenOpts = { level: "gudep", orientation: "portrait" };

      const fname = await generatePdfFromHtmlViaClient(
        htmlString,
        pdfGenOpts,
        prepared.targetEntityInfo || {
          id: data.id,
          pangkalan: data.pangkalan,
          no_gudep: data.no_gudep,
        },
        true
      );
      Swal.fire("Sukses!", `PDF Gudep "${fname}" diunduh.`, "success");
    } catch (err) {
      Swal.fire(
        "Gagal Proses",
        `Gagal buat PDF Gudep: ${err.message}`,
        "error"
      );
    } finally {
      setReportLoadingId(null);
      if (Swal.isVisible() && Swal.isLoading()) {
        Swal.close();
      }
    }
  }, [data]);

  // Fungsi untuk mengaktifkan mode edit
  const handleEditClick = () => setIsEditable(true);

  // Fungsi untuk menyimpan data yang telah diubah
  const handleSubmit = async () => {
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
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
            pangkalan: pangkalan,
            ambalan: ambalan,
            tingkatan: tingkatan,
          });

          Swal.fire("Sukses!", "Data Anda telah disimpan.", "success");

          // Refresh data setelah berhasil disimpan
          const updatedResult = await fetchGugusdepanId(gudepId);
          setData(updatedResult.data);
          setJumlahPutra(updatedResult.data.jumlah_putra || 0);
          setJumlahPutri(updatedResult.data.jumlah_putri || 0);
          setNoGudep(updatedResult.data.no_gudep || "");
          setPangkalan(updatedResult.data.pangkalan || "");
          setAmbalan(updatedResult.data.ambalan || "");
          setTingkatan(updatedResult.data.tingkatan || "");
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
      <div className="md:ml-18 rounded-xl shadow-xl mt-20 md:mt-0">
        <div className="p-4">
          {/* Header */}
          <div className="flex bg-[#9500FF] rounded-2xl mx-2 px-2">
            <span
              className="items-center md:text-2xl text-xl font-bold md:px-12 m-auto flex justify-center text-white"
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
                  <div className="hidden md:block">Simpan</div>
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="bg-white text-[#9500FF] md:px-4 px-3 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2"
                  title="Ubah Data"
                >
                  <span className="material-icons">edit</span>
                  <div className="hidden md:block">Ubah</div>
                </button>
              )}
              <button
                onClick={handleDownloadClientPdfForGudep}
                className="bg-[#9500FF] text-white p-1 rounded-md hover:bg-[#7a00cc] text-sm cursor-pointer px-4 hidden md:block font-bold"
                disabled={reportLoadingId === data?.id} // Use optional chaining
                title="Unduh Laporan PDF Gudep (Klien)"
              >
                {reportLoadingId === data?.id ? "..." : "Unduh Laporan Gudep"}
              </button>
            </div>
          </div>

          {/* Loading atau Error */}
          {loading && <p className="text-center mt-4">Memuat data...</p>}
          {error && <p className="text-center mt-4 text-red-500">{error}</p>}

          {/* Form Data Gugusdepan */}
          {data && (
            <form onSubmit={handleSubmit} className="m-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Kwarran
                  </label>
                  <select
                    value={data.kwarran_id || ""}
                    onChange={(e) =>
                      setData({ ...data, kwarran_id: e.target.value })
                    }
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
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
                    Tingkatan
                  </label>
                  <select
                    value={tingkatan || ""}
                    onChange={(e) => setTingkatan(e.target.value)}
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    disabled={!isEditable}
                  >
                    <option value="Siaga">Siaga</option>
                    <option value="Penggalang">Penggalang</option>
                    <option value="Penegak/Pandega">Penegak/Pandega</option>
                    <option value="Pandega">Pandega</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                <div className="md:col-span-2">
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    No. Gudep
                  </label>
                  <input
                    type="text"
                    value={noGudep}
                    onChange={(e) => setNoGudep(e.target.value)}
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    placeholder="Masukkan No. Gudep"
                    readOnly={!isEditable}
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Jumlah Putra
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
                    Jumlah Putri
                  </label>
                  <input
                    type="number"
                    value={jumlahPutri}
                    readOnly
                    className="rounded-xl p-3 w-full border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    {labelAmbalan}
                  </label>
                  <input
                    type="text"
                    value={ambalan}
                    onChange={(e) => setAmbalan(e.target.value)}
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    readOnly={!isEditable}
                    placeholder={
                      labelAmbalan === "Ambalan / Racana :"
                        ? "Masukkan Ambalan / Racana"
                        : "Masukkan Jumlah Barung / Regu"
                    }
                  />
                </div>

                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pangkalan
                  </label>
                  <input
                    type="text"
                    value={pangkalan}
                    onChange={(e) => setPangkalan(e.target.value)}
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    readOnly={!isEditable}
                    placeholder="Masukkan Pangkalan"
                  />
                </div>
              </div>

              <div className="my-4">
                <label className="text-[#9500FF] font-bold mb-2 block">
                  Mabigus
                </label>
                <input
                  type="text"
                  value={data.mabigus || ""}
                  onChange={(e) =>
                    setData({ ...data, mabigus: e.target.value })
                  }
                  className={`rounded-xl p-3 w-full border border-gray-300 ${
                    !isEditable ? "bg-gray-100" : ""
                  }`}
                  readOnly={!isEditable}
                  placeholder="Masukkan Nama Mabigus"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pembina
                  </label>
                  <input
                    type="text"
                    value={data.pembina || ""}
                    onChange={(e) =>
                      setData({ ...data, pembina: e.target.value })
                    }
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    readOnly={!isEditable}
                    placeholder="Masukkan Nama Pembina"
                  />
                </div>
                <div>
                  <label className="text-[#9500FF] font-bold mb-2 block">
                    Pelatih
                  </label>
                  <input
                    type="text"
                    value={data.pelatih || ""}
                    onChange={(e) =>
                      setData({ ...data, pelatih: e.target.value })
                    }
                    className={`rounded-xl p-3 w-full border border-gray-300 ${
                      !isEditable ? "bg-gray-100" : ""
                    }`}
                    readOnly={!isEditable}
                    placeholder="Masukkan Nama Pelatih"
                  />
                </div>
              </div>
            </form>
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
