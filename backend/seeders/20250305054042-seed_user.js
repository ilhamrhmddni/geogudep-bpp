const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert data ke tabel "user"
    await queryInterface.bulkInsert("user", [
      {
        id: uuidv4(),
        username: "admin",
        email: "admin@example.com",
        password: "$2b$10$hashedpassword",
        role: "operator",
        fullname: "Administrator",
        asal: "Indonesia",
        no_telp: "08123456789",
        photo_path: null,
        isLoggedIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Ambil user_id dari user yang baru dimasukkan
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "user" WHERE username = 'admin' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users.length) throw new Error("User tidak ditemukan!");

    const user = users[0]; // Ambil user pertama

    // Insert data ke tabel "gudep"
    await queryInterface.bulkInsert("gudep", [
      {
        id: uuidv4(),
        user_id: user.id, // Ambil ID user dari hasil query
        no_gudep: "G123",
        tingkatan: "Penegak",
        mabigus: null,
        pembina: null,
        pelatih: null,
        email: null,
        tahun_update: new Date(),
        jumlah_putra: 10,
        jumlah_putri: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Ambil gudep_id dari gudep yang baru dimasukkan
    const gudepData = await queryInterface.sequelize.query(
      `SELECT id FROM "gudep" WHERE user_id = '${user.id}' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!gudepData.length) throw new Error("Gudep tidak ditemukan!");

    const gudep = gudepData[0]; // Ambil gudep pertama

    // Insert data ke tabel "geografis"
    await queryInterface.bulkInsert("geografis", [
      {
        id: uuidv4(),
        gudep_id: gudep.id, // Ambil ID gudep dari hasil query
        titik_koordinat: null,
        longitude: "117.12345",
        latitude: "-0.12345",
        alamat: "Jl. Contoh No.1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("geografis", null, {});
    await queryInterface.bulkDelete("gudep", null, {});
    await queryInterface.bulkDelete("user", null, {});
  },
};
