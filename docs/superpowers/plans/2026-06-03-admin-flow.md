# Admin Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JWT-based admin auth, a submissions listing API with filters, and approve/reject actions that send WhatsApp notifications via Twilio.

**Architecture:** Stateless JWT auth — login returns a 24h token, logout is client-side only. A single auth middleware guards all admin routes. WhatsApp send failures are non-fatal (logged, never bubble to HTTP response).

**Tech Stack:** Express 5, PostgreSQL (pg), bcrypt, jsonwebtoken, twilio, winston

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `db/schema.sql` | Append `admin_users` table DDL |
| Modify | `db/seed.js` | Append admin user seed with bcrypt hash |
| Create | `middleware/auth.middleware.js` | JWT verification, attaches `req.admin` |
| Create | `utils/whatsapp.js` | Twilio WhatsApp send helper |
| Create | `controllers/admin.controller.js` | login, logout, listSubmissions, approveSubmission, rejectSubmission |
| Create | `routes/admin.routes.js` | Mount all `/api/admin/*` routes |
| Modify | `server.js` | Register admin routes |
| Modify | `.env.example` | Add Twilio env var keys |

---

## Task 1: Install Twilio and update .env.example

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.example`
- Modify: `.env`

- [ ] **Step 1: Install twilio**

```bash
npm install twilio
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Add Twilio keys to `.env.example`**

Append to the end of `.env.example`:

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

- [ ] **Step 3: Add Twilio keys to `.env` (with real values)**

Append to `.env` with your actual Twilio credentials:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

> Note: `whatsapp:+14155238886` is the Twilio sandbox number. Replace with your approved sender once out of sandbox.

- [ ] **Step 4: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "chore: install twilio, add Twilio env vars to example"
```

---

## Task 2: Add admin_users table to schema

**Files:**
- Modify: `db/schema.sql`

- [ ] **Step 1: Append admin_users table to `db/schema.sql`**

Add at the end of the file:

```sql
-- ADMIN USERS

CREATE TABLE IF NOT EXISTS admin_users (
  id         SERIAL       PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 2: Run the DDL against your database**

```bash
psql -U <your_db_user> -d result_separator -c "
CREATE TABLE IF NOT EXISTS admin_users (
  id         SERIAL       PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);"
```

Expected output: `CREATE TABLE`

- [ ] **Step 3: Verify the table exists**

```bash
psql -U <your_db_user> -d result_separator -c "\d admin_users"
```

Expected: shows columns `id`, `email`, `password`, `is_active`, `created_at`.

- [ ] **Step 4: Commit**

```bash
git add db/schema.sql
git commit -m "feat: add admin_users table to schema"
```

---

## Task 3: Seed an admin user

**Files:**
- Modify: `db/seed.js`

- [ ] **Step 1: Append admin seed logic to `db/seed.js`**

In `db/seed.js`, import bcrypt at the top (after the existing `require` lines):

```js
const bcrypt = require('bcrypt');
```

Inside the `seed()` function, after the `console.log('Seeding complete')` line and before the `} catch` block, add:

```js
    console.log('Seeding admin_users');
    const adminEmail    = 'admin@resultseparator.com';
    const adminPassword = 'Admin@123';
    const hashedPw      = await bcrypt.hash(adminPassword, Number(process.env.SALT_ROUNDS) || 10);
    await client.query(
      `INSERT INTO admin_users (email, password, is_active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password`,
      [adminEmail, hashedPw]
    );
    console.log('Admin user seeded — email: ' + adminEmail + ', password: ' + adminPassword);
```

- [ ] **Step 2: Run the seed**

```bash
node db/seed.js
```

Expected output (last lines):
```
Seeding admin_users
Admin user seeded — email: admin@resultseparator.com, password: Admin@123
```

- [ ] **Step 3: Verify admin exists in DB**

```bash
psql -U <your_db_user> -d result_separator -c "SELECT id, email, is_active FROM admin_users;"
```

Expected: one row with `email = admin@resultseparator.com` and `is_active = t`.

- [ ] **Step 4: Commit**

```bash
git add db/seed.js
git commit -m "feat: seed default admin user"
```

---

## Task 4: Create JWT auth middleware

**Files:**
- Create: `middleware/auth.middleware.js`

- [ ] **Step 1: Create `middleware/auth.middleware.js`**

```js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { adminId: decoded.adminId, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

- [ ] **Step 2: Verify the file exists and has no syntax errors**

```bash
node -e "require('./middleware/auth.middleware')"
```

Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add middleware/auth.middleware.js
git commit -m "feat: add JWT auth middleware"
```

---

## Task 5: Create WhatsApp utility

**Files:**
- Create: `utils/whatsapp.js`

- [ ] **Step 1: Create `utils/whatsapp.js`**

```js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, message) => {
  const e164 = to.startsWith('+') ? to : `+91${to}`;
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   `whatsapp:${e164}`,
    body: message,
  });
};

module.exports = { sendWhatsApp };
```

> `to` is the student's `whatsapp_number` field (e.g. `"9876543210"`). The helper prefixes `+91` for Indian numbers that don't already include a country code.

- [ ] **Step 2: Verify no syntax errors**

```bash
node -e "require('./utils/whatsapp')"
```

Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add utils/whatsapp.js
git commit -m "feat: add Twilio WhatsApp send utility"
```

---

## Task 6: Create admin controller — login and logout

**Files:**
- Create: `controllers/admin.controller.js`

- [ ] **Step 1: Create `controllers/admin.controller.js` with login and logout**

```js
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
```

- [ ] **Step 2: Verify no syntax errors**

```bash
node -e "require('./controllers/admin.controller')"
```

Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add controllers/admin.controller.js
git commit -m "feat: admin login and logout"
```

---

## Task 7: Add listSubmissions to admin controller

**Files:**
- Modify: `controllers/admin.controller.js`

- [ ] **Step 1: Add `listSubmissions` function**

In `controllers/admin.controller.js`, add this function before the `module.exports` line:

```js
const listSubmissions = async (req, res) => {
  try {
    const { status, student_type, standard, year } = req.query;

    const conditions = [];
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
    const data  = await query(sql, values);

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    logger.error('listSubmissions: ' + err.message);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
```

- [ ] **Step 2: Update `module.exports`**

Replace the current `module.exports` line with:

```js
module.exports = { login, logout, listSubmissions };
```

- [ ] **Step 3: Verify no syntax errors**

```bash
node -e "require('./controllers/admin.controller')"
```

Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add controllers/admin.controller.js
git commit -m "feat: admin list submissions with filters"
```

---

## Task 8: Add approveSubmission and rejectSubmission to admin controller

**Files:**
- Modify: `controllers/admin.controller.js`

- [ ] **Step 1: Add `approveSubmission` function**

In `controllers/admin.controller.js`, add before `module.exports`:

```js
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
```

- [ ] **Step 2: Add `rejectSubmission` function**

Directly after `approveSubmission` and before `module.exports`, add:

```js
const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await findOne('student_submissions', { id: Number(id) });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.submission_status !== 'pending') {
      return res.status(409).json({ success: false, message: 'Submission already processed' });
    }

    await update('student_submissions', { submission_status: 'rejected' }, { id: Number(id) });

    try {
      await sendWhatsApp(
        submission.whatsapp_number,
        `Dear ${submission.first_name} ${submission.last_name}, unfortunately your result submission was not approved`
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
```

- [ ] **Step 3: Update `module.exports`**

```js
module.exports = { login, logout, listSubmissions, approveSubmission, rejectSubmission };
```

- [ ] **Step 4: Verify no syntax errors**

```bash
node -e "require('./controllers/admin.controller')"
```

Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add controllers/admin.controller.js
git commit -m "feat: admin approve and reject submission with WhatsApp notification"
```

---

## Task 9: Create admin routes and wire into server

**Files:**
- Create: `routes/admin.routes.js`
- Modify: `server.js`

- [ ] **Step 1: Create `routes/admin.routes.js`**

```js
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth.middleware');
const {
  login,
  logout,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
} = require('../controllers/admin.controller');

router.post('/login',  login);
router.post('/logout', auth, logout);

router.get('/submissions',              auth, listSubmissions);
router.patch('/submissions/:id/approve', auth, approveSubmission);
router.patch('/submissions/:id/reject',  auth, rejectSubmission);

module.exports = router;
```

- [ ] **Step 2: Register admin routes in `server.js`**

In `server.js`, add this require near the top with the other route requires:

```js
const adminRoutes      = require("./routes/admin.routes");
```

Then add this line with the other `app.use` route registrations:

```js
app.use("/api/admin", adminRoutes);
```

- [ ] **Step 3: Start the server and verify it boots cleanly**

```bash
node server.js
```

Expected output:
```
info: Server running on port 3000
```

No crash, no unhandled errors. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add routes/admin.routes.js server.js
git commit -m "feat: wire admin routes into server"
```

---

## Task 10: End-to-end API verification

Start the server: `node server.js`

- [ ] **Step 1: Test login with wrong password — expect 401**

```bash
curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resultseparator.com","password":"wrong"}' | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)))"
```

Expected: `{ success: false, message: 'Invalid credentials' }`

- [ ] **Step 2: Test login with correct credentials — save token**

```bash
curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resultseparator.com","password":"Admin@123"}'
```

Expected: `{ "success": true, "token": "eyJ..." }` — copy the token value.

- [ ] **Step 3: Test protected route without token — expect 401**

```bash
curl -s http://localhost:3000/api/admin/submissions
```

Expected: `{ "success": false, "message": "Authentication required" }`

- [ ] **Step 4: Test list submissions with token — expect 200**

Replace `<TOKEN>` with the token from Step 2:

```bash
curl -s http://localhost:3000/api/admin/submissions \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `{ "success": true, "count": N, "data": [...] }`

- [ ] **Step 5: Test filters**

```bash
curl -s "http://localhost:3000/api/admin/submissions?status=pending" \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: only `submission_status = pending` rows returned.

```bash
curl -s "http://localhost:3000/api/admin/submissions?student_type=school&standard=10" \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: only school students in 10th standard.

- [ ] **Step 6: Test approve on a pending submission**

Replace `<ID>` with an actual pending submission id from Step 4:

```bash
curl -s -X PATCH http://localhost:3000/api/admin/submissions/<ID>/approve \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `{ "success": true, "message": "Submission approved" }`  
Check DB: `SELECT submission_status FROM student_submissions WHERE id = <ID>;` → should be `verified`.  
Check server logs: WhatsApp send logged (success or non-fatal error).

- [ ] **Step 7: Test approve same submission again — expect 409**

```bash
curl -s -X PATCH http://localhost:3000/api/admin/submissions/<ID>/approve \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `{ "success": false, "message": "Submission already processed" }`

- [ ] **Step 8: Test reject on a different pending submission**

Replace `<ID2>` with another pending submission id:

```bash
curl -s -X PATCH http://localhost:3000/api/admin/submissions/<ID2>/reject \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `{ "success": true, "message": "Submission rejected" }`

- [ ] **Step 9: Test logout**

```bash
curl -s -X POST http://localhost:3000/api/admin/logout \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `{ "success": true, "message": "Logged out" }`

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: admin flow complete — auth, listing, approve/reject, WhatsApp"
```
