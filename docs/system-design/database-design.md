# Database Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

HostelFix uses **PostgreSQL** as the relational database, accessed through the **Prisma ORM**. This document defines all database entities (tables), their fields, data types, constraints, relationships, indexes, and enumerations.

The database design is derived directly from the Phase 1 functional requirements and the Phase 2 API design.

---

## Enumerations

### `Role`

Defines the three user roles in the system.

```
STUDENT   — Hostel student; can raise complaints, view mess menu
WARDEN    — Hostel authority; manages complaints and mess
STAFF     — Maintenance personnel; resolves assigned complaints
```

### `ComplaintStatus`

Defines all valid states in the complaint lifecycle.

```
PENDING       — Submitted, awaiting warden review
APPROVED      — Warden has approved the complaint
REJECTED      — Warden has rejected the complaint (terminal)
ASSIGNED      — Warden has assigned the complaint to staff
IN_PROGRESS   — Staff has begun work
RESOLVED      — Staff has completed work
CLOSED        — Warden has verified and closed the complaint (terminal)
```

### `ComplaintCategory`

Defines the fixed set of complaint categories for the current version.

```
ELECTRICAL
PLUMBING
CLEANING
FURNITURE
INTERNET
OTHER
```

> Additional categories may be introduced in a future version.

### `MealType`

Defines the meal slots in the mess menu.

```
BREAKFAST
LUNCH
DINNER
```

**Why enums?** Enums enforce a controlled vocabulary for values that must be consistent across the application. Using an enum prevents invalid values from being stored (e.g., "elec" instead of "ELECTRICAL"), ensures type safety in the Prisma schema, and makes filtering and comparisons reliable.

---

## Entity Definitions

---

### Entity: `User`

Represents all application users — students, wardens, and staff.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (CUID) | Primary Key, auto-generated | Unique user identifier |
| `name` | String | Not null | Full name of the user |
| `email` | String | Not null, **Unique** | Login identifier |
| `passwordHash` | String | Not null | bcrypt-hashed password |
| `role` | `Role` enum | Not null | STUDENT / WARDEN / STAFF |
| `roomNumber` | String | Nullable | Room number (Students only) |
| `hostelBlock` | String | Nullable | Hostel block (Students only) |
| `staffCategory` | String | Nullable | Work category of staff (e.g., "Electrician") |
| `createdAt` | DateTime | Not null, default: now() | Account creation timestamp |

**Constraints:**
- `email` must be unique across all users.
- `roomNumber` and `hostelBlock` are required for STUDENT accounts; nullable for WARDEN and STAFF.
- `staffCategory` is informational for STAFF accounts; nullable for others.
- `passwordHash` must never store plain text.

**Indexes:** `email` (unique index — enforces uniqueness and enables fast login lookup)

---

### Entity: `Complaint`

Represents a hostel complaint submitted by a student.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (CUID) | Primary Key, auto-generated | Unique complaint identifier |
| `studentId` | String | Not null, FK → User.id | The student who submitted the complaint |
| `category` | `ComplaintCategory` enum | Not null | Category of the complaint |
| `description` | String | Not null | Detailed description of the issue |
| `imageUrl` | String | Nullable | URL of optional attached image |
| `status` | `ComplaintStatus` enum | Not null, default: PENDING | Current lifecycle status |
| `assignedStaffId` | String | Nullable, FK → User.id | Staff member assigned to the complaint |
| `rejectionReason` | String | Nullable | Required when status = REJECTED; null otherwise |
| `deadlineAt` | DateTime | Nullable | Optional resolution deadline (future SLA use) |
| `createdAt` | DateTime | Not null, default: now() | Complaint submission timestamp |
| `updatedAt` | DateTime | Not null, auto-updated | Timestamp of most recent update |

**Constraints:**
- `studentId` must reference a valid User with role = STUDENT.
- `assignedStaffId` must reference a valid User with role = STAFF when set.
- `rejectionReason` is required (not null) when `status = REJECTED`; must be null for all other statuses.
- `status` must only contain valid `ComplaintStatus` enum values.
- `category` must only contain valid `ComplaintCategory` enum values.

**Indexes:**
- `studentId` — for filtering a student's own complaints
- `status` — for filtering by status across the system
- `assignedStaffId` — for fetching complaints assigned to a specific staff member
- `deadlineAt` — for future SLA deadline queries

---

### Entity: `StatusLog`

Records every status transition for a complaint, forming the complaint's audit trail and timeline.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (CUID) | Primary Key, auto-generated | Unique log entry identifier |
| `complaintId` | String | Not null, FK → Complaint.id | The complaint this log belongs to |
| `oldStatus` | `ComplaintStatus` enum | Nullable | Previous status (null for initial PENDING entry) |
| `newStatus` | `ComplaintStatus` enum | Not null | Status after the transition |
| `changedById` | String | Not null, FK → User.id | User who triggered the transition |
| `note` | String | Nullable | Optional note (e.g., rejection reason copy for display) |
| `timestamp` | DateTime | Not null, default: now() | When the transition occurred |

**Constraints:**
- `complaintId` must reference a valid Complaint.
- `changedById` must reference a valid User.
- Records are immutable — no StatusLog entry should ever be updated or deleted.

**Indexes:** `complaintId` — for efficiently retrieving all log entries for a complaint

---

### Entity: `MessMenu`

Represents a single meal entry in the weekly mess menu.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (CUID) | Primary Key, auto-generated | Unique menu entry identifier |
| `dayOfWeek` | String | Not null | Day the meal applies to (e.g., "Monday") |
| `mealType` | `MealType` enum | Not null | BREAKFAST / LUNCH / DINNER |
| `items` | String | Not null | Description of the meal items |
| `weekOf` | DateTime | Not null | The start date (Monday) of the week this menu applies to |

**Constraints:**
- A combination of `dayOfWeek + mealType + weekOf` should be unique to prevent duplicate menu entries for the same slot in the same week.

---

### Entity: `MenuFeedback`

Represents a feedback entry submitted by a student for a mess menu entry.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (CUID) | Primary Key, auto-generated | Unique feedback identifier |
| `messMenuId` | String | Not null, FK → MessMenu.id | The menu entry this feedback relates to |
| `studentId` | String | Not null, FK → User.id | The student who submitted the feedback |
| `rating` | Integer | Not null, min: 1, max: 5 | Numerical rating |
| `comment` | String | Nullable | Optional written comment |
| `createdAt` | DateTime | Not null, default: now() | Feedback submission timestamp |

**Constraints:**
- `messMenuId` must reference a valid MessMenu entry.
- `studentId` must reference a valid User with role = STUDENT.
- `rating` must be between 1 and 5 inclusive.

**Indexes:**
- `messMenuId` — for retrieving all feedback for a specific menu entry
- `studentId` — for filtering feedback by student

---

## Database Constraints Summary

| Constraint | Entity | Rule |
|---|---|---|
| Unique email | User | No two users may share the same email |
| FK: studentId | Complaint | Must reference existing User |
| FK: assignedStaffId | Complaint | Must reference existing User (role = STAFF) |
| FK: complaintId | StatusLog | Must reference existing Complaint |
| FK: changedById | StatusLog | Must reference existing User |
| FK: messMenuId | MenuFeedback | Must reference existing MessMenu |
| FK: studentId | MenuFeedback | Must reference existing User |
| Rating range | MenuFeedback | 1 ≤ rating ≤ 5 |
| Not null fields | All entities | Required fields cannot be stored as null |
| Enum values | Complaint, StatusLog, MessMenu, MenuFeedback | Only valid enum values accepted |
| Nullable rejectionReason | Complaint | Null unless status = REJECTED |

---

## Index Summary

| Table | Indexed Field | Reason |
|---|---|---|
| User | `email` | Fast login lookup; uniqueness enforcement |
| Complaint | `studentId` | Filter complaints by student |
| Complaint | `status` | Filter complaints by current status |
| Complaint | `assignedStaffId` | Filter complaints assigned to a staff member |
| Complaint | `deadlineAt` | Future SLA deadline queries |
| StatusLog | `complaintId` | Retrieve timeline entries for a complaint |
| MenuFeedback | `messMenuId` | Retrieve all feedback for a menu entry |
| MenuFeedback | `studentId` | Retrieve all feedback submitted by a student |
