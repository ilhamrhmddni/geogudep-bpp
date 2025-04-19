import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../services/AuthService";
import FormLabel from "../atoms/FormLabel";
import PrimaryButton from "../atoms/PrimaryButton";
import TextInput from "../atoms/TextInput";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple check for existing token - no need for complex validation on initial load
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("data");
    }
  }, []);

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // Function to decode JWT token directly in this component
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid",
        text: "Username dan password harus diisi.",
      });
    }

    setLoading(true);

    try {
      const response = await login(username, password);

      if (!response?.token) {
        return Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: response.message || "Login gagal. Token tidak diterima.",
        });
      }

      // Parse the JWT token directly
      const tokenData = parseJwt(response.token);

      if (!tokenData) {
        return Swal.fire({
          icon: "error",
          title: "Token Tidak Valid",
          text: "Format token tidak valid atau tidak dapat didekode.",
        });
      }

      // Extract user data from token
      const {
        username: decodedUsername,
        email,
        role,
        gudep_id,
        redirectUrl,
      } = tokenData;

      // Validate user role
      if (!["admin", "operator"].includes(role)) {
        return Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: `Role '${role}' tidak diperbolehkan.`,
        });
      }

      // Store token and user data in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "data",
        JSON.stringify({ username: decodedUsername, email, role, gudep_id })
      );

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
        text: error.message || "Terjadi kesalahan saat login.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#9500FF] bg-[length:60%] md:bg-[length:50%] bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/bg-siluet.png')" }}
    >
      <div className="w-full max-w-md flex flex-col space-y-8 my-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-[url('/logo.png')] bg-contain bg-no-repeat bg-center" />
          <h2 className="text-2xl font-bold text-center text-white">
            Sistem Informasi Geografis <br /> Pegudep Balikpapan
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 md:space-y-8"
        >
          {/* Username field */}
          <div className="flex flex-col gap-2 items-center sm:items-stretch text-center">
            <FormLabel
              htmlFor="username"
              text="Username"
              className="text-white font-medium"
            />
            <TextInput
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan Username"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2 items-center sm:items-stretch text-center">
            <FormLabel
              htmlFor="password"
              text="Password"
              className="text-white font-medium"
            />
            <TextInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              required
            />
          </div>

          <div className="flex flex-col items-center mt-4">
            <PrimaryButton
              text={loading ? "Loading..." : "Login"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>
        <button
          className="text-white text-lg cursor-pointer hover:font-semibold hover:text-white mt-4"
          onClick={() => navigate("/")}
        >
          Kembali Ke Halaman Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
