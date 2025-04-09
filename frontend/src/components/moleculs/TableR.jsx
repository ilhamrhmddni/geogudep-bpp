import React from "react";

const getNestedValue = (obj, path) => {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] ? acc[key] : "-"), obj);
};

const TableR = ({ headers, data = [] }) => {
  return (
    <table className="min-w-full table-auto mt-4">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border px-4 py-2 border-none">
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              {headers.map((header, idx) => (
                <td
                  key={idx}
                  className="border border-none px-2 py-1 text-center"
                >
                  {getNestedValue(item, header.key)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="text-center py-4">
              Data tidak ditemukan
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableR;
