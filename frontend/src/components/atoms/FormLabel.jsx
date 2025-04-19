import React from "react";

const Label = ({ text, htmlFor, className, ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1 font-bold text-[#9500FF] ${className}`}
      {...props}
    >
      {text}
    </label>
  );
};

export default Label;
