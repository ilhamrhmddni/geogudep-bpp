const { Sequelize } = require("sequelize");
const config = require("../config/config");

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: config.dialect,
  dialectModule: config.dialectModule,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  },
  logging: console.log, // Enable detailed logs
});

module.exports = sequelize;
