import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

export const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ MSSQL Connected Successfully');
    return pool;
  } catch (err) {
    console.error('❌ MSSQL Connection Error:', err);
    process.exit(1);
  }
};

export const getPool = () => pool;
export const getDB = () => pool;
export { sql };