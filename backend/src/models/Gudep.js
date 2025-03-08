const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Kwarran = require("./Kwarran");

const Gudep = sequelize.define(
  "Gudep",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "user",
        key: "id",
        as: "useres",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "user_id",
    },
    kwarran_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "kwarran",
        key: "id",
        as: "kwarranes",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "kwarran_id",
    },
    no_gudep: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tingkatan: {
      type: DataTypes.ENUM("Siaga", "Penggalang", "Penegak", "Pandega"),
      defaultValue: "Penegak",
      allowNull: false,
    },
    mabigus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pembina: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pelatih: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    tahun_update: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    jumlah_putra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    jumlah_putri: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    tableName: "gudep",
  }
);

// **🔹 Function untuk update jumlah_gudep di Kwarran**
async function updateJumlahGudep(kwarran_id) {
  if (!kwarran_id) return; // **Cegah error jika kwarran_id kosong**
  const jumlahGudep = await Gudep.count({ where: { kwarran_id } });
  await Kwarran.update(
    { jumlah_gudep: jumlahGudep },
    { where: { id: kwarran_id } }
  );
}

// **🔹 Hook setelah CREATE Gudep**
Gudep.afterCreate(async (gudep, options) => {
  await updateJumlahGudep(gudep.kwarran_id);
});

// **🔹 Hook setelah DELETE Gudep**
Gudep.afterDestroy(async (gudep, options) => {
  await updateJumlahGudep(gudep.kwarran_id);
});

// **🔹 Hook setelah UPDATE Gudep (Jika Pindah Kwarran)**
Gudep.afterUpdate(async (gudep, options) => {
  const prevKwarranId = gudep.previous("kwarran_id");
  if (prevKwarranId !== gudep.kwarran_id) {
    await updateJumlahGudep(prevKwarranId); // Update kwarran lama
    await updateJumlahGudep(gudep.kwarran_id); // Update kwarran baru
  }
});

module.exports = Gudep;
