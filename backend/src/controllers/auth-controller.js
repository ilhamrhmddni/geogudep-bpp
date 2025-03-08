const { User, Gudep, Geografis } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    try {
      // Check user credentials
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User  tidak ditemukan" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Password salah" });
      }

      if (user.isLoggedIn) {
        return res
          .status(403)
          .json({ message: "Akun ini sedang digunakan di perangkat lain" });
      }

      // Mark user as logged in
      await user.update({ isLoggedIn: true });

      // Find related Gudep
      const gudep = await Gudep.findOne({ where: { user_id: user.id } });
      if (!gudep) {
        return res.status(404).json({ message: "Gudep tidak ditemukan" });
      }

      // Find Geografis based on gudep_id
      const geografis = await Geografis.findOne({
        where: { gudep_id: gudep.id },
      });
      if (!geografis) {
        return res.status(404).json({ message: "Geografis tidak ditemukan" });
      }

      // Create JWT token without a secret key
      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      // Determine redirect URL based on role
      const redirectUrl =
        user.role === "admin" ? "admin/kwarran" : "operator/gugusdepan";

      res.status(200).json({
        message: "Login berhasil",
        token,
        redirectUrl,
        gudep_id: gudep.id,
        geografis_id: geografis.id,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Get token from the Authorization header
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" }); // Return 401 if token is not found
      }

      const decoded = jwt.verify(token, "kwarcabbpn"); // Replace with your actual secret key
      const userId = decoded.user_id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User  tidak ditemukan" });
      }

      await user.update({ isLoggedIn: false }); // Update isLoggedIn status
      res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
      console.error("Error during logout:", error);
      return res.status(401).json({ message: "Token tidak valid" }); // Return 401 for invalid token
    }
  },
};
