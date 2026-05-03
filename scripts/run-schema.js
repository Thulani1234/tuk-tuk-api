import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import * as dotenv from 'dotenv';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const config = {
  host: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' || 
       (process.env.DB_SERVER && (process.env.DB_SERVER.includes('.neon.tech') || process.env.DB_SERVER.includes('.supabase.com'))) 
       ? { rejectUnauthorized: false } 
       : false
};

async function runSchema() {
  const pool = new Pool(config);
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Connecting to database to run schema...');
    await pool.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err.message);
  } finally {
    await pool.end();
  }
}

runSchema();
