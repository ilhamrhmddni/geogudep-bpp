// src/moleculs/TableRU.jsx
import React from "react";

const TableRU = ({ headers, data, onApprove }) => {
  return (
    <table className="min-w-full table-auto mt-4">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border px-4 py-2 border-none">
              {header.label}
            </th>
          ))}
          <th className="border px-4 py-2 border-none">Actions</th>
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
                  {item[header.key]}
                </td>
              ))}
              <td className="border border-none px-2 py-1 text-center transition-colors">
                <button
                  onClick={() => onApprove(item.id)}
                  className={`px-4 py-2 rounded ${
                    item.status === "selesai" ? "bg-[#590396] " : "bg-[#9500FF]"
                  } text-white`}
                  disabled={item.status === "selesai"}
                >
                  {item.status === "selesai" ? "Selesai" : "Approve"}
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length + 1} className="text-center py-4">
              Data tidak ditemukan
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableRU;
