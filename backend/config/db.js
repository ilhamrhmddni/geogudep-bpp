require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  dialectModule: require("pg"),
  logging: false, // Matikan logging query
  pool: {
    max: 10, // Maksimum 10 koneksi
    min: 1, // Minimal 1 koneksi standby
    acquire: 30000, // Waktu tunggu 30 detik sebelum error
    idle: 10000, // Koneksi idle ditutup setelah 10 detik
  },
});

module.exports = sequelize;
