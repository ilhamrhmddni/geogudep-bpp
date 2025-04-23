// File: src/components/moleculs/TableRU.jsx (Versi BARU - Fleksibel)
import React from "react";

/**
 * Komponen Tabel Fleksibel (Pengganti TableRU Lama)
 * - Menerima props: headers, data
 * - Merender data sesuai header.key
 * - Jika header.key adalah 'actions', akan merender JSX yang ada di item.actions
 * - Tidak lagi memiliki prop onApprove atau logika tombol internal.
 */
const TableRU = ({ headers = [], data = [] }) => {
  // Tambahkan default props untuk menghindari error jika props tidak dikirim
  if (!Array.isArray(headers) || !Array.isArray(data)) {
    console.error("TableRU requires headers and data props as arrays.");
    return <div>Error loading table data.</div>; // Tampilkan pesan error atau null
  }

  return (
    <div className="overflow-x-auto mt-4">
      {" "}
      {/* Hapus mt-4 jika sudah diatur di parent */}
      <table className="min-w-full table-auto">
        {" "}
        {/* Hapus border jika tidak ingin */}
        <thead>
          {/* Style Header disamakan dengan preferensi */}
          <tr className="bg-gray-50">
            {headers.map((header) => (
              <th
                key={header?.key || header?.label} // Fallback key
                scope="col" // Tambahkan scope untuk a11y
                className={`${
                  header?.width || "w-auto"
                } px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`} // Contoh style header
              >
                {header?.label || "Header?"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {" "}
          {/* Garis antar baris */}
          {data.length > 0 ? (
            data.map((item, index) => (
              // Gunakan ID item sebagai key jika ada
              <tr key={item?.id || index} className="hover:bg-gray-50">
                {headers.map((header) => {
                  const headerKey = header?.key;
                  // Ambil data sel, beri fallback '-' jika null/undefined
                  const cellData =
                    item && headerKey ? item[headerKey] ?? "-" : "-";

                  return (
                    <td
                      key={`${headerKey}-${item?.id || index}`}
                      // Style Cell (padding, ukuran teks, alignment - sesuaikan)
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center"
                    >
                      {/* Render data atau JSX langsung */}
                      {cellData}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            // Baris jika data kosong
            <tr>
              <td colSpan={headers?.length || 1} className="text-center py-4">
                Data tidak ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableRU;
