# Error Handling Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

HostelFix uses a consistent API response envelope for all responses — both successful and error. This makes frontend consumption predictable and simplifies error display logic.

---

## Standard Response Envelope

### Success Response

```json
{
  "success": true,
  "data": { }
}
```

- `success`: Always `true` for successful operations.
- `data`: The response payload. Can be an object, array, or `null` for operations with no return data.

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

- `success`: Always `false` for errors.
- `message`: A plain-language description of what went wrong, safe to display to users.

---

## HTTP Status Code Reference

| Code | Name | When Used |
|------|------|-----------|
| `200` | OK | Successful GET, PATCH operations |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation failure — missing or invalid input fields |
| `401` | Unauthorized | Missing, invalid, or expired JWT token |
| `403` | Forbidden | Valid token but insufficient role permissions |
| `404` | Not Found | Requested resource does not exist |
| `409` | Conflict | Duplicate resource — e.g., email already registered |
| `500` | Internal Server Error | Unhandled server-side error |

---

## Error Scenarios and Responses

### Authentication Errors

```
Scenario: No JWT token provided
Status  : 401
Body    : { "success": false, "message": "Authentication required" }

Scenario: JWT token expired
Status  : 401
Body    : { "success": false, "message": "Session expired. Please log in again" }

Scenario: JWT token invalid or tampered
Status  : 401
Body    : { "success": false, "message": "Invalid authentication token" }

Scenario: Incorrect email or password on login
Status  : 401
Body    : { "success": false, "message": "Invalid email or password" }
```

### Authorization Errors

```
Scenario: User role not permitted for the route
Status  : 403
Body    : { "success": false, "message": "You do not have permission to perform this action" }

Scenario: Student attempting to access another student's complaint
Status  : 403
Body    : { "success": false, "message": "Access denied" }

Scenario: Staff attempting to update a complaint not assigned to them
Status  : 403
Body    : { "success": false, "message": "This complaint is not assigned to you" }
```

### Validation Errors

```
Scenario: Required field missing on complaint creation
Status  : 400
Body    : { "success": false, "message": "Category and description are required" }

Scenario: Invalid complaint category value
Status  : 400
Body    : { "success": false, "message": "Invalid complaint category" }

Scenario: Mess feedback rating outside 1–5 range
Status  : 400
Body    : { "success": false, "message": "Rating must be between 1 and 5" }

Scenario: Missing rejection reason when rejecting complaint
Status  : 400
Body    : { "success": false, "message": "A rejection reason is required" }
```

### Conflict Errors

```
Scenario: Email already registered
Status  : 409
Body    : { "success": false, "message": "An account with this email already exists" }
```

### Not Found Errors

```
Scenario: Complaint ID does not exist
Status  : 404
Body    : { "success": false, "message": "Complaint not found" }

Scenario: Mess menu entry does not exist
Status  : 404
Body    : { "success": false, "message": "Menu entry not found" }
```

### Workflow Errors (Invalid State Transitions)

```
Scenario: Attempting an invalid complaint state transition
Status  : 400
Body    : { "success": false, "message": "Invalid status transition from PENDING to CLOSED" }

Scenario: Warden attempts to close a complaint that is not yet Resolved
Status  : 400
Body    : { "success": false, "message": "Only resolved complaints can be closed" }

Scenario: Staff attempts to update a complaint that is not Assigned or In Progress
Status  : 400
Body    : { "success": false, "message": "Invalid status transition" }
```

### Server Errors

```
Scenario: Unexpected database or runtime error
Status  : 500
Body    : { "success": false, "message": "An internal server error occurred. Please try again later" }
```

---

## Global Error Handler (Express)

A global error-handling middleware should be registered in Express as the last middleware. It catches all unhandled errors and returns a standardized `500` response, preventing stack traces or sensitive details from leaking to clients.

```
Design:

  All route controllers call next(error) on unhandled exceptions.
  The global error handler receives the error object.
  It logs the error server-side (with stack trace) for debugging.
  It returns a generic 500 response to the client without exposing internal details.
```

---

## Frontend Error Handling Design

The React frontend should handle API errors as follows:

| Error Type | Frontend Behavior |
|---|---|
| `401 Unauthorized` | Clear stored token; redirect to `/login` |
| `403 Forbidden` | Show "Access Denied" message; do not redirect |
| `400 Bad Request` | Display the `message` field near the relevant form field or as a toast notification |
| `404 Not Found` | Show a "Not Found" message or redirect to dashboard |
| `409 Conflict` | Display the `message` field on the relevant form |
| `500 Server Error` | Show a generic "Something went wrong. Please try again." message |

Axios interceptors should be used to centralize `401` handling — any `401` response automatically triggers logout and redirect to login.

---

## Response Examples

### Successful Login

```json
HTTP 200 OK
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

### Successful Complaint Creation

```json
HTTP 201 Created
{
  "success": true,
  "data": {
    "id": "clx2def456",
    "category": "PLUMBING",
    "description": "Pipe leaking in bathroom",
    "status": "PENDING",
    "createdAt": "2026-08-25T04:00:00.000Z"
  }
}
```

### Failed Login

```json
HTTP 401 Unauthorized
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Invalid State Transition

```json
HTTP 400 Bad Request
{
  "success": false,
  "message": "Invalid status transition from PENDING to CLOSED"
}
```
