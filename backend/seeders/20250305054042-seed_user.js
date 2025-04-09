"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    const userData = [];

    // Add the admin user
    userData.push({
      id: uuidv4(),
      username: "admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      fullname: "Admin User",
      asal: "Jakarta",
      no_telp: "08123456789",
      photo_path: null,
      isLoggedIn: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // // Add multiple operator users
    // for (let i = 0; i < 29; i++) {
    //   // 29 operators to make a total of 30 users
    //   userData.push({
    //     id: uuidv4(),
    //     username: `operator${i + 1}`, // Unique username for each operator
    //     email: `operator${i + 1}@example.com`, // Unique email for each operator
    //     password: "password123",
    //     role: "operator",
    //     fullname: `Operator User ${i + 1}`, // Unique full name for each operator
    //     asal: "Bandung",
    //     no_telp: `0812345678${i + 1}`, // Unique phone number for each operator
    //     photo_path: null,
    //     isLoggedIn: false,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   });
    // }

    // Insert multiple records into the "user" table
    await queryInterface.bulkInsert("user", userData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("user", null, {});
  },
};
