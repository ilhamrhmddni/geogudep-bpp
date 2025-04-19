const { Prestasi, Event, Gudep } = require("../models");
const { StatusCodes } = require("http-status-codes"); // Import status codes

module.exports = {
  // Ambil semua data prestasi
  getAllPrestasis: async (req, res) => {
    try {
      const allPrestasis = await Prestasi.findAll({
        include: [
          {
            model: Event,
            attributes: ["id", "nama", "tingkat", "tanggal_mulai"],
            required: false, // Sesuaikan dengan kebutuhan relasi Anda
            as: "eventes",
          },
          {
            model: Gudep,
            attributes: ["id", "no_gudep", "tingkatan"],
            required: false, // Sesuaikan dengan kebutuhan relasi Anda
            as: "gudepes",
          },
        ],
      });
      return res.status(StatusCodes.OK).json({
        // Menggunakan StatusCodes
        message: "Data prestasi berhasil didapatkan",
        data: allPrestasis,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Menggunakan StatusCodes
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil satu data prestasi berdasarkan id
  getPrestasiById: async (req, res) => {
    const { id } = req.params;

    try {
      const prestasi = await Prestasi.findOne({
        where: { id: id },
        include: [
          { model: Event, attributes: ["id", "nama"], as: "eventes" },
          { model: Gudep, attributes: ["id", "no_gudep"], as: "gudepes" },
        ],
      });

      if (!prestasi) {
        return res.status(StatusCodes.NOT_FOUND).json({
          // Menggunakan StatusCodes
          message: "Relasi event dan gudep tidak ditemukan",
        });
      }

      return res.status(StatusCodes.OK).json({
        // Menggunakan StatusCodes
        message: "Data prestasi berhasil ditemukan",
        data: prestasi,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Menggunakan StatusCodes
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Tambah hubungan event dengan gudep sebagai prestasi
  addPrestasi: async (req, res) => {
    const { event_id, gudep_id, keterangan } = req.body;

    if (!event_id || !gudep_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        // Menggunakan StatusCodes
        message: "Event ID dan Gudep ID wajib diisi",
      });
    }

    try {
      // Cobalah untuk membuat prestasi baru
      const newPrestasi = await Prestasi.create({
        event_id,
        gudep_id,
        keterangan,
      });

      return res.status(StatusCodes.CREATED).json({
        // Menggunakan StatusCodes
        message: "Relasi event dan gudep berhasil ditambahkan sebagai prestasi",
        data: newPrestasi,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(StatusCodes.CONFLICT).json({
          // Menggunakan StatusCodes
          message: "Prestasi dengan kombinasi event dan gudep ini sudah ada.",
          error: error.message,
        });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Menggunakan StatusCodes
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Edit hubungan event dengan gudep sebagai prestasi
  updatePrestasi: async (req, res) => {
    const { id } = req.params;
    const { newevent_id, newgudep_id, keterangan } = req.body;

    try {
      const prestasi = await Prestasi.findOne({
        where: { id: id },
      });

      if (!prestasi) {
        return res.status(StatusCodes.NOT_FOUND).json({
          // Menggunakan StatusCodes
          message: "Relasi event dan gudep tidak ditemukan",
        });
      }

      // Perbarui hanya jika nilai baru disediakan
      if (newevent_id !== undefined) prestasi.event_id = newevent_id;
      if (newgudep_id !== undefined) prestasi.gudep_id = newgudep_id;
      if (keterangan !== undefined) prestasi.keterangan = keterangan;

      await prestasi.save();

      return res.status(StatusCodes.OK).json({
        // Menggunakan StatusCodes
        message: "Relasi event dan gudep berhasil diperbarui sebagai prestasi",
        data: prestasi,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Menggunakan StatusCodes
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus hubungan event dengan gudep sebagai prestasi
  deletePrestasi: async (req, res) => {
    const { id } = req.params;

    try {
      const prestasi = await Prestasi.findOne({
        where: { id: id },
      });

      if (!prestasi) {
        return res.status(StatusCodes.NOT_FOUND).json({
          // Menggunakan StatusCodes
          message: "Relasi event dan gudep tidak ditemukan",
        });
      }

      await prestasi.destroy();
      return res.status(StatusCodes.OK).json({
        // Menggunakan StatusCodes
        message: "Relasi event dan gudep berhasil dihapus sebagai prestasi",
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Menggunakan StatusCodes
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
