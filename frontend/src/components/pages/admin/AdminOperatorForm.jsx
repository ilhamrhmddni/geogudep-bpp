import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createUser,
  editUser,
  fetchUserId,
} from "../../../services/OperatorService";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperatorForm = ({ isEdit }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [asal, setAsal] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [noGudep, setNoGudep] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [photo, setPhoto] = useState(null); // Tambahkan state untuk menyimpan file foto
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchUserId(id);
          const { data } = result;
          setUsername(data.username || "");
          setEmail(data.email);
          setFullname(data.fullname);
          setAsal(data.asal);
          setNoTelp(data.no_telp);
          setRole(data.role);
          setNoGudep(data.no_gudep || "");
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    } else {
      setUsername(""); // Inisialisasi username kosong saat tambah baru
      setPassword("");
      setConfirmPassword("");
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (role === "admin") {
      setNoGudep("ADMIN");
    } else {
      setNoGudep("");
    }
  }, [role]);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Password baru dan konfirmasi password tidak cocok.",
      });
      return;
    }

    const confirmSubmit = await Swal.fire({
      title: isEdit ? "Ubah Data Operator" : "Simpan Operator Baru",
      text: isEdit
        ? "Apakah kamu yakin ingin mengubah data operator ini?"
        : "Apakah kamu yakin ingin menyimpan operator baru ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9500FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
    });

    if (!confirmSubmit.isConfirmed) {
      console.log("Form submission canceled.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("fullname", fullname);
    formData.append("asal", asal);
    formData.append("no_telp", noTelp);
    formData.append("role", role);
    formData.append("no_gudep", noGudep);
    if (password) {
      formData.append("password", password);
    }
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      if (isEdit && id) {
        await editUser(id, formData);
        Swal.fire("Sukses!", "Data operator berhasil diubah.", "success");
      } else {
        await createUser(formData);
        Swal.fire("Sukses!", "Operator baru telah disimpan.", "success");
      }

      navigate("/admin/operator");
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-col">
        <div className="flex items-center p-4 m-auto w-full ml-20">
          <div
            className="flex items-center gap-4 font-bold text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-icons text-white">arrow_back</span>
            Kembali
          </div>
          <h1 className="text-3xl font-bold flex-grow text-center mr-24 text-[#9500FF]">
            {isEdit ? "Ubah Data Operator" : "Tambah Data Operator"}
          </h1>
        </div>

        <div className="flex flex-auto items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 ml-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Asal</label>
                <input
                  type="text"
                  value={asal}
                  onChange={(e) => setAsal(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              {/* Input untuk upload foto */}
              <div className="flex flex-col">
                <label className="mb-1 font-bold text-[#9500FF]">
                  Foto Profil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200"
              >
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminOperatorForm;
