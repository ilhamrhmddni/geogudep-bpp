// src/atoms/formatDate.js

// Fungsi formatDate untuk memformat tanggal ke format lokal Indonesia
const formatDate = (dateString) => {
  if (!dateString) return "-"; // Jika dateString kosong, kembalikan tanda "-"

  const date = new Date(dateString); // Konversi string menjadi objek Date

  // Format tanggal ke format lokal Indonesia (dd/mm/yyyy)
  return date.toLocaleDateString("id-ID", {
    day: "2-digit", // Tampilkan hari dalam 2 digit
    month: "2-digit", // Tampilkan bulan dalam 2 digit
    year: "numeric", // Tampilkan tahun dalam 4 digit
  });
};

export default formatDate;
