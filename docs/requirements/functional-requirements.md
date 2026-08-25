# Functional Requirements

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

Functional requirements define what the system shall do. Each requirement is uniquely identified, assigned to a module, and linked to the user role responsible for or affected by it. Role-based access must be enforced by the system for all requirements marked with a specific role.

---

## Module 1: Authentication

| ID | Requirement | Actor | Priority |
|----|-------------|-------|----------|
| FR-01 | The system shall allow a student to register a new account by providing their name, email address, room number, hostel block, and a password. **Note:** `roomNumber` and `hostelBlock` are part of the Student profile and must be included in the database design in Phase 2. | Student | High |
| FR-02 | The system shall allow registered users (Student, Warden, Staff) to log in using their email address and password. | All Roles | High |
| FR-03 | The system shall identify the authenticated user's role upon login and apply role-specific access accordingly. | System | High |
| FR-04 | The system shall restrict access to any functionality not permitted for the authenticated user's role. Unauthorized access attempts shall be denied. | System | High |

---

## Module 2: Complaint Management

| ID | Requirement | Actor | Priority |
|----|-------------|-------|----------|
| FR-05 | The system shall allow an authenticated student to create a new complaint. | Student | High |
| FR-06 | When creating a complaint, the student shall be required to select a complaint category and provide a description of the issue. Complaint categories are fixed for the current version: **ELECTRICAL**, **PLUMBING**, **CLEANING**, **FURNITURE**, **INTERNET**, **OTHER**. | Student | High |
| FR-07 | The system shall allow a student to optionally attach an image as evidence when submitting a complaint. | Student | Medium |
| FR-08 | The system shall allow a student to view the list of all complaints they have personally submitted. The system should use reasonable data limits when retrieving complaint lists to avoid unnecessarily large responses. Full pagination may be implemented in a future version. | Student | High |
| FR-09 | The system shall allow an authenticated warden to view all complaints submitted by all students. The system should use reasonable data limits when retrieving complaint lists to avoid unnecessarily large responses. Full pagination may be implemented in a future version. | Warden | High |
| FR-10 | The system shall allow the warden to approve or reject a complaint that is in **Pending** status. The warden shall provide a reason when rejecting a complaint. **Note:** The future database design must include a `rejectionReason` field (nullable text) on the Complaint record. This field is only required when a complaint is rejected; it shall be `null` for all other statuses. | Warden | High |
| FR-11 | The system shall allow the warden to assign an **Approved** complaint to a specific staff member. | Warden | High |
| FR-12 | The system shall allow an authenticated staff member to view all complaints assigned to them. | Staff | High |
| FR-13 | The system shall allow a staff member to update the status of a complaint assigned to them (e.g., mark as In Progress or Resolved). | Staff | High |
| FR-14 | The system shall allow the warden to close a complaint that has been marked as **Resolved** by staff, after verifying the resolution. | Warden | High |
| FR-15 | The system shall maintain a complete status history for every complaint, recording each status change along with the timestamp and the user who made the change. | System | High |

---

## Module 3: Complaint Status Lifecycle

The complaint lifecycle defines the valid states a complaint can pass through and who is responsible for each transition.

### Status Definitions

| Status | Description | Responsible Party |
|--------|-------------|-------------------|
| **Pending** | Complaint has been submitted by a student and is awaiting warden review. | System (on submission) |
| **Approved** | Warden has reviewed and approved the complaint. | Warden |
| **Rejected** | Warden has reviewed and rejected the complaint. No further action is taken. | Warden |
| **Assigned** | Warden has assigned the approved complaint to a specific staff member. | Warden |
| **In Progress** | Staff member has acknowledged the complaint and begun work. | Staff |
| **Resolved** | Staff member has completed the work and marked the complaint as resolved. | Staff |
| **Closed** | Warden has verified the resolution and officially closed the complaint. | Warden |

### Valid Transitions

```
Student submits complaint
        ↓
   [Pending]
        ↓
  Warden reviews
   ↙         ↘
[Approved]  [Rejected]
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
  Warden verifies
        ↓
   [Closed]
```

### Transition Rules

- A complaint **must not** skip states arbitrarily.
- Only the designated actor may trigger each transition.
- A **Rejected** complaint is terminal — it cannot be reopened or reassigned.
- A **Closed** complaint is terminal — it cannot be reopened.
- Only **Approved** complaints may be assigned to staff.
- Only **Assigned** or **In Progress** complaints may be updated by staff.
- Only **Resolved** complaints may be closed by the warden.

---

## Module 4: Mess Management

| ID | Requirement | Actor | Priority |
|----|-------------|-------|----------|
| FR-16 | The system shall allow the warden to create and update the weekly mess menu, specifying meals for each day of the week (breakfast, lunch, dinner, or as applicable). | Warden | High |
| FR-17 | The system shall allow an authenticated student to view the current weekly mess menu. | Student | High |
| FR-18 | The system shall allow an authenticated student to submit a feedback entry consisting of a rating and an optional written comment for mess services. | Student | Medium |
| FR-19 | The system shall allow the warden to view a summarized view of mess feedback submitted by students. | Warden | Medium |

---

## Module 5: Dashboard

| ID | Requirement | Actor | Priority |
|----|-------------|-------|----------|
| FR-20 | The system shall provide a student dashboard that displays a summary of the student's submitted complaints grouped by status. | Student | High |
| FR-21 | The system shall provide a warden dashboard that displays a summary of all hostel complaints by status, and basic complaint counts. | Warden | High |
| FR-22 | The system shall provide a staff dashboard that displays all complaints currently assigned to the logged-in staff member. | Staff | High |

---

## Functional Requirements Summary

| ID | Module | Actor | Priority |
|----|--------|-------|----------|
| FR-01 | Authentication | Student | High |
| FR-02 | Authentication | All | High |
| FR-03 | Authentication | System | High |
| FR-04 | Authentication | System | High |
| FR-05 | Complaint Management | Student | High |
| FR-06 | Complaint Management | Student | High |
| FR-07 | Complaint Management | Student | Medium |
| FR-08 | Complaint Management | Student | High |
| FR-09 | Complaint Management | Warden | High |
| FR-10 | Complaint Management | Warden | High |
| FR-11 | Complaint Management | Warden | High |
| FR-12 | Complaint Management | Staff | High |
| FR-13 | Complaint Management | Staff | High |
| FR-14 | Complaint Management | Warden | High |
| FR-15 | Complaint Management | System | High |
| FR-16 | Mess Management | Warden | High |
| FR-17 | Mess Management | Student | High |
| FR-18 | Mess Management | Student | Medium |
| FR-19 | Mess Management | Warden | Medium |
| FR-20 | Dashboard | Student | High |
| FR-21 | Dashboard | Warden | High |
| FR-22 | Dashboard | Staff | High |

---

## Notes

- All **High** priority requirements are considered mandatory for the core system.
- **Medium** priority requirements enhance usability and feedback capability but do not block core complaint management.
- Role-based access control must enforce all role restrictions listed in this document. No user shall be able to perform actions outside their defined role permissions.
