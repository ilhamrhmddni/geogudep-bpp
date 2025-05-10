const express = require("express");
const route = express.Router();

const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  approveAndStreamPDF,
  approveOnly,
  generateDirectPdf,
  adhocDownload,
} = require("../controllers/laporan-controller.js");

route.get("/", getAllLaporan);
route.get("/:id", getLaporan);
route.post("/", addLaporan);
route.put("/:id/approve-generate", approveAndStreamPDF);
route.put("/:id/approve", approveOnly);
route.post("/generate-direct-pdf", generateDirectPdf);
route.post("/adhoc-download/:id", adhocDownload);
route.delete("/:id", deleteLaporan);

module.exports = route;
