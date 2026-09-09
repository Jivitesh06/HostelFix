# API Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document defines the complete REST API design for HostelFix. Each endpoint specifies the HTTP method, path, authentication requirement, permitted role, request body, success response, and possible error responses.

All responses use the standard envelope:
- Success: `{ "success": true, "data": { ... } }`
- Error: `{ "success": false, "message": "..." }`

Authentication is provided via the `Authorization: Bearer <token>` header.

---

## Base URL

```
/api
```

---

## Authentication Endpoints

---

### POST /api/auth/register

**Description:** Register a new student account.

**Auth required:** No (public)

**Permitted roles:** None (Student self-registration only)

**Request Body:**

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@college.edu",
  "password": "securepassword123",
  "roomNumber": "A-204",
  "hostelBlock": "Block A"
}
```

**Success Response — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "clx1abc123",
    "name": "Rahul Sharma",
    "email": "rahul@college.edu",
    "role": "STUDENT"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing required field | "Name, email, password, room number, and hostel block are required" |
| 409 | Email already registered | "An account with this email already exists" |
| 500 | Server error | "An internal server error occurred" |

---

### POST /api/auth/login

**Description:** Authenticate a user and return a JWT.

**Auth required:** No (public)

**Permitted roles:** All

**Request Body:**

```json
{
  "email": "rahul@college.edu",
  "password": "securepassword123"
}
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1abc123",
      "name": "Rahul Sharma",
      "email": "rahul@college.edu",
      "role": "STUDENT"
    }
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing email or password | "Email and password are required" |
| 401 | Invalid credentials | "Invalid email or password" |

---

### GET /api/auth/me

**Description:** Return the currently authenticated user's profile.

**Auth required:** Yes

**Permitted roles:** All

**Request Body:** None

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx1abc123",
    "name": "Rahul Sharma",
    "email": "rahul@college.edu",
    "role": "STUDENT",
    "roomNumber": "A-204",
    "hostelBlock": "Block A"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 401 | Missing or invalid token | "Authentication required" |

---

## Complaint Endpoints

---

### POST /api/complaints

**Description:** Create a new complaint. Initial status is always PENDING.

**Auth required:** Yes

**Permitted roles:** STUDENT

**Request Body:**

```json
{
  "category": "PLUMBING",
  "description": "Bathroom pipe is leaking and causing flooding.",
  "imageUrl": "https://storage.example.com/evidence.jpg"
}
```

**Success Response — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "category": "PLUMBING",
    "description": "Bathroom pipe is leaking and causing flooding.",
    "imageUrl": "https://storage.example.com/evidence.jpg",
    "status": "PENDING",
    "studentId": "clx1abc123",
    "createdAt": "2026-08-25T04:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing category or description | "Category and description are required" |
| 400 | Invalid category value | "Invalid complaint category" |
| 401 | Not authenticated | "Authentication required" |
| 403 | Role not STUDENT | "You do not have permission to perform this action" |

---

### GET /api/complaints

**Description:** Retrieve complaints. Students see their own; Wardens see all.

**Auth required:** Yes

**Permitted roles:** STUDENT, WARDEN

**Query Parameters (optional):**

| Param | Description |
|---|---|
| `status` | Filter by status (e.g., `?status=PENDING`) |
| `category` | Filter by category |

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx2def456",
      "category": "PLUMBING",
      "description": "Bathroom pipe is leaking...",
      "status": "PENDING",
      "createdAt": "2026-08-25T04:00:00.000Z",
      "student": {
        "name": "Rahul Sharma",
        "roomNumber": "A-204",
        "hostelBlock": "Block A"
      }
    }
  ]
}
```

**Notes:**
- STUDENT: response contains only their own complaints.
- WARDEN: response contains all complaints from all students.
- Reasonable data limits are applied; full pagination is a future enhancement.

---

### GET /api/complaints/:id

**Description:** Retrieve a single complaint with full details and status history.

**Auth required:** Yes

**Permitted roles:** STUDENT (own only), WARDEN (any), STAFF (assigned only)

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "category": "PLUMBING",
    "description": "Bathroom pipe is leaking...",
    "imageUrl": null,
    "status": "IN_PROGRESS",
    "rejectionReason": null,
    "createdAt": "2026-08-25T04:00:00.000Z",
    "updatedAt": "2026-08-25T06:00:00.000Z",
    "student": { "name": "Rahul Sharma", "roomNumber": "A-204" },
    "assignedStaff": { "name": "Mohan Lal", "staffCategory": "Plumber" },
    "statusHistory": [
      {
        "oldStatus": null,
        "newStatus": "PENDING",
        "changedBy": { "name": "Rahul Sharma" },
        "timestamp": "2026-08-25T04:00:00.000Z"
      },
      {
        "oldStatus": "PENDING",
        "newStatus": "APPROVED",
        "changedBy": { "name": "Dr. Warden" },
        "timestamp": "2026-08-25T05:00:00.000Z"
      },
      {
        "oldStatus": "APPROVED",
        "newStatus": "ASSIGNED",
        "changedBy": { "name": "Dr. Warden" },
        "timestamp": "2026-08-25T05:30:00.000Z"
      },
      {
        "oldStatus": "ASSIGNED",
        "newStatus": "IN_PROGRESS",
        "changedBy": { "name": "Mohan Lal" },
        "timestamp": "2026-08-25T06:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 403 | Student accessing another's complaint | "Access denied" |
| 403 | Staff accessing unassigned complaint | "This complaint is not assigned to you" |
| 404 | Complaint not found | "Complaint not found" |

---

### PATCH /api/complaints/:id/approve

**Description:** Warden approves a PENDING complaint.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:** None

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "status": "APPROVED",
    "updatedAt": "2026-08-25T05:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Complaint not in PENDING status | "Invalid status transition from [status] to APPROVED" |
| 404 | Complaint not found | "Complaint not found" |

---

### PATCH /api/complaints/:id/reject

**Description:** Warden rejects a PENDING complaint with a reason.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:**

```json
{
  "rejectionReason": "This issue has already been addressed. Please verify before re-submitting."
}
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "status": "REJECTED",
    "rejectionReason": "This issue has already been addressed.",
    "updatedAt": "2026-08-25T05:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing rejection reason | "A rejection reason is required" |
| 400 | Complaint not in PENDING status | "Invalid status transition from [status] to REJECTED" |
| 404 | Complaint not found | "Complaint not found" |

---

### PATCH /api/complaints/:id/assign

**Description:** Warden assigns an APPROVED complaint to a staff member.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:**

```json
{
  "staffId": "clxstaff789"
}
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "status": "ASSIGNED",
    "assignedStaffId": "clxstaff789",
    "updatedAt": "2026-08-25T05:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Missing staffId | "Staff ID is required" |
| 400 | staffId is not a valid STAFF user | "Invalid staff member" |
| 400 | Complaint not in APPROVED status | "Invalid status transition from [status] to ASSIGNED" |
| 404 | Complaint not found | "Complaint not found" |

---

### PATCH /api/complaints/:id/status

**Description:** Staff updates the status of an assigned complaint (IN_PROGRESS or RESOLVED).

**Auth required:** Yes

**Permitted roles:** STAFF

**Request Body:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Valid values for `status`:** `IN_PROGRESS`, `RESOLVED`

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-08-25T06:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Invalid status value | "Invalid status value" |
| 400 | Invalid transition | "Invalid status transition from [status] to [newStatus]" |
| 403 | Complaint not assigned to this staff | "This complaint is not assigned to you" |
| 404 | Complaint not found | "Complaint not found" |

---

### PATCH /api/complaints/:id/close

**Description:** Warden closes a RESOLVED complaint.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:** None

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "status": "CLOSED",
    "updatedAt": "2026-08-25T08:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Complaint not in RESOLVED status | "Only resolved complaints can be closed" |
| 404 | Complaint not found | "Complaint not found" |

---

## Mess Endpoints

---

### GET /api/mess

**Description:** Retrieve the current weekly mess menu.

**Auth required:** Yes

**Permitted roles:** All

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxmenu001",
      "dayOfWeek": "Monday",
      "mealType": "BREAKFAST",
      "items": "Idli, Sambar, Coconut Chutney",
      "weekOf": "2026-08-24T00:00:00.000Z"
    },
    {
      "id": "clxmenu002",
      "dayOfWeek": "Monday",
      "mealType": "LUNCH",
      "items": "Dal, Rice, Roti, Mixed Vegetables",
      "weekOf": "2026-08-24T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/mess

**Description:** Warden creates a new mess menu entry.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:**

```json
{
  "dayOfWeek": "Monday",
  "mealType": "BREAKFAST",
  "items": "Idli, Sambar, Coconut Chutney",
  "weekOf": "2026-08-24"
}
```

**Success Response — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "clxmenu001",
    "dayOfWeek": "Monday",
    "mealType": "BREAKFAST",
    "items": "Idli, Sambar, Coconut Chutney",
    "weekOf": "2026-08-24T00:00:00.000Z"
  }
}
```

---

### PUT /api/mess/:id

**Description:** Warden updates an existing mess menu entry.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Request Body:**

```json
{
  "items": "Poha, Boiled Eggs, Tea"
}
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "clxmenu001",
    "items": "Poha, Boiled Eggs, Tea"
  }
}
```

---

### DELETE /api/mess/:id

**Description:** Warden deletes a mess menu entry.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": { "message": "Menu entry deleted" }
}
```

---

### POST /api/mess/:id/feedback

**Description:** Student submits feedback for a specific mess menu entry.

**Auth required:** Yes

**Permitted roles:** STUDENT

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Food was good today, but sambar was a bit salty."
}
```

**Success Response — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "clxfb001",
    "messMenuId": "clxmenu001",
    "studentId": "clx1abc123",
    "rating": 4,
    "comment": "Food was good today, but sambar was a bit salty.",
    "createdAt": "2026-08-25T07:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Message |
|---|---|---|
| 400 | Rating not provided | "Rating is required" |
| 400 | Rating out of range | "Rating must be between 1 and 5" |
| 404 | Menu entry not found | "Menu entry not found" |

---

### GET /api/mess/feedback

**Description:** Warden retrieves summarized feedback from students.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxfb001",
      "rating": 4,
      "comment": "Food was good today.",
      "createdAt": "2026-08-25T07:00:00.000Z",
      "student": { "name": "Rahul Sharma", "roomNumber": "A-204" },
      "messMenu": { "dayOfWeek": "Monday", "mealType": "BREAKFAST" }
    }
  ]
}
```

---

## Analytics Endpoint (Future — Not Implemented in Phase 3)

### GET /api/analytics/summary

**Description:** Returns basic complaint statistics for the warden. Designed for future implementation.

**Auth required:** Yes

**Permitted roles:** WARDEN

**Planned Response shape:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "PENDING": 5,
      "APPROVED": 3,
      "ASSIGNED": 8,
      "IN_PROGRESS": 10,
      "RESOLVED": 12,
      "CLOSED": 6,
      "REJECTED": 1
    }
  }
}
```

> This endpoint is designed but will not be implemented in Phase 3. The Warden dashboard may derive basic statistics from the `GET /api/complaints` response instead.

---

## API Endpoint Summary

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Student registration |
| POST | `/api/auth/login` | Public | Login + JWT |
| GET | `/api/auth/me` | All | Current user profile |
| POST | `/api/complaints` | Student | Create complaint |
| GET | `/api/complaints` | Student, Warden | List complaints |
| GET | `/api/complaints/:id` | Student, Warden, Staff | Single complaint |
| PATCH | `/api/complaints/:id/approve` | Warden | Approve complaint |
| PATCH | `/api/complaints/:id/reject` | Warden | Reject complaint |
| PATCH | `/api/complaints/:id/assign` | Warden | Assign staff |
| PATCH | `/api/complaints/:id/status` | Staff | Update status |
| PATCH | `/api/complaints/:id/close` | Warden | Close complaint |
| GET | `/api/mess` | All | View mess menu |
| POST | `/api/mess` | Warden | Create menu entry |
| PUT | `/api/mess/:id` | Warden | Update menu entry |
| DELETE | `/api/mess/:id` | Warden | Delete menu entry |
| POST | `/api/mess/:id/feedback` | Student | Submit feedback |
| GET | `/api/mess/feedback` | Warden | View feedback |
| GET | `/api/analytics/summary` | Warden | Future only |
