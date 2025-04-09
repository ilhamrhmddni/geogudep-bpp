import React from "react";

const TableCRUD = ({ headers, data, onEdit, onDelete }) => {
  return (
    <table className="min-w-full table-auto mt-4 ">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border px-4 py-2 border-none">
              {header.label} {/* Menampilkan label */}
            </th>
          ))}
          <th className="border border-none px-4 py-2">Actions</th>
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
                  {item[header.key]} {/* Mengakses item dengan key */}
                </td>
              ))}
              <td className="border border-none px-4 py-2 flex items-center justify-center">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-500 mr-2"
                >
                  <span className="material-icons cursor-pointer">edit</span>{" "}
                  {/* Ganti dengan ikon */}
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500"
                >
                  <span className="material-icons cursor-pointer">delete</span>{" "}
                  {/* Ikon untuk delete */}
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

export default TableCRUD;
