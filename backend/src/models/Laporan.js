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
    target_id: {
      type: DataTypes.STRING, // Sesuaikan tipe data ini dengan tipe ID Kwarran/Gudep Anda (bisa UUID, INTEGER, dll)
      allowNull: true, // Boleh null jika level = 'semua'
    },
    pdf_path: {
      // Untuk menyimpan path relatif ke file PDF
      type: DataTypes.STRING,
      allowNull: true,
    },
    // --- AKHIR FIELD BARU ---
    // Di src/models/Laporan.js
    status: {
      type: DataTypes.ENUM(
        "Menunggu",
        "Setujui", // Tambahkan jika Anda pakai status ini
        "Siap Kirim", // Status setelah PDF dibuat
        "Kirim", // Status setelah email coba dikirim (opsional)
        "Selesai",
        "Error Generate", // Status jika PDF gagal dibuat
        "Error Kirim" // Status jika email gagal dikirim
      ),
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
