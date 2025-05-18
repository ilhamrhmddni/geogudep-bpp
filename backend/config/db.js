const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectModule: config.dialectModule,
  dialectOptions: config.dialectOptions,
  logging: config.logging,
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
