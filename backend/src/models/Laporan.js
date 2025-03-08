const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Laporan = sequelize.define(
  "Laporan",
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
    asal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_hp: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM("Menunggu", "Setujui", "Kirim", "Selesai"),
      allowNull: false,
      defaultValue: "Menunggu",
    },
  },
  {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    tableName: "laporan",
  }
);

module.exports = Laporan;
