"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
// seeders/20231001-demo-kwarran.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("kwarran", [
      {
        id: uuidv4(),
        kode: 1,
        nama: "Kwarran 1",
        ketua_kwarran: "Ketua 1",
        ketua_dkr: "Ketua DKR 1",
        jumlah_gudep: 0,
        email: "kwarran1@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        kode: 2,
        nama: "Kwarran 2",
        ketua_kwarran: "Ketua 2",
        ketua_dkr: "Ketua DKR 2",
        jumlah_gudep: 0,
        email: "kwarran2@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("kwarran", null, {});
  },
};
