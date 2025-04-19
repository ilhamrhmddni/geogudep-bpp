import React from "react";

// Komponen Label untuk menampilkan label pada elemen form
const Label = ({ text, htmlFor, className, ...props }) => {
  return (
    // Elemen <label> dengan styling Tailwind CSS
    <label
      htmlFor={htmlFor} // Menghubungkan label dengan elemen form menggunakan atribut htmlFor
      className={`mb-1 font-bold text-[#9500FF] ${className}`} // Styling default dengan opsi tambahan melalui className
      {...props} // Spread operator untuk menerima properti tambahan
    >
      {text} {/* Teks label yang diterima melalui prop */}
    </label>
  );
};

export default Label;
