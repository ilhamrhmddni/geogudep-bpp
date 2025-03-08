const express = require("express");
const route = express.Router();

const {
  getAllPrestasis,
  getPrestasiById,
  addPrestasi,
  updatePrestasi,
  deletePrestasi,
} = require("../controllers/prestasi-controller.js");

route.get("/", getAllPrestasis);
route.get("/:id", getPrestasiById);
route.post("/", addPrestasi);
route.put("/:id", updatePrestasi);
route.delete("/:id", deletePrestasi);

module.exports = route;
