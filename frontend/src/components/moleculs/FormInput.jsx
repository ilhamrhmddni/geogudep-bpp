import React, { useState } from "react";
import Label from "../atoms/FormLabel";
import Button from "../atoms/PrimaryButton";
import Input from "../atoms/TextInput";

// Komponen FormInput untuk menangani input form sederhana
const FormInput = () => {
  const [name, setName] = useState(""); // State untuk menyimpan nilai input nama

  // Fungsi untuk menangani submit form
  const handleSubmit = () => {
    // Validasi sederhana sebelum submit
    if (name.trim() === "") {
      alert("Nama tidak boleh kosong!");
      return;
    }
    alert(`Nama berhasil dikirim: ${name}`);
  };

  return (
    // Container form dengan styling Tailwind CSS
    <div className="p-4 border border-gray-200 rounded">
      {/* Label untuk input nama */}
      <Label text="Nama" htmlFor="name" />
      {/* Input teks untuk nama */}
      <Input
        type="text"
        placeholder="Masukkan nama" // Placeholder untuk input
        value={name} // Nilai input terikat ke state
        onChange={(e) => setName(e.target.value)} // Fungsi untuk mengubah nilai state
      />
      {/* Tombol untuk submit form */}
      <Button text="Kirim" onClick={handleSubmit} />
    </div>
  );
};

export default FormInput;
