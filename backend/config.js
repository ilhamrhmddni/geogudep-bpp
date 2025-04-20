require("dotenv").config();

module.exports = {
  databaseUrl: process.env.SUPABASE_API_URL, // Tambahkan databaseUrl
  username: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DATABASE,
  host: process.env.SUPABASE_HOST,
  port: process.env.SUPABASE_PORT,
  dialect: process.env.SUPABASE_DIALECT,
  dialectModule: require("pg"),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false, // Nonaktifkan logging untuk Sequelize
};
