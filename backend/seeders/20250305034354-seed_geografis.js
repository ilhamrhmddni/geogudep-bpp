"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ambil satu ID dari tabel "gudep"
    const gudepData = await queryInterface.sequelize.query(
      `SELECT id FROM "gudep" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

    const gudep = gudepData[0]; // Ambil gudep pertama

    await queryInterface.bulkInsert("geografis", [
      {
        id: uuidv4(),
        gudep_id: gudep.id, // Menggunakan ID dari gudep yang ada
        titik_koordinat: "0,0",
        longitude: "0",
        latitude: "0",
        alamat: "Alamat 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("geografis", null, {});
  },
};
