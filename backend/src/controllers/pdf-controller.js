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
  Laporan,
} = require("../models");

// **Fungsi untuk membuat PDF**
const generatePDF = async (htmlContent, fileName) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfPath = path.join(__dirname, `../storage/reports/${fileName}.pdf`);
  if (!fs.existsSync(path.dirname(pdfPath))) {
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  }

  await page.pdf({ path: pdfPath, format: "A4" });
  await browser.close();

  return pdfPath;
};

// **Fungsi untuk mengirim email**
const sendEmailWithPDF = async (email, pdfPath, subject) => {
  if (!fs.existsSync(pdfPath)) {
    throw new Error("File PDF tidak ditemukan!");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject || "Laporan Gudep",
    text: "Laporan Gudep telah diekspor ke PDF. Silakan lihat lampiran.",
    attachments: [{ filename: "report.pdf", path: pdfPath }],
  };

  await transporter.sendMail(mailOptions);
};

// **Ekspor Semua Gudep (Jika Status "Setujui")**
exports.exportAll = async (req, res) => {
  try {
    const gudepData = await Gudep.findAll({
      include: [
        { model: Kwarran, as: "kwarran" },
        Geografis,
        { model: Event, as: "gudepEvent" },
        { model: Prestasi, as: "gudepPrestasi" },
        PesertaDidik,
        {
          model: Laporan,
          as: "laporan",
          where: { status: "Setujui" }, // Filter Laporan by status
          required: true,
        },
      ],
    });

    if (!gudepData.length) {
      return res
        .status(404)
        .json({ message: "Tidak ada Gudep yang siap diekspor!" });
    }

    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath)) {
      return res
        .status(500)
        .json({ message: "Template HTML tidak ditemukan!" });
    }

    let htmlContent = fs.readFileSync(templatePath, "utf8");
    const currentDate = new Date().toLocaleDateString();
    const tableRows = gudepData
      .map(
        (g, i) =>
          `<tr><td>${i + 1}</td><td>${g.no_gudep}</td><td>${
            g.tingkatan
          }</td></tr>`
      )
      .join("");

    htmlContent = htmlContent
      .replace("{{{title}}}", "Laporan Seluruh Gudep")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{gudep}}}", tableRows);

    const pdfPath = await generatePDF(htmlContent, "all-gudep");
    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error exporting all Gudep:", error);
    res
      .status(500)
      .json({ message: "Gagal ekspor semua Gudep", error: error.message });
  }
};

// **Ekspor Detail Gudep Berdasarkan ID**
exports.exportByGudep = async (req, res) => {
  try {
    const { id } = req.params; // Get the Gudep ID from the request parameters
    const gudep = await Gudep.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "useres", // Use the correct alias for User
        },
        {
          model: Kwarran,
          as: "kwarranes", // Use the correct alias for Kwarran
        },
        {
          model: Geografis,
          as: "Geografises", // Use the correct alias for Geografis
        },
        {
          model: PesertaDidik,
          as: "PesertaDidikes", // Use the correct alias for PesertaDidik
        },
        {
          model: Event,
          as: "gudepesEvent", // Use the correct alias for Event
        },
        {
          model: Prestasi,
          as: "gudepesPrestasi", // Use the correct alias for Prestasi
        },
        {
          model: Laporan,
          as: "laporanes", // Use the correct alias for Laporan
        },
      ],
    });

    if (!gudep) {
      return res.status(404).json({ message: "Gudep tidak ditemukan!" });
    }

    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath)) {
      return res
        .status(500)
        .json({ message: "Template HTML tidak ditemukan!" });
    }

    let htmlContent = fs
      .readFileSync(templatePath, "utf8")
      .replace("{{{title}}}", `Laporan Gudep ${gudep.no_gudep}`)
      .replace(
        "{{{gudep}}}",
        `<tr><td>1</td><td>${gudep.no_gudep}</td><td>${gudep.tingkatan}</td></tr>`
      );

    const pdfPath = await generatePDF(htmlContent, `gudep-${id}`);
    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error exporting Gudep:", error);
    res
      .status(500)
      .json({ message: "Gagal ekspor Gudep", error: error.message });
  }
};

// **Ekspor Semua Gudep Berdasarkan Kwarran**
// **Ekspor Semua Gudep Berdasarkan Kwarran**
exports.exportByKwarran = async (req, res) => {
  try {
    const { id } = req.params; // Get the Kwarran ID from the request parameters
    const kwarran = await Kwarran.findOne({
      where: { id },
      include: [
        {
          model: Gudep,
          as: "gudepesList", // Ensure this matches the alias defined in the association
          include: [
            {
              model: User,
              as: "useres", // Use the correct alias for User
            },
            {
              model: Geografis,
              as: "Geografises", // Use the correct alias for Geografis
            },
            {
              model: Event,
              as: "gudepesEvent", // Use the correct alias for Event
            },
            {
              model: Prestasi,
              as: "gudepesPrestasi", // Use the correct alias for Prestasi
            },
            {
              model: PesertaDidik,
              as: "PesertaDidikes", // Use the correct alias for PesertaDidik
            },
          ],
        },
      ],
    });

    if (!kwarran) {
      return res.status(404).json({ message: "Kwarran tidak ditemukan!" });
    }

    if (!kwarran.gudepList || kwarran.gudepList.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada Gudep dalam Kwarran ini!" });
    }

    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath)) {
      return res
        .status(500)
        .json({ message: "Template HTML tidak ditemukan!" });
    }

    let htmlContent = fs
      .readFileSync(templatePath, "utf8")
      .replace("{{{title}}}", `Laporan Kwarran ${kwarran.nama}`);

    const tableRows = kwarran.gudepList
      .map(
        (g, i) =>
          `<tr><td>${i + 1}</td><td>${g.no_gudep}</td><td>${
            g.tingkatan
          }</td></tr>`
      )
      .join("");

    htmlContent = htmlContent.replace("{{{gudep}}}", tableRows);
    const pdfPath = await generatePDF(htmlContent, `kwarran-${id}`);

    res.json({ message: "PDF berhasil disimpan!", pdfPath });
  } catch (error) {
    console.error("Error exporting Kwarran:", error);
    res
      .status(500)
      .json({ message: "Gagal ekspor Kwarran", error: error.message });
  }
};

// **Fungsi untuk mengirim PDF melalui email**
exports.sendPDF = async (req, res) => {
  try {
    const { email, fileName } = req.query;

    if (!email || !fileName) {
      return res
        .status(400)
        .json({ message: "Email dan fileName harus disertakan!" });
    }

    const pdfPath = path.join(__dirname, `../storage/reports/${fileName}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "File PDF tidak ditemukan!" });
    }

    await sendEmailWithPDF(email, pdfPath, "Laporan PDF Gudep");
    res.json({ message: `PDF berhasil dikirim ke ${email}!` });
  } catch (error) {
    console.error("Error sending PDF:", error);
    res
      .status(500)
      .json({ message: "Gagal mengirim email!", error: error.message });
  }
};
