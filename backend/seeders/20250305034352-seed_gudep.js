// "use strict";
// const { v4: uuidv4 } = require("uuid");

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const gudepData = [];

//     for (let i = 0; i < 30; i++) {
//       // Ambil satu ID user secara acak dari tabel "user"
//       const userData = await queryInterface.sequelize.query(
//         `SELECT id FROM "user" ORDER BY RANDOM() LIMIT 1;`,
//         { type: Sequelize.QueryTypes.SELECT }
//       );

//       // Ambil satu ID kwarran secara acak dari tabel "kwarran"
//       const kwarranData = await queryInterface.sequelize.query(
//         `SELECT id FROM "kwarran" ORDER BY RANDOM() LIMIT 1;`,
//         { type: Sequelize.QueryTypes.SELECT }
//       );

//       // Pastikan data user dan kwarran tersedia
//       if (!userData.length) throw new Error("Tidak ada data User!");
//       if (!kwarranData.length) throw new Error("Tidak ada data Kwarran!");

//       const user = userData[0]; // Ambil user pertama
//       const kwarran = kwarranData[0]; // Ambil kwarran pertama

//       // Tambahkan data Gudep ke array
//       gudepData.push({
//         id: uuidv4(),
//         user_id: user.id,
//         kwarran_id: kwarran.id,
//         no_gudep: (i + 1).toString().padStart(3, "0"), // Format no_gudep
//         tingkatan:
//           i % 3 === 0 ? "Penggalang" : i % 3 === 1 ? "Penegak" : "Siaga",
//         mabigus: `Mabigus ${i + 1}`,
//         pembina: `Pembina ${i + 1}`,
//         pelatih: `Pelatih ${i + 1}`,
//         email: `gudep${i + 1}@example.com`,
//         tahun_update: new Date(),
//         jumlah_putra: Math.floor(Math.random() * 20),
//         jumlah_putri: Math.floor(Math.random() * 20),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//     }

//     // Insert multiple records into the "gudep" table
//     await queryInterface.bulkInsert("gudep", gudepData);
//   },

//   down: async (queryInterface) => {
//     await queryInterface.bulkDelete("gudep", null, {});
//   },
// };

"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ambil satu ID user secara acak dari tabel "user"
    const userData = await queryInterface.sequelize.query(
      `SELECT id FROM "user" ORDER BY RANDOM() LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Ambil satu ID kwarran secara acak dari tabel "kwarran"
    const kwarranData = await queryInterface.sequelize.query(
      `SELECT id FROM "kwarran" ORDER BY RANDOM() LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Pastikan data user dan kwarran tersedia
    if (!userData.length) throw new Error("Tidak ada data User!");
    if (!kwarranData.length) throw new Error("Tidak ada data Kwarran!");

    const user = userData[0]; // Ambil user pertama
    const kwarran = kwarranData[0]; // Ambil kwarran pertama

    // Buat satu data Gudep
    const gudepData = {
      id: uuidv4(),
      user_id: user.id,
      kwarran_id: kwarran.id,
      no_gudep: "001", // Nomor Gudep pertama
      tingkatan: "Penegak",
      mabigus: "Mabigus 1",
      pembina: "Pembina 1",
      pelatih: "Pelatih 1",
      email: "gudep1@example.com",
      tahun_update: new Date(),
      jumlah_putra: 10,
      jumlah_putri: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert satu record ke tabel "gudep"
    await queryInterface.bulkInsert("gudep", [gudepData]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("gudep", { no_gudep: "001" }, {});
  },
};
