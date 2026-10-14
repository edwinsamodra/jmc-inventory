import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'jmc_user',
  password: process.env.DB_PASSWORD || 'jmc_password',
  database: process.env.DB_NAME || 'jmc_inventory',
  connectionLimit: 5
});

export default pool;
