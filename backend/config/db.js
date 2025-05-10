const { Sequelize } = require("sequelize"); // Import Sequelize
const config = require("./config"); // Import konfigurasi dari file config.js

// Membuat instance Sequelize menggunakan databaseUrl yang ada di config
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectModule: config.dialectModule,
  dialectOptions: config.dialectOptions,
  logging: config.logging, // Menonaktifkan log untuk produksi
  pool: config.pool, // Pengaturan untuk pool koneksi
});

// Fungsi untuk menguji koneksi ke database
async function testConnection() {
  try {
    await sequelize.authenticate(); // Coba autentikasi ke database
    console.log(
      "✅ Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1); // Keluar jika koneksi gagal
  }
}

// Tes koneksi saat aplikasi dijalankan
testConnection();

module.exports = sequelize; // Ekspor sequelize untuk digunakan di tempat lain
