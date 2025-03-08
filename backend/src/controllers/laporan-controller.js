const { data } = require("react-router-dom");
const { Laporan } = require("../models");

module.exports = {
  // Ambil semua laporan
  getAllLaporan: async (req, res) => {
    try {
      console.log("📡 Mengambil semua laporan dari database...");

      const allLaporan = await Laporan.findAll();

      console.log("✅ Data laporan berhasil diambil:", allLaporan);

      return res.status(200).json({
        message: "Data laporan berhasil didapatkan",
        data: allLaporan,
      });
    } catch (error) {
      console.error("❌ Error mengambil laporan:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil laporan berdasarkan ID
  getLaporan: async (req, res) => {
    const { id } = req.params;

    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        return res.status(404).json({
          message: "Laporan tidak ditemukan",
        });
      }
      return res.status(200).json({
        message: "Data laporan berhasil didapatkan",
        data: laporan,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Tambah laporan baru
  addLaporan: async (req, res) => {
    const { nama, asal, no_hp, email, status } = req.body;

    try {
      const newLaporan = await Laporan.create({
        nama,
        asal,
        no_hp,
        email,
        status,
      });

      return res.status(201).json({
        message: "Laporan berhasil ditambahkan",
        data: newLaporan,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus laporan berdasarkan ID
  deleteLaporan: async (req, res) => {
    const { id } = req.params;

    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        return res.status(404).json({
          message: "Laporan tidak ditemukan",
        });
      }

      await laporan.destroy();
      return res.status(200).json({
        message: "Laporan berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Update laporan berdasarkan ID
  updateLaporan: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      }
      
      await laporan.update({ status });

      return res.status(200).json({
        message: `Status laporan berhasil diubah menjadi '${status}'`,
        data: laporan,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  },
};
