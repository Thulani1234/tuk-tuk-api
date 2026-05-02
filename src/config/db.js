import sql from 'mssql';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  server:   'localhost',
  port:     1433,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
  },
  pool: {
    max:               10,
    min:               0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

export const getPool = async () => {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    } catch (err) {
      pool = null;
      throw err;
    }
  }
  return pool;
};

export { sql };