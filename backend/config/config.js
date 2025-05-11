require("dotenv").config(); // Load .env file

// Ambil variabel dari .env
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const ssl = process.env.DB_SSL === "false"; // Jika SSL diaktifkan, maka "true"

// Bangun URL koneksi untuk PostgreSQL
const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}?sslmode=${
  ssl ? "" : "disable"
}`;

module.exports = {
  databaseUrl,
  dialect: "postgres",
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  logging: false, // Disable logging untuk produksi
  pool: {
    max: 3,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
