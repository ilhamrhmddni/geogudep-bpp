import React from "react";

const TableRU = ({ headers, data, onApprove }) => {
  return (
    <table className="min-w-full table-auto mt-4">
      <thead>
        <tr>
          {/* Render header tabel */}
          {headers.map((header) => (
            <th key={header.key} className={`${header.width} px-4 py-2`}>
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Jika data tersedia, render baris data */}
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td
                  key={header.key}
                  className="border border-none px-2 py-1 text-center"
                >
                  {/* Kolom nomor */}
                  {header.key === "no" ? (
                    index + 1
                  ) : header.key === "actions" ? (
                    // Kolom aksi dengan tombol Approve/Selesai
                    <button
                      onClick={() => onApprove(item.id)}
                      className={`px-4 py-2 rounded ${
                        item.status === "selesai"
                          ? "bg-[#590396]" // Warna tombol jika status selesai
                          : "bg-[#9500FF]" // Warna tombol jika belum selesai
                      } text-white`}
                      disabled={item.status === "selesai"} // Disable tombol jika status selesai
                    >
                      {item.status === "selesai" ? "Selesai" : "Approve"}
                    </button>
                  ) : (
                    // Kolom data lainnya
                    item[header.key] || "-" // Tampilkan "-" jika data kosong
                  )}
                </td>
              ))}
            </tr>
          ))
        ) : (
          // Jika data tidak ditemukan
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
