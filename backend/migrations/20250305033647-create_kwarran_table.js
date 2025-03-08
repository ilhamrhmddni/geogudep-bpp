"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20231001-create-kwarran.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("kwarran", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      kode: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ketua_kwarran: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ketua_dkr: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jumlah_gudep: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
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
    await queryInterface.dropTable("kwarran");
  },
};
