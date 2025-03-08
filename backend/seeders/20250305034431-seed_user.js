"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
// seeders/20231001-demo-user.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("user", [
      {
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
      },
      {
        id: uuidv4(),
        username: "operator",
        email: "operator@example.com",
        password: "password123",
        role: "operator",
        fullname: "Operator User",
        asal: "Bandung",
        no_telp: "08123456788",
        photo_path: null,
        isLoggedIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("user", null, {});
  },
};
