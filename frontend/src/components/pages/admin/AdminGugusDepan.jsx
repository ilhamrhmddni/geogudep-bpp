// src/components/pages/admin/AdminGugusdepan.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
import { downloadPdfGudep } from "../../../services/LaporanService"; // Diubah
import AdminHeader from "../../atoms/AdminHeader";
// ... (impor lainnya)
import DetailCell from "../../atoms/DetailCell";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

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
    try {
      setLoading(true);
      const [gugusdepanResult, kwarranResult] = await Promise.all([
        fetchGugusdepan(),
        fetchKwarran(),
      ]);
      setData(
        Array.isArray(gugusdepanResult.data) ? gugusdepanResult.data : []
      );
      setKwarranList(
        Array.isArray(kwarranResult.data) ? kwarranResult.data : []
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
      { key: "no_gudep", label: "No. Gudep", width: "w-2/20" },
      { key: "kwarran_nama", label: "Kwarran", width: "w-2/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-1/20" },
      { key: "pangkalan", label: "Pangkalan", width: "w-2/20" },
      { key: "ambalan", label: "Ambalan", width: "w-2/20" },
      { key: "jumlah", label: "Jumlah", width: "w-1/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "detail", label: "Detail", width: "w-1/20" },
      { key: "tahun_update", label: "Tanggal Update", width: "w-2/20" }, // Adjusted
      { key: "actions", label: "Unduh Laporan", width: "w-2/20" },
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

  const handleDownloadPdf = async (targetId, namaGudep) => {
    setReportLoadingId(targetId);
    try {
      const result = await downloadPdfGudep(targetId, namaGudep); // Service yang benar
      Swal.fire(
        "Info",
        result.message || "Proses unduh laporan dari Dropbox dimulai.",
        "info"
      );
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh Laporan HTML dari Dropbox.",
        "error"
      );
    } finally {
      setReportLoadingId(null);
    }
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const intermediateData = (Array.isArray(data) ? data : []).filter(
      (item) => {
        const searchMatch = [
          item.no_gudep,
          item.pangkalan,
          item.mabigus,
          item.pembina,
          item.pelatih,
        ].some((field) => (field ?? "").toLowerCase().includes(query));
        const kwarranNamaSelected = kwarranList.find(
          (k) => k.id === item.kwarran_id
        )?.nama;
        const kwarranMatch = selectedKwarran
          ? kwarranNamaSelected === selectedKwarran
          : true;
        const tingkatanMatch = selectedTingkatan
          ? item.tingkatan === selectedTingkatan
          : true;
        return (
          searchMatch &&
          kwarranMatch &&
          tingkatanMatch &&
          item.useres?.role !== "admin"
        );
      }
    );
    const totalRows = intermediateData.length;
    const threshold = 2;
    return intermediateData.map((item, index) => {
      const isNearBottom = index >= totalRows - threshold;
      const positionValue = isNearBottom ? "top" : "bottom";
      return {
        ...item,
        no: index + 1,
        kwarran_nama:
          kwarranList.find((k) => k.id === item.kwarran_id)?.nama || "-",
        tahun_update: item.tahun_update ? FormatDate(item.tahun_update) : "-",
        jumlah: (
          <DetailCell
            title="Lihat"
            details={[
              { label: "Putra", value: item.jumlah_putra ?? 0 },
              { label: "Putri", value: item.jumlah_putri ?? 0 },
            ]}
            position={positionValue}
          />
        ),
        detail: (
          <DetailCell
            title="Lihat"
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
            onClick={() =>
              handleDownloadPdf(item.id, item.pangkalan || item.no_gudep)
            }
            className="material-icons bg-[#9500FF] text-white p-1 rounded-md hover:bg-[#7a00cc] text-sm"
            disabled={reportLoadingId === item.id}
            title="Unduh Laporan Gudep (HTML)"
          >
            {reportLoadingId === item.id ? "..." : "download"}
          </button>
        ),
      };
    });
  }, [
    data,
    searchQuery,
    selectedKwarran,
    selectedTingkatan,
    kwarranList,
    reportLoadingId,
  ]);

  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={kwarranList.map((k) => ({
          id: k.nama,
          nama: k.nama,
          value: k.nama,
        }))}
        selected={selectedKwarran}
        onChange={handleKwarranChange}
        placeholder="Pilih Kwarran"
      />
      <Dropdown
        options={[
          { id: "Siaga", nama: "Siaga" },
          { id: "Penggalang", nama: "Penggalang" },
          { id: "Penegak/Pandega", nama: "Penegak/Pandega" },
          { id: "Pandega", nama: "Pandega" },
        ].map((o) => ({ ...o, value: o.id }))}
        selected={selectedTingkatan}
        onChange={handleTingkatanChange}
        placeholder="Pilih Tingkatan"
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
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filteredData.length === 0 ? (
            <NoDataMessage message="Data Gugusdepan tidak ditemukan." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <TableR headers={headers} data={filteredData} />
            </div>
          )}
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminGugusdepan;
