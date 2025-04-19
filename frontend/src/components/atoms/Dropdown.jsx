// Dropdown.jsx
import React from "react";

const Dropdown = ({ options, selected, onChange, placeholder }) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="m-2 p-2 border-2 border-white rounded-md text-white font-bold cursor-pointer"
    >
      <option value="" className="text-[#9500FF] font-bold">
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.id}
          value={option.nama || option.id}
          className="text-[#9500FF] font-bold"
        >
          {option.nama || option.id}
        </option>
      ))}
    </select>
  );
};

export default Dropdown; // Pastikan ada ekspor default di sini
