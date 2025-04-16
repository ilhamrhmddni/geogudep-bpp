const express = require("express");
const route = express.Router();
const upload = require("../middlewares/uploadMiddleware.js");

const {
  getAllUser,
  getUser,
  addUser,
  deleteUser,
  updateUser,
} = require("../controllers/user-controller.js");

route.get("/:id", getUser);
route.get("/", getAllUser);
route.post("/", addUser);
route.delete("/:id", deleteUser);
route.put("/:id", upload.single("photo_path"), updateUser);

module.exports = route;
