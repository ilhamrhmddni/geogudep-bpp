// File: src/pages/AdminLaporanGudep.jsx
// Versi: Final Alur Multi-Tahap dengan Tabel HTML Standar

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Import services - Pastikan semua path benar
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import {
  approveAndGenerateLaporan, // <-- Service baru
  deleteLaporan,
  fetchLaporan, // <-- Service baru
  sendLaporanEmail, // <-- Service baru
} from "../../../services/LaporanService";

// Import komponen UI - Pastikan semua path benar
import AdminHeader from "../../atoms/AdminHeader";
import Dropdown from "../../atoms/Dropdown"; // Pastikan Dropdown menerima {id, value, label}
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
// import TableRU from "../../moleculs/TableRU"; // Tidak dipakai lagi di file ini
import AdminTemplate from "../../templates/AdminTemplate";

const AdminLaporanGudep = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]); // Data Laporan
  const [loading, setLoading] = useState(true); // Loading data laporan utama
  const [error, setError] = useState(null); // Error fetch data
  const [selectedStatus, setSelectedStatus] = useState(""); // Filter status
  const [actionLoading, setActionLoading] = useState({}); // Loading per baris { [laporanId]: true }

  // State untuk data referensi Kwarran dan Gudep
  const [kwarranList, setKwarranList] = useState([]);
  const [gudepList, setGudepList] = useState([]);
  const [loadingRefData, setLoadingRefData] = useState(true); // Loading data referensi
  const navigate = useNavigate(); // Jika perlu navigasi

  // Fungsi fetch data Laporan (utama)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLaporan();
      setData(Array.isArray(result?.data) ? result.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data laporan:", err);
      setError((prev) => prev || "Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi fetch data Referensi (Kwarran & Gudep)
  const fetchRefData = useCallback(async () => {
    setLoadingRefData(true);
    try {
      const [kwarranResult, gudepResult] = await Promise.all([
        fetchKwarran(),
        fetchGugusdepan(),
      ]);
      setKwarranList(kwarranResult?.data || []);
      setGudepList(gudepResult?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching ref data:", err);
      setError((prev) => prev || "Gagal memuat data referensi Kwarran/Gudep.");
    } finally {
      setLoadingRefData(false);
    }
  }, []);

  // Panggil kedua fetch saat komponen mount
  useEffect(() => {
    fetchData();
    fetchRefData();
  }, [fetchData, fetchRefData]);

  // Handlers search & filter status
  const handleSearchChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    []
  );
  const handleStatusChange = useCallback(
    (value) => setSelectedStatus(value),
    []
  );

  // --- HANDLER AKSI ---
  const handleApproveGenerate = useCallback(
    async (id) => {
      console.log("FE: Triggering Approve & Generate for ID:", id);
      if (!id) return;
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      Swal.fire({
        title: "Memproses...",
        text: "Membuat PDF laporan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const result = await approveAndGenerateLaporan(id);
        Swal.fire(
          "Sukses!",
          result.message || "PDF berhasil dibuat, laporan siap dikirim.",
          "success"
        );
        fetchData();
      } catch (err) {
        Swal.fire("Gagal!", err.message || "Gagal memproses laporan.", "error");
      } finally {
        setActionLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [fetchData]
  );

  const handleSendEmail = useCallback(
    async (id) => {
      console.log("FE: Triggering Send Email for ID:", id);
      if (!id) return;
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      Swal.fire({
        title: "Mengirim Email...",
        text: "Mohon tunggu...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const result = await sendLaporanEmail(id);
        Swal.fire(
          "Sukses!",
          result.message || "Email laporan berhasil dikirim.",
          "success"
        );
        fetchData();
      } catch (err) {
        Swal.fire(
          "Gagal!",
          err.message || "Gagal mengirim email laporan.",
          "error"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [fetchData]
  );

  const handleDelete = useCallback(
    async (id) => {
      console.log("FE: Triggering Delete for ID:", id);
      if (!id) return;
      const confirmDelete = await Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a00cc",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });
      if (confirmDelete.isConfirmed) {
        setActionLoading((prev) => ({ ...prev, [id]: true }));
        try {
          await deleteLaporan(id);
          Swal.fire("Dihapus!", "Data laporan telah dihapus.", "success");
          fetchData();
        } catch (err) {
          console.error("Error deleting report:", err);
          Swal.fire(
            "Gagal!",
            err.message || "Gagal menghapus laporan.",
            "error"
          );
        } finally {
          setActionLoading((prev) => ({ ...prev, [id]: false }));
        }
      }
    },
    [fetchData]
  );
  // --- AKHIR HANDLER AKSI ---

  // Filter data laporan
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const searchFields = [
        item.nama,
        item.asal,
        item.email,
        item.level,
        item.target_id,
        item.status,
      ];
      const matchesSearch = searchFields.some((field) =>
        (field ?? "").toLowerCase().includes(query)
      );
      const matchesStatus =
        selectedStatus === "" || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, selectedStatus]);

  // Buat Lookup Maps
  const kwarranMap = useMemo(
    () => new Map(kwarranList.map((k) => [k.id, k.nama])),
    [kwarranList]
  );
  const gudepMap = useMemo(
    () =>
      new Map(
        gudepList.map((g) => [g.id, { nama: g.nama, no_gudep: g.no_gudep }])
      ),
    [gudepList]
  );

  // Header tabel
  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-auto" },
      { key: "nama", label: "Nama Pelapor", width: "w-auto" },
      { key: "asal", label: "Asal", width: "w-auto" },
      { key: "email", label: "Email", width: "w-auto" },
      { key: "level", label: "Level", width: "w-auto" },
      { key: "targetDetail", label: "Target Laporan", width: "w-auto" },
      { key: "status", label: "Status", width: "w-auto" },
      { key: "pdfLink", label: "File PDF", width: "w-auto" },
      { key: "createdAt", label: "Tgl Minta", width: "w-auto" },
      { key: "actions", label: "Aksi", width: "w-auto" },
    ],
    []
  );

  // Opsi dropdown status
  const statusOptions = useMemo(
    () => [
      { id: "Menunggu", value: "Menunggu", label: "Menunggu" },
      { id: "Siap Kirim", value: "Siap Kirim", label: "Siap Kirim" },
      { id: "Selesai", value: "Selesai", label: "Selesai" },
    ],
    []
  );
  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={statusOptions}
        selected={selectedStatus}
        onChange={handleStatusChange}
        placeholder="Semua Status"
        id="status-filter"
      />
    </div>
  );

  // Transformasi data + Render Aksi Kondisional sebagai JSX
  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      const isLoading = actionLoading[item.id];
      let actionButtons = [];

      // Logika Tombol Aksi Kondisional
      if (item.status === "Menunggu") {
        actionButtons.push(
          <button
            key="approveGen"
            onClick={() => handleApproveGenerate(item.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs disabled:opacity-50"
            disabled={isLoading}
            title="Setujui & Generate PDF"
          >
            {" "}
            {isLoading ? "Memproses..." : "Setujui & Generate"}{" "}
          </button>
        );
      } else if (item.status === "Siap Kirim") {
        if (item.pdf_path) {
          actionButtons.push(
            <a
              key="view"
              href={`/reports/${item.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
              title="Lihat PDF"
            >
              {" "}
              Lihat{" "}
            </a>
          );
        }
        actionButtons.push(
          <button
            key="send"
            onClick={() => handleSendEmail(item.id)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs disabled:opacity-50"
            disabled={isLoading}
            title="Kirim Laporan via Email"
          >
            {" "}
            {isLoading ? "Mengirim..." : "Kirim Email"}{" "}
          </button>
        );
      } else if (item.status === "Selesai") {
        actionButtons.push(
          <span
            key="status"
            className="text-green-600 text-xs font-semibold px-2 py-1"
          >
            Selesai
          </span>
        );
        if (item.pdf_path) {
          actionButtons.push(
            <a
              key="view-done"
              href={`/reports/${item.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-500 hover:text-blue-700 text-xs"
              title="Lihat PDF"
            >
              (Lihat)
            </a>
          );
        }
      } else if (
        item.status === "Error Generate" ||
        item.status === "Error Kirim"
      ) {
        actionButtons.push(
          <span
            key="status"
            className="text-red-600 text-xs font-semibold px-2 py-1"
          >
            Error
          </span>
        );
        if (item.status === "Error Generate") {
          actionButtons.push(
            <button
              key="retryGen"
              onClick={() => handleApproveGenerate(item.id)}
              className="ml-2 bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded text-xs disabled:opacity-50"
              disabled={isLoading}
              title="Coba Generate Ulang"
            >
              {" "}
              {isLoading ? "..." : "Retry"}{" "}
            </button>
          );
        }
      } else {
        // Status lain (misal: Proses Generate, Proses Kirim)
        actionButtons.push(
          <span key="status" className="text-gray-500 text-xs italic px-2 py-1">
            {item.status || "Memuat..."}
          </span>
        );
      }
      // Tombol Delete
      actionButtons.push(
        <button
          key="delete"
          onClick={() => handleDelete(item.id)}
          className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50"
          disabled={isLoading}
          title="Hapus Laporan"
        >
          {" "}
          <span className="material-icons" style={{ fontSize: "1.1rem" }}>
            delete
          </span>{" "}
        </button>
      );

      // Menyiapkan Target Detail
      let targetDetail = "-";
      if (item.level === "kwarran" && !loadingRefData)
        targetDetail = kwarranMap.get(item.target_id) || item.target_id || "-";
      else if (item.level === "gudep" && !loadingRefData) {
        const gudepInfo = gudepMap.get(item.target_id);
        targetDetail = gudepInfo
          ? `${gudepInfo.nama || "?"} (${gudepInfo.no_gudep || "?"})`
          : item.target_id || "-";
      } else if (item.level === "semua") targetDetail = "Semua Data";

      // Data yang akan dirender di tabel
      return {
        id: item.id,
        no: index + 1,
        nama: item.nama,
        asal: item.asal,
        email: item.email || "-",
        level: item.level || "-",
        targetDetail: targetDetail,
        status: item.status || "-",
        pdfLink:
          (item.status === "Siap Kirim" ||
            item.status === "Selesai" ||
            item.status === "Kirim") &&
          item.pdf_path ? (
            <a
              href={`/reports/${item.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 text-xs"
            >
              {" "}
              Lihat PDF{" "}
            </a>
          ) : (
            "-"
          ),
        createdAt: item.createdAt ? FormatDate(item.createdAt) : "-",
        actions: (
          <div className="flex justify-center items-center space-x-1">
            {actionButtons}
          </div>
        ), // JSX Aksi
      };
    });
  }, [
    filteredData,
    actionLoading,
    handleApproveGenerate,
    handleSendEmail,
    handleDelete,
    kwarranMap,
    gudepMap,
    loadingRefData,
  ]);

  // Tampilkan loading utama
  if (loading || loadingRefData) {
    return (
      <AdminTemplate>
        <LoadingSpinner />
      </AdminTemplate>
    );
  }

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Permintaan Laporan"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterDropdowns}
          />

          <div className="mt-6 overflow-x-auto">
            {error ? (
              <ErrorMessage message={error} />
            ) : transformedData.length === 0 ? (
              <NoDataMessage
                message={
                  searchQuery || selectedStatus
                    ? "Data laporan tidak ditemukan sesuai filter."
                    : "Belum ada data laporan."
                }
              />
            ) : (
              // --- Menggunakan Tabel HTML Standar ---
              <table className="min-w-full table-auto mt-4">
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        className={`${header.width || ""} px-4 py-2`}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transformedData.map((item) => (
                    <tr key={item.id}>
                      {headers.map((header) => (
                        <td
                          key={`${item.id}-${header.key}`}
                          className="border border-none px-2 py-2 text-center"
                        >
                          {" "}
                          {/* Removed text alignment conditions to match TableCRUD */}
                          {/* Render data atau JSX aksi */}
                          {item[header.key] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              // --- Akhir Tabel HTML Standar ---
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminLaporanGudep;
