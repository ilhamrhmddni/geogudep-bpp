const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();
const db = require("./src/models");
const sequelize = require("./config/db");

const app = express();
const rootRoutes = require("./src/routes");

// 🛠 Middleware
app.use(cors()); // Mengaktifkan CORS
app.use(express.json()); // Parsing JSON request body

// Konfigurasi multer untuk upload file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Custom middleware untuk Imgur upload
const uploadToImgur = async (req, res, next) => {
  if (req.file) {
    try {
      const imgurUpload = await axios({
        method: "post",
        url: "https://api.imgur.com/oauth2/authorize",
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
        data: req.file.buffer,
      });
      req.imgurLink = imgurUpload.data.data.link; // Menyimpan link Imgur di request
    } catch (error) {
      console.error("Error uploading to Imgur:", error);
      return res
        .status(500)
        .json({ message: "Gagal mengunggah foto ke Imgur" });
    }
  }
  next();
};

// 🛠 Routes
// Sebelum menggunakan rootRoutes, tambahkan middleware untuk upload ke Imgur
app.use(
  "/api/profile/update/:userId",
  upload.single("photo"),
  uploadToImgur,
  (req, res, next) => {
    // Setelah upload ke Imgur selesai, lanjutkan ke rootRoutes
    next();
  }
);
app.use(rootRoutes);

// 🛠 Error Handling Global
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res
    .status(500)
    .json({ message: "Terjadi kesalahan server", error: err.message });
});

const port = process.env.PORT || 3000; // Gunakan process.env.PORT jika tersedia

// 🛠 Cek Koneksi Database & Jalankan Server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    console.log("✅ Application is running.");
    db.sequelize
      .authenticate()
      .then(() => {
        console.log("✅ Database connected!");
        app.listen(port, () =>
          console.log(`🚀 Server running on port ${port}`)
        );
      })
      .catch((err) => {
        console.error("❌ Database connection error:", err.message);
        console.error("❌ Error details:", err); // Debugging: detail error
        process.exit(1); // Keluar jika koneksi database gagal
      });
  } catch (error) {
    console.error("❌ Failed to start the application:", error.message);
    process.exit(1);
  }
})();

module.exports = app;
