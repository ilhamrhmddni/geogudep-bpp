import React from "react";

const FormLabel = ({ htmlFor, text }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-md font-bold text-white text-center "
    >
      {text}
    </label>
  );
};

export default FormLabel;
