import React from "react";

const TableRU = ({ headers, data, onApprove }) => {
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
                    <button
                      onClick={() => onApprove(item.id)}
                      className={`px-4 py-2 rounded ${
                        item.status === "selesai"
                          ? "bg-[#590396]"
                          : "bg-[#9500FF]"
                      } text-white`}
                      disabled={item.status === "selesai"}
                    >
                      {item.status === "selesai" ? "Selesai" : "Approve"}
                    </button>
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

export default TableRU;
