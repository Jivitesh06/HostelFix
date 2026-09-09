# System Design — Phase 2

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Document Purpose

This document is the Phase 2 master overview for HostelFix. It summarizes all system design decisions and serves as the entry point for evaluators and the Phase 3 implementation team.

Full detail for each section is in the individual documents under `docs/system-design/`.

---

## 1. System Architecture

HostelFix uses a three-tier client-server architecture:

```
Student / Warden / Staff (Browser)
              ↓  HTTPS
        React Frontend
              ↓  REST API (JSON + JWT)
      Express.js Backend
              ↓  Prisma Client
          Prisma ORM
              ↓  TCP
         PostgreSQL
```

> **The React frontend must never connect directly to the database. All data access flows through the Express REST API.**

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + React Router + Axios | UI, routing, role-based pages, API calls |
| Backend | Node.js + Express.js | REST API, JWT auth, business logic, workflow enforcement |
| ORM | Prisma | Type-safe queries, relationships, transactions |
| Database | PostgreSQL | Persistent storage, constraints, indexes |

> 📄 [`docs/system-design/architecture.md`](./system-design/architecture.md)

---

## 2. Module Architecture

### Backend Modules

| Module | Route Prefix | Owner |
|---|---|---|
| Authentication | `/api/auth` | Member 2 |
| Complaint Management | `/api/complaints` | Member 1 + Member 2 |
| Mess Management | `/api/mess` | Member 4 |

### Frontend Modules

| Module | Routes | Owner |
|---|---|---|
| Auth Pages | `/login`, `/register` | Member 2 |
| Student Module | `/student/*` | Member 3 |
| Warden Module | `/warden/*` | Member 1 |
| Staff Module | `/staff/*` | Member 1 |
| Mess UI | `/student/mess`, `/warden/mess` | Member 4 |

> 📄 [`docs/system-design/module-design.md`](./system-design/module-design.md)

---

## 3. Role-Permission Matrix

| Feature | Student | Warden | Staff |
|---|---|---|---|
| Register | ✅ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ |
| Create Complaint | ✅ | ❌ | ❌ |
| View Own Complaints | ✅ | ❌ | ❌ |
| View All Complaints | ❌ | ✅ | ❌ |
| Approve / Reject Complaint | ❌ | ✅ | ❌ |
| Assign Staff | ❌ | ✅ | ❌ |
| View Assigned Complaints | ❌ | ❌ | ✅ |
| Update Assigned Complaint Status | ❌ | ❌ | ✅ |
| Close Complaint | ❌ | ✅ | ❌ |
| View Mess Menu | ✅ | ✅ | ✅ |
| Manage Mess Menu | ❌ | ✅ | ❌ |
| Submit Mess Feedback | ✅ | ❌ | ❌ |
| View Feedback Summary | ❌ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |

> All permissions are enforced on the **backend** via `verifyToken` + `requireRole` middleware. Frontend role-hiding is for usability only.

> 📄 [`docs/system-design/role-permissions.md`](./system-design/role-permissions.md)

---

## 4. Complaint State Machine

### States & Transitions

```
[PENDING] ──→ [REJECTED]  ← terminal (Warden)
    │
    ↓ (Warden)
[APPROVED]
    │
    ↓ (Warden)
[ASSIGNED]
    │
    ↓ (Staff)
[IN_PROGRESS]
    │
    ↓ (Staff)
[RESOLVED]
    │
    ↓ (Warden)
[CLOSED]  ← terminal
```

### Transition Actors

| Transition | Actor |
|---|---|
| PENDING → APPROVED | Warden |
| PENDING → REJECTED | Warden (rejection reason required) |
| APPROVED → ASSIGNED | Warden (selects staff member) |
| ASSIGNED → IN_PROGRESS | Assigned Staff |
| IN_PROGRESS → RESOLVED | Assigned Staff |
| RESOLVED → CLOSED | Warden |

> **Invalid transitions must be rejected by the backend with HTTP 400.**

> 📄 [`docs/system-design/complaint-workflow.md`](./system-design/complaint-workflow.md)

---

## 5. Database Design

### Entities

| Entity | Key Fields |
|---|---|
| `User` | id, name, email (unique), passwordHash, role, roomNumber, hostelBlock, staffCategory |
| `Complaint` | id, studentId (FK), category, description, imageUrl, status, assignedStaffId (FK), rejectionReason (nullable), deadlineAt, createdAt, updatedAt |
| `StatusLog` | id, complaintId (FK), oldStatus, newStatus, changedById (FK), note, timestamp |
| `MessMenu` | id, dayOfWeek, mealType, items, weekOf |
| `MenuFeedback` | id, messMenuId (FK), studentId (FK), rating (1–5), comment, createdAt |

### Enums

| Enum | Values |
|---|---|
| `Role` | STUDENT, WARDEN, STAFF |
| `ComplaintStatus` | PENDING, APPROVED, REJECTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED |
| `ComplaintCategory` | ELECTRICAL, PLUMBING, CLEANING, FURNITURE, INTERNET, OTHER |
| `MealType` | BREAKFAST, LUNCH, DINNER |

### Key Constraints

- `User.email` is unique
- `Complaint.studentId` → valid User (STUDENT)
- `Complaint.assignedStaffId` → valid User (STAFF), nullable
- `Complaint.rejectionReason` → nullable; required only when `status = REJECTED`
- `MenuFeedback.rating` → 1 ≤ rating ≤ 5
- `StatusLog` entries are immutable

> 📄 [`docs/system-design/database-design.md`](./system-design/database-design.md)

---

## 6. Entity-Relationship Overview

```
User (STUDENT) ──────────< Complaint (via studentId)
User (STAFF)   ──────────< Complaint (via assignedStaffId)
Complaint      ──────────< StatusLog (via complaintId)
User (any)     ──────────< StatusLog (via changedById)
MessMenu       ──────────< MenuFeedback (via messMenuId)
User (STUDENT) ──────────< MenuFeedback (via studentId)
```

The `User` table uses a single-table design with role-specific optional fields (`roomNumber`/`hostelBlock` for Students, `staffCategory` for Staff).

> 📄 [`docs/system-design/er-diagram.md`](./system-design/er-diagram.md)

---

## 7. API Design Summary

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | All roles |

### Complaints

| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/complaints` | Student |
| GET | `/api/complaints` | Student / Warden |
| GET | `/api/complaints/:id` | Student / Warden / Staff |
| PATCH | `/api/complaints/:id/approve` | Warden |
| PATCH | `/api/complaints/:id/reject` | Warden |
| PATCH | `/api/complaints/:id/assign` | Warden |
| PATCH | `/api/complaints/:id/status` | Staff |
| PATCH | `/api/complaints/:id/close` | Warden |

### Mess

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/mess` | All |
| POST | `/api/mess` | Warden |
| PUT | `/api/mess/:id` | Warden |
| DELETE | `/api/mess/:id` | Warden |
| POST | `/api/mess/:id/feedback` | Student |
| GET | `/api/mess/feedback` | Warden |

### Future (Not Phase 3)

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/analytics/summary` | Warden |

> 📄 [`docs/system-design/api-design.md`](./system-design/api-design.md)

---

## 8. Authentication Flow

```
Login Form → POST /api/auth/login
          → Backend verifies email + bcrypt password
          → JWT generated { userId, role }
          → Token returned to frontend
          → Frontend stores token
          → All subsequent requests: Authorization: Bearer <token>
          → verifyToken middleware validates token
          → requireRole middleware checks permission
          → Controller executes
```

> 📄 [`docs/system-design/authentication-flow.md`](./system-design/authentication-flow.md)

---

## 9. Frontend Architecture

### Routes

| Prefix | Role | Pages |
|---|---|---|
| `/login`, `/register` | Public | Login, Register |
| `/student/*` | STUDENT | Dashboard, My Complaints, New Complaint, Complaint Detail, Mess |
| `/warden/*` | WARDEN | Dashboard, All Complaints, Complaint Detail, Mess Management |
| `/staff/*` | STAFF | Dashboard, Complaint Detail |

### Key Reusable Components

`Navbar` · `Sidebar` · `DashboardCard` · `StatusBadge` · `ComplaintCard` · `ComplaintTable` · `ComplaintTimeline` · `ProtectedRoute` · `RoleRoute` · `MessMenu` · `FeedbackForm` · `Modal` · `LoadingState` · `ErrorMessage`

> 📄 [`docs/system-design/frontend-design.md`](./system-design/frontend-design.md)

---

## 10. Error Handling

All API responses use a consistent envelope:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "Plain-language error" }
```

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation, invalid transition) |
| 401 | Unauthorized (missing/expired token) |
| 403 | Forbidden (wrong role or ownership) |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 500 | Internal Server Error |

> 📄 [`docs/system-design/error-handling.md`](./system-design/error-handling.md)

---

## 11. Team Module Ownership

| Member | Owns | Delivers |
|---|---|---|
| Member 1 | Warden Module + Complaint Workflow | Warden dashboard, approve/reject/assign/close UI, complaint lifecycle UI |
| Member 2 | Backend + Auth + Database | Auth APIs, complaint APIs, Prisma schema, JWT middleware, role guards |
| Member 3 | Student Module | Student dashboard, complaint creation UI, my complaints, timeline UI |
| Member 4 | Mess + Documentation | Mess menu UI, feedback UI, mess API integration, documentation |

The modular architecture allows each member to work independently on their area and integrate through the shared REST API.

---

## 12. Documentation Structure

```
docs/
├── system-design.md                   ← This file (Phase 2 master overview)
└── system-design/
    ├── architecture.md                ← System architecture + tech stack
    ├── module-design.md               ← Backend + frontend module breakdown
    ├── role-permissions.md            ← Role-permission matrix + enforcement rules
    ├── database-design.md             ← All entities, enums, constraints, indexes
    ├── er-diagram.md                  ← ER diagram (Mermaid + ASCII) + relationships
    ├── api-design.md                  ← Full API spec with request/response examples
    ├── authentication-flow.md         ← JWT auth flow + middleware design
    ├── complaint-workflow.md          ← State machine + all complaint flows
    ├── frontend-design.md             ← Page architecture + component design
    └── error-handling.md              ← Error codes + standard response format
```

---

## 13. Phase 1 Consistency Check

| Phase 1 Requirement | Phase 2 Design Coverage |
|---|---|
| FR-01 — Student registration (roomNumber, hostelBlock) | `User` entity includes `roomNumber` and `hostelBlock`; POST /api/auth/register accepts these fields |
| FR-02 — Login for all roles | POST /api/auth/login; JWT returned with role |
| FR-03 — Role identification | JWT payload includes `role`; `requireRole` middleware enforces it |
| FR-04 — Role-based access enforcement | `verifyToken` + `requireRole` on every protected route |
| FR-05/06 — Complaint creation with fixed category enum | POST /api/complaints; `ComplaintCategory` enum defined |
| FR-07 — Optional image attachment | `imageUrl` nullable field on `Complaint` |
| FR-08 — Student views own complaints | GET /api/complaints scoped to studentId for STUDENT role |
| FR-09 — Warden views all complaints | GET /api/complaints returns all for WARDEN role |
| FR-10 — Approve/reject; rejectionReason | PATCH /approve and /reject endpoints; `rejectionReason` nullable field on `Complaint` |
| FR-11 — Assign complaint to staff | PATCH /assign; `assignedStaffId` on `Complaint` |
| FR-12 — Staff views assigned complaints | GET /api/complaints scoped to assignedStaffId for STAFF role |
| FR-13 — Staff updates status | PATCH /status endpoint; validates ASSIGNED→IN_PROGRESS or IN_PROGRESS→RESOLVED |
| FR-14 — Warden closes resolved complaint | PATCH /close endpoint; validates RESOLVED→CLOSED |
| FR-15 — Complaint status history | `StatusLog` entity; created on every transition |
| FR-16 — Warden manages mess menu | POST/PUT/DELETE /api/mess endpoints |
| FR-17 — Student views mess menu | GET /api/mess; accessible to all authenticated roles |
| FR-18 — Student submits mess feedback | POST /api/mess/:id/feedback; `MenuFeedback` entity |
| FR-19 — Warden views feedback summary | GET /api/mess/feedback; WARDEN role only |
| FR-20/21/22 — Role dashboards | Frontend routes: /student/dashboard, /warden/dashboard, /staff/dashboard |

**All 22 functional requirements from Phase 1 have corresponding design coverage in Phase 2.**

---

## 14. Phase 2 Evaluation Checklist

| Item | Status |
|---|---|
| System architecture | ✅ Complete |
| Architecture diagram | ✅ Complete |
| Module architecture | ✅ Complete |
| Role-permission matrix | ✅ Complete |
| Complaint state machine | ✅ Complete |
| ER design | ✅ Complete |
| Database entities defined | ✅ Complete |
| Relationships defined | ✅ Complete |
| Enums defined | ✅ Complete |
| Database constraints documented | ✅ Complete |
| Database indexes documented | ✅ Complete |
| API architecture documented | ✅ Complete |
| API request/response design documented | ✅ Complete |
| Authentication flow documented | ✅ Complete |
| Complaint data flow documented | ✅ Complete |
| Frontend page architecture documented | ✅ Complete |
| Frontend component architecture documented | ✅ Complete |
| Error handling design documented | ✅ Complete |
| Team module ownership documented | ✅ Complete |
| Phase 1 consistency checked | ✅ Complete — all 22 FRs covered |
| No Phase 3 implementation started | ✅ Confirmed |

---

> **Phase 2 is complete. Phase 3 (Implementation) may begin when approved.**
