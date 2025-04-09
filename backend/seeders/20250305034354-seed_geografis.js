// "use strict";
// const { v4: uuidv4 } = require("uuid");

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const geografisData = [];

//     for (let i = 0; i < 30; i++) {
//       // Ambil satu ID gudep secara acak dari tabel "gudep"
//       const gudepData = await queryInterface.sequelize.query(
//         `SELECT id FROM "gudep" ORDER BY RANDOM() LIMIT 1;`,
//         { type: Sequelize.QueryTypes.SELECT }
//       );

//       if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

//       const gudep = gudepData[0]; // Ambil gudep pertama

//       // Tambahkan data Geografis ke array
//       geografisData.push({
//         id: uuidv4(),
//         gudep_id: gudep.id, // Menggunakan ID dari gudep yang ada
//         titik_koordinat: `${Math.random() * 180 - 90},${
//           Math.random() * 360 - 180
//         }`, // Random coordinates
//         longitude: (Math.random() * 360 - 180).toString(), // Random longitude
//         latitude: (Math.random() * 180 - 90).toString(), // Random latitude
//         alamat: `Alamat ${i + 1}`, // Unique address
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//     }

//     // Insert multiple records into the "geografis" table
//     await queryInterface.bulkInsert("geografis", geografisData);
//   },

//   down: async (queryInterface) => {
//     await queryInterface.bulkDelete("geografis", null, {});
//   },
// };

"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ambil satu ID gudep secara acak dari tabel "gudep"
    const gudepData = await queryInterface.sequelize.query(
      `SELECT id FROM "gudep" ORDER BY RANDOM() LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!gudepData.length) throw new Error("Tidak ada data Gudep!");

    const gudep = gudepData[0]; // Ambil gudep pertama

    // Buat satu data Geografis
    const geografisData = {
      id: uuidv4(),
      gudep_id: gudep.id, // Menggunakan ID dari gudep yang ada
      titik_koordinat: `${Math.random() * 180 - 90},${
        Math.random() * 360 - 180
      }`, // Random coordinates
      longitude: (Math.random() * 360 - 180).toString(), // Random longitude
      latitude: (Math.random() * 180 - 90).toString(), // Random latitude
      alamat: "Alamat 1", // Unique address
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert satu record ke tabel "geografis"
    await queryInterface.bulkInsert("geografis", [geografisData]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("geografis", { alamat: "Alamat 1" }, {});
  },
};
