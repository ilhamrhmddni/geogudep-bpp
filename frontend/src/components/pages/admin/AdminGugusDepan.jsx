// src/components/pages/admin/AdminGugusDepan.jsx
import html2pdf from "html2pdf.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import { prepareDataForDirectClientPdf } from "../../../services/LaporanService";
import { renderGudepHTMLForClient } from "../../../utils/clientSideReportRenderer";

import AdminHeader from "../../atoms/AdminHeader";
import DetailCell from "../../atoms/DetailCell";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const getClientSidePdfFileName = (
  level,
  targetEntityInfo,
  clientTimestamp = new Date()
) => {
  const now = clientTimestamp;
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
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

const AdminGugusdepan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [kwarranList, setKwarranList] = useState([]);
  const [selectedKwarran, setSelectedKwarran] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLoadingId, setReportLoadingId] = useState(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [gudepResult, kwarranResult] = await Promise.all([
        fetchGugusdepan(),
        fetchKwarran(),
      ]);
      setData(Array.isArray(gudepResult?.data) ? gudepResult.data : []);
      setKwarranList(
        Array.isArray(kwarranResult?.data) ? kwarranResult.data : []
      );
      setError(null);
    } catch (err) {
      setError(err.message || "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/20" },
      { key: "no_gudep", label: "No. Gudep", width: "w-1/20" },
      { key: "kwarran_nama", label: "Kwarran", width: "w-2/20" },
      { key: "pangkalan", label: "Pangkalan", width: "w-3/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-2/20" },
      { key: "jumlah", label: "Jumlah", width: "w-1/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "detail", label: "Pengurus", width: "w-2/20" },
      { key: "updatedAt", label: "Diupdate", width: "w-2/20" },
      { key: "actions", label: "Unduh PDF", width: "w-1/20" },
    ],
    []
  );

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleKwarranChange = useCallback(
    (value) => setSelectedKwarran(value),
    []
  );
  const handleTingkatanChange = useCallback(
    (value) => setSelectedTingkatan(value),
    []
  );

  const generatePdfFromHtmlViaClient = async (
    htmlString,
    pdfGenOptions,
    laporanId,
    targetEntityInfo,
    isDirect = false
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

  const handleDownloadClientPdfForGudep = useCallback(async (gudepItem) => {
    if (!gudepItem || !gudepItem.id) {
      Swal.fire("Error", "Item Gudep invalid.", "error");
      return;
    }
    setReportLoadingId(gudepItem.id);
    Swal.fire({
      title: "Memproses...",
      text: `Siapkan data PDF untuk ${
        gudepItem.pangkalan || gudepItem.no_gudep
      }...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const prepared = await prepareDataForDirectClientPdf({
        level: "gudep",
        targetId: gudepItem.id,
        namaGudep: gudepItem.pangkalan || gudepItem.no_gudep,
      });
      if (!prepared || !prepared.reportRenderData)
        throw new Error("Data render PDF Gudep tidak diterima.");
      Swal.update({ text: "Data diterima. Membuat PDF..." });

      const htmlString = renderGudepHTMLForClient(prepared.reportRenderData);
      const pdfGenOpts = { level: "gudep", orientation: "portrait" };

      const fname = await generatePdfFromHtmlViaClient(
        htmlString,
        pdfGenOpts,
        null,
        prepared.targetEntityInfo || {
          id: gudepItem.id,
          pangkalan: gudepItem.pangkalan,
          no_gudep: gudepItem.no_gudep,
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
  }, []);

  const kwarranMap = useMemo(
    () => new Map(kwarranList.map((k) => [k.id, k.nama])),
    [kwarranList]
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const gudepDataArr = Array.isArray(data) ? data : [];
    return gudepDataArr
      .filter((item) => {
        const kwarranNamaItem = kwarranMap.get(item.kwarran_id);
        const searchMatch = [
          item.no_gudep,
          item.pangkalan,
          item.mabigus,
          item.pembina,
          item.pelatih,
          item.email,
          kwarranNamaItem,
        ].some((field) =>
          String(field ?? "")
            .toLowerCase()
            .includes(query)
        );
        const kwarranMatch = selectedKwarran
          ? kwarranNamaItem === selectedKwarran
          : true;
        const tingkatanMatch = selectedTingkatan
          ? item.tingkatan === selectedTingkatan
          : true;
        const notAdmin = item.useres?.role !== "admin";
        return searchMatch && kwarranMatch && tingkatanMatch && notAdmin;
      })
      .map((item, index) => {
        const isNearBottom =
          index >=
            gudepDataArr.length -
              Math.max(2, Math.floor(gudepDataArr.length * 0.2)) &&
          gudepDataArr.length > 3;
        const positionValue = isNearBottom ? "top" : "bottom";
        return {
          ...item,
          no: index + 1,
          kwarran_nama: kwarranMap.get(item.kwarran_id) || "-",
          updatedAt: item.updatedAt ? FormatDate(item.updatedAt) : "-",
          jumlah: (
            <DetailCell
              title="Jumlah Anggota"
              details={[
                { label: "Putra", value: item.jumlah_putra ?? 0 },
                { label: "Putri", value: item.jumlah_putri ?? 0 },
              ]}
              position={positionValue}
            />
          ),
          detail: (
            <DetailCell
              title="Pengurus"
              details={[
                { label: "Mabigus", value: item.mabigus ?? "-" },
                { label: "Pembina", value: item.pembina ?? "-" },
                { label: "Pelatih", value: item.pelatih ?? "-" },
              ]}
              position={positionValue}
            />
          ),
          actions: (
            <button
              onClick={() => handleDownloadClientPdfForGudep(item)}
              className="material-icons bg-[#9500FF] text-white p-1 rounded-md hover:bg-[#7a00cc] text-sm"
              disabled={reportLoadingId === item.id}
              title="Unduh Laporan PDF Gudep (Klien)"
            >
              {reportLoadingId === item.id ? "..." : "picture_as_pdf"}
            </button>
          ),
        };
      });
  }, [
    data,
    searchQuery,
    selectedKwarran,
    selectedTingkatan,
    kwarranMap,
    reportLoadingId,
    handleDownloadClientPdfForGudep,
  ]);

  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={kwarranList.map((k) => ({
          id: k.nama, // Filter berdasarkan nama
          nama: k.nama,
          value: k.nama, // Value yang dikirim saat onChange
        }))}
        selected={selectedKwarran}
        onChange={handleKwarranChange} // Fungsi ini menerima value (nama kwarran)
        placeholder="Filter Kwarran"
        id="kwarran-filter-gudep"
        className="min-w-[180px]"
      />
      <Dropdown
        options={[
          { id: "Siaga", nama: "Siaga", value: "Siaga" },
          { id: "Penggalang", nama: "Penggalang", value: "Penggalang" },
          { id: "Penegak", nama: "Penegak", value: "Penegak" }, // Seringkali Penegak & Pandega dipisah atau digabung
          { id: "Pandega", nama: "Pandega", value: "Pandega" },
          {
            id: "Penegak/Pandega",
            nama: "Penegak/Pandega",
            value: "Penegak/Pandega",
          },
        ]}
        selected={selectedTingkatan}
        onChange={handleTingkatanChange}
        placeholder="Filter Tingkatan"
        id="tingkatan-filter-gudep"
        className="min-w-[180px]"
      />
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Gugusdepan"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterDropdowns}
          />
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Gugusdepan tidak ditemukan." />
            ) : (
              <TableR headers={headers} data={filteredData} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};
export default AdminGugusdepan;
