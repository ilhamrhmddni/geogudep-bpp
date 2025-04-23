// src/components/pages/operator/OperatorPesertaDidikForm.jsx
// (Kode ini SAMA seperti yang Anda berikan sebelumnya)
// Pastikan semua import path sudah benar

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  editGugusdepan,
  fetchGugusdepanId,
} from "../../../services/GugusdepanService"; // Sesuaikan path jika perlu
import {
  createPesertadidik,
  editPesertadidik,
  fetchPesertadidikById,
} from "../../../services/PesertadidikService"; // Sesuaikan path jika perlu
import { decodeToken } from "../../../utils/jwt"; // Sesuaikan path jika perlu
import OperatorTemplate from "../../templates/OperatorTemplate"; // Sesuaikan path jika perlu

// Decode token untuk mendapatkan gudep_id (pastikan ini berfungsi benar)
const tokenData = decodeToken();
const gudepId = tokenData?.gudep_id;

const OperatorPesertaDidikForm = ({ isEdit }) => {
  const [formData, setFormData] = useState({
    nama: "",
    gender: "",
    ttl: "",
    detailtingkatan: "",
    gudep_id: gudepId || "", // Pastikan gudepId ada nilainya
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari parameter URL

  // Ambil data peserta didik jika mode edit
  useEffect(() => {
    // Pastikan gudepId di state sudah terisi sebelum fetch jika diperlukan
    // Atau set default gudep_id di sini jika belum ada saat mount
    if (!formData.gudep_id && gudepId) {
      setFormData((prev) => ({ ...prev, gudep_id: gudepId }));
    }

    // Fetch data hanya jika isEdit=true DAN id BUKAN undefined/null/string kosong
    if (isEdit && id && id !== "undefined") {
      // Tambahan cek id !== "undefined" untuk kejelasan
      console.log("Fetching data for edit, ID:", id); // Log ID yang digunakan
      const fetchData = async () => {
        try {
          const result = await fetchPesertadidikById(id);
          // console.log("Fetched Peserta Didik Data:", result); // Log hasil fetch

          // Pastikan result.data ada sebelum diakses
          if (result && result.data) {
            const { data } = result;
            setFormData({
              nama: data.nama || "",
              gender: data.gender || "",
              ttl: data.ttl ? data.ttl.split("T")[0] : "", // Format tanggal jika perlu
              detailtingkatan: data.detailtingkatan || "",
              gudep_id: data.gudep_id || gudepId || "", // Prioritaskan data dari fetch, fallback ke token
            });
          } else {
            throw new Error(
              "Data peserta didik tidak ditemukan dalam respons API."
            );
          }
        } catch (error) {
          console.error("Error fetching Peserta Didik data:", error);
          Swal.fire(
            "Error!",
            `Gagal mengambil data peserta didik: ${error.message}`,
            "error"
          );
          // Mungkin navigasi kembali jika data tidak ditemukan?
          // navigate("/operator/pesertadidik");
        }
      };
      fetchData();
    } else if (isEdit) {
      // Handle kasus jika mode edit tapi ID tidak valid
      console.error("Edit mode active but ID is invalid:", id);
      Swal.fire(
        "Error!",
        "ID Peserta Didik tidak valid untuk mode edit.",
        "error"
      );
      navigate("/operator/pesertadidik"); // Kembali ke daftar jika ID salah
    }
  }, [id, isEdit, navigate, formData.gudep_id]); // Tambahkan formData.gudep_id jika logic di atas dipakai

  // HandleChange (tidak berubah)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // HandleSubmit (Logika update jumlah gudep perlu diperiksa ulang)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi gudep_id sebelum submit
    if (!formData.gudep_id) {
      Swal.fire("Error!", "ID Gugus Depan tidak valid.", "error");
      return;
    }

    const confirmSubmit = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7a00cc",
      cancelButtonColor: "#9500FF",
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });
    if (!confirmSubmit.isConfirmed) return;

    try {
      if (isEdit && id && id !== "undefined") {
        // --- Logika Edit ---
        // TODO: Periksa kembali logika update jumlah putra/putri saat EDIT.
        //       Sepertinya ada kesalahan logika pengurangan/penambahan.
        //       Harus tahu gender LAMA dan gender BARU.

        // 1. Ambil data Peserta Didik LAMA (sebelum diedit) untuk tahu gender lamanya
        const oldPesertaDataResult = await fetchPesertadidikById(id);
        if (!oldPesertaDataResult || !oldPesertaDataResult.data) {
          throw new Error(
            "Gagal mengambil data peserta didik lama untuk update jumlah."
          );
        }
        const oldGender = oldPesertaDataResult.data.gender;
        const newGender = formData.gender;

        // 2. Edit data peserta didik dulu
        await editPesertadidik(id, formData);

        // 3. Jika gender berubah, baru update jumlah di gugusdepan
        if (oldGender !== newGender) {
          const gugusDataResult = await fetchGugusdepanId(formData.gudep_id);
          if (!gugusDataResult || !gugusDataResult.data) {
            throw new Error(
              "Gagal mengambil data gugus depan untuk update jumlah."
            );
          }
          let jumlahPutra = gugusDataResult.data.jumlah_putra || 0;
          let jumlahPutri = gugusDataResult.data.jumlah_putri || 0;

          if (oldGender === "Laki-laki") jumlahPutra--;
          else if (oldGender === "Perempuan") jumlahPutri--;

          if (newGender === "Laki-laki") jumlahPutra++;
          else if (newGender === "Perempuan") jumlahPutri++;

          await editGugusdepan(formData.gudep_id, {
            jumlah_putra: jumlahPutra,
            jumlah_putri: jumlahPutri,
          });
        }
        // --- Akhir Logika Edit ---
      } else {
        // --- Logika Tambah ---
        await createPesertadidik(formData);

        // Update jumlah setelah berhasil tambah
        const gugusDataResult = await fetchGugusdepanId(formData.gudep_id);
        if (!gugusDataResult || !gugusDataResult.data) {
          throw new Error(
            "Gagal mengambil data gugus depan untuk update jumlah."
          );
        }
        let jumlahPutra = gugusDataResult.data.jumlah_putra || 0;
        let jumlahPutri = gugusDataResult.data.jumlah_putri || 0;

        if (formData.gender === "Laki-laki") jumlahPutra++;
        else if (formData.gender === "Perempuan") jumlahPutri++;

        await editGugusdepan(formData.gudep_id, {
          jumlah_putra: jumlahPutra,
          jumlah_putri: jumlahPutri,
        });
        // --- Akhir Logika Tambah ---
      }

      Swal.fire("Sukses!", "Data peserta didik telah disimpan.", "success");
      navigate("/operator/pesertadidik");
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire("Error!", `Gagal menyimpan data: ${error.message}`, "error");
    }
  };

  // Return JSX (tidak berubah signifikan, pastikan semua field terhubung ke formData)
  return (
    <OperatorTemplate>
      {/* ... (Kode JSX Form sama seperti sebelumnya) ... */}
      <div className="flex flex-col mt-20 md:mt-0">
        {" "}
        {/* Header */}{" "}
        <div className="flex items-center p-4 m-auto w-full md:ml-20">
          {" "}
          <div
            className="flex items-center gap-4 font-bold text-lg md:text-xl px-4 py-2 bg-[#9500FF] rounded-md text-white cursor-pointer"
            onClick={() => navigate(-1)}
          >
            {" "}
            <span className="material-icons text-white">arrow_back</span>{" "}
            <span className="hidden md:inline">Kembali</span>{" "}
          </div>{" "}
          <h1 className="text-xl md:text-3xl font-bold flex-grow text-center md:mr-24 text-[#9500FF] md:mt-4 mt-0">
            {" "}
            {isEdit ? "Edit Peserta Didik" : "Tambah Peserta Didik"}{" "}
          </h1>{" "}
        </div>{" "}
        {/* Form */}{" "}
        <div className="flex flex-auto items-center justify-center">
          {" "}
          <div className="p-4 md:p-8 bg-white rounded-lg shadow-xl text-left w-full mx-4 md:ml-24">
            {" "}
            <form onSubmit={handleSubmit} className="space-y-4">
              {" "}
              {/* Input Nama */}{" "}
              <div className="flex flex-col">
                {" "}
                <label className="mb-1 font-semibold text-purple-600">
                  {" "}
                  Nama{" "}
                </label>{" "}
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  placeholder="Masukkan Nama Peserta Didik"
                />{" "}
              </div>{" "}
              {/* Input Gender */}{" "}
              <div className="flex flex-col">
                {" "}
                <label className="mb-1 font-semibold text-purple-600">
                  {" "}
                  Gender{" "}
                </label>{" "}
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                >
                  {" "}
                  <option value="">Pilih Gender</option>{" "}
                  <option value="Laki-laki">Laki-laki</option>{" "}
                  <option value="Perempuan">Perempuan</option>{" "}
                </select>{" "}
              </div>{" "}
              {/* Input Tanggal Lahir */}{" "}
              <div className="flex flex-col">
                {" "}
                <label className="mb-1 font-semibold text-purple-600">
                  {" "}
                  Tanggal Lahir{" "}
                </label>{" "}
                <input
                  type="date"
                  name="ttl"
                  value={formData.ttl}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                />{" "}
              </div>{" "}
              {/* Input Detail Tingkatan */}{" "}
              <div className="flex flex-col">
                {" "}
                <label className="mb-1 font-semibold text-purple-600">
                  {" "}
                  Detail Tingkatan{" "}
                </label>{" "}
                <input
                  type="text"
                  name="detailtingkatan"
                  value={formData.detailtingkatan}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                  placeholder="Masukkan Detail Tingkatan Peserta Didik"
                />{" "}
              </div>{" "}
              {/* Tombol Submit */}{" "}
              <button
                type="submit"
                className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#7a00cc] transition duration-200"
              >
                {" "}
                {isEdit ? "Simpan Perubahan" : "Simpan"}{" "}
              </button>{" "}
            </form>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    </OperatorTemplate>
  );
};

export default OperatorPesertaDidikForm;
