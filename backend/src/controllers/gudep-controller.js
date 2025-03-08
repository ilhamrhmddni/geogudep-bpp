const { Gudep, User, Geografis, Kwarran } = require("../models");

module.exports = {
  // ✅ Ambil semua Gudep
  getAllGudep: async (req, res) => {
    try {
      const allGudep = await Gudep.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "username"],
            required: true,
            as: "useres",
          },
          {
            model: Geografis,
            attributes: ["id", "titik_koordinat"],
            required: false,
            as: "geografises",
          },
          {
            model: Kwarran,
            attributes: ["id", "nama"],
            required: false,
            as: "kwarranes",
          },
        ],
      });
      return res.status(200).json({
        message: "Data Gudep berhasil didapatkan",
        data: allGudep,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // ✅ Ambil Gudep berdasarkan ID
  getGudep: async (req, res) => {
    const { id } = req.params;

    try {
      const gudep = await Gudep.findByPk(id);

      if (!gudep) {
        return res.status(404).json({ message: "Gudep tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Data Gudep berhasil didapatkan",
        data: gudep,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // ✅ Update Gudep berdasarkan ID
  updateGudep: async (req, res) => {
    const { id } = req.params;
    const {
      user_id,
      kwarran_id,
      geografis_id,
      no_gudep,
      tingkatan,
      mabigus,
      pembina,
      pelatih,
      email,
      tahun_update,
      jumlah_putra,
      jumlah_putri,
    } = req.body;

    try {
      const gudep = await Gudep.findByPk(id);

      if (!gudep) {
        return res.status(404).json({ message: "Gudep tidak ditemukan" });
      }

      await gudep.update({
        user_id,
        kwarran_id,
        geografis_id,
        no_gudep,
        tingkatan,
        mabigus,
        pembina,
        pelatih,
        email,
        tahun_update,
        jumlah_putra,
        jumlah_putri,
      });

      return res.status(200).json({
        message: "Data Gudep berhasil diperbarui",
        data: gudep,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // ✅ Tambah Gudep baru
  addGudep: async (req, res) => {
    const {
      user_id,
      kwarran_id,
      geografis_id,
      no_gudep,
      tingkatan,
      mabigus,
      pembina,
      pelatih,
      email,
      tahun_update,
      jumlah_putra,
      jumlah_putri,
    } = req.body;

    try {
      // Buat Gudep baru
      const newGudep = await Gudep.create({
        user_id,
        kwarran_id,
        geografis_id,
        no_gudep,
        tingkatan,
        mabigus,
        pembina,
        pelatih,
        email,
        tahun_update,
        jumlah_putra,
        jumlah_putri,
      });

      return res.status(201).json({
        message: "Data Gudep berhasil ditambahkan",
        data: newGudep,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
