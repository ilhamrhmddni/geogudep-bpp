// src/components/moleculs/TableCRUD.jsx
import React from "react";

// Komponen TableCRUD dikembalikan ke cara kerja umum:
// onEdit(item) -> menerima seluruh objek data baris
// onDelete(id) -> menerima ID dari item baris
const TableCRUD = ({ headers, data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto mt-4">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className={`${header.width || ""} px-4 py-2`}
              >
                {" "}
                {/* Tambah default width */}
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              // Gunakan item.id sebagai key jika ADA, fallback ke index
              // Pastikan data yang DIKIRIM ke TableCRUD SELALU punya 'id'
              <tr key={item?.id ?? data.indexOf(item)}>
                {headers.map((header) => (
                  <td
                    key={`${item?.id}-${header.key}`}
                    className="border border-none px-2 py-1 text-center"
                  >
                    {header.key === "actions" ? (
                      <div className="flex items-center justify-center">
                        {/* Tombol Edit: Panggil onEdit dengan seluruh item baris */}
                        <button
                          onClick={() => onEdit(item)} // <-- KEMBALIKAN KE onEdit(item)
                          className="text-blue-500 mr-2"
                          aria-label="Edit"
                        >
                          <span
                            className="material-icons cursor-pointer"
                            style={{ fontSize: "1.25rem" }}
                          >
                            edit
                          </span>
                        </button>
                        {/* Tombol Delete: Panggil onDelete dengan ID item */}
                        <button
                          onClick={() => onDelete(item.id)} // <-- Tetap onDelete(item.id)
                          className="text-red-500"
                          aria-label="Hapus"
                        >
                          <span
                            className="material-icons cursor-pointer"
                            style={{ fontSize: "1.25rem" }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    ) : Array.isArray(item[header.key]) ? (
                      <div className="overflow-x-auto">
                        {" "}
                        {/* ... slider ... */}{" "}
                      </div>
                    ) : (
                      // Render data sel biasa
                      item[header.key] ?? "-"
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
    </div>
  );
};

export default TableCRUD;
