import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../services/AuthService";
import FormLabel from "../atoms/FormLabel";
import PrimaryButton from "../atoms/PrimaryButton";
import TextInput from "../atoms/TextInput";

const LoginPage = () => {
  // State untuk menyimpan data form dan status loading
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Efek untuk menghapus data jika token tidak ada
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.removeItem("data");
    }
  }, []);

  // Fungsi untuk menangani perubahan input form
  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // Fungsi untuk decode JWT token
  const parseJwt = (token) => {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return payload;
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  // Fungsi untuk menangani submit form login
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    // Validasi input form
    if (!username.trim() || !password.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid",
        text: "Username dan password harus diisi.",
      });
    }

    setLoading(true);

    try {
      // Panggil API login
      const response = await login(username, password);

      // Validasi token dari response
      if (!response?.token) {
        return Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: response.message || "Login gagal. Token tidak diterima.", // Tampilkan pesan error dari server
        });
      }

      // Decode token untuk mendapatkan data pengguna
      const tokenData = parseJwt(response.token);

      if (!tokenData) {
        return Swal.fire({
          icon: "error",
          title: "Token Tidak Valid",
          text: "Format token tidak valid atau tidak dapat didekode.",
        });
      }

      const {
        username: decodedUsername,
        email,
        role,
        gudep_id,
        redirectUrl,
      } = tokenData;

      // Validasi role pengguna
      if (!["admin", "operator"].includes(role)) {
        return Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: `Role '${role}' tidak diperbolehkan.`,
        });
      }

      // Simpan token dan data pengguna ke localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "data",
        JSON.stringify({ username: decodedUsername, email, role, gudep_id })
      );

      // Tampilkan notifikasi sukses dan navigasi ke halaman dashboard
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: response.message || "Selamat datang!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(redirectUrl || "/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message || "Terjadi kesalahan saat login.", // Tampilkan pesan error dari catch block
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#9500FF] bg-[length:60%] md:bg-[length:50%] bg-no-repeat bg-center px-4"
      style={{ backgroundImage: "url('/bg-siluet.png')" }}
    >
      <div className="w-full max-w-md flex flex-col space-y-6 md:space-y-8 my-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo dan judul */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[url('/logo.png')] bg-contain bg-no-repeat bg-center" />
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Sistem Informasi Geografis <br /> Pegudep Balikpapan
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-5 md:space-y-6"
        >
          {/* Input username */}
          <div className="flex flex-col gap-2 items-center sm:items-stretch text-center">
            <FormLabel
              htmlFor="username"
              text="Username"
              className="text-white font-medium text-sm md:text-base"
            />
            <TextInput
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan Username"
              required
              className="w-full text-sm md:text-base"
            />
          </div>

          {/* Input password */}
          <div className="flex flex-col gap-2 items-center sm:items-stretch text-center">
            <FormLabel
              htmlFor="password"
              text="Password"
              className="text-white font-medium text-sm md:text-base"
            />
            <TextInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              required
              className="w-full text-sm md:text-base"
            />
          </div>

          {/* Tombol login */}
          <div className="flex flex-col items-center mt-4">
            <PrimaryButton
              text={loading ? "Loading..." : "Login"}
              type="submit"
              disabled={loading}
              className="w-full text-sm md:text-base"
            />
          </div>
        </form>
        {/* Tombol kembali ke dashboard */}
        <button
          className="text-white text-sm md:text-base cursor-pointer hover:font-semibold hover:text-white mt-4"
          onClick={() => navigate("/")}
        >
          Kembali Ke Halaman Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
