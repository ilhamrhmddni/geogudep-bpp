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

    await queryInterface.bulkInsert("pesertadidik", [
      {
        id: uuidv4(),
        gudep_id: gudep.id, // Ambil ID dari gudep yang sudah ada
        nama: "Peserta 1",
        gender: "Laki-laki",
        ttl: "2000-01-01",
        detailtingkatan: "Detail Tingkatan 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("pesertadidik", null, {});
  },
};
