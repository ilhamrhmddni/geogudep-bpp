// src/components/pages/admin/AdminLaporanGudep.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import {
  approveLaporanStatusOnly,
  deleteLaporan as deleteLaporanService, // Diubah ke PDF
  downloadOrViewSavedPdfReport,
  fetchLaporan,
  generateAndDownloadPdfReport,
  generateDirectPdfReportAndDownload,
} from "../../../services/LaporanService";

import AdminHeader from "../../atoms/AdminHeader";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

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
    try {
      setLoading(true);
      const [laporanResult, kwarranResult, gudepResult] = await Promise.all([
        fetchLaporan(),
        fetchKwarran(),
        fetchGugusdepan(),
      ]);
      setData(Array.isArray(laporanResult.data) ? laporanResult.data : []);
      setKwarranList(
        Array.isArray(kwarranResult.data) ? kwarranResult.data : []
      );
      setGudepList(
        (Array.isArray(gudepResult.data) ? gudepResult.data : []).filter(
          (g) => g.useres?.role !== "admin"
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
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
      { key: "nama", label: "Pelapor", width: "w-3/20" },
      { key: "asal", label: "Asal", width: "w-2/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "level", label: "Level Lap.", width: "w-2/20" },
      { key: "targetDetail", label: "Target", width: "w-3/20" },
      { key: "status", label: "Status", width: "w-2/20" },
      { key: "createdAt", label: "Tgl Minta", width: "w-2/20" },
      { key: "actions", label: "Aksi", width: "w-3/20" },
    ],
    []
  );

  const handleDeleteLaporanEntry = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Yakin hapus?",
      text: "Permintaan laporan ini dan file terkait di Dropbox (jika terdeteksi pathnya) akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (confirmResult.isConfirmed) {
      try {
        await deleteLaporanService(id);
        fetchInitialData();
        Swal.fire("Berhasil", "Permintaan laporan telah dihapus.", "success");
      } catch (err) {
        Swal.fire(
          "Gagal",
          err.message || "Gagal menghapus permintaan laporan.",
          "error"
        );
      }
    }
  };

  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleStatusFilterChange = useCallback(
    (value) => setSelectedStatusFilter(value),
    []
  );
  const handleLevelFilterChange = useCallback(
    (value) => setSelectedLevelFilter(value),
    []
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
    return data.filter((item) => {
      let targetName = "";
      if (item.level === "kwarran")
        targetName = kwarranMap.get(item.target_id) || "";
      else if (item.level === "gudep")
        targetName = gudepMap.get(item.target_id) || "";
      const searchableFields = [
        item.nama,
        item.asal,
        item.email,
        item.level,
        item.status,
        targetName,
      ].filter(Boolean);
      const matchesSearch = searchableFields.some((f) =>
        f.toLowerCase().includes(query)
      );
      const matchesStatus =
        selectedStatusFilter === "" || item.status === selectedStatusFilter;
      const matchesLevel =
        selectedLevelFilter === "semua" || item.level === selectedLevelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [
    data,
    searchQuery,
    selectedStatusFilter,
    selectedLevelFilter,
    kwarranMap,
    gudepMap,
  ]);

  const handleSetujui = async (id) => {
    setReportLoadingId(id);
    try {
      await approveLaporanStatusOnly(id, "Setujui");
      fetchInitialData();
      Swal.fire(
        "Berhasil",
        "Status diperbarui. Laporan PDF siap di-generate.",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Tidak bisa memperbarui status.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const handleSelesaiManual = async (id) => {
    setReportLoadingId(id);
    try {
      await approveLaporanStatusOnly(id, "Selesai");
      fetchInitialData();
      Swal.fire("Berhasil", "Status laporan ditandai 'Selesai'.", "success");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Tidak bisa menyelesaikan laporan.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const handleGenerateAndDownloadPdfFromList = async (laporanId) => {
    setReportLoadingId(laporanId);
    try {
      const result = await generateAndDownloadPdfReport(laporanId);
      Swal.fire(
        "Info",
        result.message || "Proses unduh laporan PDF dari Dropbox dimulai.",
        "info"
      );
      fetchInitialData();
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh laporan PDF dari Dropbox.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const handleDownloadExistingPdf = async (laporanId) => {
    setReportLoadingId(laporanId);
    try {
      const result = await downloadOrViewSavedPdfReport(laporanId);
      Swal.fire(
        "Info",
        result.message || "Proses unduh laporan PDF dari Dropbox dimulai.",
        "info"
      );
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh laporan PDF yang ada dari Dropbox.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      let targetDetail = "-";
      if (item.level === "kwarran")
        targetDetail =
          kwarranMap.get(item.target_id) || `ID: ${item.target_id}`;
      else if (item.level === "gudep")
        targetDetail = gudepMap.get(item.target_id) || `ID: ${item.target_id}`;
      else if (item.level === "semua") targetDetail = "Semua Data";
      const isLoading = reportLoadingId === item.id;
      return {
        no: index + 1,
        id: item.id,
        nama: item.nama || "-",
        asal: item.asal || "-",
        email: item.email || "-",
        level: item.level || "-",
        targetDetail,
        status: item.status || "-",
        createdAt: item.createdAt ? FormatDate(item.createdAt) : "-",
        actions: (
          <div className="flex gap-1 justify-center flex-wrap">
            {item.status === "Menunggu" && (
              <>
                <button
                  className="material-icons bg-green-500 p-1 rounded-md text-white hover:bg-green-600 text-sm"
                  onClick={() => handleSetujui(item.id)}
                  title="Setujui & Siapkan Laporan"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "check_circle"}
                </button>
                <button
                  className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600 text-sm"
                  onClick={() => handleDeleteLaporanEntry(item.id)}
                  title="Hapus Permintaan"
                >
                  delete
                </button>
              </>
            )}
            {item.status === "Setujui" && (
              <>
                <button
                  className="material-icons bg-purple-600 p-1 rounded-md text-white hover:bg-purple-700 text-sm"
                  disabled={isLoading}
                  onClick={() => handleGenerateAndDownloadPdfFromList(item.id)}
                  title="Generate & Unduh PDF ke Dropbox"
                >
                  {isLoading ? "..." : "cloud_upload"}
                </button>
                <button
                  className="material-icons bg-blue-500 p-1 rounded-md text-white hover:bg-blue-600 text-sm"
                  onClick={() => handleSelesaiManual(item.id)}
                  title="Tandai Selesai (Manual)"
                >
                  done_all
                </button>
                <button
                  className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600 text-sm"
                  onClick={() => handleDeleteLaporanEntry(item.id)}
                  title="Hapus Permintaan"
                >
                  delete
                </button>
              </>
            )}
            {(item.status === "Selesai" || item.status === "Error Generate") &&
              item.pdf_path && (
                <button
                  className="material-icons bg-teal-500 p-1 rounded-md text-white hover:bg-teal-600 text-sm"
                  disabled={isLoading}
                  onClick={() => handleDownloadExistingPdf(item.id)}
                  title="Unduh Ulang PDF dari Dropbox"
                >
                  {isLoading ? "..." : "file_download"}
                </button>
              )}
            {(item.status === "Selesai" ||
              item.status === "Error Generate") && (
              <button
                className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600 text-sm ml-1"
                onClick={() => handleDeleteLaporanEntry(item.id)}
                title="Hapus Permintaan"
              >
                delete
              </button>
            )}
            {item.status === "Error Generate" && !item.pdf_path && (
              <button
                className="material-icons bg-orange-500 p-1 rounded-md text-white hover:bg-orange-600 text-sm"
                disabled={isLoading}
                onClick={() => handleGenerateAndDownloadPdfFromList(item.id)}
                title="Coba Generate & Unduh Ulang PDF ke Dropbox"
              >
                {isLoading ? "..." : "autorenew"}
              </button>
            )}
          </div>
        ),
      };
    });
  }, [
    filteredData,
    kwarranMap,
    gudepMap,
    reportLoadingId,
    handleSetujui,
    handleDeleteLaporanEntry,
    handleSelesaiManual,
    handleGenerateAndDownloadPdfFromList,
    handleDownloadExistingPdf,
  ]);

  const handleGenerateDirectPdfReport = useCallback(async () => {
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
      title: "Membuat Laporan PDF & Upload ke Dropbox...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const params = { level: directReportLevel };
      if (directReportLevel !== "semua") {
        params.targetId = directReportTargetId;
        if (directReportLevel === "kwarran")
          params.namaKwarran = kwarranList.find(
            (k) => k.id === directReportTargetId
          )?.nama;
        else if (directReportLevel === "gudep")
          params.namaGudep = gudepList.find(
            (g) => g.id === directReportTargetId
          )?.pangkalan;
      }
      const result = await generateDirectPdfReportAndDownload(params); // Panggil service PDF
      Swal.close();
      Swal.fire(
        "Info",
        result.message || "Proses unduh laporan PDF dari Dropbox dimulai.",
        "info"
      );
    } catch (err) {
      Swal.fire(
        "Gagal!",
        err.message || "Gagal membuat laporan PDF langsung.",
        "error"
      );
    } finally {
      setDirectReportLoading(false);
    }
  }, [directReportLevel, directReportTargetId, kwarranList, gudepList]);

  const directReportTargetOptions = useMemo(() => {
    if (directReportLevel === "kwarran")
      return kwarranList.map((k) => ({ id: k.id, nama: k.nama, value: k.id }));
    if (directReportLevel === "gudep")
      return gudepList.map((g) => ({
        id: g.id,
        nama: `${g.pangkalan || g.no_gudep || "N/A"} (${
          kwarranMap.get(g.kwarran_id) || "-"
        })`,
        value: g.id,
      }));
    return [];
  }, [directReportLevel, kwarranList, gudepList, kwarranMap]);

  const statusOptions = [
    { id: "", value: "", label: "Filter Status" },
    { id: "Menunggu", value: "Menunggu", label: "Menunggu" },
    { id: "Setujui", value: "Setujui" },
    { id: "Selesai", value: "Selesai" },
    { id: "Error Generate", value: "Error Generate", label: "Error Generate" },
  ];
  const levelOptionsTableFilter = [
    { id: "semua", value: "semua", label: "Filter Level" },
    { id: "kwarran", value: "kwarran", label: "Kwarran" },
    { id: "gudep", value: "gudep", label: "Gudep" },
  ];
  const levelOptionsDirect = [
    { id: "semua", value: "semua", label: "Level: Semua" },
    { id: "kwarran", value: "kwarran", label: "Level: Kwarran" },
    { id: "gudep", value: "gudep", label: "Level: Gudep" },
  ];

  const FilterControls = (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full md:w-auto">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Dropdown
          options={statusOptions}
          selected={selectedStatusFilter}
          onChange={handleStatusFilterChange}
          placeholder="Filter Status"
          id="status-filter-table"
          className="w-full sm:w-auto md:min-w-[150px]"
        />
        <Dropdown
          options={levelOptionsTableFilter}
          selected={selectedLevelFilter}
          onChange={handleLevelFilterChange}
          placeholder="Filter Level Laporan"
          id="level-filter-table"
          className="w-full sm:w-auto md:min-w-[150px]"
        />
      </div>
      <div className="border-t md:border-t-0 md:border-l border-gray-300 my-2 md:my-0 md:mx-3 md:h-10 self-center"></div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch">
        <Dropdown
          options={levelOptionsDirect}
          selected={directReportLevel}
          onChange={(v) => {
            setDirectReportLevel(v);
            setDirectReportTargetId("");
          }}
          placeholder="Pilih Level Unduhan"
          id="direct-level-filter"
          className="w-full sm:w-auto md:min-w-[150px]"
        />
        {(directReportLevel === "kwarran" || directReportLevel === "gudep") && (
          <Dropdown
            options={directReportTargetOptions}
            selected={directReportTargetId}
            onChange={setDirectReportTargetId}
            placeholder={`Pilih Target`}
            id="direct-target-filter"
            className="w-full sm:w-auto md:min-w-[200px]"
            disabled={
              directReportLoading ||
              loading ||
              directReportTargetOptions.length === 0
            }
          />
        )}
        <button
          onClick={handleGenerateDirectPdfReport}
          disabled={directReportLoading || loading}
          className="bg-[#9500FF] hover:bg-[#7a00cc] text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 h-10 w-full sm:w-auto text-sm"
          title="Buat & Unduh Laporan PDF Langsung"
        >
          {directReportLoading ? "Memproses..." : "Unduh Langsung PDF"}
        </button>
      </div>
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Permintaan Laporan"
            showSearch
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterControls}
          />
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : transformedData.length === 0 ? (
            <NoDataMessage
              message={
                searchQuery ||
                selectedStatusFilter ||
                selectedLevelFilter !== "semua"
                  ? "Data laporan tidak ditemukan."
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
