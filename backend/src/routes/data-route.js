// src/routes/data-route.js (SUDAH BENAR untuk tujuannya)
const express = require("express");
const router = express.Router();
// Asumsikan dataController berisi fetchAllDataAndGeneratePDF, fetchDataById, fetchKwarranById
const dataController = require("../controllers/data-controller"); // Atau DataController

router.get("/all", dataController.fetchAllDataAndGeneratePDF);
router.get("/gudep/:id", dataController.fetchDataById);
router.get("/kwarran/:id", dataController.fetchKwarranById);

module.exports = router;
