// src/controllers/laporan-controller.js
const {
  Laporan,
  Kwarran,
  Gudep,
  User,
  PesertaDidik,
  Prestasi,
  Geografis,
  Event,
} = require("../models");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { Dropbox } = require("dropbox");
const { Op } = require("sequelize");
const puppeteer = require("puppeteer");

// --- Fungsi Puppeteer untuk PDF ---
async function launchBrowser() {
  console.log("Meluncurkan browser Puppeteer...");
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
        "--disable-web-security",
        "--disable-extensions",
        "--disable-features=site-per-process",
      ],
      timeout: 60000,
    });
    console.log("Browser Puppeteer berhasil diluncurkan.");
    return browser;
  } catch (error) {
    console.error("⚠️ Error saat meluncurkan Puppeteer:", error);
    throw new Error(
      `Gagal memulai browser untuk generasi PDF: ${error.message}`
    );
  }
}

async function closeBrowser(browser) {
  if (browser) {
    try {
      console.log("Menutup browser Puppeteer...");
      await browser.close();
      console.log("Browser Puppeteer berhasil ditutup.");
    } catch (err) {
      console.error("⚠️ Error saat menutup browser Puppeteer:", err);
    }
  }
}

async function generatePdfBufferFromHtml(browser, htmlContent) {
  let page = null;
  console.log("Membuat halaman baru Puppeteer...");
  try {
    if (!htmlContent || htmlContent.trim() === "") {
      throw new Error("Konten HTML untuk PDF kosong.");
    }
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
    page.setDefaultTimeout(90000);

    page.on("console", (message) =>
      console.log(
        `PUPPETEER CONSOLE: ${message.type().toUpperCase()} ${message.text()}`
      )
    );
    page.on("pageerror", (error) =>
      console.error("PUPPETEER PAGE ERROR:", error.message)
    );

    console.log("Mengatur konten halaman Puppeteer...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 90000,
    });

    console.log("Men-generate buffer PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
      timeout: 90000,
      preferCSSPageSize: true,
    });

    if (!pdfBuffer || pdfBuffer.length < 100) {
      throw new Error(
        `Buffer PDF yang dihasilkan tidak valid (ukuran: ${
          pdfBuffer?.length || 0
        } bytes)`
      );
    }
    console.log(`Buffer PDF berhasil di-generate: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error(
      "⚠️ Error saat men-generate buffer PDF:",
      error.message,
      error.stack
    );
    throw new Error(`Gagal membuat buffer PDF: ${error.message}`);
  } finally {
    if (page)
      await page
        .close()
        .catch((err) => console.error("Error menutup halaman Puppeteer:", err));
  }
}
// --- End Fungsi Puppeteer ---

// --- Fungsi Render HTML ---
async function renderAllHtml() {
  console.log("Memulai render HTML untuk semua data...");
  try {
    const allKwaran = await Kwarran.findAll({
      include: [
        { model: Gudep, as: "gudepesList", attributes: ["id", "no_gudep"] },
      ],
      order: [["nama", "ASC"]],
    });
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres", attributes: ["username"] },
        { model: Geografis, as: "geografises" },
        { model: Kwarran, as: "kwarranes", attributes: ["nama"] },
      ],
      order: [
        [{ model: Kwarran, as: "kwarranes" }, "nama", "ASC"],
        ["no_gudep", "ASC"],
      ],
    });
    const allEvents = await Event.findAll({
      order: [["tanggal_mulai", "DESC"]],
    });

    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath))
      throw new Error(`Template tidak ditemukan: ${templatePath}`);
    let template = fs.readFileSync(templatePath, "utf-8");
    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });

    const kwarranRows =
      allKwaran
        .map((k) => {
          const gudepCount =
            k?.gudepesList?.filter((g) => g.no_gudep !== "ADMIN").length || 0;
          return `<tr><td>${k?.kode || "-"}</td><td>${k?.nama || "-"}</td><td>${
            k?.ketua_kwarran || "-"
          }</td><td>${k?.ketua_dkr || "-"}</td><td>${
            k?.email || "-"
          }</td><td>${gudepCount}</td></tr>`;
        })
        .join("") || "<tr><td colspan='6'>Tidak ada data Kwarran.</td></tr>";
    const gudepRows =
      allGudep
        .filter((g) => g.no_gudep !== "ADMIN")
        .map((g, index) => {
          const kwarranNama = g?.kwarranes?.nama || "-";
          return `<tr><td>${index + 1}</td><td>${kwarranNama}</td><td>${
            g?.no_gudep || "-"
          }</td><td>${g?.tingkatan || "-"}</td><td>${
            g?.pangkalan || "-"
          }</td><td>${g?.ambalan || "-"}</td><td>${g?.mabigus || "-"}</td><td>${
            g?.pembina || "-"
          }</td><td>${g?.pelatih || "-"}</td><td>${g?.email || "-"}</td><td>${
            g?.jumlah_putra || 0
          }</td><td>${g?.jumlah_putri || 0}</td></tr>`;
        })
        .join("") || "<tr><td colspan='12'>Tidak ada data Gudep.</td></tr>";
    const geografisRows =
      allGudep
        .filter((g) => g.no_gudep !== "ADMIN" && g.geografises)
        .map((g, index) => {
          const geo = g.geografises;
          const kwarranNama = g?.kwarranes?.nama || "-";
          return `<tr><td>${index + 1}</td><td>${kwarranNama}</td><td>${
            g?.no_gudep || "-"
          }</td><td>${geo?.titik_koordinat || "-"}</td><td>${
            geo?.alamat || "-"
          }</td></tr>`;
        })
        .join("") || "<tr><td colspan='5'>Tidak ada data geografis.</td></tr>";
    const eventRows =
      allEvents
        .map(
          (e, index) =>
            `<tr><td>${index + 1}</td><td>${e?.nama || "-"}</td><td>${
              e?.tanggal_mulai
                ? new Date(e.tanggal_mulai).toLocaleDateString("id-ID")
                : "-"
            }</td><td>${
              e?.tanggal_selesai
                ? new Date(e.tanggal_selesai).toLocaleDateString("id-ID")
                : "-"
            }</td><td>${e?.tempat || "-"}</td><td>${
              e?.tingkat || "-"
            }</td><td>${e?.penyelenggara || "-"}</td></tr>`
        )
        .join("") || "<tr><td colspan='7'>Tidak ada data kegiatan.</td></tr>";
    template = template
      .replace(/{{{title}}}/g, "Laporan Lengkap Data Pramuka Balikpapan")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows)
      .replace("{{{eventRows}}}", eventRows);
    console.log(`Render HTML semua data selesai. Panjang: ${template.length}`);
    return template;
  } catch (error) {
    console.error(
      "⚠️ Gagal render HTML semua data:",
      error.message,
      error.stack
    );
    throw error; // Dilempar agar bisa ditangkap oleh pemanggil
  }
}

async function renderGudepHtml(gudepId) {
  console.log(`Memulai render HTML untuk Gudep ID: ${gudepId}`);
  try {
    if (!gudepId || typeof gudepId !== "string")
      throw new Error(`ID Gudep tidak valid: ${gudepId}`);
    const gudep = await Gudep.findOne({
      where: { id: gudepId },
      include: [
        { model: User, as: "useres", attributes: ["username"] },
        { model: Geografis, as: "geografises" },
        {
          model: Prestasi,
          as: "prestasies",
          include: [{ model: Event, as: "eventes", attributes: ["nama"] }],
        },
        { model: PesertaDidik, as: "pesertaDidikes", order: [["nama", "ASC"]] },
        { model: Kwarran, as: "kwarranes" },
      ],
    });
    if (!gudep) throw new Error(`Gudep dengan ID ${gudepId} tidak ditemukan.`);
    const templatePath = path.join(
      __dirname,
      "../views/report-template-gudep.html"
    );
    if (!fs.existsSync(templatePath))
      throw new Error(`Template Gudep tidak ditemukan: ${templatePath}`);
    let template = fs.readFileSync(templatePath, "utf-8");
    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });
    const kwarran = gudep.kwarranes || {};
    const geoData = gudep.geografises || {};
    const prestasiRows =
      (gudep.prestasies || [])
        .map(
          (p, index) =>
            `<tr><td>${index + 1}</td><td>${
              p?.eventes?.nama || p?.event_id || "-"
            }</td><td>${p?.keterangan || "-"}</td></tr>`
        )
        .join("") || "<tr><td colspan='3'>Tidak ada data prestasi.</td></tr>";
    const pesertaRows =
      (gudep.pesertaDidikes || [])
        .map(
          (pd, index) =>
            `<tr><td>${index + 1}</td><td>${pd?.nama || "-"}</td><td>${
              pd?.gender || "-"
            }</td><td>${
              pd?.ttl ? new Date(pd.ttl).toLocaleDateString("id-ID") : "-"
            }</td><td>${pd?.detailtingkatan || "-"}</td></tr>`
        )
        .join("") ||
      "<tr><td colspan='5'>Tidak ada data peserta didik.</td></tr>";
    template = template
      .replace(/{{{title}}}/g, `Laporan Gudep ${gudep.no_gudep || gudep.id}`)
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranKode}}}", kwarran?.kode || "-")
      .replace("{{{kwarranNama}}}", kwarran?.nama || "-")
      .replace("{{{kwarranKetua}}}", kwarran?.ketua_kwarran || "-")
      .replace("{{{kwarranKetuaDKR}}}", kwarran?.ketua_dkr || "-")
      .replace("{{{kwarranEmail}}}", kwarran?.email || "-")
      .replace("{{{gudepKode}}}", gudep?.no_gudep || "-")
      .replace("{{{gudepPangkalan}}}", gudep?.pangkalan || "-")
      .replace("{{{gudepTingkatan}}}", gudep?.tingkatan || "-")
      .replace("{{{gudepMabigus}}}", gudep?.mabigus || "-")
      .replace("{{{gudepPembina}}}", gudep?.pembina || "-")
      .replace("{{{gudepPelatih}}}", gudep?.pelatih || "-")
      .replace("{{{gudepEmail}}}", gudep?.email || "-")
      .replace("{{{gudepJumlahLaki}}}", gudep?.jumlah_putra?.toString() || "0")
      .replace(
        "{{{gudepJumlahPerempuan}}}",
        gudep?.jumlah_putri?.toString() || "0"
      )
      .replace("{{{geoKoordinat}}}", geoData?.titik_koordinat || "-")
      .replace("{{{geoLong}}}", geoData?.longitude || "-")
      .replace("{{{geoLat}}}", geoData?.latitude || "-")
      .replace("{{{geoAlamat}}}", geoData?.alamat || "-")
      .replace("{{{prestasiRows}}}", prestasiRows)
      .replace("{{{pesertaRows}}}", pesertaRows);
    console.log(
      `Render HTML Gudep ${gudepId} selesai. Panjang: ${template.length}`
    );
    return template;
  } catch (error) {
    console.error(
      `⚠️ Gagal render HTML Gudep ID ${gudepId}:`,
      error.message,
      error.stack
    );
    throw error;
  }
}

async function renderKwarranHtml(kwarranId) {
  console.log(`Memulai render HTML untuk Kwarran ID: ${kwarranId}`);
  try {
    if (!kwarranId || typeof kwarranId !== "string")
      throw new Error(`ID Kwarran tidak valid: ${kwarranId}`);
    const kwarran = await Kwarran.findOne({
      where: { id: kwarranId },
      include: [
        {
          model: Gudep,
          as: "gudepesList",
          where: { no_gudep: { [Op.ne]: "ADMIN" } },
          required: false,
          include: [{ model: Geografis, as: "geografises" }],
          order: [["no_gudep", "ASC"]],
        },
      ],
    });
    if (!kwarran)
      throw new Error(`Kwarran dengan ID ${kwarranId} tidak ditemukan.`);
    const templatePath = path.join(
      __dirname,
      "../views/report-template-kwarran.html"
    );
    if (!fs.existsSync(templatePath))
      throw new Error(`Template Kwarran tidak ditemukan: ${templatePath}`);
    let template = fs.readFileSync(templatePath, "utf-8");
    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });
    const gudepRows =
      (kwarran?.gudepesList || [])
        .map(
          (g, index) =>
            `<tr><td>${index + 1}</td><td>${kwarran?.nama || "-"}</td><td>${
              g?.no_gudep || "-"
            }</td><td>${g?.tingkatan || "-"}</td><td>${
              g?.pangkalan || "-"
            }</td><td>${g?.ambalan || "-"}</td><td>${
              g?.mabigus || "-"
            }</td><td>${g?.pembina || "-"}</td><td>${
              g?.pelatih || "-"
            }</td><td>${g?.email || "-"}</td><td>${
              g?.jumlah_putra || 0
            }</td><td>${g?.jumlah_putri || 0}</td></tr>`
        )
        .join("") || "<tr><td colspan='12'>Tidak ada data Gudep.</td></tr>";
    const geografisRows =
      (kwarran?.gudepesList || [])
        .filter((g) => g.geografises)
        .map(
          (g, index) =>
            `<tr><td>${index + 1}</td><td>${kwarran?.nama || "-"}</td><td>${
              g?.no_gudep || "-"
            }</td><td>${g.geografises?.titik_koordinat || "-"}</td><td>${
              g.geografises?.alamat || "-"
            }</td></tr>`
        )
        .join("") ||
      "<tr><td colspan='5'>Tidak ada data geografis Gudep.</td></tr>";
    template = template
      .replace(
        /{{{title}}}/g,
        `Laporan Kwarran ${kwarran?.nama || kwarran?.id}`
      )
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranKode}}}", kwarran?.kode || "-")
      .replace("{{{kwarranNama}}}", kwarran?.nama || "-")
      .replace("{{{kwarranKetua}}}", kwarran?.ketua_kwarran || "-")
      .replace("{{{kwarranKetuaDKR}}}", kwarran?.ketua_dkr || "-")
      .replace("{{{kwarranEmail}}}", kwarran?.email || "-")
      .replace(
        "{{{kwarranJumlahGudep}}}",
        kwarran?.gudepesList?.length.toString() || "0"
      )
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows);
    console.log(
      `Render HTML Kwarran ${kwarranId} selesai. Panjang: ${template.length}`
    );
    return template;
  } catch (error) {
    console.error(
      `⚠️ Gagal render HTML Kwarran ID ${kwarranId}:`,
      error.message,
      error.stack
    );
    throw error;
  }
}
// --- End Fungsi Render HTML ---

const getReportPdfFileName = (level, targetEntity) => {
  const now = new Date();
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

  if (level === "semua") {
    entityName = "Semua_Data";
  } else if (targetEntity) {
    if (level === "kwarran") {
      entityName = `Kwarran_${targetEntity.nama || `ID_${targetEntity.id}`}`;
    } else if (level === "gudep") {
      entityName = `Gudep_${
        targetEntity.no_gudep ||
        targetEntity.pangkalan ||
        `ID_${targetEntity.id}`
      }`;
    }
  }
  entityName = entityName.replace(/[^\w.-]/g, "_");
  baseName += entityName;
  return `${baseName}_${timestamp}.pdf`;
};

const dbx = process.env.DROPBOX_ACCESS_TOKEN
  ? new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN })
  : null;
if (!dbx && process.env.DROPBOX_ACCESS_TOKEN) {
  console.error(
    "KESALAHAN KRITIS: DROPBOX_ACCESS_TOKEN terdefinisi tapi SDK Dropbox gagal diinisialisasi."
  );
} else if (!process.env.DROPBOX_ACCESS_TOKEN) {
  console.warn(
    "PERINGATAN: DROPBOX_ACCESS_TOKEN tidak diatur. Upload laporan ke Dropbox tidak akan berfungsi."
  );
}

const DROPBOX_REPORTS_FOLDER =
  process.env.DROPBOX_REPORTS_FOLDER || "/Laporan Aplikasi Geogudep PDF";

module.exports = {
  getAllLaporan: async (req, res) => {
    try {
      const allLaporan = await Laporan.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({
        message: "Data laporan berhasil didapatkan",
        data: allLaporan,
      });
    } catch (error) {
      console.error("❌ Error mengambil laporan:", error.message);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  },

  getLaporan: async (req, res) => {
    const { id } = req.params;
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      return res
        .status(200)
        .json({ message: "Data laporan berhasil didapatkan", data: laporan });
    } catch (error) {
      console.error(`❌ Error mengambil laporan ID ${id}:`, error.message);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  },

  addLaporan: async (req, res) => {
    const { nama, asal, noHp, email, level, targetId } = req.body;
    if (!nama || !asal || !noHp || !email || !level) {
      return res
        .status(400)
        .json({ message: "Semua field input wajib diisi." });
    }
    if ((level === "kwarran" || level === "gudep") && !targetId) {
      return res
        .status(400)
        .json({ message: `Target ID untuk level '${level}' wajib diisi.` });
    }
    if (!["semua", "kwarran", "gudep"].includes(level)) {
      return res
        .status(400)
        .json({ message: "Nilai level laporan tidak valid." });
    }
    try {
      const newLaporan = await Laporan.create({
        nama,
        asal,
        no_hp: String(noHp),
        email,
        level,
        target_id: level !== "semua" && targetId ? targetId : null,
        status: "Menunggu",
        pdf_path: null,
      });
      return res.status(201).json({
        message: "Permintaan laporan berhasil ditambahkan",
        data: newLaporan,
      });
    } catch (error) {
      console.error("❌ Error saat membuat entri Laporan:", error.message);
      return res.status(500).json({
        message:
          "Terjadi kesalahan server saat menambahkan permintaan laporan.",
        error: error.message,
      });
    }
  },

  deleteLaporan: async (req, res) => {
    const { id } = req.params;
    if (!dbx && process.env.DROPBOX_ACCESS_TOKEN) {
      console.error(
        "Kesalahan kritis: Dropbox SDK tidak terinisialisasi saat mencoba menghapus laporan."
      );
    }
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return res.status(404).json({ message: "Laporan tidak ditemukan" });

      if (laporan.pdf_path && dbx && !laporan.pdf_path.startsWith("http")) {
        try {
          console.log(
            `Mencoba menghapus file PDF dari Dropbox: ${laporan.pdf_path}`
          );
          await dbx.filesDeleteV2({ path: laporan.pdf_path });
          console.log(
            `File ${laporan.pdf_path} berhasil dihapus dari Dropbox.`
          );
        } catch (dbxDeleteError) {
          console.warn(
            `Gagal menghapus file PDF ${laporan.pdf_path} dari Dropbox: ${
              dbxDeleteError.error?.error_summary || dbxDeleteError.message
            }. Entri laporan tetap akan dihapus.`
          );
        }
      }
      await laporan.destroy();
      return res.status(200).json({ message: "Laporan berhasil dihapus." }); // Mengirim JSON agar konsisten
    } catch (error) {
      console.error(`❌ Error menghapus laporan ID ${id}:`, error.message);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  },

  approveOnly: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: "Status baru wajib diisi." });
    const allowedStatus = Laporan.getAttributes().status.values;
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: `Status '${status}' tidak valid.` });
    }
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return res.status(404).json({ message: "Laporan tidak ditemukan." });
      await laporan.update({ status: status });
      return res.status(200).json({
        message: `Status laporan berhasil diubah menjadi '${status}'.`,
        data: laporan,
      });
    } catch (error) {
      console.error(`Error updating status laporan ID ${id}:`, error.message);
      return res.status(500).json({
        message: "Gagal mengubah status laporan.",
        error: error.message,
      });
    }
  },

  approveAndGeneratePdfReport: async (req, res) => {
    const { id: laporanId } = req.params;
    let laporan;
    let browser = null;

    if (!dbx)
      return res.status(500).json({
        message:
          "Integrasi Dropbox tidak dikonfigurasi dengan benar (token tidak ada).",
      });

    try {
      console.log(
        `⚡ Memicu Approve & Generate PDF untuk ID Laporan: ${laporanId} (Upload ke Dropbox)`
      );
      laporan = await Laporan.findByPk(laporanId);
      if (!laporan)
        return res
          .status(404)
          .json({ message: "Permintaan laporan tidak ditemukan." });
      if (!["Menunggu", "Error Generate", "Setujui"].includes(laporan.status)) {
        return res.status(400).json({
          message: `Laporan status '${laporan.status}' tidak bisa diproses ulang.`,
        });
      }

      browser = await launchBrowser();

      let htmlContent = "",
        targetEntity = null;
      if (laporan.level === "semua") htmlContent = await renderAllHtml();
      else if (laporan.level === "kwarran") {
        if (!laporan.target_id)
          throw new Error("Target ID Kwarran kosong untuk laporan ini.");
        targetEntity = await Kwarran.findByPk(laporan.target_id);
        if (!targetEntity)
          throw new Error(
            `Data Kwarran target (ID: ${laporan.target_id}) tidak ditemukan.`
          );
        htmlContent = await renderKwarranHtml(laporan.target_id);
      } else if (laporan.level === "gudep") {
        if (!laporan.target_id)
          throw new Error("Target ID Gudep kosong untuk laporan ini.");
        targetEntity = await Gudep.findByPk(laporan.target_id);
        if (!targetEntity)
          throw new Error(
            `Data Gudep target (ID: ${laporan.target_id}) tidak ditemukan.`
          );
        htmlContent = await renderGudepHtml(laporan.target_id);
      } else throw new Error(`Level laporan tidak valid: ${laporan.level}`);

      if (!htmlContent?.trim())
        throw new Error("Gagal menghasilkan konten HTML untuk PDF.");

      const pdfBuffer = await generatePdfBufferFromHtml(browser, htmlContent);
      const fileName = getReportPdfFileName(laporan.level, targetEntity);
      const dropboxPath = `${DROPBOX_REPORTS_FOLDER}/${fileName}`;

      console.log(`Mengunggah PDF ${fileName} ke Dropbox path: ${dropboxPath}`);
      const uploadResponse = await dbx.filesUpload({
        path: dropboxPath,
        contents: pdfBuffer,
        autorename: true,
        mode: "overwrite",
      });
      const uploadedFile = uploadResponse.result;
      console.log(
        "Upload PDF ke Dropbox berhasil:",
        uploadedFile.name,
        uploadedFile.path_display
      );

      let sharedLinkUrl = "";
      try {
        const linkSettings = {
          path: uploadedFile.path_lower,
          settings: { requested_visibility: "public" },
        };
        const sharedLinkResponse =
          await dbx.sharingCreateSharedLinkWithSettings(linkSettings);
        sharedLinkUrl = sharedLinkResponse.result.url
          .replace("www.dropbox.com", "dl.dropboxusercontent.com")
          .replace("?dl=0", "?dl=1");
        console.log(
          `Shared link Dropbox PDF (direct download): ${sharedLinkUrl}`
        );
      } catch (linkError) {
        console.warn(
          `Gagal membuat shared link Dropbox PDF untuk ${uploadedFile.path_display}: ${linkError.message}. Akan menggunakan path Dropbox.`
        );
      }

      await laporan.update({
        status: "Selesai",
        pdf_path: sharedLinkUrl || uploadedFile.path_display,
      });
      return res.status(200).json({
        message: "Laporan PDF berhasil dibuat dan diunggah ke Dropbox.",
        filePathInDropbox: uploadedFile.path_display,
        downloadUrl: sharedLinkUrl,
        data: laporan,
      });
    } catch (error) {
      console.error(
        `❌ Gagal proses laporan PDF ID ${laporanId} (approve & gen Dropbox):`,
        error.status,
        error.message,
        error.error,
        error.stack
      );
      if (laporan)
        await laporan
          .update({ status: "Error Generate", pdf_path: null })
          .catch((e) => console.error("Gagal update status error:", e));
      if (!res.headersSent) {
        const errMsg =
          error.error &&
          typeof error.error === "object" &&
          error.error.error_summary
            ? error.error.error_summary
            : error.message;
        return res.status(error.status || 500).json({
          message: `Gagal memproses permintaan: ${errMsg}`,
          errorDetail: error.error,
        });
      }
    } finally {
      if (browser) await closeBrowser(browser);
    }
  },

  generateDirectPdfReport: async (req, res) => {
    const { level, targetId } = req.body;
    let browser = null;
    if (!dbx)
      return res
        .status(500)
        .json({ message: "Integrasi Dropbox tidak dikonfigurasi." });
    if (!level || !["semua", "kwarran", "gudep"].includes(level))
      return res.status(400).json({ message: "Level laporan tidak valid." });
    if ((level === "kwarran" || level === "gudep") && !targetId)
      return res
        .status(400)
        .json({ message: `Target ID (${level}) wajib diisi.` });

    console.log(
      `Backend menerima (direct PDF report): level = ${level}, targetId = ${targetId}`
    );
    try {
      browser = await launchBrowser();
      let htmlContent = "",
        targetEntity = null;

      if (level === "semua") htmlContent = await renderAllHtml();
      else if (level === "kwarran") {
        targetEntity = await Kwarran.findByPk(targetId);
        if (!targetEntity)
          throw new Error(`Target Kwarran (ID: ${targetId}) tidak ditemukan.`);
        htmlContent = await renderKwarranHtml(targetId);
      } else if (level === "gudep") {
        targetEntity = await Gudep.findByPk(targetId);
        if (!targetEntity)
          throw new Error(`Target Gudep (ID: ${targetId}) tidak ditemukan.`);
        htmlContent = await renderGudepHtml(targetId);
      }

      if (!htmlContent?.trim())
        throw new Error("Konten HTML kosong untuk PDF.");

      const pdfBuffer = await generatePdfBufferFromHtml(browser, htmlContent);
      const fileName = getReportPdfFileName(level, targetEntity);
      const dropboxPath = `${DROPBOX_REPORTS_FOLDER}/${fileName}`;

      console.log(
        `Mengunggah (direct) PDF ${fileName} ke Dropbox path: ${dropboxPath}`
      );
      const uploadResponse = await dbx.filesUpload({
        path: dropboxPath,
        contents: pdfBuffer,
        autorename: true,
        mode: "overwrite",
      });
      const uploadedFile = uploadResponse.result;
      console.log(
        "Upload direct PDF ke Dropbox berhasil:",
        uploadedFile.name,
        uploadedFile.path_display
      );

      let sharedLinkUrl = "";
      try {
        const linkSettings = {
          path: uploadedFile.path_lower,
          settings: { requested_visibility: "public" },
        };
        const sharedLinkResponse =
          await dbx.sharingCreateSharedLinkWithSettings(linkSettings);
        sharedLinkUrl = sharedLinkResponse.result.url
          .replace("www.dropbox.com", "dl.dropboxusercontent.com")
          .replace("?dl=0", "?dl=1");
        console.log(`Shared link Dropbox (direct PDF): ${sharedLinkUrl}`);
      } catch (linkError) {
        console.warn(
          `Gagal membuat shared link Dropbox (direct PDF): ${linkError.message}.`
        );
      }

      return res.status(200).json({
        message: "Laporan PDF berhasil dibuat dan diunggah ke Dropbox.",
        filePathInDropbox: uploadedFile.path_display,
        downloadUrl: sharedLinkUrl,
      });
    } catch (error) {
      console.error(
        `❌ Gagal generate direct laporan PDF (Dropbox):`,
        error.status,
        error.message,
        error.error,
        error.stack
      );
      if (!res.headersSent) {
        const errMsg =
          error.error &&
          typeof error.error === "object" &&
          error.error.error_summary
            ? error.error.error_summary
            : error.message;
        return res.status(error.status || 500).json({
          message: `Gagal memproses permintaan: ${errMsg}`,
          errorDetail: error.error,
        });
      }
    } finally {
      if (browser) await closeBrowser(browser);
    }
  },

  adhocDownloadPdfReport: async (req, res) => {
    const { id: laporanId } = req.params;
    if (!dbx)
      return res
        .status(500)
        .json({ message: "Integrasi Dropbox tidak dikonfigurasi." });
    try {
      const laporan = await Laporan.findByPk(laporanId);
      if (!laporan || !laporan.pdf_path) {
        return res.status(404).json({
          message:
            "Laporan atau file PDF Dropbox tidak ditemukan. Coba generate ulang.",
        });
      }
      const dropboxFileIdentifier = laporan.pdf_path;
      if (dropboxFileIdentifier.startsWith("http")) {
        console.log(`Mengarahkan ke URL Dropbox PDF: ${dropboxFileIdentifier}`);
        return res.redirect(dropboxFileIdentifier);
      }
      // Jika path, buat temporary link (lebih aman untuk file yang tidak dimaksudkan untuk publik permanen)
      console.log(
        `Mendapatkan temporary link untuk path Dropbox: ${dropboxFileIdentifier}`
      );
      const tempLinkResponse = await dbx.filesGetTemporaryLink({
        path: dropboxFileIdentifier,
      });
      console.log(
        `Mengarahkan ke temporary link Dropbox PDF: ${tempLinkResponse.result.link}`
      );
      return res.redirect(tempLinkResponse.result.link);
    } catch (error) {
      console.error(
        `❌ Gagal adhoc download PDF dari Dropbox (ID: ${laporanId}):`,
        error.status,
        error.message,
        error.error
      );
      if (!res.headersSent) {
        const errMsg =
          error.error &&
          typeof error.error === "object" &&
          error.error.error_summary
            ? error.error.error_summary.replace(/\/.*/, "")
            : error.message;
        return res.status(error.status || 500).json({
          message: `Gagal mengambil file PDF dari Dropbox: ${errMsg}`,
          errorDetail: error.error,
        });
      }
    }
  },
};
