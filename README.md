# HostelFix 🏠

**Smart Hostel Complaint & Mess Management System**

HostelFix is a centralized web-based system for managing hostel complaints and mess-related information in a college hostel environment. It replaces informal complaint channels (WhatsApp, verbal, physical registers) with a structured, transparent, and accountable digital workflow.

---

## Problem

Hostel complaints are commonly handled through verbal communication, WhatsApp messages, or physical registers — leading to lost complaints, unclear responsibility, and lack of transparency for students.

HostelFix solves this by providing a role-based complaint lifecycle system with full status tracking and accountability.

---

## Key Features

- 📋 **Structured Complaint Submission** — Students submit complaints with category, description, and optional image evidence
- 🔄 **Full Complaint Lifecycle** — Pending → Approved → Assigned → In Progress → Resolved → Closed
- 👥 **Three User Roles** — Student, Warden, and Staff with enforced role-based access
- 📜 **Complaint History** — Every status change is recorded with timestamp and actor
- 🍽️ **Mess Menu** — Warden publishes weekly mess menu visible to all students
- ⭐ **Mess Feedback** — Students submit ratings and comments on mess services
- 📊 **Role-Based Dashboards** — Each role sees a relevant summary view

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Register, raise complaints, track status, view timeline, view mess menu, submit feedback |
| **Warden** | Approve/reject/assign complaints, close resolved complaints, manage mess menu, view feedback |
| **Staff** | View assigned complaints, update status, mark complaints as resolved |

---

## Complaint Lifecycle

```
Student submits → [Pending] → Warden approves → [Approved]
                                     ↓
                              Warden assigns → [Assigned]
                                     ↓
                            Staff starts work → [In Progress]
                                     ↓
                           Staff completes → [Resolved]
                                     ↓
                           Warden verifies → [Closed]

          Alternative: [Pending] → Warden rejects → [Rejected]
```

---

## Project Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Requirement Analysis | ✅ Complete |
| **Phase 2** | System Design & Architecture | ✅ Complete |
| **Phase 3A** | Foundation & Database Implementation | ✅ Complete |
| **Phase 3B** | Authentication & Protected Routes | 🔜 Next |
| **Phase 3C** | Complaint Management Workflow | 🔜 Upcoming |
| **Phase 3D** | Mess Management & Final Evaluation Polish | 🔜 Upcoming |

---

## Documentation

- **Phase 1 Requirements:** [`docs/requirements-analysis.md`](./docs/requirements-analysis.md)
- **Phase 2 System Design:** [`docs/system-design.md`](./docs/system-design.md)
  - [`architecture.md`](./docs/system-design/architecture.md) — 3-tier architecture
  - [`module-design.md`](./docs/system-design/module-design.md) — Backend & frontend modules
  - [`role-permissions.md`](./docs/system-design/role-permissions.md) — Role-permission matrix
  - [`database-design.md`](./docs/system-design/database-design.md) — Schema, models, constraints, indexes
  - [`er-diagram.md`](./docs/system-design/er-diagram.md) — Entity-relationship diagrams
  - [`api-design.md`](./docs/system-design/api-design.md) — REST API specification
  - [`authentication-flow.md`](./docs/system-design/authentication-flow.md) — JWT auth flows
  - [`complaint-workflow.md`](./docs/system-design/complaint-workflow.md) — State machine transitions
  - [`frontend-design.md`](./docs/system-design/frontend-design.md) — Page routes & components
  - [`error-handling.md`](./docs/system-design/error-handling.md) — Error standards

---

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios, Vite
- **Backend:** Node.js, Express.js, CORS, dotenv, bcryptjs, jsonwebtoken
- **Database:** PostgreSQL (Supabase compatible) with Prisma ORM 5.x

---

## Project Structure

```text
HostelFix/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (ProtectedRoute, RoleRoute, etc.)
│   │   ├── context/            # AuthContext state management
│   │   ├── pages/              # Role-based pages (auth, student, warden, staff)
│   │   ├── routes/             # AppRoutes configuration
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # Environment validation
│   │   ├── middleware/         # Error handler, 404, auth guards
│   │   ├── routes/             # Health & feature route definitions
│   │   ├── utils/              # Standardized API response helpers
│   │   └── server.js           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data model & PostgreSQL config
│   │   ├── seed.js             # Demo accounts & seed dataset
│   │   └── migrations/         # Prisma migration history
│   ├── verify-db.js            # Database verification script
│   ├── .env.example
│   └── package.json
│
├── docs/                       # Phase 1 & Phase 2 documentation
├── README.md
└── .gitignore
```

---

## Setup & Running Guide

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **PostgreSQL** (local instance or free cloud Supabase instance)

### 1. Environment Variables

Create `.env` files in both `server/` and `client/`:

```bash
# Server environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET

# Client environment
cp client/.env.example client/.env
```

Example `server/.env`:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/hostelfix?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Example `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 2. Backend Setup & Database Migration

```bash
cd server
npm install

# Validate Prisma schema
npx prisma validate

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed demo dataset
npm run db:seed

# Optional: Verify database and relations
node verify-db.js
```

### 3. Frontend Setup

```bash
cd ../client
npm install

# Test build
npm run build
```

### 4. Running the Application

In terminal 1 (Backend):
```bash
cd server
npm run dev    # or npm start
# Server runs on http://localhost:5001
# Health check: http://localhost:5001/api/health
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Demo Accounts for Evaluation

All demo accounts share the password: **`Demo@1234`**

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@hostelfix.demo` | `Demo@1234` | Room A-101, Block A |
| **Student** | `student2@hostelfix.demo` | `Demo@1234` | Room B-205, Block B |
| **Warden** | `warden@hostelfix.demo` | `Demo@1234` | Hostel Warden |
| **Staff** | `staff@hostelfix.demo` | `Demo@1234` | Maintenance (Plumber) |
| **Staff** | `staff2@hostelfix.demo` | `Demo@1234` | Maintenance (Electrician) |

---

## College Project

This is a software engineering college project developed for academic evaluation.
