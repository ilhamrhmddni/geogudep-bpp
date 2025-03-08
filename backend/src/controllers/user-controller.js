const { User } = require("../models");

module.exports = {
  // Ambil semua user
  getAllUser: async (req, res) => {
    try {
      const allUser = await User.findAll();

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
      const user = await User.findByPk(id);

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

  // Tambah user baru
  addUser: async (req, res) => {
    const {
      username,
      email,
      password,
      role,
      fullname,
      asal,
      no_telp,
      photo_path,
    } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      const newUser = await User.create({
        username,
        email,
        password, // Harus di-hash sebelum disimpan
        role,
        fullname,
        asal,
        no_telp,
        photo_path: photo_path || "default-profile.png", // Beri default jika kosong
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

  // Update user
  updateUser: async (req, res) => {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      role,
      fullname,
      asal,
      no_telp,
      photo_path,
    } = req.body;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      await user.update({
        username,
        email,
        password, // Jika tidak diubah, tetap gunakan password lama
        role,
        fullname,
        asal,
        no_telp,
        photo_path: photo_path || user.photo_path, // Jangan kosongkan `photo_path`
      });

      return res.status(200).json({
        message: "User berhasil diperbarui",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};
