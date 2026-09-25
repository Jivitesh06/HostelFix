<div align="center">

# 🏠 HostelFix

### Smart Hostel Complaint Lifecycle & Mess Management Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%20ORM-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-215%2F215%20Passing-brightgreen?style=flat-square&logo=checkmarx&logoColor=white)](./server)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A high-accountability digital platform replacing informal communication channels (paper registers, WhatsApp groups, verbal notices) with a transparent, role-enforced complaint lifecycle, photo verification, weekly dining management, and resident & staff directory for college residences.

[Key Features](#-key-features) • [User Roles](#-user-roles--access-matrix) • [Hostel Scoping](#-campus-hostels--gender-scoping) • [Complaint Workflow](#-complaint-lifecycle-workflow) • [Photo Proof](#-photo-upload--work-completion-proof) • [User Management](#-warden-user-management--staff-provisioning) • [Deployment](#-production-deployment-guide) • [Quick Start](#-quick-start-guide) • [Evaluation Accounts](#-evaluation-demo-accounts)

---

</div>

## 📌 Problem & Solution

* **The Problem:** Campus hostels face unorganized maintenance reporting — complaints get buried in WhatsApp chats or lost in paper registers, students lack status visibility, and administrators lack audit trails and physical proof to hold workers accountable.
* **The Solution:** **HostelFix** implements an immutable, 6-stage complaint state machine with role-based routing, warden multi-hostel scoping, student profile verification, dining menu schedules with verified reviews, Cloudinary image upload with mandatory technician work completion proof, a dedicated Warden User Management suite for resident and staff oversight, and a secure administrative onboarding gate.

---

## ✨ Key Features

- 📋 **6-Stage Complaint Lifecycle** — `PENDING` → `APPROVED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` (or `REJECTED` with mandatory justification).
- 📸 **Cloudinary Photo Verification** — Students attach optional issue photos on complaint submission; maintenance staff are strictly required to upload work completion proof photos when resolving complaints.
- 🔍 **Interactive Lightbox Inspection** — Wardens, staff, and students can click any photo to inspect high-resolution images in a lightbox modal.
- 👥 **Warden User Management Suite** — Wardens access a dedicated `/warden/users` dashboard to browse resident students (scoped to their hostel) and manage maintenance workers (provision new staff, edit trade specializations, toggle active duty status).
- 📜 **Immutable Audit Trail** — Every status transition records an unalterable log with timestamp, actor ID, previous status, and notes.
- 🏢 **Multi-Hostel & Gender Scoping** — Strict scoping ensures wardens only view and manage complaints and students originating from their assigned residence hall.
- 👨‍🎓 **Comprehensive Student Profiles** — Detailed student academic records (University Roll No, Branch, Year of Study, Mobile, Room, Block) with warden inspection modals.
- 🍽️ **Weekly Mess Management** — Day-by-day breakfast, lunch, snacks, and dinner schedules with verified 1–5 star student dining reviews.
- 🛡️ **Secure Administrative Onboarding** — Dedicated `/admin/staff-register` portal protected by an administrative passkey (`HostelFix@Admin2026`) and hard 403 blocks against students.
- 🎨 **Modern SaaS UI/UX** — Responsive, clean design built with modern CSS styling, Lucide icons, status badges, and zero icon overlaps.
- 🧪 **100% Test Coverage** — 215 automated backend unit and integration test assertions verifying security, workflows, photo validation, user management, and database integrity.

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
flowchart TD
    SUBMIT(["Student Submits Complaint"]) --> PENDING["PENDING"]
    
    PENDING -->|"Warden Rejects (Reason Required)"| REJECTED["REJECTED"]
    PENDING -->|"Warden Approves"| APPROVED["APPROVED"]
    APPROVED -->|"Warden Assigns Staff"| ASSIGNED["ASSIGNED"]
    ASSIGNED -->|"Staff Starts Work"| IN_PROGRESS["IN_PROGRESS"]
    IN_PROGRESS -->|"Staff Completes Repair"| RESOLVED["RESOLVED"]
    RESOLVED -->|"Warden Verifies & Closes"| CLOSED["CLOSED"]
```

```text
Student Submits ──> [ PENDING ] ──(Warden Approves)──> [ APPROVED ] ──(Warden Assigns)──> [ ASSIGNED ]
                         │                                                                      │
                (Warden Rejects)                                                                │
                         │                                                                      ▼
                         ▼                                                              [ IN_PROGRESS ]
                  [ REJECTED ]                                                                  │
                                                                                          (Staff Works)
                                                                                                │
                                                                                                ▼
                  [ CLOSED ] <──(Warden Verifies)── [ RESOLVED ] <──────────────────────────────┘
```

Each step generates a timestamped entry in the `StatusLog` table visible on the complaint details timeline.

---

## 📷 Photo Upload & Work Completion Proof

HostelFix integrates **Cloudinary** for secure, persistent image hosting without storing heavy binaries in PostgreSQL or on the local filesystem:

1. **Student Issue Photo (Optional):**
   - Students can upload a photo (JPEG, PNG, WebP ≤ 5MB) while creating a complaint.
   - Includes real-time image preview, client-side format/size validation, and remove/replace controls.
2. **Technician Work Completion Proof (Strictly Mandatory):**
   - When maintenance technicians mark an assigned job as `RESOLVED`, the system **strictly enforces** both a resolution note and an uploaded photo demonstrating the completed repair.
   - Backend controller rejects status transitions to `RESOLVED` with `400 Bad Request` if `completionPhotoUrl` is missing or empty.
3. **Interactive Lightbox Inspection:**
   - Original student photo and worker completion proof are displayed with full-resolution lightbox inspection modals across Student, Warden, and Staff views.
   - Wardens review the worker's completion proof directly inside the "Verify & Close" modal before marking complaints `CLOSED`.

> 💡 **Offline / Evaluation Fallback:** If Cloudinary environment variables are omitted, the upload service automatically falls back to an encoded Data-URI format, ensuring offline evaluation and CI tests never fail.

---

---

## 👥 Warden User Management & Staff Provisioning

The Warden portal includes a dedicated User Management hub at `/warden/users`:
1. **Resident Students Registry:**
   - Automatically scoped to the Warden's residential jurisdiction (e.g. Sarabhai Hostel vs. Gargi Hostel).
   - Real-time search across student name, roll number, room allocation, and academic branch.
   - Comprehensive resident profile inspector modal displaying personal, academic, and hostel residence data.
2. **Maintenance Worker Directory:**
   - Centralized registry of all campus maintenance technicians (Plumbers, Electricians, Carpenters, Cleaners, etc.).
   - Displays current workload (active assigned work order tickets) and duty status.
   - **Add Staff Member:** Directly provision new maintenance worker accounts with bcrypt hashed passwords and trade categorization.
   - **Edit Staff & Duty Status:** Wardens can update worker phone numbers, trade classifications, and toggle active duty status (`Active` / `Inactive` on leave).

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router DOM v6, Axios, Lucide React, Vite |
| **Backend** | Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt.js |
| **Cloud Storage** | Cloudinary v2 SDK, Multer Memory Storage (5MB limit) |
| **Database & ORM** | PostgreSQL (Supabase / Neon compatible), Prisma ORM 5.x |
| **Testing** | Native Node.js Automated Test Suites (215 Assertions) |
| **Styling** | Custom SaaS CSS Design System, Responsive Flex/Grid |
| **Deployment** | Vercel (Client SPA), Render / Railway (API Server), Supabase (DB) |

---

## 📁 Project Structure

```text
HostelFix/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # AppShell, Modal, ProtectedRoute, RoleRoute
│   │   ├── constants/               # Hostel & gender configuration
│   │   ├── context/                 # AuthContext (JWT session management)
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register, StaffRegisterPage
│   │   │   ├── student/             # Dashboard, Complaints, NewComplaint, Profile, Mess
│   │   │   ├── warden/              # Dashboard, Complaints, Detail, Profile, Mess, UserManagement
│   │   │   └── staff/               # Dashboard, Work Orders, Detail
│   │   ├── routes/                  # AppRoutes configuration
│   │   ├── services/                # Axios instance with auth interceptors (api, complaint, mess, user)
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
│   │   ├── config/                  # Environment, Prisma & Cloudinary clients
│   │   ├── controllers/             # Auth, complaints, mess, user, upload controllers
│   │   ├── middleware/              # JWT verification, RBAC, error & upload handlers
│   │   ├── routes/                  # API endpoints (/auth, /complaints, /mess, /users, /upload)
│   │   ├── utils/                   # Response helpers & hostel rules
│   │   └── server.js                # Express app entry point
│   ├── test-auth.js                 # 42 Auth & onboarding tests
│   ├── test-profile.js              # 57 Profile, gender & scoping tests
│   ├── test-complaints.js           # 41 Complaint workflow & photo proof tests
│   ├── test-mess.js                 # 26 Mess menu & review tests
│   ├── test-user-management.js      # 49 User management & staff provisioning tests
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

# Optional Cloudinary Storage (falls back to local Data-URI if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

HostelFix includes 5 comprehensive automated test suites covering all business logic, security constraints, and state transitions.

Run with backend running on port 5001:
```bash
cd server

# 1. Authentication, Protected Routes & Staff Onboarding (42 tests)
node test-auth.js

# 2. Student Profile, Gender Validation & Warden Scoping (57 tests)
node test-profile.js

# 3. Complaint State Machine & Work Proof Verification (41 tests)
node test-complaints.js

# 4. Weekly Mess Scheduling & Rating Feedback (26 tests)
node test-mess.js

# 5. Warden User Management, Staff Provisioning & Duty Status (49 tests)
node test-user-management.js
```

```text
============================================================
Test Suite Results: 215 / 215 Tests Passed (100% Success Rate)
============================================================
```

---

## 🌐 Production Deployment Guide

HostelFix is fully pre-configured for production deployment across cloud providers:

### Step 1: Managed PostgreSQL Database (Supabase / Neon)
1. Create a free project at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the PostgreSQL connection URI (e.g. `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`).
3. Set this as `DATABASE_URL` in your backend environment.

### Step 2: Backend REST API (Render / Railway)
1. Push this repository to GitHub and create a new Web Service on [Render](https://render.com).
2. Configure settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma migrate deploy && npx prisma generate`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon connection string
   - `JWT_SECRET`: A secure random 64-character hex string
   - `CLIENT_URL`: `https://<your-vercel-app>.vercel.app`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
   - `NODE_ENV`: `production`
   - `ADMIN_REGISTRATION_KEY`: `HostelFix@Admin2026`
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
4. Optional: Run seed once via Render Shell: `npm run db:seed`.

### Step 3: Frontend Client SPA (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-api>.onrender.com/api`
4. Deploy! `client/vercel.json` and `client/public/_redirects` automatically handle single-page application routing rewrites so direct navigation and refreshes work flawlessly.

---

## 🔑 Evaluation Demo Accounts

All seeded demo accounts share the password: **`Demo@1234`**

| Role | Email | Password | Assigned Location / Trade |
|---|---|---|---|
| **Student (Male)** | `student@hostelfix.demo` | `Demo@1234` | Sarabhai Hostel, Room A-101 |
| **Student (Female)** | `student2@hostelfix.demo` | `Demo@1234` | Gargi Hostel, Room B-205 |
| **Warden (Sarabhai)** | `warden@hostelfix.demo` | `Demo@1234` | Sarabhai Hostel (Boys) |
| **Warden (Gargi)** | `warden_girls@hostelfix.demo` | `Demo@1234` | Gargi Hostel (Girls) |
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
