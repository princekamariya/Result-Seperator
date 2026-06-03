const { Pool } = require('pg');
require('dotenv').config();
const logger   = require('../utils/logger');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     Number(process.env.DB_PORT) || 5432,
  ssl:      process.env.DB_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(client => {
    logger.info('Database connected to ' + process.env.DB_NAME);
    client.release();
  })
  .catch(err => {
    logger.error('Database connection failed: ' + err.message);
    process.exit(1);
  });

module.exports = pool;
