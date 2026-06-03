const pool = require('../config/db');

// Run any raw SQL query, returns all matching rows
const query = async (sql, values) => {
  const result = await pool.query(sql, values);
  return result.rows;
};

// Get all rows from a table that match the given conditions
// where is an object like { col: value, col2: value2 }
const findMany = async (table, where = {}, { orderBy = '', limit = null } = {}) => {
  const keys = Object.keys(where);
  const values = Object.values(where);

  const whereClause = keys.length
    ? 'WHERE ' + keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ')
    : '';
  const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';
  const limitClause = limit ? `LIMIT ${Number(limit)}` : '';

  const sql = `SELECT * FROM "${table}" ${whereClause} ${orderClause} ${limitClause}`.trim();
  return query(sql, values);
};

// Get a single row (returns null if not found)
const findOne = async (table, where = {}) => {
  const rows = await findMany(table, where, { limit: 1 });
  return rows[0] || null;
};

// Insert a row into a table, returns the new row id
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const cols = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const result = await pool.query(
    `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING id`,
    values
  );
  return result.rows[0].id;
};

// Update rows in a table, returns number of rows changed
const update = async (table, data, where) => {
  const dataKeys = Object.keys(data);
  const whereKeys = Object.keys(where);

  const setClause   = dataKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
  const whereClause = whereKeys.map((k, i) => `"${k}" = $${dataKeys.length + i + 1}`).join(' AND ');
  const values = [...Object.values(data), ...Object.values(where)];

  const result = await pool.query(
    `UPDATE "${table}" SET ${setClause} WHERE ${whereClause}`,
    values
  );
  return result.rowCount;
};

module.exports = { query, findMany, findOne, insert, update };
