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

// **User  and Gudep (One-to-One)**
db.User.hasOne(db.Gudep, { foreignKey: "user_id", as: "gudepes" });
db.Gudep.belongsTo(db.User, { foreignKey: "user_id", as: "useres" });

// **Kwarran and Gudep (One-to-Many)**
db.Kwarran.hasMany(db.Gudep, { foreignKey: "kwarran_id", as: "gudepesList" });
db.Gudep.belongsTo(db.Kwarran, { foreignKey: "kwarran_id", as: "kwarranes" });

// **Gudep and Prestasi (One-to-Many)**
db.Gudep.hasMany(db.Prestasi, { foreignKey: "gudep_id", as: "prestasies" });
db.Prestasi.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

// **Gudep and Geografis (One-to-One)**
db.Gudep.hasOne(db.Geografis, { foreignKey: "gudep_id", as: "geografises" });
db.Geografis.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

// **Gudep and PesertaDidik (One-to-Many)**
db.Gudep.hasMany(db.PesertaDidik, {
  foreignKey: "gudep_id",
  as: "pesertaDidikes",
});
db.PesertaDidik.belongsTo(db.Gudep, { foreignKey: "gudep_id", as: "gudepes" });

// **Many-to-Many Gudep and Event through Prestasi**
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

// **Gudep and Event (One-to-Many)**
db.Gudep.hasMany(db.Event, {
  foreignKey: "gudep_id",
  as: "eventes",
});

// ✅ Hooks
// **Event and Prestasi (One-to-Many)**
db.Event.hasMany(db.Prestasi, { foreignKey: "event_id", as: "prestasies" });
db.Prestasi.belongsTo(db.Event, { foreignKey: "event_id", as: "eventes" });

// **Hook for creating Gudep and Geografis automatically after User creation**
db.User.afterCreate(async (user) => {
  try {
    console.log(
      `🛠️ Membuat Gudep dan Geografis untuk user ${user.username}...`
    );
    const gudep = await db.Gudep.create({ user_id: user.id });
    await db.Geografis.create({ gudep_id: gudep.id });
    console.log(
      `✅ Gudep dan Geografis berhasil dibuat untuk user ${user.username}`
    );
  } catch (error) {
    console.error(`❌ Gagal membuat Gudep dan Geografis: ${error.message}`);
  }
});

// ✅ Database Synchronization
(async () => {
  try {
    // Synchronize all tables
    await sequelize.sync({ alter: false }); // Use `alter: true` to update the schema
    console.log("✅ Database synchronized.");

    // Inject default admin user
    const defaultUsername = "admin";
    const defaultPassword = "ilhamrhmddni";

    const [admin, created] = await db.User.findOrCreate({
      where: { username: defaultUsername },
      defaults: {
        username: defaultUsername,
        password: defaultPassword, // Store plain text password
        email: "ilhamrhmddni@gmail.com",
        role: "admin",
        fullname: "Administrator",
      },
    });

    if (created) {
      console.log("✅ Admin user created successfully.");
    } else {
      console.log("ℹ️ Admin user already exists.");
    }

    // Ensure Gudep and Geografis are created for the admin user
    const existingGudep = await db.Gudep.findOne({
      where: { user_id: admin.id },
    });
    if (!existingGudep) {
      console.log("🛠️ Creating Gudep and Geografis for admin user...");
      const gudep = await db.Gudep.create({
        user_id: admin.id,
        no_gudep: "ADMIN", // Set no_gudep to "ADMIN" for the admin user
      });
      await db.Geografis.create({ gudep_id: gudep.id });
      console.log("✅ Gudep and Geografis created for admin user.");
    }

    // Inject Gudep and Geografis for existing users (only once)
    const users = await db.User.findAll();
    for (const user of users) {
      if (user.username !== defaultUsername) {
        // Skip admin user
        const existingGudep = await db.Gudep.findOne({
          where: { user_id: user.id },
        });
        if (!existingGudep) {
          console.log(
            `🛠️ Injecting Gudep and Geografis for user ${user.username}...`
          );
          const gudep = await db.Gudep.create({ user_id: user.id });
          await db.Geografis.create({ gudep_id: gudep.id });
          console.log(
            `✅ Gudep and Geografis created for user ${user.username}`
          );
        }
      }
    }
  } catch (err) {
    console.error(
      "❌ Failed to synchronize database or inject default user:",
      err
    );
  }
})();

module.exports = db;
