const { Sequelize } = require("sequelize");
const config = require("./config");

if (!config.databaseUrl) {
  console.error("❌ DATABASE_URL is not defined in the environment variables.");
  process.exit(1);
}

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectModule: config.dialectModule,
  dialectOptions: config.dialectOptions,
  logging: false, // Disable logging for production
  pool: config.pool,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      "✅ Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = sequelize;
