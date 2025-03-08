const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const db = require("./src/models");

const app = express();
const rootRoutes = require("./src/routes");

// 🛠 Middleware
app.use(cors()); // Mengaktifkan CORS
app.use(express.json()); // Parsing JSON request body
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded data
app.use(morgan("dev")); // Logging request

// 🛠 Routes
app.use(rootRoutes);

// 🛠 Error Handling Global
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res
    .status(500)
    .json({ message: "Terjadi kesalahan server", error: err.message });
});

const port = process.env.PORT || 3000;

// 🛠 Cek Koneksi Database & Jalankan Server
db.sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected!");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
