import React from "react";

const TableCRUD = ({ headers, data, onEdit, onDelete }) => {
  return (
    <table className="min-w-full table-auto mt-4">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header.key} className={`${header.width} px-4 py-2`}>
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td
                  key={header.key}
                  className="border border-none px-2 py-1 text-center"
                >
                  {header.key === "no" ? (
                    index + 1
                  ) : header.key === "actions" ? (
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-500 mr-2"
                      >
                        <span className="material-icons cursor-pointer">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-500"
                      >
                        <span className="material-icons cursor-pointer">
                          delete
                        </span>
                      </button>
                    </div>
                  ) : (
                    item[header.key] || "-"
                  )}
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

export default TableCRUD;
