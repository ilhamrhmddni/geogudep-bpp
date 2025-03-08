const express = require("express");
const route = express.Router();

const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  updateLaporan,
} = require("../controllers/laporan-controller.js");

route.get("/", getAllLaporan);
route.get("/:id", getLaporan);
route.post("/", addLaporan);
route.put("/:id/status", updateLaporan);
route.delete("/:id", deleteLaporan);

module.exports = route;
