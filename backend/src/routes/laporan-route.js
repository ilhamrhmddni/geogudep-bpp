// src/routes/laporan-route.js
const express = require("express");
const route = express.Router();

// Impor fungsi controller yang sudah disesuaikan
const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  approveOnly, // Untuk mengubah status menjadi "Setujui"
  approveAndPrepareReportData, // Menggantikan approveAndGeneratePdfReport
  prepareDirectReportData, // Menggantikan generateDirectPdfReport
  updateLaporanStatusAndPath, // Endpoint baru untuk update setelah PDF klien dibuat
} = require("../controllers/laporan-controller.js");

// Middleware otentikasi Anda (misalnya, verifyAdminToken)
// const { verifyAdminToken } = require('../middleware/authMiddleware'); // Sesuaikan path

// Rute yang umumnya memerlukan otentikasi admin (tambahkan middleware Anda)
route.get("/", /* verifyAdminToken, */ getAllLaporan);
route.get("/:id", /* verifyAdminToken, */ getLaporan);
route.delete("/:id", /* verifyAdminToken, */ deleteLaporan);
route.put("/:id/approve", /* verifyAdminToken, */ approveOnly);

// Rute baru untuk alur PDF di klien
route.put(
  "/:id/approve-prepare-data",
  /* verifyAdminToken, */ approveAndPrepareReportData
);
route.post(
  "/prepare-direct-data",
  /* verifyAdminToken, */ prepareDirectReportData
);
route.put(
  "/:id/update-status-path",
  /* verifyAdminToken, */ updateLaporanStatusAndPath
);

// Rute publik untuk membuat permintaan laporan
route.post("/", addLaporan);

module.exports = route;
