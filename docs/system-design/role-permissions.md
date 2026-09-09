# Role-Permission Matrix

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

HostelFix defines three user roles: **Student**, **Warden**, and **Staff**. Each role has a specific set of permitted actions. Permissions are enforced on the backend API — the frontend may conditionally render UI elements by role, but no permission is enforced by the frontend alone.

---

## Permission Matrix

| Feature | Student | Warden | Staff |
|---------|---------|--------|-------|
| Register | ✅ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ |
| Create Complaint | ✅ | ❌ | ❌ |
| View Own Complaints | ✅ | ❌ | ❌ |
| View All Complaints | ❌ | ✅ | ❌ |
| Approve Complaint | ❌ | ✅ | ❌ |
| Reject Complaint | ❌ | ✅ | ❌ |
| Assign Staff to Complaint | ❌ | ✅ | ❌ |
| View Assigned Complaints | ❌ | ❌ | ✅ |
| Update Assigned Complaint Status | ❌ | ❌ | ✅ |
| Close Complaint | ❌ | ✅ | ❌ |
| View Mess Menu | ✅ | ✅ | ✅ |
| Manage Mess Menu | ❌ | ✅ | ❌ |
| Submit Mess Feedback | ✅ | ❌ | ❌ |
| View Mess Feedback Summary | ❌ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |

---

## Permission Details by Role

### Student

Students are hostel residents who initiate the complaint process and consume mess-related information.

| Permitted Action | Notes |
|---|---|
| Register | Self-service; no admin approval required |
| Login | With email and password |
| Create Complaint | Requires authentication; creates with PENDING status |
| View Own Complaints | Can only see complaints they personally submitted |
| View Mess Menu | Read-only access to the published weekly menu |
| Submit Mess Feedback | One feedback entry per student (future enforcement) |
| View Dashboard | Student-specific dashboard showing their own complaint summary |

**Restrictions:**
- A student cannot view another student's complaints.
- A student cannot change the status of any complaint.
- A student cannot access warden or staff functionality.

---

### Warden

The warden is the administrative authority responsible for complaint oversight and mess management.

| Permitted Action | Notes |
|---|---|
| Login | Pre-created warden account |
| View All Complaints | Full visibility of all submitted complaints |
| Approve Complaint | From PENDING → APPROVED |
| Reject Complaint | From PENDING → REJECTED; rejection reason required |
| Assign Staff | From APPROVED → ASSIGNED; selects staff member |
| Close Complaint | From RESOLVED → CLOSED after verifying resolution |
| View Mess Menu | Read access to the current menu |
| Manage Mess Menu | Create and update the weekly mess menu |
| View Mess Feedback Summary | View ratings and comments submitted by students |
| View Dashboard | Warden dashboard with hostel-wide complaint statistics |

**Restrictions:**
- Warden cannot submit complaints.
- Warden cannot update the In Progress or Resolved status directly (reserved for Staff).
- Warden cannot submit mess feedback.

---

### Staff

Staff members are maintenance personnel who handle assigned complaints.

| Permitted Action | Notes |
|---|---|
| Login | Pre-created staff account |
| View Assigned Complaints | Can only see complaints assigned to them |
| Update Assigned Complaint Status | ASSIGNED → IN_PROGRESS or IN_PROGRESS → RESOLVED |
| View Mess Menu | Read-only access |
| View Dashboard | Staff dashboard showing their assigned complaint list |

**Restrictions:**
- Staff cannot approve, reject, assign, or close complaints.
- Staff cannot see complaints that are not assigned to them.
- Staff cannot manage the mess menu or view feedback.

---

## Backend Enforcement Rule

> **All permissions listed above must be enforced by the Express.js backend through authentication middleware and role authorization middleware. The frontend may hide or show UI elements based on role for usability, but no permission is considered enforced until the backend validates it independently.**

### Enforcement Pattern

Every protected API endpoint applies the following middleware chain:

```
Request
   ↓
verifyToken()        ← Checks JWT validity; rejects if missing or expired
   ↓
requireRole(role)    ← Checks user role against permitted role(s)
   ↓
Controller           ← Executes business logic only if both checks pass
```

### HTTP Response on Violation

| Violation | HTTP Status | Message |
|---|---|---|
| No token / invalid token | `401 Unauthorized` | "Authentication required" |
| Valid token but wrong role | `403 Forbidden` | "You do not have permission to perform this action" |
| Student accessing another's data | `403 Forbidden` | "Access denied" |

---

## Account Creation Policy

| Role | How Account Is Created |
|------|------------------------|
| Student | Self-registration via `/api/auth/register` |
| Warden | Created manually by system administrator (no self-registration) |
| Staff | Created manually by system administrator (no self-registration) |

Warden and Staff accounts are seeded or created by an administrator during system setup. They are not self-registerable to prevent privilege escalation.
