"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
// seeders/20231001-demo-laporan.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("laporan", [
      {
        id: uuidv4(),
        nama: "Laporan 1",
        asal: "Asal 1",
        no_hp: 1234567890,
        email: "laporan1@example.com",
        status: "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("laporan", null, {});
  },
};
