# Requirements Traceability Matrix

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

The Requirements Traceability Matrix (RTM) maps each functional requirement to its module, the user role it relates to, and the planned implementation phase. This ensures that all requirements are accounted for during development and can be verified upon completion.

---

## Traceability Matrix

| Req. ID | Requirement Summary | Module | User Role | Planned Phase |
|---------|---------------------|--------|-----------|---------------|
| FR-01 | Student registration | Authentication | Student | Phase 2 |
| FR-02 | User login | Authentication | All Roles | Phase 2 |
| FR-03 | Role identification on login | Authentication | System | Phase 2 |
| FR-04 | Role-based access enforcement | Authentication | System | Phase 2 |
| FR-05 | Create new complaint | Complaint Management | Student | Phase 3 |
| FR-06 | Complaint category and description | Complaint Management | Student | Phase 3 |
| FR-07 | Attach evidence image to complaint | Complaint Management | Student | Phase 3 |
| FR-08 | Student views own complaints | Complaint Management | Student | Phase 3 |
| FR-09 | Warden views all complaints | Complaint Management | Warden | Phase 3 |
| FR-10 | Warden approves or rejects complaint | Complaint Management | Warden | Phase 3 |
| FR-11 | Warden assigns complaint to staff | Complaint Management | Warden | Phase 3 |
| FR-12 | Staff views assigned complaints | Complaint Management | Staff | Phase 3 |
| FR-13 | Staff updates complaint status | Complaint Management | Staff | Phase 3 |
| FR-14 | Warden closes resolved complaint | Complaint Management | Warden | Phase 3 |
| FR-15 | Complaint status history maintained | Complaint Management | System | Phase 3 |
| FR-16 | Warden manages weekly mess menu | Mess Management | Warden | Phase 3 |
| FR-17 | Student views mess menu | Mess Management | Student | Phase 3 |
| FR-18 | Student submits mess feedback | Mess Management | Student | Phase 3 |
| FR-19 | Warden views mess feedback summary | Mess Management | Warden | Phase 3 |
| FR-20 | Student dashboard | Dashboard | Student | Phase 3 |
| FR-21 | Warden dashboard | Dashboard | Warden | Phase 3 |
| FR-22 | Staff dashboard | Dashboard | Staff | Phase 3 |

---

## Phase Definitions

| Phase | Description |
|-------|-------------|
| **Phase 1** | Requirement Analysis — problem statement, objectives, stakeholders, functional and non-functional requirements, use cases, workflow, scope, assumptions, and constraints. *(Current phase)* |
| **Phase 2** | System Design and Architecture — database schema design, API design, technology stack selection, authentication architecture, and project setup. |
| **Phase 3** | Implementation — full system development including authentication, complaint management, mess management, dashboards, and the complaint lifecycle. |
| **Phase 4** *(Future)* | Testing, deployment, and potential enhancements from the future scope list. |

---

## Traceability to Non-Functional Requirements

| NFR ID | Description | Category | Verified In |
|--------|-------------|----------|-------------|
| NFR-01.1 | Passwords stored as hashed values | Security | Phase 3 |
| NFR-01.2 | Protected routes require authentication | Security | Phase 3 |
| NFR-01.3 | Role-based access enforced server-side | Security | Phase 3 |
| NFR-01.4 | Users cannot access other roles' functionality | Security | Phase 3 |
| NFR-01.5 | Students access only own complaint data | Security | Phase 3 |
| NFR-02.1 | Simple and intuitive UI | Usability | Phase 3 |
| NFR-02.2 | Clear persistent navigation | Usability | Phase 3 |
| NFR-02.3 | Status displayed with visual indicators | Usability | Phase 3 |
| NFR-02.4 | Plain-language error messages | Usability | Phase 3 |
| NFR-02.5 | Confirmation messages on successful actions | Usability | Phase 3 |
| NFR-03.1 | Operations complete in reasonable time | Performance | Phase 3 |
| NFR-03.2 | Dashboard loads only relevant data | Performance | Phase 3 |
| NFR-03.3 | Complaint listings are paginated or limited | Performance | Phase 3 |
| NFR-04.1 | Complaint records stored persistently | Reliability | Phase 3 |
| NFR-04.2 | Status history preserved on every transition | Reliability | Phase 3 |
| NFR-04.3 | All inputs validated before processing | Reliability | Phase 3 |
| NFR-05.1 | Modular frontend-backend-database architecture | Maintainability | Phase 2 |
| NFR-05.2 | Feature-based code organization | Maintainability | Phase 2 |
| NFR-05.3 | Consistent naming conventions | Maintainability | Phase 2–3 |
| NFR-06.1 | Additional hostel blocks supportable | Scalability | Phase 2 |
| NFR-06.2 | Additional staff can be added without changes | Scalability | Phase 3 |
| NFR-06.3 | Complaint categories manageable without code changes | Scalability | Phase 2–3 |
| NFR-07.1 | Responsive on laptop/desktop | Responsiveness | Phase 3 |
| NFR-07.2 | Usable on mobile and tablet | Responsiveness | Phase 3 |
| NFR-07.3 | Compatible with Chrome, Firefox, Edge | Responsiveness | Phase 3 |

---

## Traceability to Use Cases

| Use Case ID | Related FR IDs | Actor |
|-------------|---------------|-------|
| UC-S01 | FR-01 | Student |
| UC-S02 | FR-02, FR-03, FR-04 | Student |
| UC-S03 | FR-05, FR-06, FR-07 | Student |
| UC-S04 | FR-08, FR-20 | Student |
| UC-S05 | FR-08 | Student |
| UC-S06 | FR-15 | Student |
| UC-S07 | FR-17 | Student |
| UC-S08 | FR-18 | Student |
| UC-S09 | — | Student |
| UC-W01 | FR-02, FR-03, FR-04 | Warden |
| UC-W02 | FR-09, FR-21 | Warden |
| UC-W03 | FR-10 | Warden |
| UC-W04 | FR-10 | Warden |
| UC-W05 | FR-11 | Warden |
| UC-W06 | FR-09, FR-15 | Warden |
| UC-W07 | FR-14 | Warden |
| UC-W08 | FR-16 | Warden |
| UC-W09 | FR-19 | Warden |
| UC-W10 | — | Warden |
| UC-ST01 | FR-02, FR-03, FR-04 | Staff |
| UC-ST02 | FR-12, FR-22 | Staff |
| UC-ST03 | FR-13 | Staff |
| UC-ST04 | FR-13 | Staff |
| UC-ST05 | — | Staff |

---

## Coverage Summary

| Category | Total Requirements | Covered by Phase 3 |
|----------|-------------------|-------------------|
| Functional Requirements | 22 | 22 |
| Non-Functional Requirements | 23 | 23 |
| Use Cases | 24 | 24 |

All functional requirements defined in Phase 1 are planned for implementation in Phase 3. All non-functional requirements will be addressed across Phase 2 (architecture decisions) and Phase 3 (implementation).

---

## Notes

- This matrix will be updated as Phase 2 (design) and Phase 3 (implementation) progress.
- Any requirement added or modified after Phase 1 must be reflected in this matrix.
- All requirement IDs (FR-01 through FR-22, NFR-01 through NFR-07) are consistent across all Phase 1 documentation.
