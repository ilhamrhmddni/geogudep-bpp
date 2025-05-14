// src/controllers/laporan-controller.js
const {
  Laporan,
  Kwarran,
  Gudep,
  User, // Pastikan model ini dan relasinya benar
  PesertaDidik,
  Prestasi,
  Geografis,
  Event,
} = require("../models"); // Sesuaikan path ke models jika perlu
const { Op } = require("sequelize");
require("dotenv").config();
const StatusCodes = require("http-status-codes");

// Fungsi helper untuk respon sukses dan error (TETAP SAMA)
const sendSuccess = (res, message, data, statusCode = StatusCodes.OK) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendError = (
  res,
  message,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  errorDetails = null
) => {
  console.error(
    "Server Error:",
    message,
    errorDetails ? errorDetails.stack || errorDetails : ""
  );
  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails ? errorDetails.message || errorDetails : undefined,
  });
};

// Fungsi UTAMA untuk mengambil DATA MENTAH yang dibutuhkan untuk rendering PDF di client
const fetchDataForReport = async (level, targetId) => {
  console.log(
    `[BE:fetchDataForReport] Dipanggil dengan level: ${level}, targetId: ${targetId}`
  );
  let reportDataOutput = {
    currentDate: new Date().toISOString(), // Kirim sebagai ISO string, frontend akan format
    level: level,
    targetId: targetId,
    title: "",
  };
  let targetEntityInfoForFilename = null;

  try {
    if (level === "semua") {
      reportDataOutput.title = "Laporan Lengkap Data Pramuka Balikpapan";
      reportDataOutput.allKwarran = (
        await Kwarran.findAll({
          include: [
            {
              model: Gudep,
              as: "gudepesList",
              attributes: ["id"],
              where: { no_gudep: { [Op.ne]: "ADMIN" } },
              required: false,
            },
          ],
          order: [["nama", "ASC"]],
        })
      ).map((k) => k.toJSON());

      reportDataOutput.allGudep = (
        await Gudep.findAll({
          where: { no_gudep: { [Op.ne]: "ADMIN" } },
          include: [
            { model: Geografis, as: "geografises" },
            { model: Kwarran, as: "kwarranes", attributes: ["id", "nama"] }, // Sertakan ID Kwarran
          ],
          order: [
            [{ model: Kwarran, as: "kwarranes" }, "nama", "ASC"],
            ["no_gudep", "ASC"],
          ],
        })
      ).map((g) => g.toJSON());

      reportDataOutput.allEvent = (
        await Event.findAll({
          order: [["tanggal_mulai", "DESC"]],
        })
      ).map((e) => e.toJSON());

      targetEntityInfoForFilename = null; // Tidak ada entitas spesifik untuk nama file "semua"
    } else if (level === "kwarran") {
      if (!targetId)
        throw new Error("Target ID diperlukan untuk laporan Kwarran.");
      const kwarran = await Kwarran.findByPk(targetId, {
        include: [
          {
            model: Gudep,
            as: "gudepesList",
            where: { no_gudep: { [Op.ne]: "ADMIN" } },
            required: false,
            include: [{ model: Geografis, as: "geografises" }],
            order: [["no_gudep", "ASC"]],
          },
        ],
      });
      if (!kwarran)
        throw new Error(`Data Kwarran (ID: ${targetId}) tidak ditemukan.`);
      reportDataOutput.kwarranDetail = kwarran.toJSON();
      reportDataOutput.title = `Laporan Kwartir Ranting ${
        kwarran.nama || targetId
      }`;
      targetEntityInfoForFilename = { id: kwarran.id, nama: kwarran.nama };
    } else if (level === "gudep") {
      if (!targetId)
        throw new Error("Target ID diperlukan untuk laporan Gudep.");
      const gudep = await Gudep.findByPk(targetId, {
        include: [
          { model: Geografis, as: "geografises" },
          {
            model: Prestasi,
            as: "prestasies",
            include: [
              { model: Event, as: "eventes", attributes: ["id", "nama"] },
            ],
          }, // Sertakan ID Event
          {
            model: PesertaDidik,
            as: "pesertaDidikes",
            order: [["nama", "ASC"]],
          },
          {
            model: Kwarran,
            as: "kwarranes",
            attributes: [
              "id",
              "kode",
              "nama",
              "ketua_kwarran",
              "ketua_dkr",
              "email",
            ],
          },
        ],
      });
      if (!gudep)
        throw new Error(`Data Gudep (ID: ${targetId}) tidak ditemukan.`);
      reportDataOutput.gudepDetail = gudep.toJSON();
      reportDataOutput.kwarranInfo = gudep.kwarranes
        ? gudep.kwarranes.toJSON()
        : {};
      reportDataOutput.title = `Laporan Gudep ${
        gudep.pangkalan || gudep.no_gudep || targetId
      }`;
      targetEntityInfoForFilename = {
        id: gudep.id,
        pangkalan: gudep.pangkalan,
        no_gudep: gudep.no_gudep,
      };
    } else {
      throw new Error(`Level laporan tidak valid: ${level}`);
    }
    return {
      reportRenderData: reportDataOutput,
      targetEntityInfo: targetEntityInfoForFilename,
    };
  } catch (error) {
    console.error(
      `[BE:fetchDataForReport] ERROR INTERNAL: level=${level}, targetId=${targetId}`,
      error.stack
    );
    throw error;
  }
};

// Fungsi controller lainnya
module.exports = {
  getAllLaporan: async (req, res) => {
    try {
      const allLaporan = await Laporan.findAll({
        order: [["createdAt", "DESC"]],
      });
      sendSuccess(
        res,
        "Data semua permintaan laporan berhasil didapatkan.",
        allLaporan
      );
    } catch (error) {
      sendError(
        res,
        "Gagal mendapatkan data semua permintaan laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },

  getLaporan: async (req, res) => {
    const { id } = req.params;
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return sendError(
          res,
          "Data laporan tidak ditemukan.",
          StatusCodes.NOT_FOUND
        );
      sendSuccess(res, "Data laporan berhasil didapatkan.", laporan);
    } catch (error) {
      sendError(
        res,
        "Gagal mendapatkan data laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },

  addLaporan: async (req, res) => {
    const { nama, asal, noHp, email, level, targetId } = req.body;
    if (!nama || !asal || !noHp || !email || !level) {
      return sendError(
        res,
        "Nama, Asal, No. HP, Email, dan Level wajib diisi.",
        StatusCodes.BAD_REQUEST
      );
    }
    const allowedLevels = ["semua", "kwarran", "gudep"]; // Sesuaikan dengan enum di model Laporan
    if (!allowedLevels.includes(level)) {
      return sendError(
        res,
        `Nilai level tidak valid. Pilihan: ${allowedLevels.join(", ")}`,
        StatusCodes.BAD_REQUEST
      );
    }
    if ((level === "kwarran" || level === "gudep") && !targetId) {
      return sendError(
        res,
        `Target ID untuk level '${level}' wajib diisi.`,
        StatusCodes.BAD_REQUEST
      );
    }
    try {
      let finalTargetId = level === "semua" ? null : targetId;
      if (finalTargetId) {
        // Validasi apakah targetId ada di DB
        if (level === "kwarran" && !(await Kwarran.findByPk(finalTargetId))) {
          return sendError(
            res,
            `Kwarran dengan ID ${finalTargetId} tidak ditemukan.`,
            StatusCodes.NOT_FOUND
          );
        }
        if (level === "gudep" && !(await Gudep.findByPk(finalTargetId))) {
          return sendError(
            res,
            `Gudep dengan ID ${finalTargetId} tidak ditemukan.`,
            StatusCodes.NOT_FOUND
          );
        }
      }
      const newLaporan = await Laporan.create({
        nama,
        asal,
        no_hp: String(noHp),
        email,
        level,
        target_id: finalTargetId,
        status: "Menunggu",
        pdf_path: null,
      });
      sendSuccess(
        res,
        "Permintaan laporan berhasil ditambahkan.",
        newLaporan,
        StatusCodes.CREATED
      );
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return sendError(
          res,
          error.errors.map((e) => e.message).join(", "),
          StatusCodes.BAD_REQUEST,
          error
        );
      }
      sendError(
        res,
        "Gagal menambahkan permintaan laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },

  deleteLaporan: async (req, res) => {
    const { id } = req.params;
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return sendError(
          res,
          "Laporan tidak ditemukan.",
          StatusCodes.NOT_FOUND
        );
      await laporan.destroy();
      sendSuccess(res, "Laporan berhasil dihapus.");
    } catch (error) {
      sendError(
        res,
        "Gagal menghapus laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },

  approveOnly: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return sendError(res, "Status baru diperlukan.", StatusCodes.BAD_REQUEST);
    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return sendError(
          res,
          "Permintaan laporan tidak ditemukan.",
          StatusCodes.NOT_FOUND
        );
      if (
        !["Menunggu", "Error Generate"].includes(laporan.status) &&
        status === "Setujui"
      ) {
        return sendError(
          res,
          `Laporan dengan status '${laporan.status}' tidak dapat diubah menjadi 'Setujui' saat ini.`,
          StatusCodes.CONFLICT
        );
      }
      laporan.status = status; // Bisa juga ada validasi status lain di sini
      await laporan.save();
      sendSuccess(
        res,
        `Status laporan berhasil diperbarui menjadi '${status}'.`,
        laporan
      );
    } catch (error) {
      sendError(
        res,
        "Gagal memperbarui status laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },

  approveAndPrepareReportData: async (req, res) => {
    // Nama fungsi controller diubah
    const { id: laporanId } = req.params;
    let laporan;
    try {
      console.log(
        `[BE] Memulai approveAndPrepareReportData untuk Laporan ID: ${laporanId}`
      );
      laporan = await Laporan.findByPk(laporanId);
      if (!laporan)
        return sendError(
          res,
          "Permintaan laporan tidak ditemukan.",
          StatusCodes.NOT_FOUND
        );

      if (!["Menunggu", "Error Generate", "Setujui"].includes(laporan.status)) {
        return sendError(
          res,
          `Laporan status '${laporan.status}' tidak bisa diproses ulang.`,
          StatusCodes.BAD_REQUEST
        );
      }

      if (
        laporan.status === "Menunggu" ||
        laporan.status === "Error Generate"
      ) {
        await laporan.update({ status: "Setujui" });
        console.log(
          `[BE] Status laporan ${laporanId} diubah menjadi "Setujui"`
        );
      }

      const { reportRenderData, targetEntityInfo } = await fetchDataForReport(
        laporan.level,
        laporan.target_id
      );
      console.log(
        `[BE] Data untuk laporan ${laporanId} (level: ${laporan.level}) berhasil diambil.`
      );

      sendSuccess(res, "Data laporan siap untuk diproses di klien.", {
        laporanItem: laporan.toJSON(),
        reportRenderData: reportRenderData,
        targetEntityInfo: targetEntityInfo,
      });
    } catch (error) {
      console.error(
        `[BE] ❌ Gagal approveAndPrepareReportData untuk ID ${laporanId}:`,
        error.stack
      );
      if (
        laporan &&
        (laporan.status === "Setujui" || laporan.status === "Menunggu")
      ) {
        await laporan
          .update({ status: "Error Generate", pdf_path: null })
          .catch((e) =>
            console.error("[BE] Gagal update status ke Error Generate:", e)
          );
      }
      if (!res.headersSent) {
        sendError(
          res,
          `Gagal mempersiapkan data laporan: ${error.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error
        );
      }
    }
  },

  prepareDirectReportData: async (req, res) => {
    // Nama fungsi controller diubah
    const { level, targetId, namaKwarran, namaGudep } = req.body;
    try {
      console.log(
        `[BE] Memulai prepareDirectReportData: level=${level}, targetId=${targetId}`
      );
      if (!level || !["semua", "kwarran", "gudep"].includes(level)) {
        return sendError(
          res,
          "Level laporan tidak valid.",
          StatusCodes.BAD_REQUEST
        );
      }
      if ((level === "kwarran" || level === "gudep") && !targetId) {
        return sendError(
          res,
          `Target ID (${level}) wajib diisi.`,
          StatusCodes.BAD_REQUEST
        );
      }

      const { reportRenderData, targetEntityInfo } = await fetchDataForReport(
        level,
        targetId
      );
      console.log(
        `[BE] Data untuk direct report (level: ${level}) berhasil diambil.`
      );

      let finalTargetEntityInfo = targetEntityInfo;
      if (targetEntityInfo) {
        if (level === "kwarran" && namaKwarran)
          finalTargetEntityInfo = { ...targetEntityInfo, nama: namaKwarran };
        else if (level === "gudep" && namaGudep)
          finalTargetEntityInfo = { ...targetEntityInfo, pangkalan: namaGudep };
      }

      sendSuccess(res, "Data laporan direct siap untuk diproses di klien.", {
        reportRenderData: reportRenderData,
        targetEntityInfo: finalTargetEntityInfo,
      });
    } catch (error) {
      console.error(`[BE] ❌ Gagal prepareDirectReportData:`, error.stack);
      if (!res.headersSent) {
        sendError(
          res,
          `Gagal memproses permintaan direct: ${error.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error
        );
      }
    }
  },

  updateLaporanStatusAndPath: async (req, res) => {
    // Endpoint baru
    const { id } = req.params;
    const { status, client_generated_filename } = req.body;

    if (!status)
      return sendError(res, "Status baru diperlukan.", StatusCodes.BAD_REQUEST);
    const allowedStatus = Laporan.getAttributes().status.values;
    if (!allowedStatus.includes(status)) {
      return sendError(
        res,
        `Status '${status}' tidak valid. Pilihan: ${allowedStatus.join(", ")}`,
        StatusCodes.BAD_REQUEST
      );
    }

    try {
      const laporan = await Laporan.findByPk(id);
      if (!laporan)
        return sendError(
          res,
          "Laporan tidak ditemukan.",
          StatusCodes.NOT_FOUND
        );

      if (status === "Selesai" && !["Setujui"].includes(laporan.status)) {
        // "DiprosesKlien" adalah contoh jika Anda ingin status antara
        return sendError(
          res,
          `Tidak dapat mengubah status dari '${laporan.status}' menjadi 'Selesai' pada tahap ini.`,
          StatusCodes.BAD_REQUEST
        );
      }

      laporan.status = status;
      if (client_generated_filename !== undefined) {
        // Hanya update jika dikirim
        laporan.pdf_path = `CLIENT_GENERATED:${client_generated_filename}`; // Tandai sebagai dibuat klien
      } else if (status === "Error Generate") {
        laporan.pdf_path = null; // Hapus path jika kembali ke error
      }
      await laporan.save();
      console.log(
        `[BE] Laporan ID ${id} diupdate: status=${status}, pdf_path=${laporan.pdf_path}`
      );
      sendSuccess(
        res,
        "Status dan info file laporan berhasil diperbarui.",
        laporan
      );
    } catch (error) {
      console.error(
        `[BE] ❌ Gagal updateLaporanStatusAndPath untuk ID ${id}:`,
        error.stack
      );
      sendError(
        res,
        "Gagal memperbarui status/info file laporan.",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error
      );
    }
  },
};
