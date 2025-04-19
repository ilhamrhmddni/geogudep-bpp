import React from "react";

// Komponen TableCRUD menerima props: headers (kolom tabel), data (data untuk ditampilkan),
// onEdit (fungsi untuk mengedit data), dan onDelete (fungsi untuk menghapus data).
const TableCRUD = ({ headers, data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      {/* Table Area */}
      <table className="min-w-full table-auto mt-4">
        <thead>
          <tr>
            {/* Render header tabel berdasarkan array headers */}
            {headers.map((header) => (
              <th key={header.key} className={`${header.width} px-4 py-2`}>
                {header.label} {/* Label header */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Jika data tersedia, render baris data */}
          {data.length > 0 ? (
            data.map((item) => (
              // Gunakan properti unik sebagai key, fallback ke index jika tidak ada ID/kode yang stabil
              <tr key={item.id || item.kode || data.indexOf(item)}>
                {headers.map((header) => (
                  <td
                    key={`${item.id}-${header.key}`} // Key unik untuk setiap sel
                    className="border border-none px-2 py-1 text-center"
                  >
                    {/* Render nomor urut jika key adalah "no" */}
                    {header.key === "no" ? (
                      data.indexOf(item) + 1
                    ) : header.key === "actions" ? (
                      // Render tombol edit dan delete jika key adalah "actions"
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => onEdit(item)} // Panggil fungsi edit
                          className="text-blue-500 mr-2"
                        >
                          <span className="material-icons cursor-pointer">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(item.id)} // Panggil fungsi delete
                          className="text-red-500"
                        >
                          <span className="material-icons cursor-pointer">
                            delete
                          </span>
                        </button>
                      </div>
                    ) : Array.isArray(item[header.key]) ? (
                      // Render slider jika data adalah array
                      <div className="overflow-x-auto">
                        <div className="flex space-x-4">
                          {item[header.key].map((content, index) => (
                            <div
                              key={index}
                              className="min-w-[100px] bg-gray-100 p-2 rounded shadow"
                            >
                              {content}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Render data berdasarkan key header, fallback ke "-" jika data kosong
                      item[header.key] || "-"
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // Jika data kosong, tampilkan pesan "Data tidak ditemukan"
            <tr>
              <td colSpan={headers.length} className="text-center py-4">
                Data tidak ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableCRUD;
