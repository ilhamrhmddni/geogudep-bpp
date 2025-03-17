require("dotenv").config();
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const {
  Gudep,
  Kwarran,
  User,
  Geografis,
  Event,
  Prestasi,
  PesertaDidik,
} = require("../models"); // Import your models

// **Fungsi untuk membuat PDF**
const generatePDF = async (htmlContent, fileName) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfPath = path.join(__dirname, `../storage/reports/${fileName}.pdf`);
  if (!fs.existsSync(path.dirname(pdfPath))) {
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  }

  await page.pdf({
    path: pdfPath,
    format: "A4",
  });
  await browser.close();

  return pdfPath;
};

exports.fetchAllDataAndGeneratePDF = async (req, res) => {
  try {
    // Retrieve all Kwarran data
    const allKwaran = await Kwarran.findAll({
      include: [{ model: Gudep, as: "gudepesList" }],
    });

    // Check if Kwarran data exists
    if (!allKwaran.length) {
      return res
        .status(404)
        .json({ message: "Tidak ada data Kwarran yang ditemukan!" });
    }

    // Retrieve all Gudep data with associated models
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Event, as: "gudepesEvents" },
      ],
    });

    // Read the HTML template
    const templatePath = path.join(__dirname, "../views/report-template.html");
    let template = fs.readFileSync(templatePath, "utf-8");

    // Generate rows for Kwarran
    let kwarranRows = allKwaran
      .map(
        (k) => `
      <tr>
        <td>${k.kode || "-"}</td>
        <td>${k.nama || "-"}</td>
        <td>${k.ketua_kwarran || "-"}</td>
        <td>${k.ketua_dkr || "-"}</td>
        <td>${k.email || "-"}</td>
        <td>${k.gudepesList.length || "-"}</td>
      </tr>
    `
      )
      .join("");

    // Generate rows for Gudep
    let gudepRows = allGudep
      .map(
        (g, index) => `
      <tr>
        <td>${index + 1}</td>
       <td>${allKwaran.find((k) => k.id === g.kwarran_id)?.kode || "-"}</td>
        <td>${g.no_gudep || "-"}</td>
        <td>${g.tingkatan || "-"}</td>
        <td>${g.mabigus || "-"}</td>
        <td>${g.pembina || "-"}</td>
        <td>${g.pelatih || "-"}</td>
        <td>${g.email || "-"}</td>
        <td>${g.jumlah_putra || "-"}</td>
        <td>${g.jumlah_putri || "-"}</td> 
      </tr>
    `
      )
      .join("");

    let geografisRows = allGudep
      .flatMap((g) => g.geografises || []) // Ensure we always return an array
      .map(
        (geo) => `
      <tr>
      <td>${
        allKwaran.find(
          (k) =>
            k.id ===
            (allGudep.find((g) => g.id === geo.gudep_id)?.kwarran_id || null)
        )?.kode || "-"
      }</td>
      <td>${
        geo.gudep_id
          ? allGudep.find((k) => k.id === geo.gudep_id)?.no_gudep || "-"
          : "-"
      }</td>
        <td>${geo.koordinat || "-"}</td>
        <td>${geo.alamat || "-"}</td>
      </tr>
    `
      )
      .join("");

    // Generate rows for Event
    let eventRows = allGudep
      .flatMap((g) => g.gudepesEvents)
      .map(
        (e) => `
      <tr>
        <td>${e.nama || "-"}</td>
        <td>${new Date(e.tanggal_mulai).toLocaleDateString() || "-"}</td>
        <td>${new Date(e.tanggal_selesai).toLocaleDateString() || "-"}</td>
        <td>${e.tempat || "-"}</td>
        <td>${e.tingkat || "-"}</td>
        <td>${e.penyelenggara || "-"}</td>

      </tr>
    `
      )
      .join("");

    // Replace placeholders in the template
    const currentDate = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    template = template
      .replace(/{{{title}}}/g, "Laporan Lengkap Gudep dan Kwarran")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows)
      .replace("{{{eventRows}}}", eventRows);

    // Generate PDF
    const pdfPath = await generatePDF(template, "Data Mukhtahir");

    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Gagal mengambil semua data dan membuat PDF",
      error: error.message,
    });
  }
};

exports.fetchDataById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter request
  try {
    const allEvents = await Event.findAll();

    const gudep = await Gudep.findOne({
      where: { id },
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Prestasi, as: "prestasies" },
        { model: PesertaDidik, as: "pesertaDidikes" },
        { model: Kwarran, as: "kwarranes" }, // Tambah relasi Kwarran
      ],
    });

    if (!gudep) {
      return res.status(404).json({ message: "Gudep tidak ditemukan!" });
    }

    // Baca template HTML
    const templatePath = path.join(
      __dirname,
      "../views/report-template-gudep.html"
    );
    let template = fs.readFileSync(templatePath, "utf-8");

    // Format tanggal lebih lengkap
    const currentDate = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Data Kwarran (jika ada)
    const kwarran = gudep.kwarranes || {};
    const kwarranKode = kwarran.kode || "-";
    const kwarranNama = kwarran.nama || "-";
    const kwarranKetua = kwarran.ketua_kwarran || "-";
    const kwarranKetuaDKR = kwarran.ketua_dkr || "-";
    const kwarranEmail = kwarran.email || "-";

    // Data Gugusdepan (hanya satu karena berdasarkan ID)
    `
        <tr>
          <td>${gudep.no_gudep || "-"}</td>
          <td>${gudep.tingkatan || "-"}</td>
          <td>${gudep.useres?.fullname || "-"}</td>
          <td>${gudep.pembina || "-"}</td>
          <td>${gudep.pelatih || "-"}</td>
          <td>${gudep.email || "-"}</td>
          <td>${gudep.jumlah_laki || "0"}</td>
          <td>${gudep.jumlah_perempuan || "0"}</td>
        </tr>
      `;

    // Data Geografis (hanya satu jika ada)
    const geo = gudep.geografises || {};
    const geoKoordinat = geo.titik_koordinat || "-";
    const geoLong = geo.longitude || "-";
    const geoLat = geo.latitude || "-";
    const geoAlamat = geo.alamat || "-";

    // Data Prestasi (jika ada)
    // Data Prestasi (jika ada)
    // Debugging: Pastikan event yang diambil dari database tidak kosong
    console.log("Semua Event di Gudep:", gudep.eventes);

    // Data Prestasi (jika ada)
    let prestasiRows =
      (gudep.prestasies || [])
        .map((prestasi, index) => {
          const eventName =
            allEvents.find((event) => event.id === prestasi.event_id)?.nama ||
            "-";

          return `
        <tr>
          <td>${index + 1}</td>
         <td>${eventName}</td>
          <td>${prestasi.keterangan || "-"}</td>
        </tr>
      `;
        })
        .join("") || "<tr><td colspan='5'>Tidak ada data prestasi.</td></tr>";

    // Ganti placeholder dalam template HTML
    template = template
      .replace(/{{{title}}}/g, "Laporan Lengkap Gudep")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranKode}}}", kwarranKode)
      .replace("{{{kwarranNama}}}", kwarranNama)
      .replace("{{{kwarranKetua}}}", kwarranKetua)
      .replace("{{{kwarranKetuaDKR}}}", kwarranKetuaDKR)
      .replace("{{{kwarranEmail}}}", kwarranEmail)
      .replace("{{{gudepKode}}}", gudep.no_gudep || "-")
      .replace("{{{gudepTingkatan}}}", gudep.tingkatan || "-")
      .replace("{{{gudepMabigus}}}", gudep.useres?.fullname || "-")
      .replace("{{{gudepPembina}}}", gudep.pembina || "-")
      .replace("{{{gudepPelatih}}}", gudep.pelatih || "-")
      .replace("{{{gudepEmail}}}", gudep.email || "-")
      .replace("{{{gudepJumlahLaki}}}", gudep.jumlah_laki || "0")
      .replace("{{{gudepJumlahPerempuan}}}", gudep.jumlah_perempuan || "0")
      .replace("{{{geoKoordinat}}}", geoKoordinat)
      .replace("{{{geoLong}}}", geoLong)
      .replace("{{{geoLat}}}", geoLat)
      .replace("{{{geoAlamat}}}", geoAlamat)
      .replace("{{{eventRows}}}", prestasiRows || ""); // Jika tidak ada prestasi, kosongkan eventRows

    // Buat PDF
    const pdfPath = await generatePDF(template, `detail-gudep-${id}`);

    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error fetching Gudep by ID:", error);
    res.status(500).json({
      message: "Gagal mengambil data berdasarkan ID",
      error: error.message,
    });
  }
};

exports.fetchKwarranById = async (req, res) => {
  const { id } = req.params; // Get the Kwarran ID from the request parameters
  try {
    // Retrieve the specific Kwarran data with associated Gudep data
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Event, as: "gudepesEvents" },
      ],
    });

    const kwarran = await Kwarran.findOne({
      where: { id },
      include: [
        {
          model: Gudep,
          as: "gudepesList",
          include: [
            { model: User, as: "useres" }, // Include User if needed
            { model: Geografis, as: "geografises" }, // Include Geografis if needed
            // Exclude Event data as per your request
          ],
        },
      ],
    });

    if (!kwarran) {
      return res.status(404).json({ message: "Kwarran tidak ditemukan!" });
    }

    // Read the HTML template
    const templatePath = path.join(
      __dirname,
      "../views/report-template-kwarran.html"
    );
    let template = fs.readFileSync(templatePath, "utf-8");

    // Generate rows for Kwarran
    const currentDate = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    let kwarranRows = `
      <tr>
        <td>${kwarran.kode || "-"}</td>
        <td>${kwarran.nama || "-"}</td>
        <td>${kwarran.ketua_kwarran || "-"}</td>
        <td>${kwarran.ketua_dkr || "-"}</td>
        <td>${kwarran.email || "-"}</td>
        <td>${kwarran.gudepesList.length || "-"}</td>
      </tr>
    `;

    // Generate rows for Gudep in Kwarran
    let gudepRows = kwarran.gudepesList
      .map((g, index) => {
        return `
      <tr>
        <td>${index + 1}</td>
        <td>${kwarran.kode || "-"}</td>
        <td>${g.no_gudep || "-"}</td>
        <td>${g.tingkatan || "-"}</td>
        <td>${g.mabigus || "-"}</td>
        <td>${g.pembina || "-"}</td>
        <td>${g.pelatih || "-"}</td>
        <td>${g.email || "-"}</td>
        <td>${g.jumlah_putra || "-"}</td>
        <td>${g.jumlah_putri || "-"}</td>
      </tr>
    `;
      })
      .join("");

    // Generate rows for Geografis associated with each Gudep
    let geografisRows = kwarran.gudepesList
      .flatMap((g) => g.geografises || [])
      .map(
        (geo) => `
      <tr>
       <td>${kwarran.kode || "-"}</td>
        <td>${
          geo.gudep_id
            ? allGudep.find((g) => g.id === geo.gudep_id)?.no_gudep || "-"
            : "-"
        }</td>
        <td>${geo.koordinat || "-"}</td>
        <td>${geo.alamat || "-"}</td>
      </tr>
    `
      )
      .join("");

    // Replace placeholders in the template
    template = template
      .replace("{{title}}", `Laporan Detail Kwarran ${kwarran.nama || "-"}`)
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{geografisRows}}}", geografisRows);

    // Generate PDF
    const pdfPath = await generatePDF(template, `detail-kwarran-${id}`);

    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error fetching Kwarran by ID:", error);
    res.status(500).json({
      message: "Gagal mengambil Kwarran berdasarkan ID",
      error: error.message,
    });
  }
};
