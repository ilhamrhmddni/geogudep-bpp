const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Kwarran = sequelize.define(
  "Kwarran",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ketua_kwarran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ketua_dkr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jumlah_gudep: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Default awal adalah 0
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    tableName: "kwarran",
  }
);

module.exports = Kwarran;
