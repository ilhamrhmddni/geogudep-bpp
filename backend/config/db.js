const { Sequelize } = require("sequelize");
const config = require("./config");

if (!config.databaseUrl) {
  throw new Error("❌ DATABASE_URL is not defined in the configuration.");
}

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: false, // Disable logging for production
  pool: config.pool,
});

// Check database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;
