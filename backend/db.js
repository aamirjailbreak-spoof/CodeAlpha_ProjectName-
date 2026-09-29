const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'codealpha_ecommerce',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

module.exports = pool;
