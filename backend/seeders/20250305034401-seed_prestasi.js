"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const prestasiData = [];

    for (let i = 0; i < 30; i++) {
      // Ambil satu ID event secara acak dari tabel "event"
      const eventData = await queryInterface.sequelize.query(
        `SELECT id FROM "event" ORDER BY RANDOM() LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Ambil satu ID gudep secara acak dari tabel "gudep"
      const gudepData = await queryInterface.sequelize.query(
        `SELECT id FROM "gudep" ORDER BY RANDOM() LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Pastikan data event dan gudep tersedia
      if (!eventData.length) throw new Error("Tidak ada data Event!");
      if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

      const event = eventData[0]; // Ambil event pertama
      const gudep = gudepData[0]; // Ambil gudep pertama

      // Tambahkan data Prestasi ke array
      prestasiData.push({
        id: uuidv4(),
        event_id: event.id, // Menggunakan ID event dari database
        gudep_id: gudep.id, // Menggunakan ID gudep dari database
        keterangan: `Prestasi ${i + 1}`, // Unique achievement description
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert multiple records into the "prestasi" table
    await queryInterface.bulkInsert("prestasi", prestasiData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("prestasi", null, {});
  },
};
