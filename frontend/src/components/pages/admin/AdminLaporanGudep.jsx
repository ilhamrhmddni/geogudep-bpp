import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import {
  approveLaporanStatusOnly,
  deleteLaporan,
  fetchLaporan,
  generateDirectPdfReport,
} from "../../../services/LaporanService";

import {} from "../../../services/LaporanService";
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
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("semua");

  // Ad-hoc PDF generator states
  const [directPdfLevel, setDirectPdfLevel] = useState("semua");
  const [directPdfTargetId, setDirectPdfTargetId] = useState("");
  const [directPdfLoading, setDirectPdfLoading] = useState(false);

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
      setGudepList(gudepResult.data || []);
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
      { key: "nama", label: "Pelapor", width: "w-2/20" },
      { key: "asal", label: "Asal", width: "w-2/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "level", label: "Level Lap.", width: "w-1/20" },
      { key: "targetDetail", label: "Target", width: "w-2/20" },
      { key: "status", label: "Status", width: "w-1/20" },
      { key: "createdAt", label: "Tgl Minta", width: "w-1/20" },
      { key: "actions", label: "Aksi", width: "w-1/20" },
    ],
    []
  );

  const handleDeleteLaporan = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data laporan ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        // Ganti dengan endpoint hapus laporan sesuai service kamu
        await handleDeleteLaporan(id); // Pastikan fungsi ini tersedia
        setData((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Berhasil", "Laporan telah dihapus.", "success");
      } catch (err) {
        console.error("Gagal hapus laporan:", err);
        Swal.fire("Gagal", "Gagal menghapus laporan.", "error");
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
      const matchesSearch = searchableFields.some((f) =>
        f.toLowerCase().includes(query)
      );
      const matchesStatus =
        selectedStatusFilter === "" || item.status === selectedStatusFilter;
      const matchesLevel =
        selectedLevelFilter === "semua" || item.level === selectedLevelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [data, searchQuery, selectedStatusFilter, selectedLevelFilter]);

  const kwarranMap = useMemo(
    () => new Map(kwarranList.map((k) => [k.id, k.nama])),
    [kwarranList]
  );
  const gudepMap = useMemo(
    () => new Map(gudepList.map((g) => [g.id, `${g.no_gudep}`])),
    [gudepList]
  );

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      let targetDetail = "-";
      if (item.level === "kwarran")
        targetDetail =
          kwarranMap.get(item.target_id) || `ID: ${item.target_id}`;
      else if (item.level === "gudep")
        targetDetail = gudepMap.get(item.target_id) || `ID: ${item.target_id}`;
      else if (item.level === "semua") targetDetail = "Semua Data";

      const isLoading = pdfLoadingId === item.id;

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
                  className="material-icons bg-green-600 p-1 rounded-md text-white hover:bg-green-700"
                  onClick={() => handleSetujui(item.id)}
                  title="Setujui/Proses"
                >
                  check
                </button>
                <button
                  className="material-icons bg-red-600 p-1 rounded-md text-white hover:bg-red-700"
                  onClick={() => handleDelete(item.id)}
                  title="Hapus"
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
                  onClick={() => handleDownloadPdf(item.id)}
                  title="Download PDF"
                >
                  {isLoading ? "..." : "download"}
                </button>
                <button
                  className="material-icons bg-blue-600 p-1 rounded-md text-white hover:bg-blue-700"
                  onClick={() => handleSelesai(item.id)}
                  title="Tandai Selesai"
                >
                  check
                </button>
                <button
                  className="material-icons bg-red-600 p-1 rounded-md text-white hover:bg-red-700"
                  onClick={() => handleDelete(item.id)}
                  title="Hapus"
                >
                  delete
                </button>
              </>
            )}
            {item.status === "Selesai" && (
              <button
                className="material-icons bg-red-600 p-1 rounded-md text-white hover:bg-red-700"
                onClick={() => handleDelete(item.id)}
                title="Hapus"
              >
                delete
              </button>
            )}
          </div>
        ),
      };
    });
  }, [filteredData, kwarranMap, gudepMap, pdfLoadingId]);

  const statusOptions = [
    { id: "Menunggu", value: "Menunggu", label: "Menunggu" },
    { id: "Setujui", value: "Setujui", label: "Setujui/Proses" },
    { id: "Selesai", value: "Selesai", label: "Selesai" },
    { id: "Error Generate", value: "Error Generate", label: "Error Generate" },
  ];

  const handleSetujui = async (id) => {
    try {
      await approveLaporanStatusOnly(id, "Setujui");
      await fetchInitialData();
      Swal.fire("Berhasil", "Status diperbarui ke Setujui/Proses", "success");
    } catch (err) {
      Swal.fire("Gagal", "Tidak bisa memperbarui status", "error");
    }
  };

  const handleSelesai = async (id) => {
    try {
      await approveLaporanStatusOnly(id, "Selesai");
      await fetchInitialData();
      Swal.fire("Berhasil", "Status diperbarui ke Selesai", "success");
    } catch (err) {
      Swal.fire("Gagal", "Tidak bisa menyelesaikan laporan", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Hapus laporan ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
      });
      if (result.isConfirmed) {
        await deleteLaporan(id);
        await fetchInitialData();
        Swal.fire("Berhasil", "Laporan berhasil dihapus", "success");
      }
    } catch (err) {
      Swal.fire("Gagal", "Gagal menghapus laporan", "error");
    }
  };

  const handleDownloadPdf = async (id) => {
    const laporan = data.find((item) => item.id === id);
    if (!laporan) return;

    setPdfLoadingId(id);
    try {
      // Atur level dan targetId untuk keperluan generate PDF
      setDirectPdfLevel(laporan.level);
      setDirectPdfTargetId(laporan.target_id || "");

      // Tunggu state update dulu agar `handleGenerateDirectPdf` baca nilai baru
      await new Promise((resolve) => setTimeout(resolve, 100));

      await handleGenerateDirectPdf();
      Swal.fire("Berhasil", "PDF berhasil diunduh!", "success");
    } catch (err) {
      console.error("Gagal unduh PDF:", err);
      Swal.fire("Gagal", "Gagal mengunduh PDF.", "error");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleGenerateDirectPdf = useCallback(async () => {
    if (
      (directPdfLevel === "kwarran" || directPdfLevel === "gudep") &&
      !directPdfTargetId
    ) {
      Swal.fire(
        "Input Kurang",
        `Pilih ${directPdfLevel === "kwarran" ? "Kwarran" : "Gudep"} target.`,
        "warning"
      );
      return;
    }
    setDirectPdfLoading(true);
    Swal.fire({
      title: "Membuat PDF Langsung...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const params = { level: directPdfLevel };
      if (directPdfLevel !== "semua") {
        params.targetId = directPdfTargetId;
      }
      await generateDirectPdfReport(params);
      Swal.close();
    } catch (err) {
      Swal.fire(
        "Gagal!",
        err.message || "Gagal membuat PDF laporan langsung.",
        "error"
      );
    } finally {
      setDirectPdfLoading(false);
    }
  }, [directPdfLevel, directPdfTargetId]);

  const FilterDropdownsWithButton = (
    <div className="hidden md:flex gap-3 items-center">
      <Dropdown
        options={statusOptions}
        selected={selectedStatusFilter}
        onChange={handleStatusFilterChange}
        placeholder="Semua Status"
        id="status-filter"
        className="min-w-[140px]"
      />
      <button
        onClick={handleGenerateDirectPdf}
        disabled={directPdfLoading || loading}
        className="bg-[#9500FF] hover:bg-[#7a00cc] text-white font-bold py-2 px-5 rounded-md disabled:opacity-50 h-10 min-w-[140px] cursor-pointer"
        title="Buat & Unduh PDF Langsung"
      >
        {directPdfLoading ? "Memproses..." : "Download"}
      </button>
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
                searchQuery || selectedStatusFilter
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
