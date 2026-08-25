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
| **Phase 2** | System Design & Architecture | 🔜 Upcoming |
| **Phase 3** | Implementation | 🔜 Upcoming |
| **Phase 4** | Testing & Deployment | 🔜 Upcoming |

---

## Documentation

Phase 1 requirement analysis documents are located in [`docs/`](./docs/):

- [`requirements-analysis.md`](./docs/requirements-analysis.md) — Phase 1 master overview
- [`requirements/problem-statement.md`](./docs/requirements/problem-statement.md)
- [`requirements/objectives.md`](./docs/requirements/objectives.md)
- [`requirements/stakeholders.md`](./docs/requirements/stakeholders.md)
- [`requirements/functional-requirements.md`](./docs/requirements/functional-requirements.md)
- [`requirements/non-functional-requirements.md`](./docs/requirements/non-functional-requirements.md)
- [`requirements/use-cases.md`](./docs/requirements/use-cases.md)
- [`requirements/use-case-diagram.md`](./docs/requirements/use-case-diagram.md)
- [`requirements/complaint-workflow.md`](./docs/requirements/complaint-workflow.md)
- [`requirements/scope.md`](./docs/requirements/scope.md)
- [`requirements/requirements-traceability.md`](./docs/requirements/requirements-traceability.md)

---

## Tech Stack *(Planned — Phase 2/3)*

- **Frontend:** Next.js, React
- **Backend:** Node.js, Express / Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based role authentication
- **Hosting:** Free-tier cloud (TBD)

---

## College Project

This is a software engineering college project developed for academic evaluation.
