// src/components/atoms/SearchInput.js
import React from "react";

const SearchInput = ({ value, onChange, placeholder = "Cari Data ..." }) => {
  return (
    <div className="w-full flex flex-auto ">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="p-2 border-0 rounded-md w-full m-2 bg-white"
      />
    </div>
  );
};

export default SearchInput;
