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
    margin: { top: "33mm", right: "33mm", bottom: "33mm", left: "33mm" },
  });
  await browser.close();

  return pdfPath;
};

// **Fungsi untuk Mengambil Semua Data Gudep dan Kwarran**
// **Fungsi untuk Mengambil Semua Data Gudep dan Kwarran**
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

    // Retrieve all Gudep data
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Event, as: "gudepesEvents" },
        { model: Prestasi, as: "prestasies" },
        { model: PesertaDidik, as: "pesertaDidikes" },
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
        <td>${k.nama || "-"}</td>
        <td>${k.ketua_kwarran || "-"}</td>
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

    // Replace placeholders in the template
    const currentDate = new Date().toLocaleDateString();
    template = template
      .replace("{{title}}", "Laporan Lengkap Gudep dan Kwarran")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{gudepRows}}}", gudepRows);

    // Generate PDF
    const pdfPath = await generatePDF(template, "report-gudep-kwarran");

    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Gagal mengambil semua data dan membuat PDF",
      error: error.message,
    });
  }
};

// **Fungsi untuk Mengambil Gudep Berdasarkan ID**
exports.fetchDataById = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters
  try {
    const gudep = await Gudep.findOne({
      where: { id },
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Event, as: "gudepesEvents" },
        { model: Prestasi, as: "prestasies" },
        { model: PesertaDidik, as: "pesertaDidikes" },
      ],
    });

    if (!gudep) {
      return res.status(404).json({ message: "Gudep tidak ditemukan!" });
    }

    // Read the HTML template
    const templatePath = path.join(__dirname, "../views/report-template.html");
    let template = fs.readFileSync(templatePath, "utf-8");

    // Generate rows for Gudep
    const currentDate = new Date().toLocaleDateString();
    let gudepRows = `
      <tr>
        <td>${gudep.no_gudep || "-"}</td>
        <td>${gudep.tingkatan || "-"}</td>
        <td>${gudep.useres ? gudep.useres.fullname : "-"}</td>
        <td>${gudep.geografises ? gudep.geografises.alamat : "-"}</td>
        <td>${gudep.email || "-"}</td>
      </tr>
    `;

    // Replace placeholders in the template
    template = template
      .replace("{{title}}", `Laporan Detail Gudep ${gudep.no_gudep || "-"}`)
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{kwarranRows}}}", ""); // No Kwarran data for this report

    // Generate PDF
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

// **Fungsi untuk Mengambil Kwarran Berdasarkan ID**
exports.fetchKwarranById = async (req, res) => {
  const { id } = req.params; // Get the Kwarran ID from the request parameters
  try {
    const kwarran = await Kwarran.findOne({
      where: { id },
      include: [{ model: Gudep, as: "gudepesList" }],
    });

    if (!kwarran) {
      return res.status(404).json({ message: "Kwarran tidak ditemukan!" });
    }

    // Read the HTML template
    const templatePath = path.join(__dirname, "../views/report-template.html");
    let template = fs.readFileSync(templatePath, "utf-8");

    // Generate rows for Kwarran
    const currentDate = new Date().toLocaleDateString();
    let kwarranRows = `
      <tr>
        <td>${kwarran.nama || "-"}</td>
        <td>${kwarran.ketua_kwarran || "-"}</td>
        <td>${kwarran.email || "-"}</td>
        <td>${kwarran.gudepesList.length || "-"}</td>
      </tr>
    `;

    // Generate rows for Gudep in Kwarran
    let gudepRows = kwarran.gudepesList
      .map(
        (g, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${g.no_gudep || "-"}</td>
        <td>${g.tingkatan || "-"}</td>
        <td>${g.email || "-"}</td>
      </tr>
    `
      )
      .join("");

    // Replace placeholders in the template
    template = template
      .replace("{{title}}", `Laporan Detail Kwarran ${kwarran.nama || "-"}`)
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{kwarranRows}}}", kwarranRows);

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
