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

    await queryInterface.bulkInsert("user", userData);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("user", null, {});
  },
};
