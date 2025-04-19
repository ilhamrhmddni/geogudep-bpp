import React, { useMemo, useState } from "react";
import AdminHeader from "../../atoms/AdminHeader";
import ErrorMessage from "../../atoms/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminWithFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dropdown options example
  const filterOptions = useMemo(
    () => [
      { id: "", nama: "Semua" },
      { id: "option1", nama: "Option 1" },
      { id: "option2", nama: "Option 2" },
      { id: "option3", nama: "Option 3" },
    ],
    []
  );

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "name", label: "Name", width: "w-3/12" },
      { key: "description", label: "Description", width: "w-4/12" },
    ],
    []
  );

  // Example dropdown filter
  const FilterDropdown = (
    <div className="relative md:block ml-2">
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="p-2 pl-3 pr-8 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#9500FF] text-sm"
      >
        {filterOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nama}
          </option>
        ))}
      </select>
      <span className="material-icons absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
        arrow_drop_down
      </span>
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-6">
          {/* Header with dropdown filter */}
          <AdminHeader
            title="Data with Filters"
            showSearch={true}
            showAddButton={false}
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            additionalControls={FilterDropdown}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : data.length === 0 ? (
              <NoDataMessage message="Data tidak ditemukan." />
            ) : (
              <TableR headers={headers} data={data} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminWithFilters;
