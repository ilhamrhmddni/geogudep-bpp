// src/models/laporan.js (atau path yang sesuai)

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db"); // Pastikan path db config benar

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
      // --- SARAN: Gunakan STRING untuk No HP ---
      type: DataTypes.STRING, // Lebih fleksibel daripada BIGINT
      // ---------------------------------------
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    // --- FIELD BARU ---
    level: {
      type: DataTypes.ENUM("semua", "kwarran", "gudep"), // Sesuaikan valuenya jika perlu
      allowNull: false, // Anggap level selalu wajib dipilih
      defaultValue: "semua",
    },
    // models/laporan.js
    target_id: {
      type: DataTypes.UUID, // <-- Ubah tipe data
      allowNull: true, // Izinkan null jika level 'semua'
    },
    pdf_path: {
      // Untuk menyimpan path relatif ke file PDF
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Menunggu", "Setujui", "Selesai", "Error Generate"),
      allowNull: false,
      defaultValue: "Menunggu",
    },
  },
  {
    sequelize,
    freezeTableName: true,
    timestamps: true, // Jika Anda ingin createdAt dan updatedAt
    tableName: "laporan",
  }
);

module.exports = Laporan;
