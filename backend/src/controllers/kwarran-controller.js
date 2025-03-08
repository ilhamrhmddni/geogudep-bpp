const { Kwarran } = require("../models");

module.exports = {
  // Ambil semua data Kwarran
  getAllKwarran: async (req, res) => {
    try {
      const allKwarran = await Kwarran.findAll();
      return res.status(200).json({
        message: "Data Kwarran berhasil didapatkan",
        data: allKwarran,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil satu data Kwarran berdasarkan ID
  getKwarran: async (req, res) => {
    const { id } = req.params;
    try {
      const kwarran = await Kwarran.findByPk(id);
      if (!kwarran) {
        return res
          .status(404)
          .json({ message: "Data Kwarran tidak ditemukan" });
      }
      return res.status(200).json({
        message: "Data Kwarran berhasil didapatkan",
        data: kwarran,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Tambah data Kwarran
  addKwarran: async (req, res) => {
    const { kode, nama, ketua_kwarran, ketua_dkr, jumlah_gudep, email } =
      req.body;

    if (!kode || !nama) {
      return res.status(400).json({
        message: "Kode, nama, dan jumlah gugus depan wajib diisi",
      });
    }

    try {
      const newKwarran = await Kwarran.create({
        kode,
        nama,
        ketua_kwarran,
        ketua_dkr,
        jumlah_gudep,
        email,
      });
      return res.status(201).json({
        message: "Data Kwarran berhasil ditambahkan",
        data: newKwarran,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus data Kwarran berdasarkan ID
  deleteKwarran: async (req, res) => {
    const { id } = req.params;
    try {
      const kwarran = await Kwarran.findByPk(id);
      if (!kwarran) {
        return res
          .status(404)
          .json({ message: "Data Kwarran tidak ditemukan" });
      }
      await kwarran.destroy();
      return res.status(200).json({ message: "Data Kwarran berhasil dihapus" });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Edit data Kwarran berdasarkan ID
  updateKwarran: async (req, res) => {
    const { id } = req.params;
    const { kode, nama, ketua_kwarran, ketua_dkr, jumlah_gudep, email } =
      req.body;

    try {
      const kwarran = await Kwarran.findByPk(id);
      if (!kwarran) {
        return res
          .status(404)
          .json({ message: "Data Kwarran tidak ditemukan" });
      }

      await kwarran.update({
        kode,
        nama,
        ketua_kwarran,
        ketua_dkr,
        jumlah_gudep,
        email,
      });

      return res.status(200).json({
        message: "Data Kwarran berhasil diperbarui",
        data: kwarran,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
