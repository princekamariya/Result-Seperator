/**
 * config/db.js
 * MySQL connection pool using mysql2/promise
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER,
  password:         process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  port:             Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  timezone:         '+05:30',   // IST
});

// quick connectivity check at startup
pool.getConnection()
  .then(conn => {
    console.log('✅  MySQL connected →', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
