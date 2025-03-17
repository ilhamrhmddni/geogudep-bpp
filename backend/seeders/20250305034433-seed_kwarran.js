"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const kwarranData = [];

    // Create 6 kwarran entries
    for (let i = 1; i <= 6; i++) {
      kwarranData.push({
        id: uuidv4(),
        kode: i, // Unique code for each kwarran
        nama: `Kwarran ${i}`, // Unique name for each kwarran
        ketua_kwarran: `Ketua ${i}`, // Unique leader name for each kwarran
        ketua_dkr: `Ketua DKR ${i}`, // Unique DKR leader name for each kwarran
        jumlah_gudep: 0, // Initial number of Gudep
        email: `kwarran${i}@example.com`, // Unique email for each kwarran
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert multiple records into the "kwarran" table
    await queryInterface.bulkInsert("kwarran", kwarranData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("kwarran", null, {});
  },
};
