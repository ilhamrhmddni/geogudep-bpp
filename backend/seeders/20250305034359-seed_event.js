"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
// seeders/20231001-demo-event.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("event", [
      {
        id: uuidv4(),
        nama: "Event 1",
        tanggal_mulai: new Date(),
        tanggal_selesai: new Date(),
        tempat: "Tempat 1",
        tingkat: "Tingkat 1",
        penyelenggara: "Penyelenggara 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("event", null, {});
  },
};
