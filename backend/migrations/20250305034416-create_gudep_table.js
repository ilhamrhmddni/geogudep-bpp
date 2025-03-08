"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20231001-create-gudep.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("gudep", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      kwarran_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "kwarran",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      no_gudep: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tingkatan: {
        type: Sequelize.ENUM("Siaga", "Penggalang", "Penegak", "Pandega"),
        defaultValue: "Penegak",
        allowNull: false,
      },
      mabigus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pembina: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pelatih: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      tahun_update: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      jumlah_putra: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      jumlah_putri: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
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
    await queryInterface.dropTable("gudep");
  },
};
