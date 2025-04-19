import React from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../atoms/AddButton";
import Dropdown from "../atoms/Dropdown"; // Import Dropdown
import SearchInput from "../atoms/SearchInput";

const ListHeader = ({
  title,
  searchQuery,
  setSearchQuery,
  addButtonLabel,
  addButtonRoute,
  onAddButtonClick,
  dropdowns, // Tambahkan prop dropdowns
}) => {
  const navigate = useNavigate();

  const handleAdd = () => {
    if (onAddButtonClick) {
      onAddButtonClick();
    } else if (addButtonRoute) {
      navigate(addButtonRoute);
    }
  };

  return (
    <div className="flex bg-purple-600 rounded-2xl items-center justify-between px-6 py-1">
      <h2 className="text-xl font-bold whitespace-nowrap text-white">
        {title}
      </h2>
      <div className="flex items-center space-x-2">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Baris 34 kemungkinan ini
          placeholder={`Cari ${title}...`}
          className="text-black"
        />
        {dropdowns &&
          dropdowns.map((dropdown) => (
            <Dropdown
              key={dropdown.name}
              options={dropdown.options}
              selected={dropdown.selected}
              onChange={dropdown.onChange}
              placeholder={dropdown.placeholder}
              className="text-black" // Tambahkan class text-black jika perlu
            />
          ))}
        {addButtonLabel && (
          <AddButton
            onClick={handleAdd}
            label={addButtonLabel}
            icon="add"
            className="mx-2"
          />
        )}
      </div>
    </div>
  );
};

export default ListHeader;
