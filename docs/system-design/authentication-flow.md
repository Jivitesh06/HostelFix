# Authentication Flow

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

HostelFix uses **JWT (JSON Web Token) based stateless authentication**. The backend generates a signed token upon successful login. The frontend stores and attaches this token to all subsequent API requests. The backend validates the token and identifies the user's role on every protected request.

**Authentication** answers: *Who are you?*
**Authorization** answers: *What are you allowed to do?*

Both are enforced on the backend independently of the frontend.

---

## Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       Login Flow                             │
└──────────────────────────────────────────────────────────────┘

User
 │
 ▼
Login Form (React)
 │  { email, password }
 ▼
POST /api/auth/login
 │
 ▼
Backend receives request
 │
 ▼
Look up User by email
 │  ← User not found? → 401 Unauthorized
 ▼
Compare password with stored bcrypt hash
 │  ← Hash mismatch? → 401 Unauthorized
 ▼
Generate JWT
 │  Payload: { userId, role }
 │  Signed with SECRET_KEY
 │  Expiry: configurable (e.g. 7 days)
 ▼
Return JWT + user info to frontend
 │  { success: true, data: { token, user: { id, name, role } } }
 ▼
Frontend stores token (memory / localStorage)
 │
 ▼
Role check on frontend
 │
 ├── STUDENT → redirect to /student/dashboard
 ├── WARDEN  → redirect to /warden/dashboard
 └── STAFF   → redirect to /staff/dashboard
```

---

## Protected Request Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│              Authenticated Request Flow                      │
└──────────────────────────────────────────────────────────────┘

Frontend (React)
 │
 ▼
User performs protected action
 │  e.g., "Submit Complaint"
 ▼
Axios attaches JWT to request header
 │  Authorization: Bearer <token>
 ▼
Express Route receives request
 │
 ▼
verifyToken Middleware
 │  Extracts token from Authorization header
 │  Verifies signature using SECRET_KEY
 │  ← Missing / expired / invalid? → 401 Unauthorized
 │  Decodes { userId, role } from token
 │  Attaches decoded data to req.user
 ▼
requireRole Middleware
 │  Checks req.user.role against allowed roles for this route
 │  ← Role not permitted? → 403 Forbidden
 ▼
Controller
 │  Executes business logic
 │  Can access req.user.userId and req.user.role
 ▼
Prisma → PostgreSQL
 ▼
Response returned to frontend
```

---

## Registration Flow

```
Student
 │
 ▼
Register Form (React)
 │  { name, email, password, roomNumber, hostelBlock }
 ▼
POST /api/auth/register
 │
 ▼
Validate all required fields
 │  ← Missing fields? → 400 Bad Request
 ▼
Check if email already exists
 │  ← Email taken? → 409 Conflict
 ▼
Hash password using bcrypt
 │
 ▼
Create User record in database
 │  role = STUDENT
 ▼
Return success response
 │  { success: true, data: { id, name, email, role } }
 ▼
Redirect to login page
```

---

## JWT Token Design

### Token Payload

```json
{
  "userId": "cuid-string",
  "role": "STUDENT",
  "iat": 1724553600,
  "exp": 1725158400
}
```

| Field | Description |
|---|---|
| `userId` | The unique ID of the authenticated user |
| `role` | The user's role: STUDENT, WARDEN, or STAFF |
| `iat` | Issued-at timestamp (set automatically by JWT library) |
| `exp` | Expiry timestamp |

### Token Rules

- The token is signed with a server-side secret key stored in environment variables.
- The token is never stored in the database.
- Token expiry is enforced by the `verifyToken` middleware.
- A new token must be obtained by logging in again after expiry.
- The frontend is responsible for clearing stored tokens on logout.

---

## Middleware Design

### `verifyToken` Middleware

```
Purpose   : Validate JWT and attach user identity to the request
Applied to: All protected routes
Behavior  :
  - Reads Authorization header
  - Extracts token from "Bearer <token>" format
  - Verifies signature and expiry
  - On success: attaches { userId, role } to req.user
  - On failure: returns 401 Unauthorized
```

### `requireRole(...roles)` Middleware

```
Purpose   : Enforce role-based access on a specific route
Applied to: Routes that are restricted to specific roles
Behavior  :
  - Reads req.user.role (set by verifyToken)
  - Checks if role is in the allowed roles list
  - On success: passes to next handler
  - On failure: returns 403 Forbidden
```

### Middleware Usage Examples

```
// Route accessible only to Students
router.post('/complaints', verifyToken, requireRole('STUDENT'), createComplaint)

// Route accessible only to Wardens
router.patch('/complaints/:id/approve', verifyToken, requireRole('WARDEN'), approveComplaint)

// Route accessible only to Staff
router.patch('/complaints/:id/status', verifyToken, requireRole('STAFF'), updateComplaintStatus)

// Route accessible to all authenticated users
router.get('/api/auth/me', verifyToken, getProfile)
```

---

## GET /api/auth/me

This endpoint allows the frontend to re-verify the current user's identity and role on page load (e.g., after a browser refresh).

```
Request:
  GET /api/auth/me
  Authorization: Bearer <token>

Response (200 OK):
  {
    "success": true,
    "data": {
      "id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@college.edu",
      "role": "STUDENT",
      "roomNumber": "A-204",
      "hostelBlock": "Block A"
    }
  }
```

---

## Security Notes

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt hashing with a cost factor ≥ 10 |
| Token forgery | HMAC-SHA256 signed JWT with server-side secret |
| Role tampering | Role is read from the server-side JWT payload, not from client input |
| Unauthorized access | Both `verifyToken` and `requireRole` applied to every protected route |
| Token exposure | Token should not be logged or included in error responses |
