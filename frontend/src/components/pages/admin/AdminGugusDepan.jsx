import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchKwarran } from "../../../services/KwarranService";
// Impor fungsi yang sudah disesuaikan untuk HTML
import { downloadHtmlGudep } from "../../../services/LaporanService";
import AdminHeader from "../../atoms/AdminHeader";
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

  // State for report generation loading
  const [reportLoadingId, setReportLoadingId] = useState(null); // Nama state diubah

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
      setKwarranList(kwarranResult.data || []);
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
      { key: "no_gudep", label: "No. Gudep", width: "w-2/20" },
      { key: "kwarran_nama", label: "Kwarran", width: "w-2/20" },
      { key: "tingkatan", label: "Tingkatan", width: "w-1/20" },
      { key: "pangkalan", label: "Pangkalan", width: "w-2/20" },
      { key: "ambalan", label: "Ambalan", width: "w-2/20" },
      { key: "jumlah", label: "Jumlah", width: "w-1/20" },
      { key: "email", label: "Email", width: "w-3/20" },
      { key: "detail", label: "Detail", width: "w-1/20" },
      { key: "tahun_update", label: "Tanggal Update", width: "w-1/20" },
      { key: "actions", label: "Unduh Laporan", width: "w-2/20" }, // Lebar kolom disesuaikan
    ],
    []
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  const handleKwarranChange = useCallback((value) => {
    setSelectedKwarran(value);
  }, []);
  const handleTingkatanChange = useCallback((value) => {
    setSelectedTingkatan(value);
  }, []);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const intermediateData =
      data?.filter((item) => {
        const searchMatch =
          (item.no_gudep ?? "").toLowerCase().includes(query) ||
          (item.pangkalan ?? "").toLowerCase().includes(query) || // Tambah pangkalan ke pencarian
          (item.mabigus ?? "").toLowerCase().includes(query) ||
          (item.pembina ?? "").toLowerCase().includes(query) ||
          (item.pelatih ?? "").toLowerCase().includes(query);

        const kwarranMatch = selectedKwarran
          ? kwarranList.find((k) => k.id === item.kwarran_id)?.nama ===
            selectedKwarran
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
      }) || [];

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
        tahun_update: FormatDate(item.tahun_update),
        jumlah: (
          <DetailCell
            title="Lihat"
            details={[
              { label: "Putra", value: item.jumlah_putra ?? "-" },
              { label: "Putri", value: item.jumlah_putri ?? "-" },
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
              handleDownloadHtml(item.id, item.no_gudep || item.pangkalan)
            } // Panggil handleDownloadHtml
            className="material-icons color-[#9500FF] bg-[#9500FF] p-1 rounded-md text-white align-middle hover:bg-[#7a00cc]"
            disabled={reportLoadingId === item.id} // Gunakan reportLoadingId
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
    reportLoadingId, // Dependensi diubah
  ]);

  // Fungsi untuk mengunduh laporan HTML
  const handleDownloadHtml = async (targetId, namaGudep) => {
    setReportLoadingId(targetId); // Set loading state
    try {
      // Panggil service yang sudah diupdate untuk HTML
      await downloadHtmlGudep(targetId, namaGudep);
      Swal.fire("Berhasil", "Laporan HTML berhasil diunduh!", "success");
    } catch (err) {
      console.error("❌ Gagal download Laporan HTML:", err);
      Swal.fire(
        "Gagal",
        err.message || "Gagal mengunduh Laporan HTML.",
        "error"
      );
    } finally {
      setReportLoadingId(null); // Reset loading state
    }
  };

  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={kwarranList.map((k) => ({ id: k.nama, nama: k.nama }))}
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
        ]}
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
