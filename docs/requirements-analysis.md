# Requirements Analysis — Phase 1

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Document Purpose

This document provides a consolidated overview of the Phase 1 Requirement Analysis for HostelFix. It summarizes the key outputs of the analysis phase and serves as the entry point for evaluators, reviewers, and subsequent development phases.

Full detail for each section is available in the individual requirement documents located in `docs/requirements/`.

---

## 1. Problem Statement

Hostel complaints at most colleges are handled through informal channels — verbal communication, WhatsApp messages, phone calls, or physical registers. This creates problems including lost complaints, unclear responsibility, no centralized tracking, and a lack of transparency for students.

Additionally, mess-related information such as the weekly menu and student feedback has no dedicated platform, relying instead on notice boards and informal messaging.

**HostelFix** is proposed as a centralized web-based system to digitize hostel complaint management and provide a structured platform for mess information and feedback.

> 📄 Full document: [`docs/requirements/problem-statement.md`](./requirements/problem-statement.md)

---

## 2. Project Objectives

| ID | Objective |
|----|-----------|
| OBJ-01 | Digitize hostel complaint registration |
| OBJ-02 | Provide a structured complaint submission interface for students |
| OBJ-03 | Allow students to track complaint status |
| OBJ-04 | Allow wardens to review and manage complaints |
| OBJ-05 | Allow wardens to assign complaints to appropriate staff |
| OBJ-06 | Allow staff to manage their assigned complaints |
| OBJ-07 | Maintain complaint status history |
| OBJ-08 | Provide centralized weekly mess menu information |
| OBJ-09 | Allow students to provide mess feedback |
| OBJ-10 | Improve accountability and transparency in hostel complaint management |

> 📄 Full document: [`docs/requirements/objectives.md`](./requirements/objectives.md)

---

## 3. Stakeholders

| Stakeholder | Type | Interaction |
|-------------|------|-------------|
| Student | Primary | Submits complaints, tracks status, views mess menu, submits feedback |
| Warden | Primary | Reviews complaints, assigns staff, manages mess menu and feedback |
| Hostel Staff | Primary | Views and resolves assigned complaints |
| Hostel Administration | Secondary | Benefits from centralized records and accountability |

> 📄 Full document: [`docs/requirements/stakeholders.md`](./requirements/stakeholders.md)

---

## 4. User Roles

HostelFix defines exactly three application roles. Role permissions are enforced by the system.

### Student
Register · Login · Create Complaint · View Own Complaints · View Complaint Details · Track Status · View Timeline · View Mess Menu · Submit Mess Feedback

### Warden
Login · View All Complaints · Approve Complaint · Reject Complaint · Assign Staff · Monitor Complaint Status · Close Resolved Complaints · Manage Mess Menu · View Feedback Summary

### Staff
Login · View Assigned Complaints · View Complaint Details · Update Assigned Complaint Status · Mark Complaint as Resolved

> **Note:** Role permissions must be enforced by the system. No user may access functionality outside their defined role.

---

## 5. Functional Requirements Summary

22 functional requirements are defined across five modules:

| Module | FRs | Key Capabilities |
|--------|-----|-----------------|
| Authentication | FR-01 – FR-04 | Registration (incl. `roomNumber`, `hostelBlock` as required profile fields), login, role identification, access enforcement |
| Complaint Management | FR-05 – FR-15 | Full complaint lifecycle; fixed category enum (ELECTRICAL, PLUMBING, CLEANING, FURNITURE, INTERNET, OTHER); rejection requires `rejectionReason` (nullable field); reasonable data limits on complaint lists |
| Complaint Status Lifecycle | (within FR-05–FR-15) | 7 defined states with enforced transitions |
| Mess Management | FR-16 – FR-19 | Menu management and student feedback |
| Dashboard | FR-20 – FR-22 | Role-specific dashboards for all three roles |

> 📄 Full document: [`docs/requirements/functional-requirements.md`](./requirements/functional-requirements.md)

---

## 6. Complaint Status Lifecycle

```
Student raises complaint → [Pending]
                                ↓
                       Warden reviews
                        ↙           ↘
               [Approved]         [Rejected] ← terminal
                    ↓
           Warden assigns staff
                    ↓
               [Assigned]
                    ↓
          Staff begins work
                    ↓
             [In Progress]
                    ↓
         Staff completes work
                    ↓
              [Resolved]
                    ↓
        Warden verifies & closes
                    ↓
               [Closed] ← terminal
```

**Transition Rules:** States cannot be skipped. Only the designated actor may trigger each transition. Rejected and Closed are terminal states.

> 📄 Full document: [`docs/requirements/complaint-workflow.md`](./requirements/complaint-workflow.md)

---

## 7. Non-Functional Requirements Summary

| Category | Key Requirements |
|----------|-----------------|
| Security | Hashed passwords, authenticated routes, server-side role enforcement, student data isolation |
| Usability | Intuitive interface, clear navigation, visual status indicators, plain-language errors |
| Performance | Responsive operations, role-scoped data loading, paginated complaint lists |
| Reliability | Persistent records, immutable status history, input validation |
| Maintainability | Modular architecture, feature-based organization, consistent conventions |
| Scalability | Expandable blocks, staff, and categories without structural changes |
| Responsiveness | Works on laptop, mobile, and tablet; compatible with Chrome, Firefox, Edge |

> 📄 Full document: [`docs/requirements/non-functional-requirements.md`](./requirements/non-functional-requirements.md)

---

## 8. Use Cases

**Total Use Cases Defined: 24**

| Actor | Count | Use Cases |
|-------|-------|-----------|
| Student | 9 | UC-S01 through UC-S09 |
| Warden | 10 | UC-W01 through UC-W10 |
| Staff | 5 | UC-ST01 through UC-ST05 |

Each use case includes: Use Case ID, Name, Actor, Description, Preconditions, Main Flow, Alternative/Exception Flow, and Postconditions.

> 📄 Full document: [`docs/requirements/use-cases.md`](./requirements/use-cases.md)

---

## 9. Use-Case Diagram

Three actors: **Student**, **Warden**, **Staff**

Five use-case groups within the system boundary:
1. Authentication (shared)
2. Complaint Operations (Student)
3. Complaint Administration (Warden)
4. Complaint Task Management (Staff)
5. Mess Services (Student & Warden)

A Mermaid diagram definition and ASCII layout specification are provided.

> 📄 Full document: [`docs/requirements/use-case-diagram.md`](./requirements/use-case-diagram.md)

---

## 10. System Scope

### In Scope

- Role-based complaint management (Student, Warden, Staff)
- Full complaint lifecycle with enforced state transitions
- Complaint history/audit trail
- Mess menu management and student feedback
- Role-based dashboards

### Future Scope (Not Implemented)

- Automated SLA monitoring
- Email/SMS notifications
- Advanced analytics and reporting
- Mobile application
- AI-based complaint classification
- Predictive hostel maintenance
- Cloud file storage improvements

> 📄 Full document: [`docs/requirements/scope.md`](./requirements/scope.md)

---

## 11. Assumptions

1. The hostel has designated wardens and staff members with defined responsibilities.
2. Each user (student, warden, or staff) has a unique account identified by their email address.
3. Students can only view and manage complaints they have personally submitted.
4. Staff members can only manage complaints that have been assigned to them.
5. The warden has full administrative authority over complaint management and mess services.
6. Complaint categories are predefined but can be expanded in future phases.
7. The weekly mess menu is managed centrally by the warden and applies to all students.
8. Warden and staff accounts are created by the system administrator; students self-register.

---

## 12. Constraints

1. The project is developed within a college academic timeline, which limits the depth and complexity of implementation.
2. The system is initially scoped for a **single hostel environment**. Multi-hostel support is a future consideration.
3. Free-tier or low-cost cloud services will be preferred for hosting and storage.
4. The system must remain simple enough to be evaluated, demonstrated, and maintained within an academic context.
5. The current implementation prioritizes the core complaint lifecycle and mess management workflows. Advanced features are deferred to future phases.

---

## 13. Requirements Traceability

All 22 functional requirements are mapped to:
- Their target module
- The user role they apply to
- Their planned implementation phase (Phase 3)

Authentication requirements are planned for Phase 2 (design/setup).

> 📄 Full document: [`docs/requirements/requirements-traceability.md`](./requirements/requirements-traceability.md)

---

## 14. Documentation Structure

```
docs/
├── requirements-analysis.md          ← This file (Phase 1 overview)
└── requirements/
    ├── problem-statement.md           ← Problem background and description
    ├── objectives.md                  ← 10 project objectives
    ├── stakeholders.md                ← 4 stakeholders (3 primary, 1 secondary)
    ├── functional-requirements.md     ← FR-01 through FR-22
    ├── non-functional-requirements.md ← NFR-01 through NFR-07
    ├── use-cases.md                   ← 24 use cases (Student, Warden, Staff)
    ├── use-case-diagram.md            ← Diagram specification and Mermaid definition
    ├── complaint-workflow.md          ← Full lifecycle with transition rules
    ├── scope.md                       ← In scope and future scope
    └── requirements-traceability.md   ← RTM connecting FR → Module → Role → Phase
```

---

## 15. Phase 1 Completion Checklist

| Item | Status |
|------|--------|
| Problem statement | ✅ Complete |
| Objectives (10) | ✅ Complete |
| Stakeholders identified (4) | ✅ Complete |
| Three user roles defined | ✅ Complete |
| Functional requirements numbered (FR-01–FR-22) | ✅ Complete |
| Non-functional requirements documented | ✅ Complete |
| Complaint lifecycle documented | ✅ Complete |
| Mess requirements documented | ✅ Complete |
| Use cases documented (24 use cases) | ✅ Complete |
| Use-case diagram specification | ✅ Complete |
| Scope defined | ✅ Complete |
| Future scope defined | ✅ Complete |
| Assumptions documented | ✅ Complete |
| Constraints documented | ✅ Complete |
| Requirements traceability created | ✅ Complete |
| Documentation stored inside docs/ | ✅ Complete |
| No Phase 2/3 implementation started | ✅ Confirmed |

---

> **Phase 1 is complete. Phase 2 (System Design and Architecture) may now begin when approved.**
