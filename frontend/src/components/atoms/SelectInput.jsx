import React from "react";

const SelectInput = ({
  value,
  onChange,
  options,
  className,
  label,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 font-bold text-[#9500FF]">{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
