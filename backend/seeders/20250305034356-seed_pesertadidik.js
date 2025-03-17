"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const pesertaDidikData = [];

    for (let i = 0; i < 30; i++) {
      // Ambil satu ID gudep secara acak dari tabel "gudep"
      const gudepData = await queryInterface.sequelize.query(
        `SELECT id FROM "gudep" ORDER BY RANDOM() LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

      const gudep = gudepData[0]; // Ambil gudep pertama

      // Tambahkan data Peserta Didik ke array
      pesertaDidikData.push({
        id: uuidv4(),
        gudep_id: gudep.id, // Menggunakan ID dari gudep yang ada
        nama: `Peserta ${i + 1}`, // Unique name for each participant
        gender: i % 2 === 0 ? "Laki-laki" : "Perempuan", // Alternating gender
        ttl: `2000-01-${String((i % 28) + 1).padStart(2, "0")}`, // Random birth date
        detailtingkatan: `Detail Tingkatan ${i + 1}`, // Unique detail for each participant
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert multiple records into the "pesertadidik" table
    await queryInterface.bulkInsert("pesertadidik", pesertaDidikData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("pesertadidik", null, {});
  },
};
