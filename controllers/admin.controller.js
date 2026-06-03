const bcrypt          = require('bcrypt');
const jwt             = require('jsonwebtoken');
const { findOne, query, update } = require('../utils/db');
const { sendWhatsApp }           = require('../utils/whatsapp');
const logger                     = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await findOne('admin_users', { email });
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token });
  } catch (err) {
    logger.error('admin login: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const logout = (_req, res) => {
  res.json({ success: true, message: 'Logged out' });
};

module.exports = { login, logout };
