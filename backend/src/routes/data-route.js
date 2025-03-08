// src/routes/data-route.js
const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data-controller"); // Adjust the path as necessary

// Define the route to fetch all data and generate PDF
router.get("/all", dataController.fetchAllDataAndGeneratePDF); // Ensure this function is defined in your controller
// Define other routes as needed
router.get("/gudep/:id", dataController.fetchDataById);
router.get("/kwarran/:id", dataController.fetchKwarranById);

module.exports = router;
