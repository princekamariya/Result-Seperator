const pool = require('../config/db');

// Run any raw SQL query
const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// Get all rows matching conditions  { col: val, ... }
const findMany = async (table, where = {}, { orderBy = '', limit = null } = {}) => {
  const keys = Object.keys(where);
  const whereClause = keys.length
    ? 'WHERE ' + keys.map(k => `\`${k}\` = ?`).join(' AND ')
    : '';
  const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';
  const limitClause = limit   ? `LIMIT ${Number(limit)}`  : '';

  const sql = `SELECT * FROM \`${table}\` ${whereClause} ${orderClause} ${limitClause}`.trim();
  return query(sql, Object.values(where));
};

// Get single row
const findOne = async (table, where = {}) => {
  const rows = await findMany(table, where, { limit: 1 });
  return rows[0] || null;
};

// Insert a row — returns insertId
const insert = async (table, data) => {
  const cols   = Object.keys(data).map(k => `\`${k}\``).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const [res]  = await pool.execute(
    `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`,
    Object.values(data)
  );
  return res.insertId;
};

// Update rows — returns affectedRows
const update = async (table, data, where) => {
  const setClause   = Object.keys(data).map(k  => `\`${k}\` = ?`).join(', ');
  const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
  const params      = [...Object.values(data), ...Object.values(where)];
  const [res] = await pool.execute(
    `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`,
    params
  );
  return res.affectedRows;
};

module.exports = { query, findMany, findOne, insert, update };
