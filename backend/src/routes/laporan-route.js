// src/routes/laporan-route.js
const express = require("express");
const route = express.Router();

const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  approveAndGeneratePdfReport, // Nama fungsi sudah disesuaikan untuk PDF
  approveOnly,
  generateDirectPdfReport, // Nama fungsi sudah disesuaikan untuk PDF
  adhocDownloadPdfReport, // Nama fungsi sudah disesuaikan untuk PDF
} = require("../controllers/laporan-controller.js");

route.get("/", getAllLaporan);
route.get("/:id", getLaporan);
route.post("/", addLaporan);
route.delete("/:id", deleteLaporan);

route.put("/:id/approve-generate-pdf", approveAndGeneratePdfReport); // Endpoint untuk PDF
route.put("/:id/approve", approveOnly);
route.post("/generate-direct-pdf", generateDirectPdfReport); // Endpoint untuk PDF
route.get("/adhoc-download-pdf/:id", adhocDownloadPdfReport); // Endpoint untuk PDF

module.exports = route;
