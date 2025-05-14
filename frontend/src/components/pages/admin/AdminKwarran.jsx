// src/components/pages/admin/AdminKwarran.jsx
import html2pdf from "html2pdf.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { deleteKwarran, fetchKwarran } from "../../../services/KwarranService";
import { prepareDataForDirectClientPdf } from "../../../services/LaporanService";
import { renderKwarranHTMLForClient } from "../../../utils/clientSideReportRenderer";

import AdminHeader from "../../atoms/AdminHeader";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableCRUD from "../../moleculs/TableCRUD";
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
  if (level === "kwarran" && targetEntityInfo) {
    entityName = `Kwarran_${(
      targetEntityInfo.nama || `ID_${targetEntityInfo.id}`
    ).replace(/[^\w.-]+/g, "_")}`;
  } else {
    entityName = `${level || "Unknown"}_${targetEntityInfo?.id || "NoID"}`;
  }
  baseName += entityName.replace(/[^\w.-]+/g, "_");
  return `${baseName}_${timestamp}.pdf`;
};

const AdminKwarran = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLoadingId, setReportLoadingId] = useState(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchKwarran();
      setData(Array.isArray(result?.data) ? result.data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Gagal mengambil data Kwarran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "kode", label: "Kode", width: "w-1/12" },
      { key: "nama", label: "Nama", width: "w-2/12" },
      { key: "ketua_kwarran", label: "Ketua Kwarran", width: "w-2/12" },
      { key: "ketua_dkr", label: "Ketua DKR", width: "w-2/12" },
      { key: "jumlah_gudep", label: "Jml Gudep", width: "w-1/12" },
      { key: "email", label: "Email", width: "w-1/12" },
      { key: "actions", label: "Aksi CRUD", width: "w-1/12" },
      { key: "download", label: "PDF", width: "w-1/12" },
    ],
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

    console.log("Opsi html2pdf (Kwarran):", finalPdfOptions);
    try {
      await html2pdf().set(finalPdfOptions).from(element).save();
      // Untuk direct download per item, biasanya tidak ada update status ke Laporan
      return pdfFilename;
    } catch (genError) {
      console.error(
        "Error saat generate PDF Kwarran dengan html2pdf:",
        genError
      );
      throw genError;
    }
  };

  const handleDownloadClientPdfForKwarran = useCallback(async (kwarranItem) => {
    if (!kwarranItem || !kwarranItem.id) {
      Swal.fire("Error", "Item Kwarran invalid.", "error");
      return;
    }
    setReportLoadingId(kwarranItem.id);
    Swal.fire({
      title: "Memproses...",
      text: `Siapkan data PDF untuk ${kwarranItem.nama}...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const prepared = await prepareDataForDirectClientPdf({
        level: "kwarran",
        targetId: kwarranItem.id,
        namaKwarran: kwarranItem.nama,
      });
      if (!prepared || !prepared.reportRenderData)
        throw new Error("Data render PDF Kwarran tidak diterima.");
      Swal.update({ text: "Data diterima. Membuat PDF..." });

      const htmlString = renderKwarranHTMLForClient(prepared.reportRenderData);
      const pdfGenOpts = { level: "kwarran", orientation: "portrait" }; // Kwarran biasanya portrait

      const fname = await generatePdfFromHtmlViaClient(
        htmlString,
        pdfGenOpts,
        null,
        prepared.targetEntityInfo || {
          id: kwarranItem.id,
          nama: kwarranItem.nama,
        },
        true
      );
      Swal.fire("Sukses!", `PDF Kwarran "${fname}" diunduh.`, "success");
    } catch (err) {
      Swal.fire(
        "Gagal Proses",
        `Gagal buat PDF Kwarran: ${err.message}`,
        "error"
      );
    } finally {
      setReportLoadingId(null);
      if (Swal.isVisible() && Swal.isLoading()) {
        Swal.close();
      }
    }
  }, []);

  const handleEdit = useCallback(
    (item) => navigate(`/admin/kwarran/edit/${item.id}`),
    [navigate]
  );
  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Hapus data Kwarran ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7a00cc",
        cancelButtonColor: "#9500FF",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });
      if (result.isConfirmed) {
        try {
          await deleteKwarran(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data Kwarran dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Gagal menghapus data.",
          });
        }
      }
    },
    [setData]
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (Array.isArray(data) ? data : [])
      .filter((item) =>
        Object.values(item).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        )
      )
      .map((item, index) => ({
        ...item,
        no: index + 1,
        jumlah_gudep: item.gudepesList?.length || item.jumlah_gudep || 0,
        download: (
          <button
            onClick={() => handleDownloadClientPdfForKwarran(item)}
            className="material-icons bg-[#9500FF] text-white p-1 rounded-md hover:bg-[#7a00cc] text-sm"
            disabled={reportLoadingId === item.id}
            title="Unduh Laporan PDF Kwarran (Klien)"
          >
            {reportLoadingId === item.id ? "..." : "picture_as_pdf"}
          </button>
        ),
      }));
  }, [data, searchQuery, reportLoadingId, handleDownloadClientPdfForKwarran]);

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Kwarran"
            showSearch={true}
            showAddButton={true}
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onAddClick={() => navigate("/admin/kwarran/add")}
          />
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredData.length === 0 ? (
              <NoDataMessage message="Data Kwarran tidak ditemukan." />
            ) : (
              <TableCRUD
                headers={headers}
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};
export default AdminKwarran;
