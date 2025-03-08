"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20250305054203-create-user.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("admin", "operator"),
        defaultValue: "operator",
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      asal: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      no_telp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      photo_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isLoggedIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("user");
  },
};
