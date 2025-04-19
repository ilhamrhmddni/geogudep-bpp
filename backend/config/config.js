require("dotenv").config();

module.exports = {
  databaseUrl: process.env.DB_URL,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // penting untuk Supabase
    },
  },
};
