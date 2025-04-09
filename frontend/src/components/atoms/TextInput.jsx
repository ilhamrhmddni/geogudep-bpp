import React from "react";

const InputDefault = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border rounded-full border-gray-300 px-8 py-2 w-full bg-white "
    />
  );
};

export default InputDefault;
