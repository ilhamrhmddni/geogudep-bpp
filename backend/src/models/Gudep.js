const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Kwarran = require("./Kwarran");
const User = require("./User");

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
      type: DataTypes.UUID, // Ensure this matches the User model's id type
      allowNull: true,
      references: {
        model: "user", // Ensure this matches the table name of the User model
        key: "id",
        as: "useres",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    kwarran_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Kwarran,
        key: "id",
        as: "kwarranes",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    pangkalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ambalan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_gudep: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tingkatan: {
      type: DataTypes.ENUM("Siaga", "Penggalang", "Penegak/Pandega", "Pandega"),
      defaultValue: "Penegak/Pandega",
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

// Hook after CREATE Gudep
Gudep.afterCreate(async (gudep) => {
  try {
    if (gudep.kwarran_id) {
      const jumlahGudep = await Gudep.count({
        where: { kwarran_id: gudep.kwarran_id },
      });
      await Kwarran.update(
        { jumlah_gudep: jumlahGudep },
        { where: { id: gudep.kwarran_id } }
      );
    }
  } catch (error) {
    console.error("❌ Error in afterCreate hook:", error.message);
  }
});

// Hook after DELETE Gudep
Gudep.afterDestroy(async (gudep) => {
  try {
    if (gudep.kwarran_id) {
      const jumlahGudep = await Gudep.count({
        where: { kwarran_id: gudep.kwarran_id },
      });
      await Kwarran.update(
        { jumlah_gudep: jumlahGudep },
        { where: { id: gudep.kwarran_id } }
      );
    }
  } catch (error) {
    console.error("❌ Error in afterDestroy hook:", error.message);
  }
});

// Hook after UPDATE Gudep
Gudep.afterUpdate(async (gudep) => {
  try {
    const prevKwarranId = gudep.previous("kwarran_id");
    if (prevKwarranId !== gudep.kwarran_id) {
      if (prevKwarranId) {
        const prevJumlahGudep = await Gudep.count({
          where: { kwarran_id: prevKwarranId },
        });
        await Kwarran.update(
          { jumlah_gudep: prevJumlahGudep },
          { where: { id: prevKwarranId } }
        );
      }
      if (gudep.kwarran_id) {
        const newJumlahGudep = await Gudep.count({
          where: { kwarran_id: gudep.kwarran_id },
        });
        await Kwarran.update(
          { jumlah_gudep: newJumlahGudep },
          { where: { id: gudep.kwarran_id } }
        );
      }
    }
  } catch (error) {
    console.error("❌ Error in afterUpdate hook:", error.message);
  }
});

module.exports = Gudep;
