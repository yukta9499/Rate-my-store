// server/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon connection string
  ssl: { rejectUnauthorized: false },
});

export default pool;
