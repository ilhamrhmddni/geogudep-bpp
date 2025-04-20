const fs = require("fs");
const path = require("path");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "❌ DATABASE_URL is not defined in the environment variables."
  );
}

const certsPath = path.join(__dirname, "certs");
const sslOptions = {
  require: false, // Match old configuration
  rejectUnauthorized: false, // Match old configuration
};

module.exports = {
  databaseUrl,
  dialect: "postgres",
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: sslOptions,
  },
  logging: false, // Disable logging for production
  pool: {
    max: 3,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
