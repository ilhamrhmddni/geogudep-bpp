const { User, Gudep, Geografis } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    try {
      // Cek user
      const user = await User.findOne({ where: { username } });
      console.log("User found:", user);
      console.log("Username:", username);
      console.log("Password:", password);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Password salah" });
      }

      // Ambil Gudep
      const gudep = await Gudep.findOne({ where: { user_id: user.id } });
      if (!gudep) {
        return res.status(404).json({ message: "Gudep tidak ditemukan" });
      }

      // Ambil Geografis
      const geografis = await Geografis.findOne({
        where: { gudep_id: gudep.id },
      });
      if (!geografis) {
        return res.status(404).json({ message: "Geografis tidak ditemukan" });
      }

      // Buat redirect URL berdasarkan role
      const redirectUrl =
        user.role === "admin" ? "/admin/kwarran" : "/operator/gugusdepan";

      // Buat JWT hanya berisi id-id
      const token = jwt.sign(
        {
          user_id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          gudep_id: gudep.id,
          geografis_id: geografis.id,
          redirectUrl: redirectUrl,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login berhasil",
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user_id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
      console.error("Error during logout:", error);
      return res.status(401).json({ message: "Token tidak valid" });
    }
  },
};
