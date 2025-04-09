const { Geografis, Gudep, User } = require("../models");

module.exports = {
  // Ambil semua data geografis
  getAllGeografis: async (req, res) => {
    try {
      console.log("Request:", req.body);

      const allGeografis = await Geografis.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "role"],
            required: false,
            as: "useres",
          },
          {
            model: Gudep,
            as: "gudepes",
            attributes: ["id", "no_gudep", "kwarran_id"],
            required: false,
          },
        ],
      });

      console.log("All Geografis:", JSON.stringify(allGeografis, null, 2));

      allGeografis.forEach((geografis) => {
        console.log(
          `Geografis ID: ${geografis.id}, User ID: ${geografis.user_id}`
        );
        console.log(`Useres: ${JSON.stringify(geografis.useres, null, 2)}`);
      });

      return res.status(200).json({
        message: "Data geografis berhasil didapatkan",
        data: allGeografis,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil satu data geografis berdasarkan ID
  getGeografis: async (req, res) => {
    const { id } = req.params;

    try {
      const geografis = await Geografis.findByPk(id);

      if (!geografis) {
        return res
          .status(404)
          .json({ message: "Data geografis tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Data geografis berhasil didapatkan",
        data: geografis,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Edit data geografis berdasarkan ID
  updateGeografis: async (req, res) => {
    const { id } = req.params;
    const { gudep_id, titik_koordinat, longitude, latitude, alamat } = req.body;

    try {
      const geografis = await Geografis.findByPk(id);

      if (!geografis) {
        return res
          .status(404)
          .json({ message: "Data geografis tidak ditemukan" });
      }

      if (!longitude || !latitude) {
        return res.status(400).json({
          message: "Longitude dan Latitude wajib diisi",
        });
      }

      await geografis.update({
        gudep_id,
        titik_koordinat,
        longitude,
        latitude,
        alamat,
      });

      return res.status(200).json({
        message: "Data geografis berhasil diperbarui",
        data: geografis,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
