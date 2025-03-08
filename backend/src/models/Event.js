const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_mulai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tanggal_selesai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tempat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tingkat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    penyelenggara: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    tableName: "event",
  }
);

module.exports = Event;
