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
const fs = require("fs");
const { Op } = require("sequelize"); // Diperlukan untuk query yang lebih kompleks jika ada

// --- Fungsi Render HTML (TETAP SAMA) ---
async function renderAllHtml() {
  console.log("Starting HTML render for all data...");
  try {
    console.log("Fetching Kwarran data...");
    const allKwaran = await Kwarran.findAll({
      include: [{ model: Gudep, as: "gudepesList", attributes: ["id"] }],
      order: [["nama", "ASC"]],
    });
    console.log(`Found ${allKwaran.length} Kwarran records`);

    console.log("Fetching Gudep data...");
    const allGudep = await Gudep.findAll({
      include: [
        { model: User, as: "useres", attributes: ["username"] }, // Ambil username saja
        { model: Geografis, as: "geografises" },
        // { model: Event, as: "gudepesEvents" }, // Mungkin tidak perlu di laporan umum, tergantung kebutuhan
        { model: Kwarran, as: "kwarranes", attributes: ["nama"] }, // Ambil nama Kwarran
      ],
      order: [
        // Urutkan berdasarkan nama Kwarran dulu, baru nomor Gudep
        [{ model: Kwarran, as: "kwarranes" }, "nama", "ASC"],
        ["no_gudep", "ASC"],
      ],
    });
    console.log(`Found ${allGudep.length} Gudep records`);

    console.log("Fetching Event data...");
    const allEvents = await Event.findAll({
      order: [["tanggal_mulai", "DESC"]],
    });
    console.log(`Found ${allEvents.length} Event records`);

    const templatePath = path.join(__dirname, "../views/report-template.html");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    let template = fs.readFileSync(templatePath, "utf-8");

    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });

    let kwarranRows = allKwaran
      .map((k) => {
        const kode = k?.kode || "-";
        const nama = k?.nama || "-";
        const ketua_kwarran = k?.ketua_kwarran || "-";
        const ketua_dkr = k?.ketua_dkr || "-";
        const email = k?.email || "-";
        const gudepCount =
          k?.gudepesList?.filter((g) => g.no_gudep !== "ADMIN").length || 0; // Filter ADMIN

        return `<tr><td>${kode}</td><td>${nama}</td><td>${ketua_kwarran}</td><td>${ketua_dkr}</td><td>${email}</td><td>${gudepCount}</td></tr>`;
      })
      .join("");
    if (!kwarranRows)
      kwarranRows = "<tr><td colspan='6'>Tidak ada data Kwarran.</td></tr>";

    let gudepRows = allGudep
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
      .join("");
    if (!gudepRows)
      gudepRows = "<tr><td colspan='12'>Tidak ada data Gudep.</td></tr>";

    let geografisRows = allGudep
      .filter((g) => g.no_gudep !== "ADMIN" && g.geografises) // Pastikan geografises ada
      .map((g, index) => {
        const geo = g.geografises; // Akses langsung karena One-to-One
        const kwarranNama = g?.kwarranes?.nama || "-";
        const gudepNo = g?.no_gudep || "-";
        const koordinat = geo?.titik_koordinat || "-";
        const alamat = geo?.alamat || "-";
        return `<tr><td>${
          index + 1
        }</td><td>${kwarranNama}</td><td>${gudepNo}</td><td>${koordinat}</td><td>${alamat}</td></tr>`;
      })
      .join("");
    if (!geografisRows)
      geografisRows = "<tr><td colspan='5'>Tidak ada data geografis.</td></tr>";

    let eventRows = allEvents
      .map((e, index) => {
        return `<tr><td>${index + 1}</td><td>${e?.nama || "-"}</td><td>${
          e?.tanggal_mulai
            ? new Date(e.tanggal_mulai).toLocaleDateString("id-ID")
            : "-"
        }</td><td>${
          e?.tanggal_selesai
            ? new Date(e.tanggal_selesai).toLocaleDateString("id-ID")
            : "-"
        }</td><td>${e?.tempat || "-"}</td><td>${e?.tingkat || "-"}</td><td>${
          e?.penyelenggara || "-"
        }</td></tr>`;
      })
      .join("");
    if (!eventRows)
      eventRows = "<tr><td colspan='7'>Tidak ada data kegiatan.</td></tr>";

    template = template
      .replace(/{{{title}}}/g, "Laporan Lengkap Data Pramuka Balikpapan")
      .replace("{{{currentDate}}}", currentDate)
      .replace("{{{kwarranRows}}}", kwarranRows)
      .replace("{{{gudepRows}}}", gudepRows)
      .replace("{{{geografisRows}}}", geografisRows)
      .replace("{{{eventRows}}}", eventRows);

    console.log(`Final HTML generated (All): ${template.length} bytes`);
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
  console.log(`Starting render HTML for Gudep ID: ${gudepId}`);
  try {
    if (!gudepId || typeof gudepId !== "string") {
      throw new Error(`Invalid Gudep ID: ${gudepId}`);
    }

    const gudep = await Gudep.findOne({
      where: { id: gudepId },
      include: [
        { model: User, as: "useres", attributes: ["username"] },
        { model: Geografis, as: "geografises" },
        {
          model: Prestasi,
          as: "prestasies",
          include: [{ model: Event, as: "eventes", attributes: ["nama"] }], // Sertakan nama Event dari Prestasi
        },
        { model: PesertaDidik, as: "pesertaDidikes", order: [["nama", "ASC"]] },
        { model: Kwarran, as: "kwarranes" },
      ],
    });

    if (!gudep) throw new Error(`Gudep with ID ${gudepId} not found.`);
    console.log(`Found Gudep: ${gudep.no_gudep || "no number"}`);

    const templatePath = path.join(
      __dirname,
      "../views/report-template-gudep.html"
    );
    if (!fs.existsSync(templatePath))
      throw new Error(`Template file not found: ${templatePath}`);
    let template = fs.readFileSync(templatePath, "utf-8");

    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });
    const kwarran = gudep.kwarranes || {};
    const geoData = gudep.geografises || {}; // Geografis adalah objek tunggal

    let prestasiRows = (gudep.prestasies || [])
      .map((p, index) => {
        const eventName = p?.eventes?.nama || p?.event_id || "-"; // Ambil nama event dari relasi
        return `<tr><td>${index + 1}</td><td>${eventName}</td><td>${
          p?.keterangan || "-"
        }</td></tr>`;
      })
      .join("");
    if (!prestasiRows)
      prestasiRows = "<tr><td colspan='3'>Tidak ada data prestasi.</td></tr>";

    let pesertaRows = (gudep.pesertaDidikes || [])
      .map((pd, index) => {
        return `<tr><td>${index + 1}</td><td>${pd?.nama || "-"}</td><td>${
          pd?.gender || "-"
        }</td><td>${
          pd?.ttl ? new Date(pd.ttl).toLocaleDateString("id-ID") : "-"
        }</td><td>${pd?.detailtingkatan || "-"}</td></tr>`;
      })
      .join("");
    if (!pesertaRows)
      pesertaRows =
        "<tr><td colspan='5'>Tidak ada data peserta didik.</td></tr>";

    let geoKoordinat = geoData?.titik_koordinat || "-";
    let geoLong = geoData?.longitude || "-"; // Gunakan field longitude langsung
    let geoLat = geoData?.latitude || "-"; // Gunakan field latitude langsung
    let geoAlamat = geoData?.alamat || "-";

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
      .replace("{{{geoKoordinat}}}", geoKoordinat)
      .replace("{{{geoLong}}}", geoLong)
      .replace("{{{geoLat}}}", geoLat)
      .replace("{{{geoAlamat}}}", geoAlamat)
      .replace("{{{prestasiRows}}}", prestasiRows)
      .replace("{{{pesertaRows}}}", pesertaRows);

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
  console.log(`Starting render HTML for Kwarran ID: ${kwarranId}`);
  try {
    if (!kwarranId || typeof kwarranId !== "string") {
      throw new Error(`Invalid Kwarran ID: ${kwarranId}`);
    }
    const kwarran = await Kwarran.findOne({
      where: { id: kwarranId },
      include: [
        {
          model: Gudep,
          as: "gudepesList",
          where: { no_gudep: { [Op.ne]: "ADMIN" } }, // Filter ADMIN gudep
          required: false, // Gunakan false agar Kwarran tetap muncul meski tidak ada Gudep (selain ADMIN)
          include: [{ model: Geografis, as: "geografises" }],
          order: [["no_gudep", "ASC"]],
        },
      ],
    });

    if (!kwarran) throw new Error(`Kwarran with ID ${kwarranId} not found.`);
    console.log(`Found Kwarran: ${kwarran.nama || "no name"}`);

    const templatePath = path.join(
      __dirname,
      "../views/report-template-kwarran.html"
    );
    if (!fs.existsSync(templatePath))
      throw new Error(`Template file not found: ${templatePath}`);
    let template = fs.readFileSync(templatePath, "utf-8");

    const currentDate = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Makassar",
    });

    let gudepRows = (kwarran?.gudepesList || []) // Sudah difilter di query
      .map((g, index) => {
        return `<tr><td>${index + 1}</td><td>${kwarran?.nama || "-"}</td><td>${
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
    if (!gudepRows)
      gudepRows =
        "<tr><td colspan='12'>Tidak ada data Gudep di Kwarran ini.</td></tr>";

    let geografisRows = (kwarran?.gudepesList || []) // Sudah difilter di query
      .filter((g) => g.geografises) // Pastikan gudep memiliki data geografis
      .map((g, index) => {
        const geo = g.geografises;
        return `<tr><td>${index + 1}</td><td>${kwarran?.nama || "-"}</td><td>${
          g?.no_gudep || "-"
        }</td><td>${geo?.titik_koordinat || "-"}</td><td>${
          geo?.alamat || "-"
        }</td></tr>`;
      })
      .join("");
    if (!geografisRows)
      geografisRows =
        "<tr><td colspan='5'>Tidak ada data geografis Gudep di Kwarran ini.</td></tr>";

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
// --- END Fungsi Render HTML ---

// Fungsi untuk memastikan direktori ada
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Fungsi untuk mendapatkan nama file laporan yang unik
const getReportFileName = (level, targetEntity) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-"); // Format YYYY-MM-DDTHH-mm-ss-SSSZ
  let baseName = "Laporan_";

  if (level === "semua") {
    baseName += "Semua_Data";
  } else if (level === "kwarran" && targetEntity) {
    baseName += `Kwarran_${(targetEntity.nama || targetEntity.id).replace(
      /\s+/g,
      "_"
    )}`;
  } else if (level === "gudep" && targetEntity) {
    baseName += `Gudep_${(
      targetEntity.no_gudep ||
      targetEntity.pangkalan ||
      targetEntity.id
    ).replace(/\s+/g, "_")}`;
  } else {
    baseName += "Tidak_Diketahui";
  }
  return `${baseName}_${timestamp}.html`;
};

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
      const newLaporan = await Laporan.create({
        nama,
        asal,
        no_hp: String(noHp),
        email,
        level,
        target_id: level !== "semua" && targetId ? targetId : null, // Simpan null jika 'semua'
        status: "Menunggu", // Status awal
      });
      return res.status(201).json({
        message: "Permintaan laporan berhasil ditambahkan",
        data: newLaporan,
      });
    } catch (error) {
      console.error(
        "❌ Error saat Laporan.create:",
        error.message,
        error.stack
      );
      return res.status(500).json({
        message:
          "Terjadi kesalahan server saat menambahkan permintaan laporan.",
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

      // Hapus file fisik jika ada
      if (laporan.pdf_path) {
        // Menggunakan pdf_path untuk menyimpan path HTML
        const filePath = path.join(__dirname, "../../", laporan.pdf_path); // Sesuaikan path root jika perlu
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`File laporan dihapus: ${filePath}`);
        }
      }
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

  approveAndGenerateHtmlReport: async (req, res) => {
    const { id: laporanId } = req.params;
    let laporan;
    try {
      console.log(
        `⚡ Memicu Approve & Generate HTML untuk ID Laporan: ${laporanId}`
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
        `⚙️ Memulai generate HTML untuk level: ${laporan.level}, target: ${laporan.target_id}. Status diubah menjadi 'Setujui'`
      );

      let htmlContent = "";
      let targetEntity = null;

      if (laporan.level === "semua") {
        htmlContent = await renderAllHtml();
      } else if (laporan.level === "kwarran") {
        if (!laporan.target_id)
          throw new Error("Target ID Kwarran tidak ada di Laporan.");
        targetEntity = await Kwarran.findByPk(laporan.target_id);
        if (!targetEntity)
          throw new Error(
            `Kwarran dengan ID ${laporan.target_id} tidak ditemukan.`
          );
        htmlContent = await renderKwarranHtml(laporan.target_id);
      } else if (laporan.level === "gudep") {
        if (!laporan.target_id)
          throw new Error("Target ID Gudep tidak ada di Laporan.");
        targetEntity = await Gudep.findByPk(laporan.target_id);
        if (!targetEntity)
          throw new Error(
            `Gudep dengan ID ${laporan.target_id} tidak ditemukan.`
          );
        htmlContent = await renderGudepHtml(laporan.target_id);
      } else {
        throw new Error(`Level laporan tidak dikenal: ${laporan.level}`);
      }

      if (!htmlContent || htmlContent.trim() === "") {
        throw new Error("HTML content is empty after rendering");
      }

      const reportDir = path.join(__dirname, "../../generated_html_reports"); // Simpan di root/generated_html_reports
      ensureDirectoryExistence(path.join(reportDir, "file.html")); // Pastikan direktori ada

      const fileName = getReportFileName(laporan.level, targetEntity);
      const filePath = path.join(reportDir, fileName);
      const relativeFilePath = path.join("generated_html_reports", fileName); // Path relatif untuk disimpan di DB

      fs.writeFileSync(filePath, htmlContent);
      console.log(`HTML report saved to: ${filePath}`);

      await laporan.update({ status: "Selesai", pdf_path: relativeFilePath }); // pdf_path kini menyimpan path HTML
      console.log(
        `Status laporan ID ${laporanId} diubah menjadi 'Selesai' dan path HTML disimpan.`
      );

      res.status(200).json({
        message: "Laporan HTML berhasil dibuat dan disimpan di server.",
        filePath: relativeFilePath, // Kirim path relatif ke klien
        data: laporan,
      });
    } catch (error) {
      console.error(
        `❌ Gagal generate HTML laporan ID ${laporanId}:`,
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
        return res.status(500).json({
          message: `Gagal memproses permintaan pembuatan laporan HTML: ${error.message}`,
          error: error.message,
        });
      }
    }
  },

  generateDirectHtmlReport: async (req, res) => {
    const { level, targetId } = req.body;
    try {
      console.log(
        `⚡ Memicu Generate HTML Langsung untuk level: ${level}, target: ${targetId}`
      );
      if (!level || !["semua", "kwarran", "gudep"].includes(level)) {
        return res.status(400).json({ message: "Level laporan tidak valid." });
      }
      if ((level === "kwarran" || level === "gudep") && !targetId) {
        return res
          .status(400)
          .json({ message: `Target ID (${level}) wajib diisi.` });
      }

      let htmlContent = "";
      let targetEntity = null;

      if (level === "semua") {
        htmlContent = await renderAllHtml();
      } else if (level === "kwarran") {
        targetEntity = await Kwarran.findByPk(targetId);
        if (!targetEntity)
          throw new Error(`Kwarran dengan ID ${targetId} tidak ditemukan.`);
        htmlContent = await renderKwarranHtml(targetId);
      } else if (level === "gudep") {
        targetEntity = await Gudep.findByPk(targetId);
        if (!targetEntity)
          throw new Error(`Gudep dengan ID ${targetId} tidak ditemukan.`);
        htmlContent = await renderGudepHtml(targetId);
      }

      if (!htmlContent || htmlContent.trim() === "") {
        throw new Error("HTML content is empty after rendering");
      }

      const reportDir = path.join(__dirname, "../../generated_html_reports");
      ensureDirectoryExistence(path.join(reportDir, "file.html"));

      const fileName = getReportFileName(level, targetEntity);
      const filePath = path.join(reportDir, fileName);
      const relativeFilePath = path.join("generated_html_reports", fileName);

      fs.writeFileSync(filePath, htmlContent);
      console.log(`HTML report saved to: ${filePath}`);

      // Tidak ada update ke model Laporan karena ini direct generation
      res.status(200).json({
        message:
          "Laporan HTML berhasil dibuat dan disimpan di server secara langsung.",
        filePath: relativeFilePath, // Kirim path relatif agar client tahu lokasinya
        // Jika ingin mengirim file langsung:
        // res.download(filePath, fileName); (ini akan mengunduh, bukan JSON response)
      });
    } catch (error) {
      console.error(
        `❌ Gagal generate (direct) laporan HTML:`,
        error.message,
        error.stack
      );
      if (!res.headersSent) {
        return res.status(500).json({
          message: `Gagal memproses permintaan: ${error.message}`,
          error: error.message,
        });
      }
    }
  },

  adhocDownloadHtmlReport: async (req, res) => {
    const { id: laporanId } = req.params;
    try {
      console.log(
        `📥 Memicu Adhoc Download HTML untuk ID Laporan: ${laporanId}`
      );
      const laporan = await Laporan.findByPk(laporanId);
      if (!laporan) {
        return res.status(404).json({ message: "Laporan tidak ditemukan." });
      }
      if (!laporan.pdf_path) {
        // pdf_path kini menyimpan path HTML
        return res.status(404).json({
          message: "File laporan HTML tidak ditemukan untuk permintaan ini.",
        });
      }

      const filePath = path.join(__dirname, "../../", laporan.pdf_path); // Sesuaikan path root jika perlu

      if (fs.existsSync(filePath)) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${path.basename(filePath)}"`
        );
        res.setHeader("Content-Type", "text/html");
        fs.createReadStream(filePath).pipe(res);
      } else {
        console.error(
          `File tidak ditemukan di server: ${filePath} untuk laporan ID ${laporanId}`
        );
        return res
          .status(404)
          .json({ message: "File laporan HTML tidak ditemukan di server." });
      }
    } catch (error) {
      console.error(
        `❌ Gagal adhoc download HTML laporan ID ${laporanId}:`,
        error.message,
        error.stack
      );
      if (!res.headersSent) {
        return res.status(500).json({
          message: "Gagal melakukan download adhoc laporan HTML.",
          error: error.message,
        });
      }
    }
  },
};
