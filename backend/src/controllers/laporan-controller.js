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
require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const { kwarran, gudep } = require("../models");

async function launchBrowser() {
  console.log("Launching browser...");
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
        "--js-flags=--max-old-space-size=4096",
      ],
      timeout: 60000,
    });
    console.log("Browser launched successfully");
    return browser;
  } catch (error) {
    console.error("⚠️ Puppeteer launch error:", error);
    throw new Error(
      `Failed to start browser for PDF generation: ${error.message}`
    );
  }
}
async function closeBrowser(browser) {
  if (browser) {
    try {
      console.log("Closing browser...");
      await browser.close();
      console.log("Browser closed successfully");
    } catch (err) {
      console.error("⚠️ Error closing browser:", err);
    }
  }
}

async function renderAllHtml() {
  console.log("Starting HTML render for all data...");
  try {
    // Fetch Kwarran data
    console.log("Fetching Kwarran data...");
    const allKwaran = await Kwarran.findAll({
      include: [{ model: Gudep, as: "gudepesList", attributes: ["id"] }],
    });
    console.log(`Found ${allKwaran.length} Kwarran records`);

    // Fetch Gudep data
    console.log("Fetching Gudep data...");
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Event, as: "gudepesEvents" },
      ],
    });
    console.log(`Found ${allGudep.length} Gudep records`);

    if (!allKwaran.length && !allGudep.length) {
      console.warn("No Kwarran or Gudep data found.");
    }

    // Verify template file exists
    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    // Read the template
    let template = fs.readFileSync(templatePath, "utf-8");
    console.log(`Template loaded: ${template.length} bytes`);

    // Validasi template
    const requiredPlaceholders = [
      "{{{title}}}",
      "{{{currentDate}}}",
      "{{{kwarranRows}}}",
      "{{{gudepRows}}}",
      "{{{geografisRows}}}",
      "{{{eventRows}}}",
    ];
    for (const placeholder of requiredPlaceholders) {
      if (!template.includes(placeholder)) {
        throw new Error(
          `Template is missing required placeholder: ${placeholder}`
        );
      }
    }

    // Format current date
    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
    });

    // Generate Kwarran rows with safer data handling
    let kwarranRows = allKwaran
      .map((k) => {
        const kode = k?.kode || "-";
        const nama = k?.nama || "-";
        const ketua_kwarran = k?.ketua_kwarran || "-";
        const ketua_dkr = k?.ketua_dkr || "-";
        const email = k?.email || "-";
        const gudepCount = k?.gudepesList?.length || 0;

        return `<tr><td>${kode}</td><td>${nama}</td><td>${ketua_kwarran}</td><td>${ketua_dkr}</td><td>${email}</td><td>${gudepCount}</td></tr>`;
      })
      .join("");

    if (!kwarranRows) {
      kwarranRows = "<tr><td colspan='6'>No Kwarran data available.</td></tr>";
    }

    // Generate Gudep rows dengan filter dan tambahan data
    let gudepRows = allGudep
      .filter((g) => g.no_gudep !== "ADMIN") // Filter out ADMIN gudeps
      .map((g, index) => {
        const kwarran = allKwaran.find((k) => k.id === g?.kwarran_id);
        const kwarranNama = kwarran?.nama || "-";
        const no_gudep = g?.no_gudep || "-";
        const tingkatan = g?.tingkatan || "-";
        const pangkalan = g?.pangkalan || "-"; // Tambahkan pangkalan
        const ambalan = g?.ambalan || "-"; // Tambahkan ambalan
        const mabigus = g?.mabigus || "-";
        const pembina = g?.pembina || "-";
        const pelatih = g?.pelatih || "-";
        const email = g?.email || "-";
        const jumlah_putra = g?.jumlah_putra || 0;
        const jumlah_putri = g?.jumlah_putri || 0;

        return `<tr><td>${
          index + 1
        }</td><td>${kwarranNama}</td><td>${no_gudep}</td><td>${tingkatan}</td><td>${pangkalan}</td><td>${ambalan}</td><td>${mabigus}</td><td>${pembina}</td><td>${pelatih}</td><td>${email}</td><td>${jumlah_putra}</td><td>${jumlah_putri}</td></tr>`;
      })
      .join("");

    if (!gudepRows) {
      gudepRows = "<tr><td colspan='12'>No Gudep data available.</td></tr>";
    }

    // Generate geographic data rows dengan filter ADMIN
    let geografisRows = allGudep
      .filter((g) => g.no_gudep !== "ADMIN")
      .flatMap((g) => g?.geografises || [])
      .filter((geo) => {
        const gudepPemilik = allGudep.find((g) => g.id === geo?.gudep_id);
        return gudepPemilik && gudepPemilik.no_gudep !== "ADMIN";
      })
      .map((geo, index) => {
        const gudepPemilik = allGudep.find((g) => g.id === geo?.gudep_id);
        const kwarranPemilik = allKwaran.find(
          (k) => k.id === gudepPemilik?.kwarran_id
        );
        const kwarranNama = kwarranPemilik?.nama || "-";
        const gudepNo = gudepPemilik?.no_gudep || "-";
        const koordinat = geo?.titik_koordinat || "-";
        const alamat = geo?.alamat || "-";

        return `<tr><td>${
          index + 1
        }</td><td>${kwarranNama}</td><td>${gudepNo}</td><td>${koordinat}</td><td>${alamat}</td></tr>`;
      })
      .join("");

    if (!geografisRows) {
      geografisRows =
        "<tr><td colspan='5'>No geographic data available.</td></tr>";
    }

    // Generate event rows with safer data handling
    let eventRows = allGudep
      .flatMap(
        (g) =>
          g?.gudepesEvents?.map((e) => ({
            ...e.toJSON(),
            gudep: g,
          })) || []
      )
      .map((e, index) => {
        const nama = e?.nama || "-";
        const tanggal_mulai = e?.tanggal_mulai
          ? new Date(e.tanggal_mulai).toLocaleDateString("id-ID")
          : "-";
        const tanggal_selesai = e?.tanggal_selesai
          ? new Date(e.tanggal_selesai).toLocaleDateString("id-ID")
          : "-";
        const tempat = e?.tempat || "-";
        const tingkat = e?.tingkat || "-";
        const penyelenggara = e?.penyelenggara || "-";

        return `<tr><td>${
          index + 1
        }</td><td>${nama}</td><td>${tanggal_mulai}</td><td>${tanggal_selesai}</td><td>${tempat}</td><td>${tingkat}</td><td>${penyelenggara}</td></tr>`;
      })
      .join("");

    if (!eventRows) {
      eventRows = "<tr><td colspan='7'>No event data available.</td></tr>";
    }

    // Replace all placeholders in the template
    template = template
      .replace(/{{{title}}}/g, "Laporan Lengkap Gudep dan Kwarran")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows)
      .replace("{{{eventRows}}}", eventRows);

    if (template.includes("{{{") || template.includes("}}}")) {
      console.warn(
        "Warning: Final HTML still contains unreplaced placeholders"
      );
    }

    console.log(`Final HTML generated: ${template.length} bytes`);
    return template;
  } catch (error) {
    console.error(
      "⚠️ Failed to render HTML for all data:",
      error.message,
      error.stack
    );
    throw new Error(`Failed to render HTML for all data: ${error.message}`);
  }
}

async function renderGudepHtml(gudepId) {
  console.log(
    `Starting render HTML for Gudep ID: ${gudepId} (Type: ${typeof gudepId})`
  );
  try {
    if (!gudepId || typeof gudepId !== "string") {
      throw new Error(`Invalid Gudep ID: ${gudepId} (Type: ${typeof gudepId})`);
    }

    console.log("Fetching all events...");
    const allEvents = await Event.findAll();
    console.log(`Found ${allEvents.length} events`);

    console.log(`Finding Gudep with ID: ${gudepId}`);
    const gudep = await Gudep.findOne({
      where: { id: gudepId },
      include: [
        { model: User, as: "useres" },
        { model: Geografis, as: "geografises" },
        { model: Prestasi, as: "prestasies" },
        { model: PesertaDidik, as: "pesertaDidikes" },
        { model: Kwarran, as: "kwarranes" },
      ],
    });

    if (!gudep) {
      throw new Error(`Gudep with ID ${gudepId} not found.`);
    }
    console.log(`Found Gudep: ${gudep.no_gudep || "no number"}`);

    const templatePath = path.join(
      __dirname,
      "../views/report-template-gudep.html"
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, "utf-8");
    console.log(`Template loaded: ${template.length} bytes`);

    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
    });

    const kwarran = Array.isArray(gudep.kwarranes)
      ? gudep.kwarranes[0]
      : gudep.kwarranes || {};
    const geoData = Array.isArray(gudep.geografises)
      ? gudep.geografises[0]
      : gudep.geografises || {};

    let prestasiRows = (gudep.prestasies || [])
      .filter((p) => p)
      .map((p, index) => {
        const eventName =
          allEvents.find((e) => e.id === p?.event_id)?.nama ||
          p?.event_id ||
          "-";
        const keterangan = p?.keterangan || "-";

        return `<tr><td>${
          index + 1
        }</td><td>${eventName}</td><td>${keterangan}</td></tr>`;
      })
      .join("");

    if (!prestasiRows) {
      prestasiRows = "<tr><td colspan='3'>Tidak ada data prestasi.</td></tr>";
    }

    let pesertaRows = (gudep.pesertaDidikes || [])
      .filter((pd) => pd)
      .map((pd, index) => {
        const nama = pd?.nama || "-";
        const gender = pd?.gender || "-";
        const ttl = pd?.ttl
          ? new Date(pd.ttl).toLocaleDateString("id-ID")
          : "-";
        const detailtingkatan = pd?.detailtingkatan || "-";

        return `<tr><td>${
          index + 1
        }</td><td>${nama}</td><td>${gender}</td><td>${ttl}</td><td>${detailtingkatan}</td></tr>`;
      })
      .join("");

    if (!pesertaRows) {
      pesertaRows =
        "<tr><td colspan='5'>Tidak ada data peserta didik.</td></tr>";
    }

    // Extract coordinates, longitude and latitude from geoData
    let geoKoordinat = geoData?.titik_koordinat || "-";
    let geoLong = "-";
    let geoLat = "-";
    let geoAlamat = geoData?.alamat || "-";

    if (typeof geoData.titik_koordinat === "string") {
      const coords = geoData.titik_koordinat.split(",");
      if (coords.length === 2) {
        geoLat = coords[0].trim();
        geoLong = coords[1].trim();
      }
    }

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
      .replace(
        "{{{gudepJumlahLaki}}}",
        gudep?.jumlah_putra != null ? gudep.jumlah_putra.toString() : "0"
      )
      .replace(
        "{{{gudepJumlahPerempuan}}}",
        gudep?.jumlah_putri != null ? gudep.jumlah_putri.toString() : "0"
      )
      .replace("{{{geoKoordinat}}}", geoKoordinat)
      .replace("{{{geoLong}}}", geoLong)
      .replace("{{{geoLat}}}", geoLat)
      .replace("{{{geoAlamat}}}", geoAlamat)
      .replace("{{{prestasiRows}}}", prestasiRows)
      .replace("{{{pesertaRows}}}", pesertaRows || "");

    if (template.includes("{{{") || template.includes("}}}")) {
      console.warn(
        "Warning: Final HTML still contains unreplaced placeholders"
      );
    }

    console.log(`Final Gudep HTML generated: ${template.length} bytes`);
    return template;
  } catch (error) {
    console.error(
      `⚠️ Failed to render HTML for Gudep ID ${gudepId}:`,
      error.message,
      error.stack
    );
    throw new Error(`Failed to render HTML for Gudep: ${error.message}`);
  }
}

async function renderKwarranHtml(kwarranId) {
  console.log(
    `Starting render HTML for Kwarran ID: ${kwarranId} (Type: ${typeof kwarranId})`
  );
  try {
    if (!kwarranId || typeof kwarranId !== "string") {
      throw new Error(
        `Invalid Kwarran ID: ${kwarranId} (Type: ${typeof kwarranId})`
      );
    }

    console.log(`Finding Kwarran with ID: ${kwarranId}`);
    const kwarran = await Kwarran.findOne({
      where: { id: kwarranId },
      include: [
        {
          model: Gudep,
          as: "gudepesList",
          include: [{ model: Geografis, as: "geografises" }],
        },
      ],
    });

    if (!kwarran) {
      throw new Error(`Kwarran with ID ${kwarranId} not found.`);
    }
    console.log(`Found Kwarran: ${kwarran.nama || "no name"}`);

    const templatePath = path.join(
      __dirname,
      "../views/report-template-kwarran.html"
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, "utf-8");
    console.log(`Template loaded: ${template.length} bytes`);

    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
    });

    // Gudep rows dengan filter ADMIN dan tambahan pangkalan, ambalan
    let gudepRows = (kwarran?.gudepesList || [])
      .filter((g) => g && g.no_gudep !== "ADMIN")
      .map((g, index) => {
        const kwarranNama = kwarran?.nama || "-";
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
      .join("");

    if (!gudepRows) {
      gudepRows = "<tr><td colspan='12'>Tidak ada data Gudep.</td></tr>";
    }

    // Geografis data dari gudep yang bukan ADMIN
    let geografisRows = (kwarran?.gudepesList || [])
      .filter((g) => g && g.no_gudep !== "ADMIN")
      .flatMap((g) => {
        if (Array.isArray(g?.geografises)) {
          return g.geografises;
        } else if (g?.geografises) {
          return [g.geografises];
        } else {
          return [];
        }
      })
      .filter((geo) => geo)
      .map((geo, index) => {
        const gudepPemilik = kwarran?.gudepesList?.find(
          (g) => g?.id === geo?.gudep_id
        );
        const kwarranNama = kwarran?.nama || "-";
        const gudepNo = gudepPemilik?.no_gudep || "-";
        const koordinat = geo?.titik_koordinat || "-";
        const alamat = geo?.alamat || "-";

        return `<tr><td>${
          index + 1
        }</td><td>${kwarranNama}</td><td>${gudepNo}</td><td>${koordinat}</td><td>${alamat}</td></tr>`;
      })

      .join("");

    if (!geografisRows) {
      geografisRows = "<tr><td colspan='4'>Tidak ada data geografis.</td></tr>";
    }

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
        kwarran?.gudepesList?.filter((g) => g && g.no_gudep !== "ADMIN")
          .length || "0"
      )
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows);

    if (template.includes("{{{") || template.includes("}}}")) {
      console.warn(
        "Warning: Final HTML still contains unreplaced placeholders"
      );
    }

    console.log(`Final Kwarran HTML generated: ${template.length} bytes`);
    return template;
  } catch (error) {
    console.error(
      `⚠️ Failed to render HTML for Kwarran ID ${kwarranId}:`,
      error.message,
      error.stack
    );
    throw new Error(`Failed to render HTML for Kwarran: ${error.message}`);
  }
}

async function generatePdfBuffer(browser, htmlContent) {
  let page = null;
  console.log("Creating new page...");

  try {
    if (!htmlContent || htmlContent.trim() === "") {
      throw new Error("HTML content is empty");
    }

    console.log(`HTML content length: ${htmlContent.length} bytes`);

    page = await browser.newPage();
    page.setDefaultTimeout(60000);
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });

    page.on("console", (message) => {
      console.log(
        `PAGE CONSOLE: ${message.type().toUpperCase()} ${message.text()}`
      );
    });

    page.on("pageerror", (error) => {
      console.error("PAGE ERROR:", error.message);
    });

    console.log("Setting page content...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0", // Tunggu hingga tidak ada lagi permintaan jaringan
      timeout: 90000,
    });

    console.log("Waiting for page to stabilize...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Gunakan ini

    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
      timeout: 90000,
      preferCSSPageSize: false,
    });

    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error(
        `Generated PDF appears to be invalid (size: ${
          pdfBuffer?.length || 0
        } bytes)`
      );
    }

    console.log(`PDF buffer generated successfully: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error("⚠️ Error generating PDF buffer:", error);
    throw new Error(`Failed to create PDF buffer: ${error.message}`);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

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
      console.error("❌ Error mengambil laporan:", error.message, error.stack);
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
      console.error(
        `❌ Error mengambil laporan ID ${id}:`,
        error.message,
        error.stack
      );
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
        .json({ message: "Nama, Asal, No. HP, Email, dan Level wajib diisi." });
    }
    if ((level === "kwarran" || level === "gudep") && !targetId) {
      return res.status(400).json({
        message: `Target ID (${level}) wajib diisi jika level bukan 'semua'.`,
      });
    }
    if (!["semua", "kwarran", "gudep"].includes(level)) {
      return res.status(400).json({ message: "Nilai level tidak valid." });
    }

    try {
      let finalTargetId = null;

      if (level !== "semua" && targetId) {
        if (typeof targetId !== "string" || targetId.length < 30) {
          console.error(
            `Target ID '${targetId}' tidak valid untuk level '${level}'. Bukan string UUID.`
          );
          throw new Error(`Target ID ${level} tidak valid (bukan UUID).`);
        }
        finalTargetId = targetId;
        console.log(
          `Laporan baru: level=${level}, targetId=${targetId} (UUID)`
        );
      } else {
        console.log(`Laporan baru: level=${level}, targetId=null`);
      }

      const newLaporan = await Laporan.create({
        nama,
        asal,
        no_hp: String(noHp),
        email,
        level,
        target_id: finalTargetId,
      });
      return res
        .status(201)
        .json({ message: "Laporan berhasil ditambahkan", data: newLaporan });
    } catch (error) {
      console.error(
        "❌ Error saat Laporan.create:",
        error.message,
        error.stack
      );
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ message: "Data tidak valid." });
      }
      return res.status(500).json({
        message: "Terjadi kesalahan server saat menambahkan laporan.",
        error: error.message,
      });
    }
  },

  deleteLaporan: async (req, res) => {
    const { id } = req.params;
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      await laporan.destroy();
      return res.status(200).json({ message: "Laporan berhasil dihapus" });
    } catch (error) {
      console.error(
        `❌ Error menghapus laporan ID ${id}:`,
        error.message,
        error.stack
      );
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

    try {
      const allowedStatus = Laporan.getAttributes().status.values;
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: `Status '${status}' tidak valid. Pilihan: ${allowedStatus.join(
            ", "
          )}`,
        });
      }
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return res.status(404).json({ message: "Laporan tidak ditemukan." });

      await laporan.update({ status: status });
      return res.status(200).json({
        message: `Status laporan berhasil diubah menjadi '${status}'.`,
        data: laporan,
      });
    } catch (error) {
      console.error(
        `Error updating status laporan ID ${id}:`,
        error.message,
        error.stack
      );
      return res.status(500).json({
        message: "Gagal mengubah status laporan.",
        error: error.message,
      });
    }
  },

  generateDirectPdf: async (req, res) => {
    const { level, targetId } = req.body;
    let browser = null;
    try {
      console.log(
        `⚡ Memicu Generate PDF Langsung untuk level: ${level}, target: ${targetId}`
      );
      if (!level || !["semua", "kwarran", "gudep"].includes(level)) {
        return res.status(400).json({ message: "Level laporan tidak valid." });
      }

      let targetIdUntukRender = null;
      if (level === "kwarran" || level === "gudep") {
        if (!targetId) {
          return res
            .status(400)
            .json({ message: `Target ID (${level}) wajib diisi.` });
        }
        targetIdUntukRender = targetId;
      }

      browser = await launchBrowser();

      let htmlContent = "";
      if (level === "semua") {
        htmlContent = await renderAllHtml();
      } else if (level === "kwarran") {
        htmlContent = await renderKwarranHtml(targetIdUntukRender);
      } else if (level === "gudep") {
        htmlContent = await renderGudepHtml(targetIdUntukRender);
      }

      if (!htmlContent || htmlContent.trim() === "") {
        throw new Error("HTML content is empty after rendering");
      }
      const pdfBuffer = await generatePdfBuffer(browser, htmlContent);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Generated PDF buffer is empty");
      }

      const formatTanggal = () => {
        const now = new Date();
        const optionsDate = {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Makassar",
        };
        const optionsTime = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Makassar",
        };
        const tanggalBagian = now.toLocaleDateString("id-ID", optionsDate);
        const waktuBagian = now
          .toLocaleTimeString("id-ID", optionsTime)
          .replace(/\./g, ":");
        return `${tanggalBagian} ${waktuBagian}`;
      };

      let judulLaporan;
      if (level === "semua") {
        judulLaporan = "Laporan Seluruh Kwarran & Gudep";
      } else if (level === "kwarran") {
        const dataKwarran = await Kwarran.findByPk(targetId);
        console.log(
          `DEBUG [${new Date().toISOString()}] generateDirectPdf - Data Kwarran untuk ID ${targetId}:`,
          JSON.stringify(dataKwarran, null, 2)
        );
        const namaKwarran =
          dataKwarran && dataKwarran.nama && dataKwarran.nama.trim() !== ""
            ? dataKwarran.nama
            : `ID ${targetId} (Nama Kwarran Tdk Ada)`;
        judulLaporan = `Laporan Kwarran ${namaKwarran}`;
      } else if (level === "gudep") {
        const dataGudep = await Gudep.findByPk(targetId);
        console.log(
          `DEBUG [${new Date().toISOString()}] generateDirectPdf - Data Gudep untuk ID ${targetId}:`,
          JSON.stringify(dataGudep, null, 2)
        );
        const nomorGudepText =
          dataGudep &&
          dataGudep.nomor_gudep &&
          dataGudep.nomor_gudep.trim() !== ""
            ? dataGudep.nomor_gudep
            : `ID ${targetId} (Nomor Gudep Tdk Ada)`;
        judulLaporan = `Laporan Gudep ${nomorGudepText}`;
      }

      const filename = `${judulLaporan} ( ${formatTanggal()} ).pdf`;

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
        )}"`, // encodeURIComponent untuk karakter khusus
        "Content-Length": pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.error(
        `❌ Gagal generate (direct) laporan:`,
        error.message,
        error.stack
      );
      if (!res.headersSent) {
        const errorMessage = `Gagal memproses permintaan: ${error.message}`;
        return res
          .status(500)
          .json({ message: errorMessage, error: error.message });
      } else {
        console.error("Error terjadi setelah header PDF terkirim.");
      }
    } finally {
      if (browser) await closeBrowser(browser);
    }
  },

  approveAndStreamPDF: async (req, res) => {
    const { id: laporanId } = req.params;
    let laporan;
    let browser = null;
    try {
      console.log(
        `⚡ Memicu Approve & Generate (Stream) untuk ID Laporan: ${laporanId}`
      );
      laporan = await Laporan.findByPk(laporanId);
      if (!laporan) {
        return res
          .status(404)
          .json({ message: "Permintaan laporan tidak ditemukan." });
      }
      if (!["Menunggu", "Error Generate"].includes(laporan.status)) {
        return res.status(400).json({
          message: `Laporan status '${laporan.status}' tidak bisa diproses ulang.`,
        });
      }

      await laporan.update({ status: "Setujui" });
      console.log(
        `⚙️ Memulai generate PDF (stream) untuk level: ${laporan.level}, target: ${laporan.target_id}. Status diubah menjadi 'Setujui'`
      );

      let targetIdUntukRender = laporan.target_id;
      browser = await launchBrowser();
      let htmlContent = "";

      if (laporan.level === "semua") {
        htmlContent = await renderAllHtml();
      } else if (laporan.level === "kwarran") {
        if (!targetIdUntukRender)
          throw new Error("Target ID Kwarran tidak ada di Laporan.");
        htmlContent = await renderKwarranHtml(targetIdUntukRender);
      } else if (laporan.level === "gudep") {
        if (!targetIdUntukRender)
          throw new Error("Target ID Gudep tidak ada di Laporan.");
        htmlContent = await renderGudepHtml(targetIdUntukRender);
      } else {
        throw new Error(`Level laporan tidak dikenal: ${laporan.level}`);
      }

      if (!htmlContent || htmlContent.trim() === "")
        throw new Error("HTML content is empty after rendering");
      const pdfBuffer = await generatePdfBuffer(browser, htmlContent);
      if (!pdfBuffer || pdfBuffer.length === 0)
        throw new Error("Generated PDF buffer is empty");

      const formatTanggal = () => {
        const now = new Date();
        const optionsDate = {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Makassar",
        };
        const optionsTime = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Makassar",
        };
        const tanggalBagian = now.toLocaleDateString("id-ID", optionsDate);
        const waktuBagian = now
          .toLocaleTimeString("id-ID", optionsTime)
          .replace(/\./g, ":");
        return `${tanggalBagian} ${waktuBagian}`;
      };

      let judulLaporan = "Laporan";
      if (laporan.level === "semua") {
        judulLaporan = "Laporan Seluruh Kwarran & Gudep";
      } else if (laporan.level === "kwarran") {
        const dataKwarran = await Kwarran.findByPk(laporan.target_id);
        const namaKwarran = dataKwarran?.nama || `Kwarran ${laporan.target_id}`;
        judulLaporan = `Laporan Kwarran ${namaKwarran}`;
      } else if (laporan.level === "gudep") {
        const dataGudep = await Gudep.findByPk(laporan.target_id);
        const namaGudep = dataGudep?.nomor_gudep
          ? dataGudep.nomor_gudep
          : `Gudep ${laporan.target_id}`;
        judulLaporan = `Laporan ${namaGudep}`;
      }

      const filename = `${judulLaporan} ( ${formatTanggal()} ).pdf`;

      await closeBrowser(browser); // Tutup browser sebelum mengirim respons jika tidak ada streaming lanjutan
      browser = null;

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
        "Content-Length": pdfBuffer.length,
      });
      console.log("Sending PDF to client...");
      res.end(pdfBuffer);
      await laporan.update({ status: "Selesai" });
      console.log(
        `Status laporan ID ${laporanId} diubah menjadi 'Selesai' setelah PDF berhasil dikirim.`
      );
    } catch (error) {
      console.error(
        `❌ Gagal generate (stream) laporan ID ${laporanId}:`,
        error.message,
        error.stack
      );
      if (laporan && laporan.status !== "Error Generate") {
        try {
          await laporan.update({ status: "Error Generate" });
          console.log(
            `Status laporan ID ${laporanId} diubah menjadi 'Error Generate' karena error.`
          );
        } catch (updateError) {
          console.error(
            "⚠️ Gagal update status ke Error Generate:",
            updateError.message
          );
        }
      }
      if (!res.headersSent) {
        const errorMessage = `Gagal memproses permintaan: ${error.message}`;
        return res
          .status(500)
          .json({ message: errorMessage, error: error.message });
      } else {
        console.error("Error terjadi setelah header PDF terkirim.");
      }
    } finally {
      if (browser) await closeBrowser(browser);
    }
  },

  adhocDownload: async (req, res) => {
    const { id: laporanId } = req.params;
    let browser = null;
    try {
      console.log(`📥 Memicu Adhoc Download untuk ID Laporan: ${laporanId}`);
      const laporan = await Laporan.findByPk(laporanId);
      if (!laporan) {
        return res.status(404).json({ message: "Laporan tidak ditemukan." });
      }
      const { level, target_id: targetId } = laporan; // targetId diambil dari laporan.target_id
      browser = await launchBrowser();
      let htmlContent = "";

      if (level === "semua") {
        htmlContent = await renderAllHtml();
      } else if (level === "kwarran") {
        if (!targetId) throw new Error("Target ID Kwarran tidak tersedia.");
        htmlContent = await renderKwarranHtml(targetId);
      } else if (level === "gudep") {
        if (!targetId) throw new Error("Target ID Gudep tidak tersedia.");
        htmlContent = await renderGudepHtml(targetId);
      } else {
        throw new Error(`Level laporan tidak valid: ${level}`);
      }

      if (!htmlContent || htmlContent.trim() === "")
        throw new Error("HTML hasil render kosong.");
      const pdfBuffer = await generatePdfBuffer(browser, htmlContent);
      if (!pdfBuffer || pdfBuffer.length === 0)
        throw new Error("PDF buffer kosong setelah generate.");

      const formatTanggal = () => {
        const now = new Date();
        const optionsDate = {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Makassar",
        };
        const optionsTime = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Makassar",
        };
        const tanggalBagian = now.toLocaleDateString("id-ID", optionsDate);
        const waktuBagian = now
          .toLocaleTimeString("id-ID", optionsTime)
          .replace(/\./g, ":");
        return `${tanggalBagian} ${waktuBagian}`;
      };

      let judulLaporan = "Laporan";
      if (level === "semua") {
        judulLaporan = "Laporan Seluruh Kwarran & Gudep";
      } else if (level === "kwarran") {
        const dataKwarran = await Kwarran.findByPk(targetId);
        const namaKwarran = dataKwarran?.nama || `Kwarran ${targetId}`;
        judulLaporan = `Laporan Kwarran ${namaKwarran}`;
      } else if (level === "gudep") {
        const dataGudep = await Gudep.findByPk(targetId);
        const namaGudep = dataGudep?.nomor_gudep
          ? dataGudep.nomor_gudep
          : `Gudep ${targetId}`;
        judulLaporan = `Laporan ${namaGudep}`;
      }

      const filename = `${judulLaporan} ( ${formatTanggal()} ).pdf`;

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
        "Content-Length": pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.error(
        `❌ Gagal adhoc download laporan ID ${req.params.id}:`,
        error.message,
        error.stack
      );
      if (!res.headersSent) {
        return res.status(500).json({
          message: "Gagal melakukan download adhoc.",
          error: error.message,
        });
      }
    } finally {
      if (browser) await closeBrowser(browser);
    }
  },
};
