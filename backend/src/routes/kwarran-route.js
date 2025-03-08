const express = require("express");
const route = express.Router();

const {
  getAllKwarran,
  getKwarran,
  addKwarran,
  deleteKwarran,
  updateKwarran,
} = require("../controllers/kwarran-controller.js");

route.get("/", getAllKwarran);
route.get("/:id", getKwarran);
route.post("/", addKwarran);
route.put("/:id", updateKwarran);
route.delete("/:id", deleteKwarran);

module.exports = route;
