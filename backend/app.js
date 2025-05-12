// --- Imports ---
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();
const db = require("./src/models");
const sequelize = require("./config/db");
const path = require("path");

// --- Initializations ---
const app = express();
const rootRoutes = require("./src/routes");

// --- Global Middleware ---
app.use(cors());
app.use(express.json());

// --- File Upload Configuration (Multer) ---
const storage = multer.memoryStorage(); // Simpan file di memori
const upload = multer({ storage: storage });
app.use(
  "/reports",
  express.static(path.join(__dirname, "generated_html_reports"))
);

// --- Custom Middleware: Imgur Upload ---
const uploadToImgur = async (req, res, next) => {
  if (req.file) {
    try {
      const imgurUpload = await axios({
        method: "post",
        url: "https://api.imgur.com/3/image", // Imgur API endpoint for image upload
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
        data: req.file.buffer,
      });
      // Simpan link Imgur ke request object
      req.imgurLink = imgurUpload.data.data.link;
      next(); // Lanjut HANYA jika upload berhasil
    } catch (error) {
      const errorMessage = error.response?.data?.data?.error || error.message;
      console.error("❌ Error uploading to Imgur:", errorMessage);
      // Format error response konsisten dengan global handler
      res.status(500).json({
        message: "Gagal mengunggah foto ke Imgur",
        error: errorMessage,
      });
      // Jangan panggil next() jika error
    }
  } else {
    // Jika tidak ada file, langsung lanjut
    next();
  }
};

// --- Route-Specific Middleware (Imgur Upload Trigger) ---
// Middleware ini akan dijalankan untuk route yang cocok dengan " /:userId"
// PERHATIAN: Ada spasi " /:userId"
app.use(" /:userId", upload.single("photo"), uploadToImgur); // Hapus middleware inline terakhir karena uploadToImgur sudah memanggil next()

// --- Main Routes ---
app.use(rootRoutes);

// --- Global Error Handling ---
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res
    .status(500)
    .json({ message: "Terjadi kesalahan pada server", error: err.message });
});

// --- Server Configuration & Startup ---
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Autentikasi koneksi database (menggunakan kedua instance jika diperlukan)
    await sequelize.authenticate();
    await db.sequelize.authenticate();
    console.log("✅ Database connected!");

    // Jalankan server
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Failed to start the application:", error.message);
    console.error("❌ Error details:", error); // Detail error penting saat startup gagal
    process.exit(1); // Keluar dari aplikasi jika startup gagal
  }
})();

// --- Exports ---
module.exports = app;
