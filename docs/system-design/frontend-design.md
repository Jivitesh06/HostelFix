# Frontend Design

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

The HostelFix frontend is a React single-page application (SPA). It uses React Router for client-side routing, Axios for API communication, and renders different page sets depending on the authenticated user's role.

The frontend never accesses the database directly. All data is fetched from the Express REST API.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |
| Context API / State | Auth state management |
| CSS / UI Library | Styling (TBD in Phase 3) |

---

## Page Architecture

### Public Routes (No Authentication Required)

| Route | Page | Description |
|---|---|---|
| `/login` | Login Page | Email/password form; redirects to role dashboard on success |
| `/register` | Register Page | Student self-registration form |

### Student Routes (Role: STUDENT)

| Route | Page | Description |
|---|---|---|
| `/student/dashboard` | Student Dashboard | Summary cards: total, pending, in progress, resolved complaints |
| `/student/complaints` | My Complaints | List of own complaints with status badges and filters |
| `/student/complaints/new` | New Complaint | Complaint submission form |
| `/student/complaints/:id` | Complaint Detail | Full complaint details + status timeline |
| `/student/mess` | Mess Menu | Weekly mess menu + feedback form |

### Warden Routes (Role: WARDEN)

| Route | Page | Description |
|---|---|---|
| `/warden/dashboard` | Warden Dashboard | Complaint count by status; quick overview |
| `/warden/complaints` | All Complaints | Full list with status filter and search |
| `/warden/complaints/:id` | Complaint Detail | Complaint detail + approve/reject/assign/close actions |
| `/warden/mess` | Mess Management | Edit weekly menu + view submitted feedback |

### Staff Routes (Role: STAFF)

| Route | Page | Description |
|---|---|---|
| `/staff/dashboard` | Staff Dashboard | List of assigned complaints |
| `/staff/complaints/:id` | Complaint Detail | Complaint details + update status actions |

---

## Role-Based Routing Flow

```
Browser loads app
        │
        ▼
Check authentication state
        │
        ├── Not authenticated → redirect to /login
        │
        └── Authenticated
                  │
                  ▼
             Check role
                  │
                  ├── STUDENT → redirect to /student/dashboard
                  ├── WARDEN  → redirect to /warden/dashboard
                  └── STAFF   → redirect to /staff/dashboard


Unauthorized route access (e.g., Student visits /warden/dashboard):
        │
        ▼
RoleRoute component detects role mismatch
        │
        ▼
Redirect to user's own dashboard
  OR show Access Denied page
```

---

## Component Architecture

### Reusable Shared Components

| Component | Purpose | Reused By |
|---|---|---|
| `Navbar` | Top navigation bar with role-appropriate links and logout | All pages |
| `Sidebar` | Side navigation for dashboard sections | Dashboard pages |
| `DashboardCard` | Summary stat card (e.g., "5 Pending Complaints") | Student, Warden, Staff dashboards |
| `StatusBadge` | Color-coded complaint status label | Complaint lists, detail pages |
| `ComplaintCard` | Summary card for a single complaint in a list | Complaint list pages |
| `ComplaintTable` | Tabular view of complaints with sortable columns | Warden complaint list |
| `ComplaintTimeline` | Chronological StatusLog history display | Complaint detail pages |
| `ProtectedRoute` | Redirects unauthenticated users to `/login` | All protected routes |
| `RoleRoute` | Restricts a route to a specific role; redirects others | Student/Warden/Staff route groups |
| `Modal` | Reusable modal dialog for confirmations (approve, reject, assign) | Warden complaint actions |
| `LoadingState` | Spinner or skeleton shown while API data is loading | All data-fetching pages |
| `ErrorMessage` | Standardized inline error display | Forms and API error states |

### Feature-Specific Components

| Component | Purpose | Used By |
|---|---|---|
| `ComplaintForm` | Complaint submission form with category dropdown and description | Student: New Complaint page |
| `MessMenu` | Renders weekly mess menu organized by day and meal | Student and Warden mess pages |
| `FeedbackForm` | Rating + comment form for mess feedback | Student: Mess page |

---

## Route Protection Design

### `ProtectedRoute`

Wraps any route that requires the user to be authenticated.

```
ProtectedRoute behavior:
  - Read auth state (token + user from context)
  - If no token → redirect to /login
  - If token exists → render the child route
```

### `RoleRoute`

Wraps any route that is restricted to a specific role.

```
RoleRoute behavior:
  - Read user.role from auth context
  - If role matches required role → render the child page
  - If role does not match → redirect to user's own dashboard
```

### Route Configuration Summary

```
/login                          → Public
/register                       → Public

/student/*                      → ProtectedRoute + RoleRoute(STUDENT)
/warden/*                       → ProtectedRoute + RoleRoute(WARDEN)
/staff/*                        → ProtectedRoute + RoleRoute(STAFF)

/*                              → Redirect to /login
```

---

## Authentication State Management

The frontend stores the authenticated user's state globally using React Context (or a lightweight state manager).

**Auth Context shape:**

```
{
  user: {
    id: string,
    name: string,
    email: string,
    role: "STUDENT" | "WARDEN" | "STAFF"
  } | null,
  token: string | null,
  login(token, user): void,
  logout(): void,
  isAuthenticated: boolean
}
```

**Token persistence:** The token may be stored in `localStorage` for persistence across page refreshes. On app load, the stored token is used to call `GET /api/auth/me` to re-verify the session.

**Axios configuration:** A global Axios instance is created with a base URL and an interceptor that automatically attaches the `Authorization: Bearer <token>` header to every request. A response interceptor handles `401` responses by triggering logout and redirect to `/login`.

---

## Data Flow (Full Stack)

```
User Action (click, form submit)
        │
        ▼
React Component handler
        │
        ▼
Axios request (with JWT header)
        │
        ▼
Express Route + Middleware
        │
        ▼
Controller / Service
        │
        ▼
Prisma query
        │
        ▼
PostgreSQL
        │
        ▼
Prisma result
        │
        ▼
JSON Response
        │
        ▼
Axios .then() / .catch()
        │
        ▼
React state update
        │
        ▼
UI re-renders with new data
```

---

## Page-Component Map

| Page | Key Components Used |
|---|---|
| Login | Form, ErrorMessage |
| Register | Form, ErrorMessage |
| Student Dashboard | Navbar, Sidebar, DashboardCard, LoadingState |
| My Complaints | Navbar, Sidebar, ComplaintCard, StatusBadge, LoadingState |
| New Complaint | Navbar, Sidebar, ComplaintForm, ErrorMessage |
| Complaint Detail (Student) | Navbar, Sidebar, StatusBadge, ComplaintTimeline |
| Mess (Student) | Navbar, Sidebar, MessMenu, FeedbackForm |
| Warden Dashboard | Navbar, Sidebar, DashboardCard |
| All Complaints (Warden) | Navbar, Sidebar, ComplaintTable, StatusBadge |
| Complaint Detail (Warden) | Navbar, Sidebar, StatusBadge, ComplaintTimeline, Modal |
| Mess Management (Warden) | Navbar, Sidebar, MessMenu |
| Staff Dashboard | Navbar, Sidebar, ComplaintCard, StatusBadge |
| Complaint Detail (Staff) | Navbar, Sidebar, StatusBadge, ComplaintTimeline |
