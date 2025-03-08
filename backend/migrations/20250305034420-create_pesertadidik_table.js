"use strict";

/** @type {import('sequelize-cli').Migration} */

// migrations/20231001-create-pesertadidik.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pesertadidik", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      gudep_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "gudep",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM("Laki-laki", "Perempuan"),
        allowNull: false,
      },
      ttl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detailtingkatan: {
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
    await queryInterface.dropTable("pesertadidik");
  },
};
