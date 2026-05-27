const { query } = require('../utils/db');

// GET /api/dropdowns/all — single call used by the form on page load
const getAll = async (_req, res) => {
  try {
    const [standards, boards, degrees] = await Promise.all([
      query('SELECT id, key_name, value, category FROM school_standards WHERE is_active = 1 ORDER BY sort_order'),
      query('SELECT id, key_name, value            FROM school_boards     WHERE is_active = 1 ORDER BY id'),
      query('SELECT id, key_name, value            FROM college_degrees   WHERE is_active = 1 ORDER BY sort_order'),
    ]);

    res.json({
      success: true,
      data: {
        standards: standards.map(r => ({ id: r.id, key: r.key_name, value: r.value, category: r.category })),
        boards:    boards.map(r    => ({ id: r.id, key: r.key_name, value: r.value })),
        degrees:   degrees.map(r   => ({ id: r.id, key: r.key_name, value: r.value })),
      },
    });
  } catch (err) {
    console.error('getAll:', err);
    res.status(500).json({ success: false, message: 'Failed to load dropdown data' });
  }
};

// GET /api/dropdowns/standards
const getStandards = async (_req, res) => {
  try {
    const rows = await query('SELECT id, key_name, value, category FROM school_standards WHERE is_active = 1 ORDER BY sort_order');
    res.json({ success: true, data: rows.map(r => ({ id: r.id, key: r.key_name, value: r.value, category: r.category })) });
  } catch (err) {
    console.error('getStandards:', err);
    res.status(500).json({ success: false, message: 'Failed to load standards' });
  }
};

// GET /api/dropdowns/boards
const getBoards = async (_req, res) => {
  try {
    const rows = await query('SELECT id, key_name, value FROM school_boards WHERE is_active = 1 ORDER BY id');
    res.json({ success: true, data: rows.map(r => ({ id: r.id, key: r.key_name, value: r.value })) });
  } catch (err) {
    console.error('getBoards:', err);
    res.status(500).json({ success: false, message: 'Failed to load boards' });
  }
};

// GET /api/dropdowns/degrees
const getDegrees = async (_req, res) => {
  try {
    const rows = await query('SELECT id, key_name, value FROM college_degrees WHERE is_active = 1 ORDER BY sort_order');
    res.json({ success: true, data: rows.map(r => ({ id: r.id, key: r.key_name, value: r.value })) });
  } catch (err) {
    console.error('getDegrees:', err);
    res.status(500).json({ success: false, message: 'Failed to load degrees' });
  }
};

module.exports = { getAll, getStandards, getBoards, getDegrees };
