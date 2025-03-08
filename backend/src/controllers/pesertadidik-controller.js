const { PesertaDidik, Gudep } = require("../models");

module.exports = {
  // Ambil semua peserta didik
  getAllPesertaDidik: async (req, res) => {
    try {
      const allPesertaDidik = await PesertaDidik.findAll({
        include: [
          {
            model: Gudep,
            attributes: ["id", "no_gudep", "tingkatan"],
            required: true,
            as: "gudepes",
          },
        ],
      });
      return res.status(200).json({
        message: "Data peserta didik berhasil didapatkan",
        data: allPesertaDidik,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil peserta didik berdasarkan ID
  getPesertaDidik: async (req, res) => {
    const { id } = req.params;

    try {
      const pesertaDidik = await PesertaDidik.findByPk(id);
      if (!pesertaDidik) {
        return res.status(404).json({
          message: "Peserta didik tidak ditemukan",
        });
      }
      return res.status(200).json({
        message: "Data peserta didik berhasil didapatkan",
        data: pesertaDidik,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Tambah peserta didik baru
  addPesertaDidik: async (req, res) => {
    const { gudep_id, nama, gender, ttl, detailtingkatan } = req.body;

    try {
      const newPesertaDidik = await PesertaDidik.create({
        gudep_id,
        nama,
        gender,
        ttl,
        detailtingkatan,
      });

      return res.status(201).json({
        message: "Peserta didik berhasil ditambahkan",
        data: newPesertaDidik,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus peserta didik berdasarkan ID
  deletePesertaDidik: async (req, res) => {
    const { id } = req.params;

    try {
      const pesertaDidik = await PesertaDidik.findByPk(id);
      if (!pesertaDidik) {
        return res.status(404).json({
          message: "Peserta didik tidak ditemukan",
        });
      }

      await pesertaDidik.destroy();
      return res.status(200).json({
        message: "Peserta didik berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Update peserta didik berdasarkan ID
  updatePesertaDidik: async (req, res) => {
    const { id } = req.params;
    const { id_gudep, nama, gender, ttl, detailtingkatan } = req.body;

    try {
      const pesertaDidik = await PesertaDidik.findByPk(id);
      if (!pesertaDidik) {
        return res.status(404).json({
          message: "Peserta didik tidak ditemukan",
        });
      }

      await pesertaDidik.update({
        id_gudep,
        nama,
        gender,
        ttl,
        detailtingkatan,
      });

      return res.status(200).json({
        message: "Peserta didik berhasil diperbarui",
        data: pesertaDidik,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
