import html2pdf from "html2pdf.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import {
  approveLaporanStatusOnly,
  deleteLaporan as deleteLaporanService,
  fetchLaporan,
  prepareDataForClientPdfGeneration,
  prepareDataForDirectClientPdf,
  updateLaporanAfterClientPdf,
} from "../../../services/LaporanService";

import AdminHeader from "../../atoms/AdminHeader";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

import {
  renderAllDataHTMLForClient,
  renderGudepHTMLForClient,
  renderKwarranHTMLForClient,
} from "../../../utils/clientSideReportRenderer"; // Pastikan path ini benar

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
  if (level === "semua") entityName = "Semua_Data";
  else if (targetEntityInfo) {
    if (level === "kwarran")
      entityName = `Kwarran_${(
        targetEntityInfo.nama || `ID_${targetEntityInfo.id}`
      ).replace(/[^\w.-]+/g, "_")}`;
    else if (level === "gudep")
      entityName = `Gudep_${(
        targetEntityInfo.pangkalan ||
        targetEntityInfo.no_gudep ||
        `ID_${targetEntityInfo.id}`
      ).replace(/[^\w.-]+/g, "_")}`;
  } else if (level) entityName = `${level}_Direct`;
  baseName += entityName.replace(/[^\w.-]+/g, "_");
  return `${baseName}_${timestamp}.pdf`;
};

const AdminLaporanGudep = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [kwarranList, setKwarranList] = useState([]);
  const [gudepList, setGudepList] = useState([]);
  const [reportLoadingId, setReportLoadingId] = useState(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("semua");

  const [directReportLevel, setDirectReportLevel] = useState("semua");
  const [directReportTargetId, setDirectReportTargetId] = useState("");
  const [directReportLoading, setDirectReportLoading] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [laporanResult, kwarranResult, gudepResult] = await Promise.all([
        fetchLaporan(),
        fetchKwarran(),
        fetchGugusdepan(),
      ]);
      setData(Array.isArray(laporanResult?.data) ? laporanResult.data : []);
      setKwarranList(
        Array.isArray(kwarranResult?.data) ? kwarranResult.data : []
      );
      setGudepList(
        Array.isArray(gudepResult?.data)
          ? gudepResult.data.filter((g) => g.useres?.role !== "admin")
          : []
      );
      setError(null);
    } catch (err) {
      setError(err.message || "Gagal mengambil data awal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "5%" },
      { key: "nama", label: "Pelapor", width: "15%" },
      { key: "asal", label: "Asal", width: "10%" },
      { key: "email", label: "Email", width: "15%" },
      { key: "level", label: "Level", width: "10%" },
      { key: "targetDetail", label: "Target", width: "10%" },
      { key: "status", label: "Status", width: "10%" },
      { key: "pdfInfo", label: "PDF Klien", width: "10%" },
      { key: "createdAt", label: "Tgl Minta", width: "10%" },
      { key: "actions", label: "Aksi", width: "15%" },
    ],
    []
  );

  const handleDeleteLaporanEntry = useCallback(
    async (id) => {
      const confirmResult = await Swal.fire({
        title: "Yakin hapus?",
        text: "Permintaan laporan akan dihapus.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });
      if (confirmResult.isConfirmed) {
        setReportLoadingId(id);
        try {
          await deleteLaporanService(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          Swal.fire("Berhasil", "Permintaan laporan dihapus.", "success");
        } catch (err) {
          Swal.fire("Gagal", err.message || "Gagal menghapus.", "error");
        } finally {
          setReportLoadingId(null);
        }
      }
    },
    [fetchInitialData]
  );

  const kwarranMap = useMemo(
    () => new Map(kwarranList.map((k) => [k.id, k.nama])),
    [kwarranList]
  );
  const gudepMap = useMemo(
    () => new Map(gudepList.map((g) => [g.id, `${g.pangkalan || g.no_gudep}`])),
    [gudepList]
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (Array.isArray(data) ? data : []).filter((item) => {
      const searchableFields = [
        item.nama,
        item.asal,
        item.email,
        item.level,
        item.status,
      ].map((f) => String(f || "").toLowerCase());
      const matchesSearch = searchableFields.some((f) => f.includes(query));
      const matchesStatus =
        selectedStatusFilter === "" || item.status === selectedStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, selectedStatusFilter, kwarranMap, gudepMap]);

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
    // Remove custom property 'level' to avoid warnings
    delete finalPdfOptions.level;

    console.log("Opsi html2pdf:", finalPdfOptions);
    try {
      await html2pdf().set(finalPdfOptions).from(element).save();
      if (!isDirect && laporanId) {
        await updateLaporanAfterClientPdf(laporanId, "Selesai", pdfFilename);
      }
      return pdfFilename;
    } catch (genError) {
      console.error("Error saat generate PDF dengan html2pdf:", genError);
      if (!isDirect && laporanId) {
        try {
          await updateLaporanAfterClientPdf(laporanId, "Error Generate", null);
        } catch (e) {
          console.error("Gagal update status Error:", e);
        }
      }
      throw genError;
    }
  };

  const handleSetujuiPermintaan = useCallback(
    async (laporanId) => {
      setReportLoadingId(laporanId);
      try {
        await approveLaporanStatusOnly(laporanId, "Setujui");
        await fetchInitialData();
        Swal.fire(
          "Berhasil",
          "Status 'Setujui'. Siap generate PDF (klien).",
          "success"
        );
      } catch (err) {
        Swal.fire("Gagal", err.message || "Gagal update status.", "error");
      } finally {
        setReportLoadingId(null);
      }
    },
    [fetchInitialData]
  );

  const handleGenerateClientPdfForExistingReport = useCallback(
    async (laporanItem) => {
      if (!laporanItem || !laporanItem.id) {
        Swal.fire("Error", "Item laporan invalid.", "error");
        return;
      }
      setReportLoadingId(laporanItem.id);
      Swal.fire({
        title: "Memproses...",
        text: "Siapkan data & buat PDF...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const prepared = await prepareDataForClientPdfGeneration(
          laporanItem.id
        );
        if (!prepared || !prepared.reportRenderData)
          throw new Error("Data render PDF tidak diterima.");
        Swal.update({ text: "Data diterima. Membuat PDF..." });

        let htmlString;
        const pdfGenOpts = { level: prepared.laporanItem.level };
        if (prepared.laporanItem.level === "semua") {
          htmlString = renderAllDataHTMLForClient(prepared.reportRenderData);
          pdfGenOpts.orientation = "landscape";
        } else if (prepared.laporanItem.level === "kwarran") {
          htmlString = renderKwarranHTMLForClient(prepared.reportRenderData);
        } else if (prepared.laporanItem.level === "gudep") {
          htmlString = renderGudepHTMLForClient(prepared.reportRenderData);
        } else throw new Error("Level laporan tidak dikenal.");

        const fname = await generatePdfFromHtmlViaClient(
          htmlString,
          pdfGenOpts,
          laporanItem.id,
          prepared.targetEntityInfo,
          false
        );
        Swal.fire(
          "Sukses!",
          `PDF "${fname}" diunduh. Status diupdate.`,
          "success"
        );
        await fetchInitialData();
      } catch (err) {
        Swal.fire("Gagal Proses", `Gagal proses PDF: ${err.message}`, "error");
        if (laporanItem?.id) {
          const currentLaporan = data.find((d) => d.id === laporanItem.id);
          if (
            currentLaporan &&
            currentLaporan.status !== "Selesai" &&
            currentLaporan.status !== "Error Generate"
          ) {
            try {
              await updateLaporanAfterClientPdf(
                laporanItem.id,
                "Error Generate",
                null
              );
              await fetchInitialData();
            } catch (e) {
              console.error("Error update status ke Error Generate", e);
            }
          } else if (
            currentLaporan &&
            currentLaporan.status === "Error Generate"
          ) {
            await fetchInitialData();
          }
        }
      } finally {
        setReportLoadingId(null);
        if (Swal.isVisible() && Swal.isLoading()) {
          Swal.close();
        }
      }
    },
    [fetchInitialData, data]
  );

  const handleGenerateDirectClientPdf = useCallback(async () => {
    if (
      (directReportLevel === "kwarran" || directReportLevel === "gudep") &&
      !directReportTargetId
    ) {
      Swal.fire(
        "Input Kurang",
        `Pilih ${
          directReportLevel === "kwarran" ? "Kwarran" : "Gudep"
        } target.`,
        "warning"
      );
      return;
    }
    setDirectReportLoading(true);
    Swal.fire({
      title: "Memproses PDF Direct...",
      text: "Siapkan data & buat PDF...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const paramsSvc = {
        level: directReportLevel,
        targetId: directReportTargetId,
      };
      let targetInfoName = null;
      if (directReportLevel === "kwarran") {
        const kw = kwarranList.find((k) => k.id === directReportTargetId);
        paramsSvc.namaKwarran = kw?.nama;
        targetInfoName = kw;
      } else if (directReportLevel === "gudep") {
        const gu = gudepList.find((g) => g.id === directReportTargetId);
        paramsSvc.namaGudep = gu?.pangkalan || gu?.no_gudep;
        targetInfoName = gu;
      }

      const prepared = await prepareDataForDirectClientPdf(paramsSvc);
      if (!prepared || !prepared.reportRenderData)
        throw new Error("Data render PDF direct tidak diterima.");
      Swal.update({ text: "Data diterima. Membuat PDF..." });

      let htmlString;
      const pdfGenOpts = { level: directReportLevel };
      if (directReportLevel === "semua") {
        htmlString = renderAllDataHTMLForClient(prepared.reportRenderData);
        pdfGenOpts.orientation = "landscape";
      } else if (directReportLevel === "kwarran") {
        htmlString = renderKwarranHTMLForClient(prepared.reportRenderData);
      } else if (directReportLevel === "gudep") {
        htmlString = renderGudepHTMLForClient(prepared.reportRenderData);
      } else throw new Error("Level laporan tidak dikenal.");

      const fname = await generatePdfFromHtmlViaClient(
        htmlString,
        pdfGenOpts,
        null,
        prepared.targetEntityInfo || targetInfoName,
        true
      );
      Swal.fire("Sukses!", `PDF Direct "${fname}" diunduh.`, "success");
    } catch (err) {
      Swal.fire("Gagal!", err.message || "Gagal buat PDF direct.", "error");
    } finally {
      setDirectReportLoading(false);
      if (Swal.isVisible() && Swal.isLoading()) {
        Swal.close();
      }
    }
  }, [directReportLevel, directReportTargetId, kwarranList, gudepList]);

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      const targetDetail =
        item.level === "semua"
          ? "Semua Data"
          : item.level === "kwarran"
          ? kwarranMap.get(item.target_id) ||
            `ID: ${item.target_id?.substring(0, 8)}...`
          : gudepMap.get(item.target_id) ||
            `ID: ${item.target_id?.substring(0, 8)}...`;
      const isLoading = reportLoadingId === item.id;
      const pdfInfo =
        item.pdf_path && item.pdf_path.startsWith("CLIENT_GENERATED:")
          ? item.pdf_path.substring("CLIENT_GENERATED:".length)
          : item.pdf_path
          ? "Path Lama"
          : "-";

      let actionsButtons = [];
      if (item.status === "Menunggu") {
        actionsButtons.push(
          <button
            key="setujui"
            className="material-icons bg-green-500 p-1 rounded-md text-white hover:bg-green-600"
            onClick={() => handleSetujuiPermintaan(item.id)}
            title="Setujui"
            disabled={isLoading}
          >
            {isLoading ? "..." : "thumb_up_alt"}
          </button>
        );
      }
      if (item.status === "Setujui" || item.status === "Error Generate") {
        actionsButtons.push(
          <button
            key="generateClient"
            className={`material-icons p-1 rounded-md text-white ${
              item.status === "Setujui"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            onClick={() => handleGenerateClientPdfForExistingReport(item)}
            title={
              item.status === "Setujui"
                ? "Generate PDF (Klien)"
                : "Coba Ulang Generate PDF (Klien)"
            }
            disabled={isLoading}
          >
            {isLoading
              ? "..."
              : item.status === "Error Generate"
              ? "refresh"
              : "picture_as_pdf"}
          </button>
        );
      }
      actionsButtons.push(
        <button
          key="delete"
          className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600 ml-1"
          onClick={() => handleDeleteLaporanEntry(item.id)}
          title="Hapus"
          disabled={isLoading}
        >
          {isLoading ? "..." : "delete"}
        </button>
      );

      return {
        no: index + 1,
        nama: item.nama,
        asal: item.asal,
        email: item.email,
        level: item.level,
        targetDetail,
        status: item.status,
        pdfInfo,
        createdAt: item.createdAt ? FormatDate(item.createdAt) : "-",
        actions: (
          <div className="flex gap-1 justify-center items-center h-full">
            {actionsButtons}
          </div>
        ),
      };
    });
  }, [
    filteredData,
    kwarranMap,
    gudepMap,
    reportLoadingId,
    selectedLevelFilter,
    handleSetujuiPermintaan,
    handleGenerateClientPdfForExistingReport,
    handleDeleteLaporanEntry,
  ]);

  const statusOptions = useMemo(
    () => [
      { id: "Menunggu", nama: "Menunggu" },
      { id: "Setujui", nama: "Setujui" },
      { id: "Selesai", nama: "Selesai" },
      {
        id: "Error Generate",
        nama: "Error Generate PDF",
      },
    ],
    []
  );
  const levelOptions = useMemo(
    () => [
      { id: "", nama: "Semua Level" },
      { id: "kwarran", nama: "Kwarran" },
      { id: "gudep", nama: "Gudep" },
    ],
    []
  );
  const directReportTargetOptions = useMemo(() => {
    if (directReportLevel === "kwarran") {
      if (!kwarranList || kwarranList.length === 0)
        return [
          { id: "", nama: "Memuat Kwarran...", value: "", disabled: true },
        ];
      return kwarranList.map((k) => ({ id: k.id, nama: k.nama, value: k.id }));
    }
    if (directReportLevel === "gudep") {
      if (!gudepList || gudepList.length === 0)
        return [{ id: "", nama: "Memuat Gudep...", value: "", disabled: true }];
      return gudepList.map((g) => ({
        id: g.id,
        nama: `${g.pangkalan || g.no_gudep || "Tanpa Nama"} (${
          kwarranMap.get(g.kwarran_id) || "Tanpa Kwarran"
        })`,
        value: g.id,
      }));
    }
    return [];
  }, [directReportLevel, kwarranList, gudepList, kwarranMap]);

  const FilterAndDirectPdfControls = (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full md:w-auto">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Fix: options use id & nama to align with Dropdown props */}
        <Dropdown
          options={statusOptions}
          selected={selectedStatusFilter}
          onChange={(val) => setSelectedStatusFilter(val)}
          placeholder="Filter Status"
          id="status-filter-table"
          className="w-full sm:w-auto md:min-w-[180px]"
        />
      </div>
      <div className="border-t md:border-t-0 md:border-l border-gray-300 my-2 md:my-0 md:mx-3 h-auto md:h-10 self-stretch"></div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch">
        {(directReportLevel === "kwarran" || directReportLevel === "gudep") && (
          <Dropdown
            options={directReportTargetOptions}
            selected={directReportTargetId}
            onChange={(val) => setDirectReportTargetId(val)}
            placeholder={`Target ${directReportLevel}`}
            id="direct-target-filter"
            className="w-full sm:w-auto md:min-w-[200px]"
            disabled={
              directReportLoading ||
              loading ||
              directReportTargetOptions.length === 0 ||
              directReportTargetOptions[0]?.disabled
            }
          />
        )}
        <button
          onClick={handleGenerateDirectClientPdf}
          disabled={directReportLoading || loading}
          className="bg-[#9500FF] hover:bg-[#7a00cc] text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 h-10 w-full sm:w-auto"
          title="Unduh Laporan"
        >
          {directReportLoading ? "Memproses..." : "Unduh Laporan"}
        </button>
      </div>
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Laporan Gudep"
            showSearch
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            additionalControls={FilterAndDirectPdfControls}
          />
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : transformedData.length === 0 ? (
            <NoDataMessage
              message={
                searchQuery || selectedStatusFilter
                  ? "Data laporan tidak ditemukan dengan filter."
                  : "Belum ada data permintaan laporan."
              }
            />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <TableR headers={headers} data={transformedData} />
            </div>
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};
export default AdminLaporanGudep;
