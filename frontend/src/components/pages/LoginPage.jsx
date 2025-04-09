import { jwtDecode } from "jwt-decode";
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
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Cek validitas token
        const exp = decoded.exp * 1000;
        if (Date.now() >= exp) {
          localStorage.removeItem("token");
          localStorage.removeItem("data");
        }
      } catch (error) {
        console.error("Token tidak valid:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("data");
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Valid",
        text: "Username dan password harus diisi.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login(username, password);

      if (response?.token) {
        console.log("Token dari response:", response.token); // DEBUG 1

        let decoded;
        try {
          decoded = jwtDecode(response.token);
          console.log("Hasil decode token:", decoded); // DEBUG 2
        } catch (err) {
          console.error("Gagal decode token:", err.message); // DEBUG 3
          Swal.fire({
            icon: "error",
            title: "Token Tidak Valid",
            text: "Token yang diberikan tidak dapat dibaca.",
          });
          return;
        }

        // Validasi role
        if (!["admin", "operator"].includes(decoded.role)) {
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: `Role '${decoded.role}' tidak diperbolehkan mengakses sistem.`,
          });
          return;
        }

        // Simpan ke localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem(
          "data",
          JSON.stringify({
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
          })
        );

        Swal.fire({
          icon: "success",
          title: "Login Berhasil",
          text: response.message || "Selamat datang!",
        });

        navigate(decoded.redirectUrl, { replace: true });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: response.message || "Login gagal. Coba lagi.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Terjadi kesalahan saat login: " + error.message,
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
      <div className="w-full max-w-md flex flex-col md:space-y-24 my-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-[url('/logo.png')] bg-contain bg-no-repeat bg-center"></div>
          <h2 className="text-2xl font-bold text-center text-white">
            Sistem Informasi Geografis <br /> Pegudep Balikpapan
          </h2>
        </div>
        <br />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-12 md:space-y-24"
        >
          <div className="flex flex-col gap-4 items-center sm:items-stretch">
            <div>
              <FormLabel htmlFor="username" text="Username" />
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
            <div>
              <FormLabel htmlFor="password" text="Password" />
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
          </div>

          <div className="flex flex-col items-center">
            <PrimaryButton
              text={loading ? "Loading..." : "Login"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>
        <button
          className="text-white cursor-pointer hover:font-bold hover:text-[#9500FF]"
          onClick={() => navigate("/")}
        >
          Kembali Ke Halaman Dashboard
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
