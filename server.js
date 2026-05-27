/**
 * server.js — Entry point
 * Node Result Separator API
 */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const dropdownRoutes   = require('./routes/dropdown.routes');
const submissionRoutes = require('./routes/submission.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the student form from public/
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/dropdowns',   dropdownRoutes);
app.use('/api/submissions', submissionRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running → http://localhost:${PORT}`);
  console.log(`📋  Form          → http://localhost:${PORT}/`);
  console.log(`🔌  API base      → http://localhost:${PORT}/api\n`);
});
