import React from "react";
import { useNavigate } from "react-router-dom";
import UserTemplate from "../../templates/UserTemplate";

const UserDashboard = () => {
  const primaryColor = "#9500FF";
  const secondaryColor = "#7a00cc";
  const lightBg = "#F8F0FF";
  const textPrimary = "#1E1E1E";
  const textSecondary = "#555";

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/gugusdepan");
  };

  return (
    <UserTemplate>
      <div className="flex flex-col ml-18">
        {/* Hero Section */}
        <div
          className="flex-1 p-12 flex items-center justify-center rounded-lg shadow-xl overflow-hidden relative"
          style={{
            background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
            color: "white",
          }}
        >
          <img
            src="/map.png"
            alt="Peta Digital Balikpapan"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sistem Informasi Geografis
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-6">
              Gugusdepan Kwarcab Balikpapan
            </h2>
            <p className="text-lg mb-8">
              Jelajahi peta interaktif dan kelola data Pramuka dengan efisien.
            </p>
            <button
              onClick={handleNavigate}
              className="font-semibold py-3 px-6 rounded-full transition duration-300 cursor-pointer"
              style={{
                backgroundColor: "#fff",
                color: primaryColor,
              }}
            >
              Lihat Peta
            </button>
          </div>
        </div>

        {/* Section Manfaat */}
        <div className="py-16" style={{ backgroundColor: lightBg }}>
          <div className="container mx-auto text-center">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ color: primaryColor }}
            >
              Keunggulan Sistem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-16">
              {/* Card */}
              {[
                {
                  icon: "📍",
                  title: "Akses Lokasi Akurat",
                  desc: "Pantau posisi Gugusdepan secara langsung melalui peta digital.",
                },
                {
                  icon: "📊",
                  title: "Analisis Data Mudah",
                  desc: "Lihat statistik dan data anggota dengan tampilan interaktif.",
                },
                {
                  icon: "🗂️",
                  title: "Pengelolaan Terpusat",
                  desc: "Semua data tersimpan dan dikelola dalam satu sistem.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
                >
                  <div
                    className="text-4xl mb-4"
                    style={{ color: secondaryColor }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: textPrimary }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-base" style={{ color: textSecondary }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Penjelasan */}
        <div className="py-16" style={{ backgroundColor: "#F2E7FF" }}>
          <div className="container mx-auto px-8 md:px-16">
            <h2
              className="text-3xl font-bold mb-8 text-center"
              style={{ color: primaryColor }}
            >
              Tentang Sistem Informasi Geografis untuk Pramuka
            </h2>
            <p className="text-lg leading-relaxed text-justify mb-6">
              <span className="font-semibold" style={{ color: secondaryColor }}>
                GeoScout
              </span>{" "}
              hadir sebagai solusi modern untuk mengatasi tantangan pengelolaan
              data Gugusdepan di Kwarcab Balikpapan. Dengan memanfaatkan
              teknologi Sistem Informasi Geografis (SIG) berbasis web dan peta
              interaktif dari Leaflet.js, kami menyediakan platform yang
              intuitif dan efisien.
            </p>
            <p className="text-lg leading-relaxed text-justify mb-6">
              Dulu, pengelolaan data yang manual dan tersebar menyulitkan akses,
              pembaruan, dan analisis informasi penting. Kini, dengan GeoScout,
              Anda dapat dengan mudah memvisualisasikan lokasi setiap
              Gugusdepan, mengakses detail informasi secara terpusat, dan
              melakukan analisis spasial untuk pengambilan keputusan yang lebih
              strategis.
            </p>
            <p className="text-lg leading-relaxed text-justify">
              Inisiatif ini bertujuan untuk meningkatkan efisiensi operasional
              Kwarcab, memberdayakan pengelola Pramuka dengan alat yang modern,
              dan pada akhirnya, mendukung pembinaan generasi muda yang lebih
              terarah dan efektif. Mari bersama-sama menuju Pramuka Balikpapan
              yang terdigitalisasi!
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="py-16 text-center"
          style={{ backgroundColor: "#E6CCFF" }}
        >
          <div className="container mx-auto px-8 md:px-16">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ color: secondaryColor }}
            >
              Siap Mengadopsi Sistem Modern Ini?
            </h2>
            <p className="text-lg mb-8">
              Rasakan kemudahan dan efisiensi pengelolaan data Gugusdepan dengan
              GeoScout.
            </p>
            <button
              className="font-bold py-3 px-6 rounded-full shadow-md transition duration-300 hover:brightness-110"
              style={{
                backgroundColor: primaryColor,
                color: "white",
              }}
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserDashboard;
