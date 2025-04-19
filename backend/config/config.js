require("dotenv").config();

module.exports = {
  databaseUrl: process.env.SUPABASE_API_URL,
  dialect: "postgres",
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false, // Supabase butuh ini
    },
  },
};
