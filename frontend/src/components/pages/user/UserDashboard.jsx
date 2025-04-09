import React from "react";
import FormInput from "../../moleculs/FormInput";
import UserTemplate from "../../templates/UserTemplate";

const UserDashboard = () => {
  return (
    <UserTemplate>
      <div className="flex flex-col ml-18">
        {/* Main Content */}
        <div className="flex-1 p-8 bg-white flex">
          <img src="/map.png" alt="" className="w-1/2" />
          <h1 className="text-5xl font-bold px-12 space-y-4">
            <p>Sistem Informasi Geografis</p>
            <p>Pemetaan Gugus Depan</p>
            <p> Kota Balikpapan</p>
          </h1>
        </div>
        <div>
          <p className="text-black-700 m-8 text-justify text-xl">
            Gerakan Pramuka Kwartir Cabang (Kwarcab) Balikpapan memiliki peran
            penting dalam membina generasi muda, tetapi pengelolaan data
            Gugusdepan masih dilakukan secara manual dan tersebar di berbagai
            format. Hal ini menyulitkan akses, pembaruan, dan analisis data,
            sehingga menghambat perencanaan dan evaluasi.
            <br />
            <br />
            Sistem Informasi Geografis (SIG) berbasis website menjadi solusi
            untuk memetakan dan mengelola data Gugusdepan dengan lebih efisien.
            Dengan teknologi Leaflet.js, peta digital dapat menampilkan lokasi
            Gugusdepan secara interaktif, mempercepat akses informasi, serta
            membantu pengambilan keputusan berbasis data. Saat ini, pemanfaatan
            SIG dalam Pramuka masih terbatas karena kurangnya kesadaran,
            anggaran, dan tenaga ahli di bidang teknologi informasi.
            <br />
            <br />
            Oleh karena itu, penelitian ini bertujuan untuk mengembangkan SIG
            berbasis website yang dapat meningkatkan efisiensi pengelolaan
            Gugusdepan dan memperluas pemahaman tentang manfaat SIG bagi
            pengelola Pramuka.
          </p>
        </div>
      </div>
    </UserTemplate>
  );
};

export default UserDashboard;
