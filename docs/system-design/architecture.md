# System Architecture

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

HostelFix follows a three-tier client-server architecture with a clear separation between the presentation layer (React frontend), the application layer (Express REST API), and the data layer (PostgreSQL via Prisma). The frontend and database never communicate directly — all data access passes through the backend API.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Users (Browser)                          │
│              Student  /  Warden  /  Staff                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend (Client)                       │
│                                                                 │
│  • Pages & Routing (React Router)                               │
│  • Role-based page access                                       │
│  • Forms & UI components                                        │
│  • Auth state management                                        │
│  • Axios HTTP client                                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │  REST API calls (JSON over HTTP)
                          │  Authorization: Bearer <JWT>
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Express.js REST API (Server)                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               Middleware Pipeline                         │  │
│  │   CORS → Body Parser → Auth Middleware → Role Middleware  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │    Auth     │  │  Complaint   │  │    Mess Management     │ │
│  │   Module    │  │    Module    │  │        Module          │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                                                                 │
│  • JWT generation & verification                                │
│  • Business logic & workflow enforcement                        │
│  • Input validation                                             │
│  • Role-based authorization                                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │  Prisma Client calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Prisma ORM                                 │
│                                                                 │
│  • Schema definition                                            │
│  • Type-safe database queries                                   │
│  • Relationship management                                      │
│  • Transaction support                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │  TCP connection
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                           │
│                                                                 │
│  • Users         • Complaints      • StatusLogs                 │
│  • MessMenus     • MenuFeedbacks                                │
└─────────────────────────────────────────────────────────────────┘
```

> **Critical Constraint:** The React frontend must never connect directly to the PostgreSQL database. All data access flows exclusively through the Express REST API.

---

## Layer Responsibilities

### Layer 1 — React Frontend

| Responsibility | Detail |
|---|---|
| User Interface | Renders pages, forms, tables, status badges, and dashboards |
| Routing | Uses React Router for client-side navigation between pages |
| Role-Based Pages | Renders different page sets based on the authenticated user's role |
| Form Handling | Captures and validates user input before sending to the API |
| API Communication | Uses Axios to make HTTP requests to the Express backend |
| Auth State | Stores authentication information and attaches JWT to outgoing requests |
| Displaying Data | Renders JSON responses from the API as readable UI elements |

### Layer 2 — Express.js REST API

| Responsibility | Detail |
|---|---|
| REST API | Exposes structured endpoints for all system operations |
| Authentication | Verifies user identity via JWT on every protected request |
| Authorization | Checks user role against the required permission for each endpoint |
| Business Logic | Enforces the complaint workflow, valid state transitions, and rules |
| Validation | Validates all incoming request bodies before processing |
| Complaint Workflow Enforcement | Ensures invalid state transitions are rejected at the API level |

### Layer 3 — Prisma ORM

| Responsibility | Detail |
|---|---|
| ORM | Abstracts raw SQL into structured, type-safe JavaScript/TypeScript calls |
| Database Queries | Handles all read/write operations to PostgreSQL |
| Relationships | Manages foreign keys and joins through relational query APIs |
| Transactions | Groups multiple database operations into atomic units where required |

### Layer 4 — PostgreSQL

| Responsibility | Detail |
|---|---|
| Persistent Storage | Stores all application data durably |
| Constraints | Enforces unique constraints, foreign keys, and not-null rules |
| Indexing | Uses indexes to support efficient queries on common filter fields |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React (Vite or CRA) | UI framework |
| Frontend Routing | React Router | Client-side navigation |
| HTTP Client | Axios | API communication |
| Backend | Node.js + Express.js | REST API server |
| Authentication | JSON Web Tokens (JWT) | Stateless user auth |
| ORM | Prisma | Database abstraction |
| Database | PostgreSQL | Relational data storage |

---

## Key Architectural Principles

1. **Separation of Concerns** — Frontend, backend, and database have clearly separated roles. No layer takes on responsibilities outside its boundary.

2. **API-First** — All data flows through the REST API. The frontend is a consumer of the API, not a privileged participant.

3. **Backend-Enforced Security** — Authentication and role authorization are enforced exclusively on the backend. The frontend may hide UI elements by role, but the backend independently enforces all permissions.

4. **Stateless Authentication** — JWT tokens are used for authentication. The server does not store session state — the token carries the user identity and role.

5. **Modular Backend** — The backend is organized by feature module (Auth, Complaint, Mess), allowing independent development and testing of each area.

---

## Communication Protocol

- All API calls use **HTTP/HTTPS** with **JSON** request and response bodies.
- Protected endpoints require the `Authorization: Bearer <token>` header.
- All responses follow a consistent envelope format:

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

---

## Deployment Context (Phase 3 Target)

| Component | Planned Hosting |
|-----------|----------------|
| React Frontend | Vercel / Netlify (static hosting) |
| Express API | Railway / Render (Node.js server) |
| PostgreSQL | Railway / Supabase (managed Postgres) |
