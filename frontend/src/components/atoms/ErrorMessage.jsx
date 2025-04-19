import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="text-center py-4 text-red-500 font-semibold">{message}</div>
  );
};

export default ErrorMessage;
