// src/components/atoms/AddButton.js
import React from "react";

const AddButton = ({ onClick, icon = "add" }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#9500FF] text-white rounded-md mx-2 border-2 cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out flex items-center"
    >
      <span className="material-icons m-2" style={{ color: "white" }}>
        {icon}
      </span>
    </button>
  );
};

export default AddButton;
