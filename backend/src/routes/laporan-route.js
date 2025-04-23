const express = require("express");
const route = express.Router();

const {
  getAllLaporan,
  getLaporan,
  addLaporan,
  deleteLaporan,
  approveAndGenerate,
  sendEmailWithAttachment,
} = require("../controllers/laporan-controller.js");

route.get("/", getAllLaporan);
route.get("/:id", getLaporan);
route.post("/", addLaporan);
route.put("/:id/approve-generate", approveAndGenerate);
route.delete("/:id", deleteLaporan);
route.post("/:id/send-email", sendEmailWithAttachment);

module.exports = route;
