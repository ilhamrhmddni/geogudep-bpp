"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ambil satu ID user dari tabel "user"
    const userData = await queryInterface.sequelize.query(
      `SELECT id FROM "user" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Ambil satu ID kwarran dari tabel "kwarran"
    const kwarranData = await queryInterface.sequelize.query(
      `SELECT id FROM "kwarran" LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Pastikan data user dan kwarran tersedia
    if (!userData.length) throw new Error("Tidak ada data User!");
    if (!kwarranData.length) throw new Error("Tidak ada data Kwarran!");

    const user = userData[0]; // Ambil user pertama
    const kwarran = kwarranData[0]; // Ambil kwarran pertama

    await queryInterface.bulkInsert("gudep", [
      {
        id: uuidv4(),
        user_id: user.id, // Menggunakan ID user dari database
        kwarran_id: kwarran.id, // Menggunakan ID kwarran dari database
        no_gudep: "001",
        tingkatan: "Penggalang",
        mabigus: "Mabigus 1",
        pembina: "Pembina 1",
        pelatih: "Pelatih 1",
        email: "gudep1@example.com",
        tahun_update: new Date(),
        jumlah_putra: 10,
        jumlah_putri: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("gudep", null, {});
  },
};
