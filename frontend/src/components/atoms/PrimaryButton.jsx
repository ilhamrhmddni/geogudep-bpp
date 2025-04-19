import React from "react";

const PrimaryButton = ({ text, type = "button", onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-white text-[#9500FF] px-8 py-2 rounded-full font-bold hover:bg-[#9500FF] hover:text-white transition-all cursor-pointer"
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
