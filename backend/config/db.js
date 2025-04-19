const { Sequelize } = require("sequelize");
require("dotenv").config();
const config = require("./config");

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: false,
});

// Cek koneksi database
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected via Connection Pool!"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;
