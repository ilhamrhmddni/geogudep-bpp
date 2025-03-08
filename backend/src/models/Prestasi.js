const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Prestasi = sequelize.define(
  "Prestasi",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "event",
        key: "id",
        as: "eventes",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "event_id",
    },
    gudep_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "gudep",
        key: "id",
        as: "gudepes",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "gudep_id",
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    tableName: "prestasi",
  }
);

module.exports = Prestasi;
