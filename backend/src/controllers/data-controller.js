// Contoh Lokasi File: src/controllers/ReportController.js (atau LaporanController.js)

require("dotenv").config();
// Import Model yang diperlukan
const {
  Laporan,
  Gudep,
  Kwarran,
  User,
  Geografis,
  Event,
  Prestasi,
  PesertaDidik,
} = require("../models");
// Import library
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
// Import Nodemailer dan transporter (komentari jika belum setup)
// const nodemailer = require("nodemailer");
// const transporter = require("../../config/mailer");

// --- Fungsi Helper Generate PDF (Dari KODE LAMA ANDA - Tidak Diubah) ---
const generatePDF = async (htmlContent, fileName) => {
  const pdfDir = path.join(__dirname, `../storage/reports/`);
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  const pdfPath = path.join(pdfDir, `${fileName}.pdf`);
  let browser;
  try {
    browser = await puppeteer.launch({
      /* args: ['--no-sandbox'] */
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });
    console.log(`✅ PDF berhasil dibuat: ${pdfPath}`);
  } catch (err) {
    console.error("❌ Error saat generate PDF:", err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
  return pdfPath;
};

// --- Fungsi Helper Kirim Email (Konsep - Komentari jika belum setup) ---
/*
const sendReportByEmail = async (laporanData, pdfPath) => {
    // ... (logika kirim email dan update status laporan) ...
};
*/

// --- Controller Functions ---
module.exports = {
  // =====================================================
  // Fungsi Generator PDF dari KODE LAMA ANDA (TIDAK DIUBAH)
  // =====================================================
  fetchAllDataAndGeneratePDF: async (req, res) => {
    try {
      console.log("RUNNING: fetchAllDataAndGeneratePDF (Old Version)");
      const allKwaran = await Kwarran.findAll({
        include: [{ model: Gudep, as: "gudepesList" }],
      });
      if (!allKwaran.length)
        return res.status(404).json({ message: "Tidak ada data Kwarran!" });
      const allGudep = await Gudep.findAll({
        include: [
          { model: User, as: "useres" },
          { model: Geografis, as: "geografises" },
          { model: Event, as: "gudepesEvents" },
        ],
      });
      const templatePath = path.join(
        __dirname,
        "../views/report-template.html"
      );
      let template = fs.readFileSync(templatePath, "utf-8");
      const currentDate = new Date().toLocaleString("id-ID", {
        /* format */
      });
      let kwarranRows = allKwaran.map(/* ... */).join("");
      let gudepRows = allGudep.map(/* ... */).join("");
      let geografisRows = allGudep.flatMap(/* ... */).map(/* ... */).join("");
      let eventRows = allGudep.flatMap(/* ... */).map(/* ... */).join("");
      template = template.replace(/* ... placeholders ... */);
      const pdfPath = await generatePDF(template, "Data Mukhtahir");
      // Fungsi ini mengirim respons sendiri
      res.json({ message: "PDF (All) berhasil disimpan!", pdfPath });
    } catch (error) {
      console.error("Error generating PDF (All):", error);
      res.status(500).json({
        message: "Gagal membuat PDF semua data",
        error: error.message,
      });
    }
  },

  fetchDataById: async (req, res) => {
    const { id } = req.params; // ID Gudep
    try {
      console.log(`RUNNING: fetchDataById (Old Version) for Gudep ID: ${id}`);
      const allEvents = await Event.findAll(); // Fetch lama Anda
      const gudep = await Gudep.findOne({
        where: { id },
        include: [
          { model: User, as: "useres" },
          { model: Geografis, as: "geografises" },
          { model: Prestasi, as: "prestasies" },
          { model: PesertaDidik, as: "pesertaDidikes" },
          { model: Kwarran, as: "kwarranes" },
        ],
      });
      if (!gudep)
        return res.status(404).json({ message: "Gudep tidak ditemukan!" });
      const templatePath = path.join(
        __dirname,
        "../views/report-template-gudep.html"
      );
      let template = fs.readFileSync(templatePath, "utf-8");
      const currentDate = new Date().toLocaleString("id-ID", {
        /* format */
      });
      const kwarran = gudep.kwarranes || {};
      const geo = gudep.geografises || {};
      let prestasiRows =
        (gudep.prestasies || [])
          .map((prestasi, index) => {
            const eventName =
              allEvents.find((event) => event.id === prestasi.event_id)?.nama ||
              "-";
            return `<tr>...${eventName}...</tr>`;
          })
          .join("") || "<tr><td colspan='3'>...</td></tr>"; // Perbaiki colspan
      // ... (Variabel dan replace placeholders dari kode lama Anda) ...
      template = template.replace(/* ... placeholders ... */);
      const pdfPath = await generatePDF(template, `detail-gudep-${id}`);
      // Fungsi ini mengirim respons sendiri
      res.json({ message: "PDF (Gudep) berhasil disimpan!", pdfPath });
    } catch (error) {
      console.error(
        "Error fetching/generating Gudep report by ID (Old):",
        error
      );
      res
        .status(500)
        .json({ message: "Gagal membuat laporan Gudep", error: error.message });
    }
  },

  fetchKwarranById: async (req, res) => {
    const { id } = req.params; // ID Kwarran
    try {
      console.log(
        `RUNNING: fetchKwarranById (Old Version) for Kwarran ID: ${id}`
      );
      const allGudep = await Gudep.findAll({
        include: [
          /* ... includes dari kode lama ... */
        ],
      }); // Fetch lama Anda
      const kwarran = await Kwarran.findOne({
        where: { id },
        include: [
          {
            model: Gudep,
            as: "gudepesList",
            include: [
              { model: User, as: "useres" },
              { model: Geografis, as: "geografises" },
            ],
          },
        ],
      });
      if (!kwarran)
        return res.status(404).json({ message: "Kwarran tidak ditemukan!" });
      const templatePath = path.join(
        __dirname,
        "../views/report-template-kwarran.html"
      );
      let template = fs.readFileSync(templatePath, "utf-8");
      const currentDate = new Date().toLocaleString("id-ID", {
        /* format */
      });
      let kwarranRows = `<tr>...</tr>`; // dari kode lama
      let gudepRows = kwarran.gudepesList.map(/* ... */).join("");
      let geografisRows = kwarran.gudepesList
        .flatMap(/* ... */)
        .map(
          (geo) =>
            `<tr><td>...</td><td>${
              allGudep.find((g) => g.id === geo.gudep_id)?.no_gudep || "-"
            }</td>...</tr>`
        )
        .join(""); // Lookup lama
      template = template.replace(/* ... placeholders ... */);
      const pdfPath = await generatePDF(template, `detail-kwarran-${id}`);
      // Fungsi ini mengirim respons sendiri
      res.json({ message: "PDF (Kwarran) berhasil disimpan!", pdfPath });
    } catch (error) {
      console.error(
        "Error fetching/generating Kwarran report by ID (Old):",
        error
      );
      res.status(500).json({
        message: "Gagal membuat laporan Kwarran",
        error: error.message,
      });
    }
  },
  // =====================================================
  // AKHIR Fungsi Generator PDF dari KODE LAMA ANDA
  // =====================================================

  // --- FUNGSI BARU: Update Status Laporan ---
  // (Dipanggil oleh service editLaporanStatus dari frontend Admin)
  updateLaporanStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Ambil status baru dari body

    console.log(`🔄 Mencoba update status Laporan ID ${id} menjadi ${status}`);

    // Validasi status yang diterima (sesuaikan dengan ENUM di model)
    if (
      !status ||
      ![
        "Menunggu",
        "Setujui",
        "Kirim",
        "Selesai",
        "Error Kirim",
        "Error Proses",
      ].includes(status)
    ) {
      console.error(`❌ Status tidak valid: ${status}`);
      return res.status(400).json({ message: "Nilai status tidak valid." });
    }

    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        console.error(
          `❌ Laporan ID ${id} tidak ditemukan untuk update status.`
        );
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      }

      await laporan.update({ status });
      console.log(`✅ Status Laporan ID ${id} berhasil diupdate ke ${status}`);

      return res.status(200).json({
        message: `Status laporan berhasil diubah menjadi '${status}'`,
        data: laporan, // Kirim data terupdate
      });
    } catch (error) {
      console.error(`❌ Error update status laporan ID ${id}:`, error);
      return res.status(500).json({
        message: "Terjadi kesalahan server saat update status",
        error: error.message,
      });
    }
  },

  // --- FUNGSI BARU: Trigger Generate & Kirim (Versi Sederhana) ---
  // (Dipanggil oleh service generateAndSendLaporan dari frontend Admin)
  triggerReportGeneration: async (req, res) => {
    const { id: laporanId } = req.params; // Ambil ID Laporan dari URL
    let laporan;

    try {
      console.log(`⚡ Memicu proses laporan untuk ID: ${laporanId}`);
      laporan = await Laporan.findByPk(laporanId);
      if (!laporan) {
        return res
          .status(404)
          .json({ message: "Data permintaan laporan tidak ditemukan." });
      }

      // --- Logika Sederhana: Langsung update status (anggap proses jalan di background) ---
      // Di aplikasi nyata, Anda akan memanggil generator PDF di sini
      // dan MUNGKIN memanggil sendReportByEmail setelahnya.
      // Untuk sekarang, kita hanya ubah status dan beri respons.
      // Anda perlu mekanisme lain untuk benar-benar menjalankan PDF & email.

      // Contoh: Update status ke 'Diproses' atau langsung 'Kirim' (jika email belum aktif)
      const nextStatus = "Kirim"; // Asumsikan email belum aktif, tandai sbg siap dikirim/selesai proses generate
      await laporan.update({ status: nextStatus });
      console.log(
        `🔄 Status Laporan ID ${laporanId} diupdate ke ${nextStatus} (trigger diterima)`
      );

      // Kirim respons ke Admin Frontend bahwa trigger diterima
      return res.json({
        message: `Permintaan Laporan ${laporan.level} (ID: ${laporanId}) diterima dan status diubah ke '${nextStatus}'. Pembuatan PDF dan pengiriman email perlu ditangani terpisah/nanti.`,
      });
    } catch (error) {
      console.error(
        `❌ Gagal memproses trigger laporan ID ${laporanId}:`,
        error
      );
      // Update status ke Error jika perlu
      // if (laporan) await laporan.update({ status: 'Error Proses' }).catch(e => console.error("Gagal update status ke error", e));
      return res.status(500).json({
        message: "Gagal memproses trigger permintaan laporan.",
        error: error.message,
      });
    }
  },
}; // Akhir module.exports
