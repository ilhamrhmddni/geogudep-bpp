const formatDateClient = (
  dateStr,
  options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Makassar",
  }
) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split(/[-T:.Z]/);
      if (parts.length >= 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let hour = 0,
          minute = 0,
          second = 0;
        if (parts.length >= 6) {
          hour = parseInt(parts[3], 10);
          minute = parseInt(parts[4], 10);
          second = parseInt(parts[5], 10);
        }
        const validDate = new Date(
          Date.UTC(year, month, day, hour, minute, second)
        );
        if (!isNaN(validDate.getTime())) {
          return validDate.toLocaleDateString("id-ID", options);
        }
      }
      return "-";
    }
    return date.toLocaleDateString("id-ID", options);
  } catch (e) {
    console.warn("Error formatting date:", dateStr, e);
    return "-";
  }
};

const formatDateTimeClient = (dateStrInput) => {
  if (!dateStrInput) {
    console.warn("[formatDateTimeClient] Menerima input tanggal kosong/null.");
    return "-";
  }
  let date;
  date = new Date(dateStrInput);

  if (isNaN(date.getTime())) {
    console.error(
      "[formatDateTimeClient] Gagal mem-parse input tanggal:",
      dateStrInput
    );
    return "- (Invalid Date)";
  }

  try {
    return date.toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });
  } catch (e) {
    console.error("[formatDateTimeClient] Error saat toLocaleString:", e);
    return "- (Formatting Error)";
  }
};

const getReportStyles = (templateName = "umum") => {
  let commonStyles = `
      body {
        font-family: 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif; /* Pilihan font modern dengan fallback */
        color: #333; /* Warna teks utama sedikit lebih lembut */
        margin: 0;
        padding: 0;
        background-color: #fff; /* Latar belakang putih bersih */
        font-size: 9pt; /* Ukuran font dasar untuk konsistensi, bisa disesuaikan per template */
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed; /* Anda menandai ini penting, jadi kita pertahankan */
        margin-bottom: 20px; /* Jarak lebih antar tabel */
        font-size: inherit; /* Mewarisi font-size dari parent */
        /* box-shadow: 0 1px 3px rgba(0,0,0,0.08); /* Bayangan halus opsional */
      }
      th, td {
        border: 1px solid #e0e0e0; /* Border lebih lembut */
        padding: 8px 10px; /* Padding lebih nyaman */
        text-align: left;
        vertical-align: top;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      th {
        background-color: #f5f5f5; /* Latar belakang header tabel sangat lembut */
        font-weight: 600; /* Sedikit lebih tebal */
        color: #444; /* Warna teks header */
        text-transform: capitalize; /* Huruf kapital di awal kata */
        font-size: 0.95em; /* Relatif terhadap font-size tabel */
      }
      h2 { /* Judul Utama Laporan */
        text-align: center;
        margin-top: 5mm; /* Beri jarak dari atas halaman jika ini judul pertama */
        margin-bottom: 8mm;
        font-size: 18pt; /* Lebih besar dan jelas */
        color: #2c3e50; /* Warna biru tua yang elegan */
        font-weight: 600;
        padding-bottom: 3mm;
        border-bottom: 2px solid #3498db; /* Garis bawah aksen biru */
      }
      p.subtitle {
        text-align: center;
        margin-top: -5mm; /* Lebih dekat ke judul utama */
        margin-bottom: 10mm;
        font-size: 10pt;
        color: #7f8c8d; /* Abu-abu lembut untuk subjudul */
      }
      h3 { /* Judul Bagian (misal: Data Kwarran, Data Gudep) */
        page-break-after: avoid;
        margin-top: 10mm;
        margin-bottom: 5mm;
        font-size: 13pt;
        color: #34495e; /* Warna biru abu-abu */
        border-bottom: 1px solid #bdc3c7; /* Garis bawah halus */
        padding-bottom: 2mm;
        font-weight: 600;
      }

      /* Style untuk tabel detail (key-value) pada laporan Kwarran & Gudep */
      .detail-table {
        border: 1px solid #e0e0e0; /* Border luar tipis untuk grup info */
        box-shadow: none;
      }
      .detail-table th, .detail-table td {
        border: none; /* Hilangkan border sel individual */
        padding: 7px 10px;
        font-size: 9.5pt; /* Sedikit lebih besar untuk keterbacaan detail */
      }
      .detail-table tr:not(:last-child) td,
      .detail-table tr:not(:last-child) th {
         border-bottom: 1px dotted #eee; /* Garis putus-putus antar baris */
      }
      .detail-table th { /* Kolom 'key' atau label */
        background-color: transparent;
        color: #555;
        font-weight: 600; /* Label tebal */
        text-transform: none;
        width: 25%; /* Alokasikan lebar untuk label, bisa disesuaikan */
      }
      .detail-table td { /* Kolom 'value' */
        color: #333;
        width: 75%; /* Alokasikan sisa lebar untuk nilai */
      }

      /* Baris zebra untuk tabel data umum (bukan .detail-table) */
      table:not(.detail-table) tbody tr:nth-child(even) {
        background-color: #fbfbfb; /* Warna zebra sangat lembut */
      }
      /* Hindari baris zebra mengganggu style hover (jika ada, lebih relevan untuk web interaktif) */
      /* table:not(.detail-table) tbody tr:hover {
        background-color: #f0f0f0;
      } */

      .debug-border {
        border: 1px dashed red !important;
      }
    `;

  let pageSpecificStyles = "";

  // Ekstrak konten <style> dari template HTML yang diberikan sebelumnya
  const extractCss = (htmlString) => {
    const styleMatch = htmlString.match(/<style>([\s\S]*?)<\/style>/i);
    return styleMatch && styleMatch[1] ? styleMatch[1].trim() : "";
  };

  if (templateName === "umum") {
    // CSS asli Anda dari report-template.html
    const umumHtmlStyles = `
      <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{{{title}}}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; word-wrap: break-word; white-space: normal; }
        h3 { page-break-after: avoid; font-size: 12px; margin-top: 10px; margin-bottom: 5px; }
        h2 { font-size: 14px; margin-top: 5px; margin-bottom: 5px; }
        p { font-size: 10px; margin-top: 5px; margin-bottom: 5px; }
        @media print { body { margin: 0; } table { page-break-inside: auto; } }
      </style></head></html>`;
    pageSpecificStyles = extractCss(umumHtmlStyles);
    // Tambahkan override atau tambahan jika perlu, contoh:
    pageSpecificStyles += `
        body { font-size: 9pt; } /* Override jika commonStyles tidak cukup */
        h2 { font-size: 16pt; margin-bottom: 6mm;}
        h3 { font-size: 12pt; margin-bottom: 4mm;}
        /* Jika ada kolom dengan lebar tetap yang sangat penting untuk template 'umum' */
        /* th.nama-kegiatan { width: 25% !important; } */
    `;
  } else if (templateName === "gudep") {
    const gudepHtmlStyles = `
      <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{{{title}}}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; word-wrap: break-word; white-space: normal; }
        h3 { page-break-after: avoid; font-size: 13px; margin-top: 10px; margin-bottom: 5px; }
        h2 { font-size: 15px; margin-top: 5px; margin-bottom: 5px; }
        p { font-size: 11px; margin-top: 5px; margin-bottom: 5px; }
        @media print { body { margin: 0; } table { page-break-inside: auto; } }
      </style></head></html>`;
    pageSpecificStyles = extractCss(gudepHtmlStyles);
    pageSpecificStyles += `
        body { font-size: 9.5pt; }
        h2 { font-size: 17pt; }
        h3 { font-size: 12.5pt; }
        /* Untuk .detail-table pada gudep, pastikan lebar th nya cukup */
        /* .detail-table th { width: 30% !important; }  /* commonStyles sudah mencoba set 25%, override jika perlu */
    `;
  } else if (templateName === "kwarran") {
    const kwarranHtmlStyles = `
      <!DOCTYPE html><html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{{{title}}}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; word-wrap: break-word; white-space: normal; }
        h3 { page-break-after: avoid; font-size: 13px; margin-top: 10px; margin-bottom: 5px; }
        h2 { font-size: 15px; margin-top: 5px; margin-bottom: 5px; }
        p { font-size: 11px; margin-top: 5px; margin-bottom: 5px; }
        @media print { body { margin: 0; } table { page-break-inside: auto; } }
      </style></head></html>`;
    pageSpecificStyles = extractCss(kwarranHtmlStyles);
    pageSpecificStyles += `
        body { font-size: 9.5pt; }
        h2 { font-size: 17pt; }
        h3 { font-size: 12.5pt; }
    `;
  }

  return `<style>\n${commonStyles}\n${pageSpecificStyles}\n</style>`;
};

export const renderAllDataHTMLForClient = (reportRenderData) => {
  const {
    title = "Laporan Lengkap Data Pramuka Balikpapan",
    currentDate, // Ini akan berupa string tanggal dari backend
    allKwarran = [],
    allGudep = [],
    allEvent = [], // Pastikan backend mengirim data ini dalam reportRenderData.allEvent
    // Asumsi `allGeografis` sekarang adalah bagian dari `allGudep` atau Anda fetch terpisah
  } = reportRenderData;

  const kwarranRows = allKwarran
    .map(
      (k) => `
      <tr>
        <td style="width: 10%">${k.kode || "-"}</td>
        <td style="width: 20%">${k.nama || "-"}</td>
        <td style="width: 20%">${k.ketua_kwarran || "-"}</td>
        <td style="width: 20%">${k.ketua_dkr || "-"}</td>
        <td style="width: 25%">${k.email || "-"}</td>
        <td style="width: 5%">${
          k.gudepesList?.length || k.jumlah_gudep || 0
        }</td>
      </tr>`
    )
    .join("");

  const gudepRows = allGudep
    .map(
      (g, i) => `
      <tr>
        <td style="width: 3%">${i + 1}</td>
        <td style="width: 8%">${g.kwarranes?.nama || g.nama_kwarran || "-"}</td>
        <td style="width: 7%">${g.no_gudep || "-"}</td>
        <td style="width: 7%">${g.tingkatan || "-"}</td>
        <td style="width: 10%">${g.pangkalan || "-"}</td>
        <td style="width: 10%">${g.ambalan || "-"}</td>
        <td style="width: 10%">${g.mabigus || "-"}</td>
        <td style="width: 10%">${g.pembina || "-"}</td>
        <td style="width: 10%">${g.pelatih || "-"}</td>
        <td style="width: 18%">${g.email || "-"}</td>
        <td style="width: 3%">${g.jumlah_putra || 0}</td>
        <td style="width: 3%">${g.jumlah_putri || 0}</td>
      </tr>`
    )
    .join("");

  const geografisRows = allGudep
    .filter((g) => g.geografises)
    .map(
      (g, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${g.kwarranes?.nama || "-"}</td>
      <td>${g.no_gudep || "-"}</td>
      <td>${g.geografises?.titik_koordinat || "-"}</td>
      <td>${g.geografises?.alamat || "-"}</td>
    </tr>`
    )
    .join("");

  const eventRows = allEvent
    .map(
      (e, i) => `
      <tr>
        <td style="width: 3%">${i + 1}</td>
        <td style="width: 20%">${e.nama || "-"}</td>
        <td style="width: 12%">${formatDateClient(e.tanggal_mulai)}</td>
        <td style="width: 12%">${formatDateClient(e.tanggal_selesai)}</td>
        <td style="width: 20%">${e.tempat || "-"}</td>
        <td style="width: 15%">${e.tingkat || "-"}</td>
        <td style="width: 18%">${e.penyelenggara || "-"}</td> 
      </tr>`
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${getReportStyles("umum")}
      </head>
      <body>
        <h2>${title}</h2>
        <p class="subtitle">Data ini diambil pada tanggal: ${formatDateTimeClient(
          currentDate
        )}</p>
  
        <h3>Data Kwarran</h3>
        <table>
          <thead><tr><th>Kode</th><th>Nama</th><th>Ketua Kwarran</th><th>Ketua DKR</th><th>Email</th><th>J. Gudep</th></tr></thead>
          <tbody>${
            kwarranRows ||
            "<tr><td colspan='6'>Tidak ada data Kwarran.</td></tr>"
          }</tbody>
        </table>
  
        <h3>Data Gudep</h3>
        <table>
          <thead><tr><th>No</th><th>Kwarran</th><th>No. Gudep</th><th>Tingkatan</th><th>Pangkalan</th><th>Ambalan</th><th>Mabigus</th><th>Pembina</th><th>Pelatih</th><th>Email</th><th>JL</th><th>JP</th></tr></thead>
          <tbody>${
            gudepRows || "<tr><td colspan='12'>Tidak ada data Gudep.</td></tr>"
          }</tbody>
        </table>
  
        <h3>Data Geografis</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No</th> 
        <th style="width: 20%;">Kwarran</th> 
        <th style="width: 20%;">No. Gudep</th> 
        <th style="width: 25%;">Koordinat</th> 
        <th style="width: 30%;">Alamat</th> 
      </tr>
    </thead>
    <tbody>${
      geografisRows || "<tr><td colspan='5'>Tidak ada data geografis.</td></tr>"
    }</tbody>
  </table>
  
        <h3>Data Kegiatan</h3>
        <table>
          <thead><tr><th>No</th><th>Nama Kegiatan</th><th>Tanggal Mulai</th><th>Tanggal Selesai</th><th>Tempat</th><th>Tingkat</th><th>Penyelenggara</th></tr></thead>
          <tbody>${
            eventRows ||
            "<tr><td colspan='7'>Tidak ada data kegiatan.</td></tr>"
          }</tbody>
        </table>
      </body>
      </html>
    `;
};

export const renderKwarranHTMLForClient = (reportRenderData) => {
  const {
    title = "Laporan Kwarran",
    currentDate,
    kwarranDetail,
  } = reportRenderData;
  if (!kwarranDetail)
    return `<html><head><meta charset="UTF-8"><title>Error</title>${getReportStyles(
      "kwarran"
    )}</head><body><h2>Data Kwarran tidak ditemukan.</h2></body></html>`;

  const gudepRows = (kwarranDetail.gudepesList || [])
    .map(
      (g, i) => `
      <tr>
        <td style="width: 5%">${i + 1}</td>
        <td style="width: 8%">${kwarranDetail.nama || "-"}</td>
        <td style="width: 8%">${g.no_gudep || "-"}</td>
        <td style="width: 7%">${g.tingkatan || "-"}</td>
        <td style="width: 10%">${g.pangkalan || "-"}</td>
        <td style="width: 10%">${g.ambalan || "-"}</td>
        <td style="width: 10%">${g.mabigus || "-"}</td>
        <td style="width: 10%">${g.pembina || "-"}</td>
        <td style="width: 10%">${g.pelatih || "-"}</td>
        <td style="width: 18%">${g.email || "-"}</td>
        <td style="width: 3%">${g.jumlah_putra || 0}</td>
        <td style="width: 3%">${g.jumlah_putri || 0}</td>
      </tr>`
    )
    .join("");

  const geografisRows = (kwarranDetail.gudepesList || [])
    .filter((g) => g.geografises)
    .map(
      (g, i) => `
      <tr>
        <td style="width: 5%">${i + 1}</td>
        <td style="width: 15%">${kwarranDetail.nama || "-"}</td>
        <td style="width: 15%">${g.no_gudep || "-"}</td>
        <td style="width: 20%">${g.geografises?.titik_koordinat || "-"}</td> 
        <td style="width: 45%">${g.geografises?.alamat || "-"}</td> 
      </tr>`
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${getReportStyles("kwarran")}
      </head>
      <body>
        <h2>${title}</h2>
        <p class="subtitle">Data ini diambil pada tanggal: ${formatDateTimeClient(
          currentDate
        )}</p>
        <h3>Data Kwarran</h3>
        <table class="detail-table">
          <tr><th style="width: 30%">Kode Kwarran</th><td>${
            kwarranDetail.kode || "-"
          }</td></tr>
          <tr><th style="width: 30%">Nama Kwarran</th><td>${
            kwarranDetail.nama || "-"
          }</td></tr>
          <tr><th style="width: 30%">Ketua Kwarran</th><td>${
            kwarranDetail.ketua_kwarran || "-"
          }</td></tr>
          <tr><th style="width: 30%">Ketua DKR</th><td>${
            kwarranDetail.ketua_dkr || "-"
          }</td></tr>
          <tr><th style="width: 30%">Email</th><td>${
            kwarranDetail.email || "-"
          }</td></tr>
        </table>
  
        <h3>Data Gudep</h3>
        <table>
          <thead><tr><th>No</th><th>Kwarran</th><th>No. Gudep</th><th>Tingkatan</th><th>Pangkalan</th><th>Ambalan</th><th>Mabigus</th><th>Pembina</th><th>Pelatih</th><th>Email</th><th>JL</th><th>JP</th></tr></thead>
          <tbody>${
            gudepRows || "<tr><td colspan='12'>Tidak ada data gudep.</td></tr>"
          }</tbody>
        </table>
  
        <h3>Data Geografis</h3>
        <table>
          <thead><tr><th>No</th><th>Kwarran</th><th>No. Gudep</th><th>Koordinat</th><th>Alamat</th></tr></thead>
          <tbody>${
            geografisRows ||
            "<tr><td colspan='5'>Tidak ada data geografis gudep.</td></tr>"
          }</tbody>
        </table>
      </body>
      </html>
    `;
};

export const renderGudepHTMLForClient = (reportRenderData) => {
  const {
    title = "Laporan Gudep",
    currentDate,
    gudepDetail,
    kwarranInfo,
  } = reportRenderData;
  if (!gudepDetail)
    return `<html><head><meta charset="UTF-8"><title>Error</title>${getReportStyles(
      "gudep"
    )}</head><body><h2>Data Gudep tidak ditemukan.</h2></body></html>`;

  const prestasiRows = (gudepDetail.prestasies || [])
    .map(
      (p, i) => `
      <tr>
        <td style="width: 5%">${i + 1}</td>
        <td style="width: 40%">${p.eventes?.nama || p.event_id || "-"}</td>
        <td style="width: 55%">${p.keterangan || "-"}</td>
      </tr>`
    )
    .join("");

  const pesertaRows = (gudepDetail.pesertaDidikes || [])
    .map(
      (pd, i) => `
      <tr>
        <td style="width: 5%">${i + 1}</td>
        <td style="width: 30%">${pd.nama || "-"}</td>
        <td style="width: 15%">${pd.gender || "-"}</td>
        <td style="width: 25%">${formatDateClient(pd.ttl)}</td>
        <td style="width: 25%">${pd.detailtingkatan || "-"}</td>
      </tr>`
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${getReportStyles("gudep")}
      </head>
      <body>
        <h2>${title}</h2>
        <p class="subtitle">Data ini diambil pada tanggal: ${formatDateTimeClient(
          currentDate
        )}</p>
  
        ${
          kwarranInfo && Object.keys(kwarranInfo).length > 0
            ? `
          <h3>Data Kwarran Terkait</h3>
          <table class="detail-table">
            <tr><th style="width: 30%">Kode Kwarran</th><td>${
              kwarranInfo.kode || "-"
            }</td></tr>
            <tr><th style="width: 30%">Nama Kwarran</th><td>${
              kwarranInfo.nama || "-"
            }</td></tr>
            <tr><th style="width: 30%">Ketua Kwarran</th><td>${
              kwarranInfo.ketua_kwarran || "-"
            }</td></tr>
            <tr><th style="width: 30%">Ketua DKR</th><td>${
              kwarranInfo.ketua_dkr || "-"
            }</td></tr>
            <tr><th style="width: 30%">Email</th><td>${
              kwarranInfo.email || "-"
            }</td></tr>
          </table>`
            : ""
        }
  
        <h3>Data Gugus Depan</h3>
        <table class="detail-table">
          <tr><th style="width: 30%">No. Gudep</th><td>${
            gudepDetail.no_gudep || "-"
          }</td></tr>
          <tr><th style="width: 30%">Pangkalan</th><td>${
            gudepDetail.pangkalan || "-"
          }</td></tr>
          <tr><th style="width: 30%">Ambalan</th><td>${
            gudepDetail.ambalan || "-"
          }</td></tr>
          <tr><th style="width: 30%">Tingkatan</th><td>${
            gudepDetail.tingkatan || "-"
          }</td></tr>
          <tr><th style="width: 30%">Mabigus</th><td>${
            gudepDetail.mabigus || "-"
          }</td></tr>
          <tr><th style="width: 30%">Pembina</th><td>${
            gudepDetail.pembina || "-"
          }</td></tr>
          <tr><th style="width: 30%">Pelatih</th><td>${
            gudepDetail.pelatih || "-"
          }</td></tr>
          <tr><th style="width: 30%">Email</th><td>${
            gudepDetail.email || "-"
          }</td></tr>
          <tr><th style="width: 30%">Jumlah Putra</th><td>${
            gudepDetail.jumlah_putra || 0
          }</td></tr>
          <tr><th style="width: 30%">Jumlah Putri</th><td>${
            gudepDetail.jumlah_putri || 0
          }</td></tr>
        </table>
  
        <h3>Data Geografis</h3>
        <table class="detail-table">
          <tr><th style="width: 30%">Koordinat</th><td>${
            gudepDetail.geografises?.titik_koordinat || "-"
          }</td></tr>
          <tr><th style="width: 30%">Longitude</th><td>${
            gudepDetail.geografises?.longitude || "-"
          }</td></tr>
          <tr><th style="width: 30%">Latitude</th><td>${
            gudepDetail.geografises?.latitude || "-"
          }</td></tr>
          <tr><th style="width: 30%">Alamat</th><td>${
            gudepDetail.geografises?.alamat || "-"
          }</td></tr>
        </table>
  
        <h3>Data Prestasi</h3>
        <table>
          <thead><tr><th>No</th><th>Nama Kegiatan</th><th>Keterangan</th></tr></thead>
          <tbody>${
            prestasiRows ||
            "<tr><td colspan='3'>Tidak ada data prestasi.</td></tr>"
          }</tbody>
        </table>
  
        <h3>Data Peserta Didik</h3>
        <table>
          <thead><tr><th>No</th><th>Nama</th><th>Gender</th><th>Tanggal Lahir</th><th>Detail Tingkatan</th></tr></thead>
          <tbody>${
            pesertaRows ||
            "<tr><td colspan='5'>Tidak ada data peserta didik.</td></tr>"
          }</tbody>
        </table>
      </body>
      </html>
    `;
};
