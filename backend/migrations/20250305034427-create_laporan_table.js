"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20231001-create-laporan.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("laporan", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      asal: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      no_hp: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      status: {
        type: Sequelize.ENUM("false", "true"),
        allowNull: false,
        defaultValue: "false",
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
    await queryInterface.dropTable("laporan");
  },
};
