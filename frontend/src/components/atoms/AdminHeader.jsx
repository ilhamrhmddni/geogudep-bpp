import React from "react";

/**
 * Reusable AdminHeader component for all admin pages
 *
 * @param {Object} props Component props
 * @param {string} props.title - Header title
 * @param {boolean} props.showSearch - Whether to show search input
 * @param {boolean} props.showAddButton - Whether to show add button
 * @param {string} props.searchValue - Search input value
 * @param {function} props.onSearchChange - Search input change handler
 * @param {function} props.onAddClick - Add button click handler
 * @param {React.ReactNode} props.additionalControls - Additional controls to display
 * @returns {React.ReactNode}
 */
const AdminHeader = ({
  title,
  showSearch = true,
  showAddButton = false,
  searchValue = "",
  onSearchChange = () => {},
  onAddClick = () => {},
  additionalControls = null,
}) => {
  return (
    <div className="flex gap-2 bg-[#9500FF] rounded-2xl mx-4 px-6 py-4 justify-between items-center mt-10 md:mt-0 ">
      <span className="md:text-2xl text-xl font-bold text-white whitespace-nowrap ">
        {title}
      </span>
      <div className="flex gap-4 mt-2 md:mt-0 items-center">
        {showSearch && (
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Cari..."
              value={searchValue}
              onChange={onSearchChange}
              className="p-2 pl-10 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
            />
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
        )}
        {additionalControls && (
          <div className="hidden md:flex">{additionalControls}</div>
        )}
        {showAddButton && (
          <button
            onClick={onAddClick}
            className="bg-white text-[#9500FF] px-4 py-2 rounded-2xl border-2 border-[#9500FF] cursor-pointer font-bold flex gap-2 items-center"
          >
            <span className="material-icons">add</span>
            <span className="hidden md:block">Tambah</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
