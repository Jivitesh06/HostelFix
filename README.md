<div align="center">

# 🏠 HostelFix

### Smart Hostel Complaint Lifecycle & Mess Management Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%20ORM-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-164%2F164%20Passing-brightgreen?style=flat-square&logo=checkmarx&logoColor=white)](./server)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A high-accountability digital platform replacing informal communication channels (paper registers, WhatsApp groups, verbal notices) with a transparent, role-enforced complaint lifecycle and weekly dining management system for college residences.

[Key Features](#-key-features) • [User Roles](#-user-roles--access-matrix) • [Hostel Scoping](#-campus-hostels--gender-scoping) • [Complaint Workflow](#-complaint-lifecycle-workflow) • [Quick Start](#-quick-start-guide) • [Evaluation Accounts](#-evaluation-demo-accounts) • [Documentation](#-project-documentation)

---

</div>

## 📌 Problem & Solution

* **The Problem:** Campus hostels face unorganized maintenance reporting — complaints get buried in WhatsApp chats or lost in paper registers, students lack status visibility, and administrators lack audit trails to hold workers accountable.
* **The Solution:** **HostelFix** implements an immutable, 6-stage complaint state machine with role-based routing, warden multi-hostel scoping, student profile verification, dining menu schedules with verified reviews, and a secure administrative onboarding gate.

---

## ✨ Key Features

- 📋 **6-Stage Complaint Lifecycle** — `PENDING` → `APPROVED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` (or `REJECTED` with mandatory justification).
- 📜 **Immutable Audit Trail** — Every status transition records an unalterable log with timestamp, actor ID, previous status, and notes.
- 🏢 **Multi-Hostel & Gender Scoping** — Strict scoping ensures wardens only view and manage complaints originating from their assigned residence hall.
- 👨‍🎓 **Comprehensive Student Profiles** — Detailed student academic records (University Roll No, Branch, Year of Study, Mobile, Room) with warden inspection modals.
- 🍽️ **Weekly Mess Management** — Day-by-day breakfast, lunch, snacks, and dinner schedules with verified 1–5 star student dining reviews.
- 🛡️ **Secure Administrative Onboarding** — Dedicated `/admin/staff-register` portal protected by an administrative passkey (`HostelFix@Admin2026`) and hard 403 blocks against students.
- 🎨 **Modern SaaS UI/UX** — Responsive, clean design built with modern CSS styling, Lucide icons, status badges, and zero icon overlaps.
- 🧪 **100% Test Coverage** — 164 automated backend unit and integration test assertions verifying security, workflows, and database integrity.

---

## 👥 User Roles & Access Matrix

| Feature / Capability | 🎓 Student | 🏛️ Hostel Warden | 🔧 Maintenance Staff |
|---|:---:|:---:|:---:|
| Self-Registration | ✅ (Public `/register`) | 🔒 (Admin Portal Only) | 🔒 (Admin Portal Only) |
| Submit Maintenance Complaint | ✅ | ❌ | ❌ |
| View Assigned Complaints | Own Only | Hostel-Scoped Only | Assigned Trade Only |
| Approve / Reject Complaints | ❌ | ✅ | ❌ |
| Assign Work Orders to Workers | ❌ | ✅ | ❌ |
| Update Status (`In Progress` / `Resolved`) | ❌ | ❌ | ✅ |
| Verify & Close Complaints | ❌ | ✅ | ❌ |
| Inspect Student Academic Profile | ❌ | ✅ | ❌ |
| View Weekly Mess Menu | ✅ | ✅ | ✅ |
| Publish / Update Mess Menu | ❌ | ✅ | ❌ |
| Submit Dining Review (1–5 Stars) | ✅ | ❌ | ❌ |
| View Mess Dining Feedback | ❌ | ✅ | ❌ |

---

## 🏫 Campus Hostels & Gender Scoping

HostelFix enforces real-world residence policies by segregating residential wings and dynamically tailoring dropdowns:

```text
┌───────────────────────────────────────────────────────────┐
│                      CAMPUS HOSTELS                       │
├─────────────────────────────┬─────────────────────────────┤
│      BOYS HOSTELS           │       GIRLS HOSTELS         │
│  • Sarabhai Hostel          │  • Bose Hostel              │
│  • Bose Hostel              │  • Gargi Hostel             │
│  • Aryabhata Hostel         │  • Kalpana Hostel           │
│                             │  • Teresa Hostel            │
└─────────────────────────────┴─────────────────────────────┘
```

> **Warden Scoping Rule:** A warden assigned to *Sarabhai Hostel* strictly views, approves, and oversees complaints from students in *Sarabhai Hostel*. Complaints from other hostels remain isolated to their respective wardens.

---

## 🔄 Complaint Lifecycle Workflow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Student Submits Complaint
    
    PENDING --> REJECTED: Warden Rejects (Reason Mandatory)
    REJECTED --> [*]: Terminal State

    PENDING --> APPROVED: Warden Approves
    APPROVED --> ASSIGNED: Warden Assigns to Staff Member
    ASSIGNED --> IN_PROGRESS: Staff Starts Work
    IN_PROGRESS --> RESOLVED: Staff Completes Repair
    RESOLVED --> CLOSED: Warden Inspects & Verifies
    CLOSED --> [*]: Lifecycle Complete
```

Each step generates a timestamped entry in the `StatusLog` table visible on the complaint details timeline.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router DOM v6, Axios, Lucide React, Vite |
| **Backend** | Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt.js |
| **Database & ORM** | PostgreSQL (Supabase compatible), Prisma ORM 5.x |
| **Testing** | Native Node.js Automated Test Suites (164 Assertions) |
| **Styling** | Custom SaaS CSS Design System, Responsive Flex/Grid |

---

## 📁 Project Structure

```text
HostelFix/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # ProtectedRoute, RoleRoute
│   │   ├── constants/               # Hostel & gender configuration
│   │   ├── context/                 # AuthContext (JWT session management)
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register, StaffRegisterPage
│   │   │   ├── student/             # Dashboard, Complaints, NewComplaint, Profile, Mess
│   │   │   ├── warden/              # Dashboard, Complaints, Detail, Profile, Mess
│   │   │   └── staff/               # Dashboard, Work Orders, Detail
│   │   ├── routes/                  # AppRoutes configuration
│   │   ├── services/                # Axios instance with auth interceptors
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma            # Relational database schema
│   │   ├── seed.js                  # Evaluation demo accounts & mess menu
│   │   └── migrations/              # Database migration history
│   ├── src/
│   │   ├── config/                  # Environment and Prisma clients
│   │   ├── controllers/             # Auth, complaints, mess, user controllers
│   │   ├── middleware/              # JWT verification, RBAC, error handlers
│   │   ├── routes/                  # API endpoints (/auth, /complaints, /mess, /users)
│   │   ├── utils/                   # Response helpers & hostel rules
│   │   └── server.js                # Express app entry point
│   ├── test-auth.js                 # 42 Auth & onboarding tests
│   ├── test-profile.js              # 57 Profile, gender & scoping tests
│   ├── test-complaints.js           # 39 Complaint workflow tests
│   ├── test-mess.js                 # 26 Mess menu & review tests
│   ├── package.json
│   └── .env.example
│
├── docs/                            # Software engineering specification
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** v18+ and **npm** v9+
* **PostgreSQL** running locally on port 5432 (or a hosted Supabase instance)

---

### 1. Configure Environment Files

Create `.env` inside `server/`:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/hostelfix?schema=public"
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_REGISTRATION_KEY="HostelFix@Admin2026"
```

Create `.env` inside `client/`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

### 2. Database Setup & Seeding

```bash
cd server
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed sample users, complaints, mess menu & reviews
npm run db:seed
```

---

### 3. Start Application

**Start the Backend Server (Terminal 1):**
```bash
cd server
npm start
# Server active at: http://localhost:5001
# Health check:     http://localhost:5001/api/health
```

**Start the Frontend Client (Terminal 2):**
```bash
cd client
npm install
npm run dev
# Frontend active at: http://localhost:5173
```

---

## 🧪 Automated Test Verification

HostelFix includes 4 comprehensive automated test suites covering all business logic, security constraints, and state transitions.

Run with backend running on port 5001:
```bash
cd server

# 1. Authentication, Protected Routes & Staff Onboarding (42 tests)
node test-auth.js

# 2. Student Profile, Gender Validation & Warden Scoping (57 tests)
node test-profile.js

# 3. Complaint State Machine & Status History (39 tests)
node test-complaints.js

# 4. Weekly Mess Scheduling & Rating Feedback (26 tests)
node test-mess.js
```

```text
============================================================
Test Suite Results: 164 / 164 Tests Passed (100% Success Rate)
============================================================
```

---

## 🔑 Evaluation Demo Accounts

All seeded demo accounts share the password: **`Demo@1234`**

| Role | Email | Password | Assigned Location / Trade |
|---|---|---|---|
| **Student (Male)** | `student@hostelfix.demo` | `Demo@1234` | Sarabhai Hostel, Room A-101 |
| **Student (Female)** | `student2@hostelfix.demo` | `Demo@1234` | Gargi Hostel, Room B-205 |
| **Warden (Sarabhai)** | `warden@hostelfix.demo` | `Demo@1234` | Sarabhai Hostel (Boys) |
| **Warden (Gargi)** | `warden2@hostelfix.demo` | `Demo@1234` | Gargi Hostel (Girls) |
| **Staff (Plumber)** | `staff@hostelfix.demo` | `Demo@1234` | Plumbing Maintenance |
| **Staff (Electrician)** | `staff2@hostelfix.demo` | `Demo@1234` | Electrical Maintenance |

---

## 🛡️ Administrative Onboarding Portal

For provisioning new Wardens and Maintenance Technicians:
* **Portal Link:** [`http://localhost:5173/admin/staff-register`](http://localhost:5173/admin/staff-register) (or click *"Staff & Warden Portal →"* on login).
* **Administrative Authorization Key:** `HostelFix@Admin2026`
* **Student Protection:** Authenticated students navigating to this portal receive an immediate **403 Forbidden** security barrier.

---

## 📚 Project Documentation

Engineering design and software requirements specifications are available in [`/docs`](./docs):
* [System Requirements Analysis](./docs/requirements-analysis.md)
* [System Design Specification](./docs/system-design.md)
* [Database Architecture & Schema](./docs/system-design/database-design.md)
* [Role-Based Access Control (RBAC)](./docs/system-design/role-permissions.md)
* [Complaint State Machine](./docs/system-design/complaint-workflow.md)
* [REST API Specification](./docs/system-design/api-design.md)

---

<div align="center">
  <sub>Developed for College Software Engineering Academic Evaluation • 2026</sub>
</div>
