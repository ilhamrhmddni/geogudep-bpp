const axios = require("axios");
const { User, Gudep } = require("../models");
const { StatusCodes } = require("http-status-codes"); // Import status codes

module.exports = {
  // Ambil semua user
  getAllUser: async (req, res) => {
    try {
      const allUser = await User.findAll({
        include: [
          {
            model: Gudep,
            attributes: ["id", "no_gudep"],
            as: "gudepes",
          },
        ],
      });

      res.status(StatusCodes.OK).json({
        // Use StatusCodes.OK
        message: "Data semua user berhasil didapatkan",
        data: allUser,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Use StatusCodes.INTERNAL_SERVER_ERROR
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Ambil user berdasarkan ID
  getUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, {
        include: [{ model: Gudep, as: "gudepes" }],
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User tidak ditemukan" }); // Use StatusCodes.NOT_FOUND
      }

      const dataUser = user.toJSON();
      if (dataUser.photo_path && !dataUser.photo_path.startsWith("http")) {
        dataUser.photo_path = `${req.protocol}://${req.get("host")}/${
          dataUser.photo_path
        }`;
      }

      res.status(StatusCodes.OK).json({
        // Use StatusCodes.OK
        message: "Data user berhasil didapatkan",
        data: dataUser,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Use StatusCodes.INTERNAL_SERVER_ERROR
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Tambah user baru
  addUser: async (req, res) => {
    const { username, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Username sudah terdaftar" }); // Use StatusCodes.BAD_REQUEST
      }

      const newUser = await User.create({ username, password });
      res.status(StatusCodes.CREATED).json({
        // Use StatusCodes.CREATED
        message: "User berhasil ditambahkan",
        data: newUser,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Use StatusCodes.INTERNAL_SERVER_ERROR
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus user
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User tidak ditemukan" }); // Use StatusCodes.NOT_FOUND
      }

      await user.destroy();
      res.status(StatusCodes.OK).json({ message: "User berhasil dihapus" }); // Use StatusCodes.OK
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Use StatusCodes.INTERNAL_SERVER_ERROR
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Perbarui user
  updateUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User tidak ditemukan" }); // Use StatusCodes.NOT_FOUND
      }

      const {
        username = user.username,
        email = user.email,
        fullname = user.fullname,
        asal = user.asal,
        no_telp = user.no_telp,
        password,
      } = req.body;

      const updateData = { username, email, fullname, asal, no_telp };
      if (password) updateData.password = password;

      if (req.file && req.file.buffer) {
        try {
          const imgurRes = await axios.post(
            "https://api.imgur.com/3/image",
            req.file.buffer,
            {
              headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
                "Content-Type": "application/octet-stream",
              },
            }
          );

          const imgurLink = imgurRes?.data?.data?.link;
          if (!imgurLink) throw new Error("Link dari Imgur tidak ditemukan");

          updateData.photo_path = imgurLink;
        } catch (uploadErr) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            // Use StatusCodes.INTERNAL_SERVER_ERROR
            message: "Gagal mengupload foto",
            error: uploadErr.message,
          });
        }
      }

      await user.update(updateData);
      res.status(StatusCodes.OK).json({
        // Use StatusCodes.OK
        message: "User berhasil diperbarui",
        data: user,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        // Use StatusCodes.INTERNAL_SERVER_ERROR
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
