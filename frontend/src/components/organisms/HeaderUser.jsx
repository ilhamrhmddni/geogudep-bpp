import React from "react";

const HeaderUser = () => {
  return (
    <header className="w-full p-4 bg-white text-[#9500FF] flex items-center justify-center shadow-md mt-20 md:mt-0">
      {/* Logo dan judul aplikasi */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-center md:ml-18">
          Sistem Informasi Geografis Pemetaan Gugus Depan Kota Balikpapan
        </span>
      </div>
    </header>
  );
};

export default HeaderUser;
