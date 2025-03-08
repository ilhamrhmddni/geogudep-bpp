"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20231001-create-event.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event", {
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
      tanggal_mulai: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tanggal_selesai: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tempat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tingkat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      penyelenggara: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable("event");
  },
};
