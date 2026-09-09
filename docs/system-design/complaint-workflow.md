# Complaint Workflow Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document defines the complaint state machine, valid transitions, actor responsibilities for each transition, and the data flows for complaint creation, assignment, and resolution. The backend must enforce all transition rules — invalid transitions are rejected with a `400 Bad Request` response.

---

## Complaint State Machine

### States

| State | Description |
|---|---|
| `PENDING` | Complaint submitted by student; awaiting warden review |
| `APPROVED` | Warden confirmed the complaint is valid |
| `REJECTED` | Warden determined the complaint is invalid or out of scope |
| `ASSIGNED` | Warden assigned complaint to a specific staff member |
| `IN_PROGRESS` | Staff has begun active work on the complaint |
| `RESOLVED` | Staff has completed the work |
| `CLOSED` | Warden has verified the resolution and officially closed the complaint |

### State Diagram

```
                  ┌─────────────────────────┐
                  │         PENDING         │  ← set on complaint creation
                  └──────────┬──────────────┘
                             │
              ┌──────────────┼──────────────────┐
              │ Warden       │                  │ Warden
              ▼              │                  ▼
     ┌──────────────┐        │        ┌──────────────────┐
     │   APPROVED   │        │        │    REJECTED      │ ← terminal
     └──────┬───────┘        │        └──────────────────┘
            │ Warden         │
            ▼                │
     ┌──────────────┐        │
     │   ASSIGNED   │        │
     └──────┬───────┘        │
            │ Staff          │
            ▼                │
     ┌──────────────┐        │
     │  IN_PROGRESS │        │
     └──────┬───────┘        │
            │ Staff          │
            ▼                │
     ┌──────────────┐        │
     │   RESOLVED   │        │
     └──────┬───────┘        │
            │ Warden         │
            ▼                │
     ┌──────────────┐        │
     │    CLOSED    │ ← terminal
     └──────────────┘
```

---

## Valid Transitions

| From | To | Actor | Additional Action |
|------|----|-------|-------------------|
| `PENDING` | `APPROVED` | Warden | Create StatusLog entry |
| `PENDING` | `REJECTED` | Warden | Save `rejectionReason`; Create StatusLog entry |
| `APPROVED` | `ASSIGNED` | Warden | Save `assignedStaffId`; Create StatusLog entry |
| `ASSIGNED` | `IN_PROGRESS` | Assigned Staff | Create StatusLog entry |
| `IN_PROGRESS` | `RESOLVED` | Assigned Staff | Create StatusLog entry |
| `RESOLVED` | `CLOSED` | Warden | Create StatusLog entry |

> **All other transitions are invalid and must be rejected by the backend with HTTP 400 Bad Request.**

---

## Invalid Transition Examples

The following examples must be rejected by the system:

| Attempted Transition | Actor | Rejection Reason |
|---|---|---|
| `PENDING → CLOSED` | Any | Skips intermediate states |
| `PENDING → IN_PROGRESS` | Any | Invalid sequence |
| `APPROVED → RESOLVED` | Any | Cannot skip ASSIGNED and IN_PROGRESS |
| `REJECTED → APPROVED` | Warden | Rejected is terminal |
| `CLOSED → any` | Any | Closed is terminal |
| `PENDING → APPROVED` | Student | Student cannot change status |
| `PENDING → APPROVED` | Staff | Staff cannot approve |
| `RESOLVED → CLOSED` | Student | Student cannot close |
| `RESOLVED → CLOSED` | Staff | Staff cannot close |
| `ASSIGNED → IN_PROGRESS` | Other Staff | Staff can only update their own assigned complaint |

---

## Complaint Creation Flow

```
Student
  │
  ▼
Raise Complaint Form
  │  { category, description, imageUrl? }
  ▼
POST /api/complaints
  │
  ▼
verifyToken + requireRole('STUDENT')
  │
  ▼
Validate: category ∈ [ELECTRICAL, PLUMBING, CLEANING, FURNITURE, INTERNET, OTHER]
Validate: description is not empty
  │  ← Validation fails? → 400 Bad Request
  ▼
Create Complaint record
  │  status = PENDING
  │  studentId = req.user.userId
  │  createdAt = now
  ▼
Create StatusLog record
  │  complaintId = new complaint id
  │  oldStatus = null
  │  newStatus = PENDING
  │  changedById = req.user.userId
  │  timestamp = now
  ▼
Return complaint (201 Created)
  │
  ▼
Student Dashboard updates
```

---

## Complaint Approval Flow

```
Warden
  │
  ▼
View Complaint (status = PENDING)
  │
  ▼
Click "Approve"
  │
  ▼
PATCH /api/complaints/:id/approve
  │
  ▼
verifyToken + requireRole('WARDEN')
  │
  ▼
Fetch complaint by id
  │  ← Not found? → 404
  │
  ▼
Verify current status = PENDING
  │  ← Not PENDING? → 400 Invalid transition
  ▼
Update Complaint status = APPROVED
  │
  ▼
Create StatusLog (PENDING → APPROVED, changedById = warden id)
  │
  ▼
Return updated complaint (200 OK)
```

---

## Complaint Rejection Flow

```
Warden
  │
  ▼
View Complaint (status = PENDING)
  │
  ▼
Click "Reject" + enter reason
  │  { rejectionReason: "..." }
  ▼
PATCH /api/complaints/:id/reject
  │
  ▼
verifyToken + requireRole('WARDEN')
  │
  ▼
Validate: rejectionReason is not empty
  │  ← Missing? → 400 Bad Request
  ▼
Verify current status = PENDING
  │  ← Not PENDING? → 400 Invalid transition
  ▼
Update Complaint:
  │  status = REJECTED
  │  rejectionReason = provided reason
  ▼
Create StatusLog (PENDING → REJECTED, changedById = warden id)
  │
  ▼
Return updated complaint (200 OK)
```

---

## Complaint Assignment Flow

```
Warden
  │
  ▼
View Complaint (status = APPROVED)
  │
  ▼
Select staff member from list
  │  { staffId: "..." }
  ▼
PATCH /api/complaints/:id/assign
  │
  ▼
verifyToken + requireRole('WARDEN')
  │
  ▼
Validate: staffId provided
Validate: User with staffId exists and has role = STAFF
  │  ← Invalid staff? → 400 Bad Request
  ▼
Verify current status = APPROVED
  │  ← Not APPROVED? → 400 Invalid transition
  ▼
Update Complaint:
  │  status = ASSIGNED
  │  assignedStaffId = provided staffId
  ▼
Create StatusLog (APPROVED → ASSIGNED, changedById = warden id)
  │
  ▼
Return updated complaint (200 OK)
  │
  ▼
Complaint appears in Staff dashboard
```

---

## Status Update Flow (Staff)

```
Staff
  │
  ▼
View Assigned Complaint
  │
  ▼
Click "Mark In Progress" or "Mark Resolved"
  │  { status: "IN_PROGRESS" | "RESOLVED" }
  ▼
PATCH /api/complaints/:id/status
  │
  ▼
verifyToken + requireRole('STAFF')
  │
  ▼
Fetch complaint by id
  │  ← Not found? → 404
  ▼
Verify complaint.assignedStaffId = req.user.userId
  │  ← Not assigned to this staff? → 403 Forbidden
  ▼
Validate transition:
  ASSIGNED → IN_PROGRESS     ✅
  IN_PROGRESS → RESOLVED     ✅
  anything else              ❌ → 400 Bad Request
  │
  ▼
Update Complaint status
  │
  ▼
Create StatusLog (oldStatus → newStatus, changedById = staff id)
  │
  ⚠  Note: Complaint update and StatusLog creation should use a
     database transaction in Phase 3 to ensure atomicity.
  │
  ▼
Return updated complaint (200 OK)
```

---

## Complaint Closure Flow

```
Warden
  │
  ▼
View Complaint (status = RESOLVED)
  │
  ▼
Click "Close Complaint"
  │
  ▼
PATCH /api/complaints/:id/close   ← (implemented as status update by Warden)
  │
  ▼
verifyToken + requireRole('WARDEN')
  │
  ▼
Verify current status = RESOLVED
  │  ← Not RESOLVED? → 400 Invalid transition
  ▼
Update Complaint status = CLOSED
  │
  ▼
Create StatusLog (RESOLVED → CLOSED, changedById = warden id)
  │
  ▼
Return updated complaint (200 OK)
```

---

## StatusLog Record

Every status transition creates one StatusLog record:

```
StatusLog {
  id          : auto-generated
  complaintId : the complaint being updated
  oldStatus   : previous status (null for initial PENDING creation)
  newStatus   : new status
  changedById : the user who made the change (student, warden, or staff)
  timestamp   : datetime of the change
}
```

The StatusLog is read-only after creation. No user may edit or delete StatusLog entries. The student can view the full StatusLog for their own complaints as a chronological timeline.
