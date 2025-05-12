import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import {
  approveLaporanStatusOnly,
  deleteLaporan as deleteLaporanService, // Fungsi baru untuk item laporan
  downloadOrViewSavedHtmlReport, // Alias untuk menghindari konflik nama
  fetchLaporan, // Diubah dari generateDirectPdfReport
  generateAndDownloadHtmlReport,
  generateDirectHtmlReportAndDownload, // Diubah dari generateDirectPdfReport
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
  const [reportLoadingId, setReportLoadingId] = useState(null); // Diubah dari pdfLoadingId
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("semua");

  // Ad-hoc HTML generator states
  const [directReportLevel, setDirectReportLevel] = useState("semua"); // Diubah
  const [directReportTargetId, setDirectReportTargetId] = useState(""); // Diubah
  const [directReportLoading, setDirectReportLoading] = useState(false); // Diubah

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [laporanResult, kwarranResult, gudepResult] = await Promise.all([
        fetchLaporan(),
        fetchKwarran(),
        fetchGugusdepan(),
      ]);
      setData(Array.isArray(laporanResult.data) ? laporanResult.data : []);
      setKwarranList(kwarranResult.data || []);
      setGudepList(
        Array.isArray(gudepResult.data)
          ? gudepResult.data.filter((g) => g.useres?.role !== "admin")
          : []
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data.");
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
      { key: "nama", label: "Pelapor", width: "w-3/20" }, // Adjusted width
      { key: "asal", label: "Asal", width: "w-2/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "level", label: "Level Lap.", width: "w-2/20" }, // Adjusted width
      { key: "targetDetail", label: "Target", width: "w-3/20" }, // Adjusted width
      { key: "status", label: "Status", width: "w-2/20" }, // Adjusted width
      { key: "createdAt", label: "Tgl Minta", width: "w-2/20" }, // Adjusted width
      { key: "actions", label: "Aksi", width: "w-3/20" }, // Adjusted width
    ],
    []
  );

  // Fungsi delete yang memanggil service
  const handleDeleteLaporanEntry = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data permintaan laporan ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteLaporanService(id); // Memanggil fungsi service yang diimpor
        setData((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Berhasil", "Permintaan laporan telah dihapus.", "success");
      } catch (err) {
        console.error("Gagal hapus laporan:", err);
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
    // Handler untuk filter level laporan
    (value) => setSelectedLevelFilter(value),
    []
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const searchableFields = [
        item.nama || "",
        item.asal || "",
        item.email || "",
        item.level || "",
        item.status || "",
      ];
      // Tambahkan pencarian berdasarkan targetDetail jika ada
      let targetName = "";
      if (item.level === "kwarran")
        targetName = kwarranMap.get(item.target_id) || "";
      else if (item.level === "gudep")
        targetName = gudepMap.get(item.target_id) || "";
      if (targetName) searchableFields.push(targetName);

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
    kwarranList,
    gudepList,
  ]); // kwarranList & gudepList sbg dependency

  const kwarranMap = useMemo(
    () => new Map(kwarranList.map((k) => [k.id, k.nama])),
    [kwarranList]
  );
  const gudepMap = useMemo(
    () => new Map(gudepList.map((g) => [g.id, `${g.pangkalan || g.no_gudep}`])), // Prioritaskan pangkalan
    [gudepList]
  );

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      let targetDetail = "-";
      if (item.level === "kwarran")
        targetDetail =
          kwarranMap.get(item.target_id) || `ID Kwarran: ${item.target_id}`;
      else if (item.level === "gudep")
        targetDetail =
          gudepMap.get(item.target_id) || `ID Gudep: ${item.target_id}`;
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
          <div className="flex gap-1 justify-center">
            {item.status === "Menunggu" && (
              <>
                <button
                  className="material-icons bg-green-500 p-1 rounded-md text-white hover:bg-green-600"
                  onClick={() => handleSetujui(item.id)}
                  title="Setujui & Proses Laporan"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "check_circle"}
                </button>
                <button
                  className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600"
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
                  className="material-icons bg-purple-600 p-1 rounded-md text-white hover:bg-purple-700"
                  disabled={isLoading}
                  onClick={() => handleDownloadHtmlReportFromList(item.id)} // Fungsi baru
                  title="Generate & Unduh Laporan HTML"
                >
                  {isLoading ? "..." : "download"}
                </button>
                <button
                  className="material-icons bg-blue-500 p-1 rounded-md text-white hover:bg-blue-600"
                  onClick={() => handleSelesai(item.id)}
                  title="Tandai Selesai (Manual)"
                >
                  done_all
                </button>
                <button
                  className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600"
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
                  className="material-icons bg-teal-500 p-1 rounded-md text-white hover:bg-teal-600"
                  disabled={isLoading}
                  onClick={() => handleDownloadExistingHtml(item.id)}
                  title="Unduh Laporan HTML Tersimpan"
                >
                  {isLoading ? "..." : "file_download"}
                </button>
              )}
            {(item.status === "Selesai" ||
              item.status === "Error Generate") && (
              <button
                className="material-icons bg-red-500 p-1 rounded-md text-white hover:bg-red-600"
                onClick={() => handleDeleteLaporanEntry(item.id)}
                title="Hapus Permintaan"
              >
                delete
              </button>
            )}
          </div>
        ),
      };
    });
  }, [filteredData, kwarranMap, gudepMap, reportLoadingId]); // reportLoadingId dependency

  const statusOptions = [
    { id: "", value: "", label: "Semua Status" }, // Opsi default
    { id: "Menunggu", value: "Menunggu", label: "Menunggu" },
    { id: "Setujui", value: "Setujui/Proses" },
    { id: "Selesai", value: "Selesai", label: "Selesai" },
    { id: "Error Generate", value: "Error Generate", label: "Error Generate" },
  ];

  const levelOptions = [
    { id: "semua", value: "semua", label: "Semua Level" },
    { id: "kwarran", value: "kwarran", label: "Kwarran" },
    { id: "gudep", value: "gudep", label: "Gudep" },
  ];

  const handleSetujui = async (id) => {
    setReportLoadingId(id);
    try {
      await approveLaporanStatusOnly(id, "Setujui");
      await fetchInitialData(); // Refresh data
      Swal.fire(
        "Berhasil",
        "Status laporan diperbarui menjadi 'Setujui/Proses'. Siap untuk di-generate.",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Tidak bisa memperbarui status laporan.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const handleSelesai = async (id) => {
    setReportLoadingId(id);
    try {
      await approveLaporanStatusOnly(id, "Selesai");
      await fetchInitialData(); // Refresh data
      Swal.fire(
        "Berhasil",
        "Status laporan diperbarui menjadi 'Selesai'.",
        "success"
      );
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

  // Handler untuk men-generate dan mengunduh HTML dari list laporan (status "Setujui")
  const handleDownloadHtmlReportFromList = async (laporanId) => {
    setReportLoadingId(laporanId);
    try {
      const result = await generateAndDownloadHtmlReport(laporanId); // Menggunakan fungsi service yang sesuai
      Swal.fire(
        "Berhasil",
        result.message || "Laporan HTML berhasil diunduh!",
        "success"
      );
    } catch (err) {
      console.error("Gagal unduh Laporan HTML dari list:", err);
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh Laporan HTML.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  // Handler untuk mengunduh HTML yang sudah ada (status "Selesai" atau "Error Generate" jika ada path)
  const handleDownloadExistingHtml = async (laporanId) => {
    setReportLoadingId(laporanId);
    try {
      await downloadOrViewSavedHtmlReport(laporanId);
      // Tidak perlu Swal success karena service sudah menangani trigger download
    } catch (err) {
      console.error("Gagal unduh Laporan HTML yang ada:", err);
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh Laporan HTML yang sudah ada.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  // Handler untuk generate HTML langsung dari filter
  const handleGenerateDirectHtmlReport = useCallback(async () => {
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
      title: "Membuat Laporan HTML Langsung...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const params = { level: directReportLevel };
      if (directReportLevel !== "semua") {
        params.targetId = directReportTargetId;
        // Ambil nama untuk filename yang lebih baik
        if (directReportLevel === "kwarran") {
          const kwarran = kwarranList.find(
            (k) => k.id === directReportTargetId
          );
          params.namaKwarran = kwarran?.nama;
        } else if (directReportLevel === "gudep") {
          const gudep = gudepList.find((g) => g.id === directReportTargetId);
          params.namaGudep = gudep?.pangkalan || gudep?.no_gudep;
        }
      }
      const result = await generateDirectHtmlReportAndDownload(params); // Menggunakan fungsi service yang sesuai
      Swal.close(); // Tutup loading Swal
      Swal.fire(
        "Berhasil",
        result.message || "Laporan HTML berhasil diunduh!",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Gagal!",
        err.message || "Gagal membuat laporan HTML langsung.",
        "error"
      );
    } finally {
      setDirectReportLoading(false);
    }
  }, [directReportLevel, directReportTargetId, kwarranList, gudepList]);

  const directReportTargetOptions = useMemo(() => {
    if (directReportLevel === "kwarran") {
      return kwarranList.map((k) => ({ id: k.id, nama: k.nama, value: k.id }));
    }
    if (directReportLevel === "gudep") {
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

  const FilterDropdownsWithButton = (
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
          options={levelOptions} // Opsi untuk filter level tabel
          selected={selectedLevelFilter}
          onChange={handleLevelFilterChange}
          placeholder="Filter Level Laporan"
          id="level-filter-table"
          className="w-full sm:w-auto md:min-w-[150px]"
        />
      </div>
      <div className="border-t md:border-t-0 md:border-l border-gray-300 my-2 md:my-0 md:mx-3"></div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch">
        <Dropdown
          options={levelOptions}
          selected={directReportLevel}
          onChange={(value) => {
            setDirectReportLevel(value);
            setDirectReportTargetId(""); // Reset target ID ketika level berubah
          }}
          placeholder="Pilih Level Direct"
          id="direct-level-filter"
          className="w-full sm:w-auto md:min-w-[150px]"
        />
        {(directReportLevel === "kwarran" || directReportLevel === "gudep") && (
          <Dropdown
            options={directReportTargetOptions}
            selected={directReportTargetId}
            onChange={setDirectReportTargetId}
            placeholder={`Pilih Target ${
              directReportLevel === "kwarran" ? "Kwarran" : "Gudep"
            }`}
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
          onClick={handleGenerateDirectHtmlReport} // Menggunakan fungsi yang sudah diubah
          disabled={directReportLoading || loading}
          className="bg-[#9500FF] hover:bg-[#7a00cc] text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 h-10 w-full sm:w-auto" // Responsif width
          title="Buat & Unduh Laporan HTML Langsung"
        >
          {directReportLoading ? "Memproses..." : "Unduh Langsung"}
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
            additionalControls={FilterDropdownsWithButton}
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
                  ? "Data laporan tidak ditemukan dengan filter yang diterapkan."
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
