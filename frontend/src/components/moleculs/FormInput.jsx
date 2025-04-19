import React, { useState } from "react";
import Label from "../atoms/FormLabel";
import Button from "../atoms/PrimaryButton";
import Input from "../atoms/TextInput";

const FormInput = () => {
  const [name, setName] = useState("");

  return (
    <div className="p-4 border border-gray-200 rounded">
      <Label text="Nama" htmlFor="name" />
      <Input
        type="text"
        placeholder="Masukkan nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button text="Kirim" onClick={handleSubmit} />
    </div>
  );
};

export default FormInput;
