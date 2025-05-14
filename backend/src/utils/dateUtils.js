// src/utils/dateUtils.js
function formatDateIndonesia(date, dateOnly = false) {
  if (!(date instanceof Date)) {
    date = new Date(date); // Coba konversi jika bukan objek Date
  }
  if (isNaN(date.getTime())) {
    return "-"; // Kembalikan strip jika tanggal tidak valid
  }

  const optionsDate = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Makassar",
  };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Makassar",
    hour12: false,
  };

  const tanggalBagian = date.toLocaleDateString("id-ID", optionsDate);
  if (dateOnly) {
    return tanggalBagian;
  }
  const waktuBagian = date
    .toLocaleTimeString("id-ID", optionsTime)
    .replace(/\./g, ":");
  return `${tanggalBagian}, ${waktuBagian} WITA`;
}

module.exports = { formatDateIndonesia };
