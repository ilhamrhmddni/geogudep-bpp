"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const laporanData = [];

    for (let i = 0; i < 30; i++) {
      laporanData.push({
        id: uuidv4(),
        nama: `Laporan ${i + 1}`, // Unique report name
        asal: `Asal ${i + 1}`, // Unique origin
        no_hp: Math.floor(Math.random() * 10000000000), // Random phone number
        email: `laporan${i + 1}@example.com`, // Unique email
        status: i % 2 === 0 ? "true" : "false", // Alternating status
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert multiple records into the "laporan" table
    await queryInterface.bulkInsert("laporan", laporanData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("laporan", null, {});
  },
};
