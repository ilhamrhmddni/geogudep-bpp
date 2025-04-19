require("dotenv").config();

module.exports = {
  databaseUrl: process.env.DB_URL,
  dialect: "postgres",
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      require: false, // tidak perlu untuk localhost
      rejectUnauthorized: false, // penting untuk Supabase
    },
  },
};
