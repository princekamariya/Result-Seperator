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

const listSubmissions = async (req, res) => {
  try {
    const { status, student_type, standard, year } = req.query;

    const conditions = ['is_active = true'];
    const values     = [];
    let   idx        = 1;

    if (status) {
      conditions.push(`submission_status = $${idx++}`);
      values.push(status);
    }
    if (student_type) {
      conditions.push(`student_type = $${idx++}`);
      values.push(student_type);
    }
    if (standard) {
      if (student_type === 'school') {
        conditions.push(`school_standard_id = $${idx++}`);
        values.push(standard);
      } else if (student_type === 'college') {
        conditions.push(`college_degree_id = $${idx++}`);
        values.push(standard);
      } else {
        conditions.push(`(school_standard_id = $${idx} OR college_degree_id = $${idx})`);
        values.push(standard);
        idx++;
      }
    }
    if (year) {
      conditions.push(`result_year = $${idx++}`);
      values.push(Number(year));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql   = `SELECT * FROM student_submissions ${where} ORDER BY submitted_at DESC`;
    const rows  = await query(sql, values);

    const data = rows.map(row => ({
      ...row,
      // Always return an array. New submissions have result_image_urls stored.
      // Old submissions fall back to single-element array.
      result_image_urls: row.result_image_urls ?? [row.result_image_url],
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    logger.error('listSubmissions: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await findOne('student_submissions', { id: Number(id) });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.submission_status !== 'pending') {
      return res.status(409).json({ success: false, message: 'Submission already processed' });
    }

    await update('student_submissions', { submission_status: 'verified' }, { id: Number(id) });

    try {
      await sendWhatsApp(
        submission.whatsapp_number,
        `Congratulations ${submission.first_name} ${submission.last_name}! Your result has been verified`
      );
    } catch (waErr) {
      logger.error('WhatsApp send failed (approve #' + id + '): ' + waErr.message);
    }

    res.json({ success: true, message: 'Submission approved' });
  } catch (err) {
    logger.error('approveSubmission: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body || {};

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const submission = await findOne('student_submissions', { id: Number(id) });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.submission_status !== 'pending') {
      return res.status(409).json({ success: false, message: 'Submission already processed' });
    }

    await update(
      'student_submissions',
      { submission_status: 'rejected', rejection_reason: rejection_reason.trim() },
      { id: Number(id) }
    );

    try {
      await sendWhatsApp(
        submission.whatsapp_number,
        `Dear ${submission.first_name} ${submission.last_name}, your result submission was not approved.\n\nReason: ${rejection_reason.trim()}`
      );
    } catch (waErr) {
      logger.error('WhatsApp send failed (reject #' + id + '): ' + waErr.message);
    }

    res.json({ success: true, message: 'Submission rejected' });
  } catch (err) {
    logger.error('rejectSubmission: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await findOne('student_submissions', { id: Number(id) });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (!submission.is_active) {
      return res.status(409).json({ success: false, message: 'Submission already deleted' });
    }

    await update('student_submissions', { is_active: false }, { id: Number(id) });

    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    logger.error('deleteSubmission: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { login, logout, listSubmissions, approveSubmission, rejectSubmission, deleteSubmission };
