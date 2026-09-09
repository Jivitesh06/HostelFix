# Module Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

The HostelFix backend is organized into feature-based modules. Each module owns a specific area of functionality and exposes its logic through API routes. Modules are designed to be independently developed and later integrated.

---

## Module Map

```
HostelFix Backend
│
├── Authentication Module      → /api/auth
├── Complaint Module           → /api/complaints
├── Mess Management Module     → /api/mess
└── (Dashboard data served by Complaint + Mess modules)

HostelFix Frontend
│
├── Auth Pages                 (Login, Register)
├── Student Module             (Dashboard, Complaints, Mess)
├── Warden Module              (Dashboard, Complaints, Mess Admin)
└── Staff Module               (Dashboard, Assigned Complaints)
```

---

## Backend Modules

---

### Module 1 — Authentication Module

**Route prefix:** `/api/auth`

**Team Ownership:** Member 2 (Backend + Authentication + Database)

#### Responsibilities

| Responsibility | Description |
|---|---|
| Student Registration | Accept student details, hash password, create User record |
| Login | Verify credentials, generate and return JWT |
| Token Verification | Middleware: validate JWT on every protected request |
| Role Identification | Extract and expose user role from JWT payload |
| Profile Retrieval | Return current user profile via GET /api/auth/me |
| Protected Route Guard | `verifyToken` middleware applied to all non-public routes |
| Role Guard | `requireRole()` middleware applied per route |

#### Endpoints

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |

---

### Module 2 — Complaint Management Module

**Route prefix:** `/api/complaints`

**Team Ownership:** Member 1 (Warden + Complaint Workflow) and Member 2 (Backend APIs)

#### Responsibilities

| Responsibility | Description |
|---|---|
| Complaint Creation | Create new complaint with PENDING status; create initial StatusLog |
| Complaint Listing | Return filtered lists (own complaints for Student; all for Warden; assigned for Staff) |
| Complaint Detail | Return single complaint with full details |
| Approve Complaint | Warden: PENDING → APPROVED; create StatusLog |
| Reject Complaint | Warden: PENDING → REJECTED; store rejectionReason; create StatusLog |
| Assign Staff | Warden: APPROVED → ASSIGNED; store assignedStaffId; create StatusLog |
| Update Status | Staff: ASSIGNED → IN_PROGRESS or IN_PROGRESS → RESOLVED; create StatusLog |
| Close Complaint | Warden: RESOLVED → CLOSED; create StatusLog |
| Status Validation | Reject invalid transitions with 400 Bad Request |
| History | All status transitions recorded in StatusLog |

#### Endpoints

| Method | Path | Role |
|---|---|---|
| `POST` | `/api/complaints` | Student |
| `GET` | `/api/complaints` | Student (own) / Warden (all) |
| `GET` | `/api/complaints/:id` | Student (own) / Warden / Staff (assigned) |
| `PATCH` | `/api/complaints/:id/approve` | Warden |
| `PATCH` | `/api/complaints/:id/reject` | Warden |
| `PATCH` | `/api/complaints/:id/assign` | Warden |
| `PATCH` | `/api/complaints/:id/status` | Staff |

---

### Module 3 — Mess Management Module

**Route prefix:** `/api/mess`

**Team Ownership:** Member 4 (Mess + Documentation)

#### Responsibilities

| Responsibility | Description |
|---|---|
| Menu Creation | Warden creates/updates weekly mess menu entries |
| Menu Retrieval | All authenticated users can view the current weekly menu |
| Feedback Submission | Students submit a rating and optional comment |
| Feedback Summary | Warden views aggregated feedback list |

#### Endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/api/mess` | All authenticated |
| `POST` | `/api/mess` | Warden |
| `PUT` | `/api/mess/:id` | Warden |
| `DELETE` | `/api/mess/:id` | Warden |
| `POST` | `/api/mess/:id/feedback` | Student |
| `GET` | `/api/mess/feedback` | Warden |

---

## Frontend Modules

---

### Frontend Module 1 — Auth Pages

**Team Ownership:** Member 2

| Page | Path | Description |
|---|---|---|
| Login | `/login` | Email/password form; redirects by role on success |
| Register | `/register` | Student self-registration form |

---

### Frontend Module 2 — Student Module

**Team Ownership:** Member 3

| Page | Path | Description |
|---|---|---|
| Dashboard | `/student/dashboard` | Summary of own complaints by status |
| My Complaints | `/student/complaints` | List of own complaints |
| New Complaint | `/student/complaints/new` | Complaint submission form |
| Complaint Detail | `/student/complaints/:id` | Complaint details + status timeline |
| Mess Menu | `/student/mess` | Weekly mess menu + feedback form |

---

### Frontend Module 3 — Warden Module

**Team Ownership:** Member 1

| Page | Path | Description |
|---|---|---|
| Dashboard | `/warden/dashboard` | Complaint statistics by status |
| All Complaints | `/warden/complaints` | Full complaint list with filters |
| Complaint Detail | `/warden/complaints/:id` | Detail + approve/reject/assign/close actions |
| Mess Management | `/warden/mess` | Manage weekly menu + view feedback |

---

### Frontend Module 4 — Staff Module

**Team Ownership:** Member 1 (UI), Member 2 (API integration)

| Page | Path | Description |
|---|---|---|
| Dashboard | `/staff/dashboard` | List of assigned complaints |
| Complaint Detail | `/staff/complaints/:id` | Detail + update status actions |

---

## Module Independence

Each module is designed for independent development:

| Module | Can Be Built Without | Integration Point |
|---|---|---|
| Authentication | Complaint Module, Mess Module | JWT token; `req.user` object |
| Complaint Module | Mess Module | Depends on Auth middleware only |
| Mess Module | Complaint Module | Depends on Auth middleware only |
| Student Frontend | Warden/Staff pages | Shared components: Navbar, StatusBadge, ProtectedRoute |
| Warden Frontend | Student/Staff pages | Shared components: Navbar, ComplaintTable, Modal |
| Staff Frontend | Student/Warden pages | Shared components: Navbar, StatusBadge |

---

## Team Module Ownership

| Member | Owns | Delivers |
|---|---|---|
| Member 1 | Warden Module + Complaint Workflow | Warden dashboard, approve/reject/assign/close UI, complaint lifecycle UI |
| Member 2 | Backend + Auth + Database | Auth APIs, complaint APIs, Prisma schema, JWT middleware |
| Member 3 | Student Module | Student dashboard, complaint creation UI, my complaints, timeline UI |
| Member 4 | Mess + Documentation | Mess menu UI, feedback UI, mess API integration, documentation |
