// models/User.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Geografis = sequelize.define(
  "Geografis",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    gudep_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "gudep",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      field: "gudep_id",
    },
    titik_koordinat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    tableName: "geografis",
  }
);

module.exports = Geografis;
