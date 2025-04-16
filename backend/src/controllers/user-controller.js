const axios = require("axios");
const { User, Gudep } = require("../models");

module.exports = {
  // Ambil semua user
  getAllUser: async (req, res) => {
    try {
      const allUser = await User.findAll({
        include: [
          {
            model: Gudep, // Ganti dengan model yang sesuai jika berbeda
            attributes: ["id", "no_gudep"], // Hanya ambil field yang diperlukan
            as: "gudepes",
          },
        ],
      });

      return res.status(200).json({
        message: "Data users berhasil didapatkan",
        data: allUser,
      });
    } catch (error) {
      return res.status(500).json({
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
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      let fullPhotoPath = user.photo_path;

      // Pastikan `photo_path` tidak ditambahkan API_URL jika sudah merupakan URL
      if (fullPhotoPath && !fullPhotoPath.startsWith("http")) {
        fullPhotoPath = `${req.protocol}://${req.get("host")}/${fullPhotoPath}`;
      }

      return res.status(200).json({
        message: "Data user berhasil didapatkan",
        data: { ...user.toJSON(), photo_path: fullPhotoPath },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // controllers/UserController.js (addUser function - Option 3)
  addUser: async (req, res) => {
    const { username, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res.status(400).json({ message: "Username sudah terdaftar" });
      }

      const newUser = await User.create({
        username,
        password,
      });

      return res.status(201).json({
        message: "User berhasil ditambahkan",
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({
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
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      await user.destroy();
      return res.status(200).json({ message: "User berhasil dihapus" });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "User  tidak ditemukan" });
      }

      // Ambil data lama
      const currentData = user.get(); // Mengambil semua data pengguna saat ini

      // Buat objek untuk menyimpan data yang akan diperbarui
      const updateData = {
        username: req.body.username || currentData.username,
        email: req.body.email || currentData.email,
        fullname: req.body.fullname || currentData.fullname,
        asal: req.body.asal || currentData.asal,
        no_telp: req.body.no_telp || currentData.no_telp,
      };

      // Perbarui password jika ada
      if (req.body.password) {
        updateData.password = req.body.password; // Simpan password tanpa hashing
      }

      // Jika ada file foto yang diupload
      if (req.file) {
        try {
          // Pastikan buffer tersedia
          if (!req.file.buffer) {
            throw new Error("File buffer tidak tersedia");
          }

          // Upload ke Imgur
          const imgurResponse = await axios({
            method: "post",
            url: "https://api.imgur.com/3/image",
            headers: {
              Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
              "Content-Type": "application/octet-stream",
            },
            data: req.file.buffer,
          });

          console.log("Imgur Response:", imgurResponse.data);

          if (
            imgurResponse.data &&
            imgurResponse.data.data &&
            imgurResponse.data.data.link
          ) {
            updateData.photo_path = imgurResponse.data.data.link;
          } else {
            throw new Error("Format respons Imgur tidak sesuai");
          }
        } catch (error) {
          console.error("Error uploading to Imgur:", error);
          return res.status(500).json({
            message: "Gagal mengupload foto",
            error: error.message,
          });
        }
      }

      // Update data user di database
      await user.update(updateData);
      return res.status(200).json({
        message: "User  berhasil diperbarui",
        data: user,
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
