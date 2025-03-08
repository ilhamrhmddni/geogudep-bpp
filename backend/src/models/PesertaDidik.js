const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const PesertaDidik = sequelize.define(
  "PesertaDidik",
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
        as: "gudepes"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      field: "gudep_id",
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Laki-laki", "Perempuan"),
      allowNull: false,
    },
    ttl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detailtingkatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    timestamps: true,
    tableName: "pesertadidik",
  }
);

module.exports = PesertaDidik;
