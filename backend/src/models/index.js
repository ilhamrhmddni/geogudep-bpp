require("dotenv").config();
const Sequelize = require("sequelize");
const sequelize = require("../../config/db");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ✅ Import models
db.User = require("./User");
db.Kwarran = require("./Kwarran");
db.Gudep = require("./Gudep");
db.Geografis = require("./Geografis");
db.PesertaDidik = require("./PesertaDidik");
db.Event = require("./Event");
db.Prestasi = require("./Prestasi");
db.Laporan = require("./Laporan");

// ✅ Define Associations
db.User.hasOne(db.Gudep, { foreignKey: "user_id", as: "gudepes" });
db.Gudep.belongsTo(db.User, { foreignKey: "user_id", as: "useres" });

db.Kwarran.hasMany(db.Gudep, { foreignKey: "kwarran_id", as: "gudepesList" });
db.Gudep.belongsTo(db.Kwarran, { foreignKey: "kwarran_id", as: "kwarranes" });

db.Gudep.hasMany(db.Prestasi, { foreignKey: "gudep_id", as: "prestasies" });
db.Prestasi.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

db.Gudep.hasOne(db.Geografis, { foreignKey: "gudep_id", as: "geografises" });
db.Geografis.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

db.Gudep.hasMany(db.PesertaDidik, {
  foreignKey: "gudep_id",
  as: "pesertaDidikes",
});
db.PesertaDidik.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

db.Event.belongsToMany(db.Gudep, {
  through: db.Prestasi,
  foreignKey: "event_id",
  as: "eventes",
});
db.Gudep.belongsToMany(db.Event, {
  through: db.Prestasi,
  foreignKey: "gudep_id",
  as: "gudepesEvents",
});

db.Gudep.hasMany(db.Event, { foreignKey: "gudep_id", as: "eventes" });

db.Gudep.hasMany(db.Laporan, { foreignKey: "gudep_id", as: "laporanes" });
db.Laporan.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

db.Event.hasMany(db.Prestasi, { foreignKey: "event_id", as: "prestasies" });
db.Prestasi.belongsTo(db.Event, { foreignKey: "event_id", as: "eventes" });

// ✅ Database Synchronization
(async () => {
  try {
    // Synchronize models in the correct order
    await db.Kwarran.sync({ alter: true }); // Ensure Kwarran table is created first
    await db.User.sync({ alter: true }); // Then create User table
    await db.Gudep.sync({ alter: true }); // Then create Gudep table
    await db.Geografis.sync({ alter: true }); // Then create Geografis table
    await db.PesertaDidik.sync({ alter: true }); // Then create PesertaDidik table
    await db.Event.sync({ alter: true }); // Then create Event table
    await db.Prestasi.sync({ alter: true }); // Then create Prestasi table
    await db.Laporan.sync({ alter: true }); // Then create Laporan table

    // Inject default admin user and related entries
    const defaultUsername = "admin";
    const defaultPassword = "ilhamrhmddni";

    await db.sequelize.transaction(async (transaction) => {
      const [user, created] = await db.User.findOrCreate({
        where: { username: defaultUsername },
        defaults: {
          username: defaultUsername,
          password: defaultPassword, // Store plain text password
          email: "ilhamrhmddni@gmail.com",
          role: "admin",
          fullname: "Administrator",
        },
        transaction, // Ensure this operation is part of the transaction
      });

      if (created && user.role === "admin") {
        // Only create Gudep and Geografis for admin
        const gudep = await db.Gudep.create(
          {
            user_id: user.id,
            no_gudep: "ADMIN", // Set no_gudep to "ADMIN"
          },
          { transaction } // Ensure this operation is part of the transaction
        );

        await db.Geografis.create(
          {
            gudep_id: gudep.id,
          },
          { transaction } // Ensure this operation is part of the transaction
        );
      }
    });
  } catch (err) {
    console.error(
      "❌ Failed to synchronize database or inject default user:",
      err
    );
  }
})();

module.exports = db;
