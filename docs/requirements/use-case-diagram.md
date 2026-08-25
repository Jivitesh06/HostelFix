# Use-Case Diagram Specification

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document provides the formal specification for the HostelFix Use-Case Diagram. The specification defines all actors, use cases, associations, and groupings that should be represented in the visual diagram.

---

## Actors

| Actor | Type | Description |
|-------|------|-------------|
| **Student** | Primary Actor | Hostel resident who submits complaints and views mess information |
| **Warden** | Primary Actor | Hostel authority who manages complaints and mess services |
| **Staff** | Primary Actor | Maintenance personnel who resolves assigned complaints |

> No additional or system actors are introduced in the current scope.

---

## System Boundary

**System Name:** HostelFix

All use cases listed below are contained within the HostelFix system boundary.

---

## Use Cases by Actor

### Student Use Cases

| Use Case | ID |
|----------|----|
| Register | UC-S01 |
| Login | UC-S02 |
| Raise Complaint | UC-S03 |
| View Complaints | UC-S04 |
| View Complaint Status | UC-S05 |
| View Complaint Timeline | UC-S06 |
| View Mess Menu | UC-S07 |
| Submit Mess Feedback | UC-S08 |
| Logout | UC-S09 |

### Warden Use Cases

| Use Case | ID |
|----------|----|
| Login | UC-W01 |
| View All Complaints | UC-W02 |
| Approve Complaint | UC-W03 |
| Reject Complaint | UC-W04 |
| Assign Staff | UC-W05 |
| Monitor Complaint | UC-W06 |
| Close Complaint | UC-W07 |
| Manage Mess Menu | UC-W08 |
| View Mess Feedback | UC-W09 |
| Logout | UC-W10 |

### Staff Use Cases

| Use Case | ID |
|----------|----|
| Login | UC-ST01 |
| View Assigned Complaints | UC-ST02 |
| Update Complaint Status | UC-ST03 |
| Mark Complaint Resolved | UC-ST04 |
| Logout | UC-ST05 |

---

## Use-Case Groupings

For diagram organization, use cases are grouped into the following logical clusters within the system boundary:

### Group 1: Authentication (Shared)
- Register (Student only)
- Login (Student, Warden, Staff — separate associations)
- Logout (Student, Warden, Staff — separate associations)

### Group 2: Complaint Operations (Student)
- Raise Complaint
- View Complaints
- View Complaint Status
- View Complaint Timeline

### Group 3: Complaint Administration (Warden)
- View All Complaints
- Approve Complaint
- Reject Complaint
- Assign Staff
- Monitor Complaint
- Close Complaint

### Group 4: Complaint Task Management (Staff)
- View Assigned Complaints
- Update Complaint Status
- Mark Complaint Resolved

### Group 5: Mess Services (Student & Warden)
- View Mess Menu (Student)
- Submit Mess Feedback (Student)
- Manage Mess Menu (Warden)
- View Mess Feedback (Warden)

---

## Actor-Use Case Associations

### Student Associations

```
Student ── Register
Student ── Login
Student ── Raise Complaint
Student ── View Complaints
Student ── View Complaint Status
Student ── View Complaint Timeline
Student ── View Mess Menu
Student ── Submit Mess Feedback
Student ── Logout
```

### Warden Associations

```
Warden ── Login
Warden ── View All Complaints
Warden ── Approve Complaint
Warden ── Reject Complaint
Warden ── Assign Staff
Warden ── Monitor Complaint
Warden ── Close Complaint
Warden ── Manage Mess Menu
Warden ── View Mess Feedback
Warden ── Logout
```

### Staff Associations

```
Staff ── Login
Staff ── View Assigned Complaints
Staff ── Update Complaint Status
Staff ── Mark Complaint Resolved
Staff ── Logout
```

---

## Include Relationships

The following `<<include>>` relationships represent use cases that are always part of another use case's execution:

| Base Use Case | Included Use Case | Reason |
|---------------|-------------------|--------|
| Raise Complaint | Login | Student must be authenticated |
| View Complaints | Login | Student must be authenticated |
| Approve Complaint | View All Complaints | Warden must view before approving |
| Reject Complaint | View All Complaints | Warden must view before rejecting |
| Assign Staff | Approve Complaint | Assignment requires prior approval |
| Close Complaint | Monitor Complaint | Closure follows monitoring and resolution |
| Mark Complaint Resolved | Update Complaint Status | Resolution is a specific status update |

---

## Extend Relationships

The following `<<extend>>` relationships represent optional or conditional behavior:

| Base Use Case | Extending Use Case | Condition |
|---------------|--------------------|-----------|
| Raise Complaint | Attach Evidence Image | Student optionally attaches an image |
| Reject Complaint | Provide Rejection Reason | Rejection requires a reason (mandatory extension) |

---

## Diagram Layout Guidance

When rendering the visual diagram, use the following layout:

```
+─────────────────────────────────────────────────────────────────────+
│                          HostelFix System                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Authentication Group                                        │    │
│  │  (Register)  (Login)  (Logout)                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐    │
│  │ Complaint Operations │  │ Complaint Administration         │    │
│  │ (Student)            │  │ (Warden)                         │    │
│  │  Raise Complaint     │  │  View All Complaints             │    │
│  │  View Complaints     │  │  Approve Complaint               │    │
│  │  View Status         │  │  Reject Complaint                │    │
│  │  View Timeline       │  │  Assign Staff                    │    │
│  └──────────────────────┘  │  Monitor Complaint               │    │
│                             │  Close Complaint                 │    │
│  ┌──────────────────────┐  └──────────────────────────────────┘    │
│  │ Mess Services        │                                           │
│  │  View Mess Menu (S)  │  ┌──────────────────────────────────┐    │
│  │  Submit Feedback (S) │  │ Complaint Task Management        │    │
│  │  Manage Menu (W)     │  │ (Staff)                          │    │
│  │  View Feedback (W)   │  │  View Assigned Complaints        │    │
│  └──────────────────────┘  │  Update Complaint Status         │    │
│                             │  Mark Complaint Resolved         │    │
│                             └──────────────────────────────────┘    │
+─────────────────────────────────────────────────────────────────────+

[Student]  ── (Authentication, Complaint Operations, Mess Services)
[Warden]   ── (Authentication, Complaint Administration, Mess Services)
[Staff]    ── (Authentication, Complaint Task Management)
```

> **Note:** (S) denotes Student actor. (W) denotes Warden actor.

---

## Diagram Notation Reference

| Notation | Meaning |
|----------|---------|
| Oval / Ellipse | Use Case |
| Stick Figure | Actor |
| Solid Line | Association between Actor and Use Case |
| Dashed Arrow `<<include>>` | Mandatory inclusion relationship |
| Dashed Arrow `<<extend>>` | Optional or conditional extension |
| Rectangle | System boundary |

---

## Mermaid Diagram Definition

The following Mermaid definition can be used to generate the Use-Case Diagram programmatically:

```
%% HostelFix Use-Case Diagram (Mermaid flowchart approximation)

graph LR
  Student(["👤 Student"])
  Warden(["👤 Warden"])
  Staff(["👤 Staff"])

  subgraph HostelFix System
    subgraph Authentication
      Register(("Register"))
      Login(("Login"))
      Logout(("Logout"))
    end

    subgraph Complaint Operations
      RaiseComplaint(("Raise Complaint"))
      ViewComplaints(("View Complaints"))
      ViewStatus(("View Status"))
      ViewTimeline(("View Timeline"))
    end

    subgraph Complaint Administration
      ViewAll(("View All Complaints"))
      Approve(("Approve Complaint"))
      Reject(("Reject Complaint"))
      AssignStaff(("Assign Staff"))
      Monitor(("Monitor Complaint"))
      Close(("Close Complaint"))
    end

    subgraph Staff Task Management
      ViewAssigned(("View Assigned"))
      UpdateStatus(("Update Status"))
      MarkResolved(("Mark Resolved"))
    end

    subgraph Mess Services
      ViewMenu(("View Mess Menu"))
      SubmitFeedback(("Submit Feedback"))
      ManageMenu(("Manage Mess Menu"))
      ViewFeedback(("View Feedback"))
    end
  end

  Student --- Register
  Student --- Login
  Student --- Logout
  Student --- RaiseComplaint
  Student --- ViewComplaints
  Student --- ViewStatus
  Student --- ViewTimeline
  Student --- ViewMenu
  Student --- SubmitFeedback

  Warden --- Login
  Warden --- Logout
  Warden --- ViewAll
  Warden --- Approve
  Warden --- Reject
  Warden --- AssignStaff
  Warden --- Monitor
  Warden --- Close
  Warden --- ManageMenu
  Warden --- ViewFeedback

  Staff --- Login
  Staff --- Logout
  Staff --- ViewAssigned
  Staff --- UpdateStatus
  Staff --- MarkResolved
```
