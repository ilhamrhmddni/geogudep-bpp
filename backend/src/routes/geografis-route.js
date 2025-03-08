const express = require("express");
const route = express.Router();

const {
  getAllGeografis,
  getGeografis,
  updateGeografis,
} = require("../controllers/geografis-controller.js");

route.get("/", getAllGeografis);
route.get("/:id", getGeografis);
route.put("/:id", updateGeografis);

module.exports = route;
