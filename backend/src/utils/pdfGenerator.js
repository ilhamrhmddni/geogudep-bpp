// src/utils/pdfGenerator.js
const Pdfmake = require("pdfmake");
const { Sequelize } = require("sequelize");
const {
  Kwarran,
  Gudep,
  Geografis,
  Event,
  PesertaDidik,
  Prestasi,
  User,
} = require("../models"); // Sesuaikan path jika perlu
const { formatDateIndonesia } = require("./dateUtils");

// Definisikan font (PENTING)
const fonts = {
  Roboto: {
    normal: Buffer.from(
      require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Regular.ttf"],
      "base64"
    ),
    bold: Buffer.from(
      require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Medium.ttf"],
      "base64"
    ),
    italics: Buffer.from(
      require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Italic.ttf"],
      "base64"
    ),
    bolditalics: Buffer.from(
      require("pdfmake/build/vfs_fonts.js").pdfMake.vfs[
        "Roboto-MediumItalic.ttf"
      ],
      "base64"
    ),
  },
};
const printer = new Pdfmake(fonts);

function createPdfBuffer(docDefinition) {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", (err) => reject(err));
      pdfDoc.end();
    } catch (error) {
      console.error("Error in createPdfBuffer:", error);
      reject(error);
    }
  });
}

// --- STYLES (Bisa Anda kembangkan) ---
const commonStyles = {
  // Styles untuk Portrait (P)
  mainTitleP: {
    fontSize: 15,
    bold: true,
    alignment: "center",
    margin: [0, 0, 0, 5],
  },
  subtitleP: { fontSize: 11, alignment: "center", margin: [0, 0, 0, 10] },
  headerP: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
  tableDetailP: { margin: [0, 5, 0, 10], fontSize: 10 }, // Untuk tabel key-value
  tableHeaderDetailP: { bold: true, fontSize: 10, color: "black" },
  dataTableP: { margin: [0, 5, 0, 10], fontSize: 9 }, // Untuk tabel data utama
  tableHeaderP: { bold: true, fontSize: 10, color: "black" },
  italicTextP: { italics: true, fontSize: 9 },
  defaultContentP: { fontSize: 11 },

  // Styles untuk Landscape (L) - mungkin font lebih kecil
  mainTitleL: {
    fontSize: 14,
    bold: true,
    alignment: "center",
    margin: [0, 0, 0, 5],
  },
  subtitleL: { fontSize: 10, alignment: "center", margin: [0, 0, 0, 10] },
  headerL: { fontSize: 12, bold: true, margin: [0, 8, 0, 3] },
  dataTableL: { margin: [0, 5, 0, 10], fontSize: 8 },
  tableHeaderL: { bold: true, fontSize: 9, color: "black" },
  italicTextL: { italics: true, fontSize: 8 },
  defaultContentL: { fontSize: 10 },
};

// --- 1. Definisi untuk Laporan Semua Data (Mirip report-template.html) ---
async function generateAllDataPdfDefinition() {
  console.log("Memulai generateAllDataPdfDefinition");
  // TODO: Ambil semua data yang diperlukan: allKwarran, allGudep (dengan Kwarran dan Geografis), allEvents
  const allKwarranData = await Kwarran.findAll({
    include: [
      {
        model: Gudep,
        as: "gudepesList",
        attributes: ["id"],
        where: { no_gudep: { [Sequelize.Op.ne]: "ADMIN" } },
        required: false,
      },
    ],
    order: [["nama", "ASC"]],
  });
  const allGudepData = await Gudep.findAll({
    where: { no_gudep: { [Sequelize.Op.ne]: "ADMIN" } },
    include: [
      { model: Kwarran, as: "kwarranes", attributes: ["nama"] },
      { model: Geografis, as: "geografises" },
    ],
    order: [
      [{ model: Kwarran, as: "kwarranes" }, "nama", "ASC"],
      ["no_gudep", "ASC"],
    ],
  });
  const allEventData = await Event.findAll({
    order: [["tanggal_mulai", "DESC"]],
  });

  const currentDate = formatDateIndonesia(new Date());
  const title = "Laporan Lengkap Data Pramuka Balikpapan";
  const content = [];

  content.push({ text: title, style: "mainTitleL" });
  content.push({
    text: `Data ini diambil pada tanggal: ${currentDate}`,
    style: "subtitleL",
    marginBottom: 15,
  });

  // A. Data Kwarran
  content.push({ text: "Data Kwartir Ranting", style: "headerL" });
  if (allKwarranData.length > 0) {
    const kwarranTableBody = [
      [
        { text: "Kode", style: "tableHeaderL" },
        { text: "Nama", style: "tableHeaderL" },
        { text: "Ketua Kwarran", style: "tableHeaderL" },
        { text: "Ketua DKR", style: "tableHeaderL" },
        { text: "Email", style: "tableHeaderL" },
        { text: "Jml Gudep", style: "tableHeaderL" },
      ],
      ...allKwarranData.map((k) => [
        k.kode || "-",
        k.nama || "-",
        k.ketua_kwarran || "-",
        k.ketua_dkr || "-",
        k.email || "-",
        (k.gudepesList?.length || 0).toString(),
      ]),
    ];
    content.push({
      style: "dataTableL",
      table: {
        headerRows: 1,
        widths: ["10%", "20%", "20%", "20%", "25%", "5%"],
        body: kwarranTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({ text: "Tidak ada data Kwarran.", style: "italicTextL" });
  }

  // B. Data Gudep
  content.push({ text: "Data Gugus Depan", style: "headerL", marginTop: 10 });
  if (allGudepData.length > 0) {
    const gudepTableBody = [
      [
        { text: "No", style: "tableHeaderL" },
        { text: "Kwarran", style: "tableHeaderL" },
        { text: "No. Gudep", style: "tableHeaderL" },
        { text: "Tingkatan", style: "tableHeaderL" },
        { text: "Pangkalan", style: "tableHeaderL" },
        { text: "Ambalan", style: "tableHeaderL" },
        { text: "Mabigus", style: "tableHeaderL" },
        { text: "Pembina", style: "tableHeaderL" },
        { text: "Pelatih", style: "tableHeaderL" },
        { text: "Email", style: "tableHeaderL" },
        { text: "JL", style: "tableHeaderL" },
        { text: "JP", style: "tableHeaderL" },
      ],
      ...allGudepData.map((g, i) => [
        (i + 1).toString(),
        g.kwarranes?.nama || "-",
        g.no_gudep || "-",
        g.tingkatan || "-",
        g.pangkalan || "-",
        g.ambalan || "-",
        g.mabigus || "-",
        g.pembina || "-",
        g.pelatih || "-",
        g.email || "-",
        (g.jumlah_putra || 0).toString(),
        (g.jumlah_putri || 0).toString(),
      ]),
    ];
    // Sesuaikan widths agar mirip dengan persentase di HTML
    content.push({
      style: "dataTableL",
      table: {
        headerRows: 1,
        widths: [
          "3%",
          "8%",
          "7%",
          "7%",
          "10%",
          "10%",
          "10%",
          "10%",
          "10%",
          "18%",
          "3%",
          "3%",
        ],
        body: gudepTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({ text: "Tidak ada data Gugus Depan.", style: "italicTextL" });
  }

  // C. Data Geografis
  content.push({ text: "Data Geografis", style: "headerL", marginTop: 10 });
  const gudepWithGeoAll = allGudepData.filter((g) => g.geografises);
  if (gudepWithGeoAll.length > 0) {
    const geoTableBody = [
      [
        { text: "No", style: "tableHeaderL" },
        { text: "Kwarran", style: "tableHeaderL" },
        { text: "No. Gudep", style: "tableHeaderL" },
        { text: "Koordinat", style: "tableHeaderL" },
        { text: "Alamat", style: "tableHeaderL" },
      ],
      ...gudepWithGeoAll.map((g, i) => [
        (i + 1).toString(),
        g.kwarranes?.nama || "-",
        g.no_gudep || "-",
        g.geografises.titik_koordinat || "-",
        g.geografises.alamat || "-",
      ]),
    ];
    content.push({
      style: "dataTableL",
      table: {
        headerRows: 1,
        widths: ["3%", "15%", "15%", "30%", "37%"],
        body: geoTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({ text: "Tidak ada data Geografis.", style: "italicTextL" });
  }

  // D. Data Kegiatan
  content.push({ text: "Data Kegiatan", style: "headerL", marginTop: 10 });
  if (allEventData.length > 0) {
    const eventTableBody = [
      [
        { text: "No", style: "tableHeaderL" },
        { text: "Nama Kegiatan", style: "tableHeaderL" },
        { text: "Tgl Mulai", style: "tableHeaderL" },
        { text: "Tgl Selesai", style: "tableHeaderL" },
        { text: "Tempat", style: "tableHeaderL" },
        { text: "Tingkat", style: "tableHeaderL" },
        { text: "Penyelenggara", style: "tableHeaderL" },
      ],
      ...allEventData.map((e, i) => [
        (i + 1).toString(),
        e.nama || "-",
        formatDateIndonesia(e.tanggal_mulai, true),
        formatDateIndonesia(e.tanggal_selesai, true),
        e.tempat || "-",
        e.tingkat || "-",
        e.penyelenggara || "-",
      ]),
    ];
    content.push({
      style: "dataTableL",
      table: {
        headerRows: 1,
        widths: ["3%", "20%", "12%", "12%", "20%", "15%", "18%"],
        body: eventTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({ text: "Tidak ada data Kegiatan.", style: "italicTextL" });
  }

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [42.5, 42.5, 42.5, 42.5],
    content: content,
    styles: commonStyles, // Gunakan commonStyles
    defaultStyle: {
      font: "Roboto",
      fontSize: commonStyles.defaultContentL.fontSize,
    },
  };
}

// --- 2. Definisi untuk Laporan Spesifik Gudep ---
async function generateGudepPdfDefinition(gudepId) {
  console.log("Memulai generateGudepPdfDefinition untuk ID:", gudepId);
  const gudepData = await Gudep.findByPk(gudepId, {
    include: [
      { model: Kwarran, as: "kwarranes" },
      { model: Geografis, as: "geografises" },
      {
        model: Prestasi,
        as: "prestasies",
        include: [{ model: Event, as: "eventes", attributes: ["nama"] }],
      },
      { model: PesertaDidik, as: "pesertaDidikes", order: [["nama", "ASC"]] },
    ],
  });

  if (!gudepData)
    throw new Error(`Data Gudep dengan ID ${gudepId} tidak ditemukan.`);

  const currentDate = formatDateIndonesia(new Date());
  const title = `Laporan Gugus Depan ${
    gudepData.pangkalan || gudepData.no_gudep || gudepId
  }`;
  const kwarranInfo = gudepData.kwarranes || {};
  const geoInfo = gudepData.geografises || {};
  const content = [];

  content.push({ text: title, style: "mainTitleP" });
  content.push({
    text: `Data ini diambil pada tanggal: ${currentDate}`,
    style: "subtitleP",
    marginBottom: 15,
  });

  // A. Data Kwarran Terkait
  content.push({ text: "Data Kwartir Ranting Terkait", style: "headerP" });
  content.push({
    style: "tableDetailP",
    table: {
      widths: ["30%", "70%"],
      body: [
        [
          { text: "Kode Kwarran", style: "tableHeaderDetailP" },
          kwarranInfo.kode || "-",
        ],
        [
          { text: "Nama Kwarran", style: "tableHeaderDetailP" },
          kwarranInfo.nama || "-",
        ],
        [
          { text: "Ketua Kwarran", style: "tableHeaderDetailP" },
          kwarranInfo.ketua_kwarran || "-",
        ],
        [
          { text: "Ketua DKR", style: "tableHeaderDetailP" },
          kwarranInfo.ketua_dkr || "-",
        ],
        [
          { text: "Email Kwarran", style: "tableHeaderDetailP" },
          kwarranInfo.email || "-",
        ],
      ],
    },
    layout: "noBorders",
  });

  // B. Data Gudep
  content.push({ text: "Data Gugus Depan", style: "headerP", marginTop: 10 });
  content.push({
    style: "tableDetailP",
    table: {
      widths: ["30%", "70%"],
      body: [
        [
          { text: "No. Gudep", style: "tableHeaderDetailP" },
          gudepData.no_gudep || "-",
        ],
        [
          { text: "Pangkalan", style: "tableHeaderDetailP" },
          gudepData.pangkalan || "-",
        ],
        [
          { text: "Ambalan", style: "tableHeaderDetailP" },
          gudepData.ambalan || "-",
        ],
        [
          { text: "Tingkatan", style: "tableHeaderDetailP" },
          gudepData.tingkatan || "-",
        ],
        [
          { text: "Mabigus", style: "tableHeaderDetailP" },
          gudepData.mabigus || "-",
        ],
        [
          { text: "Pembina", style: "tableHeaderDetailP" },
          gudepData.pembina || "-",
        ],
        [
          { text: "Pelatih", style: "tableHeaderDetailP" },
          gudepData.pelatih || "-",
        ],
        [
          { text: "Email Gudep", style: "tableHeaderDetailP" },
          gudepData.email || "-",
        ],
        [
          { text: "Jumlah Putra", style: "tableHeaderDetailP" },
          (gudepData.jumlah_putra || 0).toString(),
        ],
        [
          { text: "Jumlah Putri", style: "tableHeaderDetailP" },
          (gudepData.jumlah_putri || 0).toString(),
        ],
      ],
    },
    layout: "noBorders",
  });

  // C. Data Geografis
  content.push({ text: "Data Geografis", style: "headerP", marginTop: 10 });
  content.push({
    style: "tableDetailP",
    table: {
      widths: ["30%", "70%"],
      body: [
        [
          { text: "Koordinat", style: "tableHeaderDetailP" },
          geoInfo.titik_koordinat || "-",
        ],
        [
          { text: "Longitude", style: "tableHeaderDetailP" },
          geoInfo.longitude || "-",
        ],
        [
          { text: "Latitude", style: "tableHeaderDetailP" },
          geoInfo.latitude || "-",
        ],
        [
          { text: "Alamat", style: "tableHeaderDetailP" },
          geoInfo.alamat || "-",
        ],
      ],
    },
    layout: "noBorders",
  });

  // D. Data Prestasi
  content.push({ text: "Data Prestasi", style: "headerP", marginTop: 10 });
  if (gudepData.prestasies && gudepData.prestasies.length > 0) {
    const prestasiTableBody = [
      [
        { text: "No", style: "tableHeaderP" },
        { text: "Nama Kegiatan", style: "tableHeaderP" },
        { text: "Keterangan", style: "tableHeaderP" },
      ],
      ...gudepData.prestasies.map((p, i) => [
        (i + 1).toString(),
        p.eventes?.nama || p.event_id || "-",
        p.keterangan || "-",
      ]),
    ];
    content.push({
      style: "dataTableP",
      table: {
        headerRows: 1,
        widths: ["5%", "40%", "55%"],
        body: prestasiTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({ text: "Tidak ada data prestasi.", style: "italicTextP" });
  }

  // E. Data Peserta Didik
  content.push({ text: "Data Peserta Didik", style: "headerP", marginTop: 10 });
  if (gudepData.pesertaDidikes && gudepData.pesertaDidikes.length > 0) {
    const pesertaTableBody = [
      [
        { text: "No", style: "tableHeaderP" },
        { text: "Nama", style: "tableHeaderP" },
        { text: "Gender", style: "tableHeaderP" },
        { text: "TTL", style: "tableHeaderP" },
        { text: "Tingk. Det.", style: "tableHeaderP" },
      ],
      ...gudepData.pesertaDidikes.map((pd, i) => [
        (i + 1).toString(),
        pd.nama || "-",
        pd.gender || "-",
        formatDateIndonesia(pd.ttl, true) || "-",
        pd.detailtingkatan || "-",
      ]),
    ];
    content.push({
      style: "dataTableP",
      table: {
        headerRows: 1,
        widths: ["5%", "30%", "15%", "25%", "25%"],
        body: pesertaTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({
      text: "Tidak ada data peserta didik.",
      style: "italicTextP",
    });
  }

  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [42.5, 42.5, 42.5, 42.5],
    content: content,
    styles: commonStyles,
    defaultStyle: {
      font: "Roboto",
      fontSize: commonStyles.defaultContentP.fontSize,
    },
  };
}

// --- 3. Definisi untuk Laporan Spesifik Kwarran ---
async function generateKwarranPdfDefinition(kwarranId) {
  console.log("Memulai generateKwarranPdfDefinition untuk ID:", kwarranId);
  const kwarranData = await Kwarran.findByPk(kwarranId, {
    include: [
      {
        model: Gudep,
        as: "gudepesList",
        where: { no_gudep: { [Sequelize.Op.ne]: "ADMIN" } },
        required: false,
        include: [{ model: Geografis, as: "geografises" }],
        order: [["no_gudep", "ASC"]],
      },
    ],
  });

  if (!kwarranData)
    throw new Error(`Data Kwarran dengan ID ${kwarranId} tidak ditemukan.`);

  const currentDate = formatDateIndonesia(new Date());
  const title = `Laporan Kwartir Ranting ${kwarranData.nama || kwarranId}`;
  const content = [];

  content.push({ text: title, style: "mainTitleP" });
  content.push({
    text: `Data ini diambil pada tanggal: ${currentDate}`,
    style: "subtitleP",
    marginBottom: 15,
  });

  // A. Data Kwarran
  content.push({ text: "Data Kwartir Ranting", style: "headerP" });
  content.push({
    style: "tableDetailP",
    table: {
      widths: ["30%", "70%"],
      body: [
        [
          { text: "Kode Kwarran", style: "tableHeaderDetailP" },
          kwarranData.kode || "-",
        ],
        [
          { text: "Nama Kwarran", style: "tableHeaderDetailP" },
          kwarranData.nama || "-",
        ],
        [
          { text: "Ketua Kwarran", style: "tableHeaderDetailP" },
          kwarranData.ketua_kwarran || "-",
        ],
        [
          { text: "Ketua DKR", style: "tableHeaderDetailP" },
          kwarranData.ketua_dkr || "-",
        ],
        [
          { text: "Email", style: "tableHeaderDetailP" },
          kwarranData.email || "-",
        ],
        [
          { text: "Jumlah Gudep Aktif", style: "tableHeaderDetailP" },
          (kwarranData.gudepesList?.length || 0).toString(),
        ],
      ],
    },
    layout: "noBorders",
  });

  // B. Data Gudep di bawah Kwarran
  content.push({
    text: "Data Gugus Depan di Bawah Kwarran Ini",
    style: "headerP",
    marginTop: 10,
  });
  if (kwarranData.gudepesList && kwarranData.gudepesList.length > 0) {
    const gudepTableBody = [
      [
        { text: "No", style: "tableHeaderP" },
        { text: "No. Gudep", style: "tableHeaderP" },
        { text: "Tingkatan", style: "tableHeaderP" },
        { text: "Pangkalan", style: "tableHeaderP" },
        { text: "Ambalan", style: "tableHeaderP" },
        { text: "Mabigus", style: "tableHeaderP" },
        { text: "Pembina", style: "tableHeaderP" },
        { text: "Pelatih", style: "tableHeaderP" },
        { text: "Email", style: "tableHeaderP" },
        { text: "JL", style: "tableHeaderP" },
        { text: "JP", style: "tableHeaderP" },
      ],
      ...kwarranData.gudepesList.map((gudep, index) => [
        (index + 1).toString(),
        gudep.no_gudep || "-",
        gudep.tingkatan || "-",
        gudep.pangkalan || "-",
        gudep.ambalan || "-",
        gudep.mabigus || "-",
        gudep.pembina || "-",
        gudep.pelatih || "-",
        gudep.email || "-",
        (gudep.jumlah_putra || 0).toString(),
        (gudep.jumlah_putri || 0).toString(),
      ]),
    ];
    // Widths disesuaikan dengan template HTML Kwarran untuk bagian Gudep
    content.push({
      style: "dataTableP",
      table: {
        headerRows: 1,
        widths: [
          "5%",
          "8%",
          "7%",
          "10%",
          "10%",
          "10%",
          "10%",
          "10%",
          "18%",
          "3%",
          "3%",
        ],
        body: gudepTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({
      text: "Tidak ada data Gugus Depan untuk Kwarran ini.",
      style: "italicTextP",
    });
  }

  // C. Data Geografis Gudep di bawah Kwarran
  content.push({
    text: "Data Geografis Gugus Depan",
    style: "headerP",
    marginTop: 10,
  });
  const gudepWithGeoKwarran =
    kwarranData.gudepesList?.filter((g) => g.geografises) || [];
  if (gudepWithGeoKwarran.length > 0) {
    const geoTableBody = [
      [
        { text: "No", style: "tableHeaderP" },
        { text: "No. Gudep", style: "tableHeaderP" },
        { text: "Koordinat", style: "tableHeaderP" },
        { text: "Alamat", style: "tableHeaderP" },
      ],
      ...gudepWithGeoKwarran.map((gudep, index) => [
        (index + 1).toString(),
        gudep.no_gudep || "-",
        gudep.geografises.titik_koordinat || "-",
        gudep.geografises.alamat || "-",
      ]),
    ];
    // Widths disesuaikan dengan template HTML Kwarran untuk bagian Geografis
    content.push({
      style: "dataTableP",
      table: {
        headerRows: 1,
        widths: ["5%", "15%", "15%", "65%"],
        body: geoTableBody,
      },
      layout: "lightHorizontalLines",
    });
  } else {
    content.push({
      text: "Tidak ada data geografis untuk Gugus Depan di Kwarran ini.",
      style: "italicTextP",
    });
  }

  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [42.5, 42.5, 42.5, 42.5],
    content: content,
    styles: commonStyles,
    defaultStyle: {
      font: "Roboto",
      fontSize: commonStyles.defaultContentP.fontSize,
    },
  };
}

module.exports = {
  createPdfBuffer,
  generateAllDataPdfDefinition,
  generateGudepPdfDefinition,
  generateKwarranPdfDefinition,
};
