const express = require("express");
const route = express.Router();

const {
  getAllGudep,
  getGudep,
  updateGudep,
} = require("../controllers/gudep-controller.js");

route.get("/", getAllGudep);
route.get("/:id", getGudep);
route.put("/:id", updateGudep);

module.exports = route;
