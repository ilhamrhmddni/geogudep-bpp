import React from "react";
import Dropdown from "../atoms/Dropdown";
import SearchInput from "../atoms/SearchInput";

const FilterHeader = ({
  title,
  searchQuery,
  onSearchChange,
  dropdowns, // Array of dropdown configurations
}) => {
  return (
    <div className="flex bg-purple-600 rounded-2xl items-center justify-between px-6 py-1">
      <span className="text-xl font-bold whitespace-nowrap text-white">
        {title}
      </span>
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        className="text-black"
        placeholder={`Cari ${title}...`}
      />
      {dropdowns &&
        dropdowns.map((dropdown) => (
          <Dropdown
            key={dropdown.name}
            options={dropdown.options}
            selected={dropdown.selected}
            onChange={dropdown.onChange}
            placeholder={dropdown.placeholder}
          />
        ))}
    </div>
  );
};

export default FilterHeader;
