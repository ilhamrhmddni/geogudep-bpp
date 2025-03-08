"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ambil satu ID event dari tabel "event"
    const eventData = await queryInterface.sequelize.query(
      `SELECT id FROM "event" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Ambil satu ID gudep dari tabel "gudep"
    const gudepData = await queryInterface.sequelize.query(
      `SELECT id FROM "gudep" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Pastikan data event dan gudep tersedia
    if (!eventData.length) throw new Error("Tidak ada data Event!");
    if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

    const event = eventData[0]; // Ambil event pertama
    const gudep = gudepData[0]; // Ambil gudep pertama

    await queryInterface.bulkInsert("prestasi", [
      {
        id: uuidv4(),
        event_id: event.id, // Menggunakan ID event dari database
        gudep_id: gudep.id, // Menggunakan ID gudep dari database
        keterangan: "Prestasi 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("prestasi", null, {});
  },
};
