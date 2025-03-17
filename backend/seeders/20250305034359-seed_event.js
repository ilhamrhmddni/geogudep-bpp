"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const eventData = [];

    for (let i = 0; i < 30; i++) {
      eventData.push({
        id: uuidv4(),
        nama: `Event ${i + 1}`, // Unique event name
        tanggal_mulai: new Date(Date.now() + i * 86400000), // Start date, one day apart
        tanggal_selesai: new Date(Date.now() + (i + 1) * 86400000), // End date, one day after start date
        tempat: `Tempat ${i + 1}`, // Unique location
        tingkat: `Tingkat ${(i % 3) + 1}`, // Alternating level (1, 2, or 3)
        penyelenggara: `Penyelenggara ${i + 1}`, // Unique organizer
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert multiple records into the "event" table
    await queryInterface.bulkInsert("event", eventData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("event", null, {});
  },
};
