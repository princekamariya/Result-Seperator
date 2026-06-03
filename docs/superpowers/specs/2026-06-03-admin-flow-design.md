# Admin Flow Design

**Date:** 2026-06-03  
**Project:** Result Separator  

---

## Overview

Add an admin flow that allows admins (seeded directly in DB) to log in, view all student submissions, and approve or reject them. On approval or rejection a WhatsApp message is sent to the student via Twilio.

---

## Database

### New table: `admin_users`

```sql
CREATE TABLE admin_users (
  id           SERIAL PRIMARY KEY,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,  -- bcrypt hashed
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- No signup API. Admins are created manually via `db/seed.js`.
- Login checks `is_active = true` before granting access.

---

## Authentication

- **Strategy:** Stateless JWT (Approach A)
- **Token payload:** `{ adminId, email }`
- **Token expiry:** `24h`
- **Header:** `Authorization: Bearer <token>`
- **Logout:** Server returns `200`; client is responsible for discarding the token.

---

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Authenticate admin, returns JWT |
| POST | `/api/admin/logout` | Stateless logout (returns 200) |

#### POST `/api/admin/login`
**Request body:**
```json
{ "email": "admin@example.com", "password": "secret" }
```
**Response (200):**
```json
{ "success": true, "token": "<jwt>" }
```
**Errors:** 401 if email not found, inactive, or wrong password.

#### POST `/api/admin/logout`
No body. Returns `{ "success": true, "message": "Logged out" }`.

---

### Protected (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/submissions` | List all submissions with optional filters |
| PATCH | `/api/admin/submissions/:id/approve` | Approve a submission, send WhatsApp |
| PATCH | `/api/admin/submissions/:id/reject` | Reject a submission, send WhatsApp |

#### GET `/api/admin/submissions`

**Query params (all optional):**

| Param | Values | Default |
|-------|--------|---------|
| `status` | `pending` \| `verified` \| `rejected` | all |
| `student_type` | `school` \| `college` | all |
| `standard` | any `key_name` from `school_standards` or `college_degrees` — filters `school_standard_id` when `student_type=school`, `college_degree_id` when `student_type=college`, or both when `student_type` is not passed | all |
| `year` | e.g. `2024` | all |

**Response (200):**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "id": 1,
      "first_name": "...",
      "last_name": "...",
      "whatsapp_number": "...",
      "student_type": "school",
      "submission_status": "pending",
      "result_image_url": "https://...",
      "result_year": 2024,
      "percentage": 87.5,
      "submitted_at": "2024-01-01T00:00:00Z",
      ...all other student fields
    }
  ]
}
```

Ordered by `submitted_at DESC`.

#### PATCH `/api/admin/submissions/:id/approve`

No request body.  
- Sets `submission_status = 'verified'`
- Sends WhatsApp: `"Congratulations [first_name] [last_name]! Your result has been verified"`
- Returns `{ "success": true, "message": "Submission approved" }`
- 404 if submission not found. 409 if already approved/rejected.

#### PATCH `/api/admin/submissions/:id/reject`

No request body.  
- Sets `submission_status = 'rejected'`
- Sends WhatsApp: `"Dear [first_name] [last_name], unfortunately your result submission was not approved"`
- Returns `{ "success": true, "message": "Submission rejected" }`
- 404 if submission not found. 409 if already approved/rejected.

---

## Middleware

### `middleware/auth.middleware.js`

- Reads `Authorization: Bearer <token>` header
- Verifies JWT using `JWT_SECRET`
- Attaches `req.admin = { adminId, email }` on success
- Returns `401` if token missing or invalid, `403` if expired

---

## WhatsApp (Twilio)

### `utils/whatsapp.js`

Thin wrapper around Twilio's `messages.create`:

```js
sendWhatsApp(to, message)
// to: student's whatsapp_number (e.g. "9876543210")
// Prefixes "whatsapp:+91" before sending to Twilio
```

**Required env vars:**
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

WhatsApp send failure is **non-fatal** — the approve/reject DB update is committed regardless, and the error is logged via winston.

---

## File Structure

```
controllers/
  admin.controller.js        — login, logout, listSubmissions, approveSubmission, rejectSubmission

routes/
  admin.routes.js            — mounts all /api/admin/* routes

middleware/
  auth.middleware.js         — JWT verification middleware

utils/
  whatsapp.js                — Twilio WhatsApp send helper

db/
  schema.sql                 — append admin_users table
  seed.js                    — add admin seed with bcrypt-hashed password

server.js                    — add: app.use("/api/admin", adminRoutes)

.env.example                 — add Twilio keys
```

---

## New Dependency

```
twilio
```

---

## Error Handling

| Scenario | HTTP Status |
|----------|-------------|
| Invalid credentials / inactive admin | 401 |
| JWT missing or invalid | 401 |
| JWT expired | 403 |
| Submission not found | 404 |
| Submission already approved or rejected | 409 |
| WhatsApp send failure | Logged, does not affect response |
| Unexpected server error | 500 |
