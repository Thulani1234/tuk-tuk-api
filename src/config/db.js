import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env'), override: true });

const config = {
  host: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' || 
       (process.env.DB_SERVER && (process.env.DB_SERVER.includes('.neon.tech') || process.env.DB_SERVER.includes('.supabase.com'))) 
       ? { rejectUnauthorized: false } 
       : false,
  max: 10,
  idleTimeoutMillis: 30000,
};

let pool = null;

export const getPool = async () => {
  if (!pool) {
    try {
      pool = new Pool(config);
      // Test the connection
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL Database');
    } catch (err) {
      pool = null;
      throw err;
    }
  }
  return pool;
};

export const sql = {}; // Exporting an empty object to satisfy any lingering imports of 'sql' from the old mssql setup