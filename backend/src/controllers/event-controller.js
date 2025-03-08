const { Event } = require("../models");

module.exports = {
  addEvent: async (req, res) => {
    const {
      nama,
      tanggal_mulai,
      tanggal_selesai,
      tempat,
      tingkat,
      penyelenggara,
    } = req.body;

    if (
      !nama ||
      !tempat ||
      !tanggal_mulai ||
      !tanggal_selesai ||
      !tingkat ||
      !penyelenggara
    ) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    try {
      const newEvent = await Event.create({
        nama,
        tanggal_mulai,
        tanggal_selesai,
        tempat,
        tingkat,
        penyelenggara,
      });
      return res.status(201).json({
        message: "Data event berhasil ditambahkan",
        data: newEvent,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Admin

  // Hapus data event berdasarkan ID
  deleteEvent: async (req, res) => {
    const { id } = req.params;
    try {
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: "Data event tidak ditemukan" });
      }
      await event.destroy();
      return res.status(200).json({ message: "Data event berhasil dihapus" });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Edit data event berdasarkan ID
  updateEvent: async (req, res) => {
    const { id } = req.params;
    const {
      nama,
      tanggal_mulai,
      tanggal_selesai,
      tempat,
      tingkat,
      penyelenggara,
    } = req.body;

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({ message: "Data event tidak ditemukan" });
      }

      if (
        !nama ||
        !tanggal_mulai ||
        !tanggal_selesai ||
        !tempat ||
        !tingkat ||
        !penyelenggara
      ) {
        return res.status(400).json({
          message: "Semua field wajib diisi",
        });
      }

      await event.update({
        nama,
        tanggal_mulai,
        tanggal_selesai,
        tempat,
        tingkat,
        penyelenggara,
      });

      return res.status(200).json({
        message: "Data event berhasil diperbarui",
        data: event,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil semua data event
  getAllEvents: async (req, res) => {
    try {
      const allEvents = await Event.findAll();
      return res.status(200).json({
        message: "Data event berhasil didapatkan",
        data: allEvents,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil satu data event berdasarkan ID
  getEvent: async (req, res) => {
    const { id } = req.params;

    try {
      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(404).json({ message: "Data event tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Data event berhasil didapatkan",
        data: event,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
