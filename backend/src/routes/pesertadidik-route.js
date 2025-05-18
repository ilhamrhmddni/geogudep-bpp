const express = require("express");
const route = express.Router();

const {
  getAllPesertaDidik,
  getPesertaDidik,
  addPesertaDidik,
  deletePesertaDidik,
  updatePesertaDidik,
  getPesertaDidikByGudepId,
} = require("../controllers/pesertadidik-controller.js");

// Middleware otentikasi Anda (misalnya, verifyAdminToken)
route.get("/gudep", getPesertaDidikByGudepId);
route.get("/", getAllPesertaDidik);
route.get("/:id", getPesertaDidik);
route.post("/", addPesertaDidik);
route.put("/:id", updatePesertaDidik);
route.delete("/:id", deletePesertaDidik);

module.exports = route;
