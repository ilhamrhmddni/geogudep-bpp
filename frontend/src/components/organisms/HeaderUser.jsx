import React from "react";

const HeaderUser = () => {
  return (
    <header className="w-full p-4 bg-white text-[#9500FF] flex items-center justify-between shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 ml-20 m-2">
        <span className="text-xl font-bold">
          Sistem Informasi Geografis Pemetaan Gugus Depan Kota Balikpapan
        </span>
      </div>
    </header>
  );
};

export default HeaderUser;
