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
route.put(
  "/:id",
  upload.single("profilePicture"), // 2. Middleware Multer: Tangani satu file dari field 'profilePicture' & taruh di req.file
  updateUser // 3. Controller Anda (akan bisa akses req.file dan req.body)
);

module.exports = route;
