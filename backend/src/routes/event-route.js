const express = require("express");
const route = express.Router();

const {
  getAllEvents,
  getEvent,
  addEvent,
  deleteEvent,
  updateEvent,
} = require("../controllers/event-controller.js");

route.get("/", getAllEvents);
route.get("/:id", getEvent);
route.post("/", addEvent);
route.put("/:id", updateEvent);
route.delete("/:id", deleteEvent);

module.exports = route;
