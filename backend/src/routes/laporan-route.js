const express = require("express");
const route = express.Router();

// Pastikan nama fungsi yang diimpor sesuai dengan yang ada di controller setelah perubahan
const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  approveAndGenerateHtmlReport, // Nama fungsi diubah
  approveOnly,
  generateDirectHtmlReport, // Nama fungsi diubah
  adhocDownloadHtmlReport, // Nama fungsi diubah
} = require("../controllers/laporan-controller.js");

// Rute untuk mendapatkan semua laporan dan laporan berdasarkan ID tetap sama
route.get("/", getAllLaporan);
route.get("/:id", getLaporan);

// Rute untuk menambah permintaan laporan baru tetap sama
route.post("/", addLaporan);

// Rute untuk menyetujui dan menghasilkan laporan (sekarang HTML)
// Path mungkin bisa disederhanakan jika mau, misal menjadi /:id/generate-html
route.put("/:id/approve-generate-html", approveAndGenerateHtmlReport); // Path dan handler diubah

// Rute untuk hanya menyetujui status laporan tetap sama
route.put("/:id/approve", approveOnly);

// Rute untuk generate laporan HTML secara langsung
route.post("/generate-direct-html", generateDirectHtmlReport); // Path dan handler diubah

// Rute untuk download ad-hoc laporan HTML yang sudah ada
route.get("/adhoc-download-html/:id", adhocDownloadHtmlReport); // Menggunakan GET karena ini untuk mengambil file, path diubah

// Rute untuk menghapus laporan tetap sama
route.delete("/:id", deleteLaporan);

module.exports = route;
