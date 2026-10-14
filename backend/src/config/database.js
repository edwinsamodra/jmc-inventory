import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'admin';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbName = process.env.DB_NAME || 'jmc_inventory';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mariadb',
  dialectOptions: {
    // MariaDB connection options for high performance & safe decimals
    connectTimeout: 10000,
    decimalNumbers: true,
    timezone: '+07:00'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[SQL] ${msg}`) : false,
  define: {
    timestamps: true,
    underscored: true, // snake_case in database columns (e.g. created_at, user_id)
    freezeTableName: true // use exact table name specified
  }
});

export const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MariaDB database connected successfully via Sequelize ORM.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MariaDB database:', error.message);
    return false;
  }
};

export default sequelize;
