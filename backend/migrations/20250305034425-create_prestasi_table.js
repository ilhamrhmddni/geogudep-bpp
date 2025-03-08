"use strict";

/** @type {import('sequelize-cli').Migration} */
// migrations/20231001-create-prestasi.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("prestasi", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "event",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gudep_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "gudep",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      keterangan: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("prestasi");
  },
};
