# System Scope

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document defines what is within scope for the current implementation of HostelFix and what has been explicitly identified as future scope. Clear scope boundaries are established to align the system with the academic project timeline and evaluation criteria.

---

## In Scope for Current Project

The following features and modules are within scope for the HostelFix implementation:

### 1. Role-Based Hostel Complaint Management

The system will support three distinct user roles: **Student**, **Warden**, and **Staff**. Role-based access control will be enforced throughout the application. Each role will have access only to the functionality permitted for that role.

### 2. Complaint Lifecycle Management

The system will implement the full complaint lifecycle:

```
Pending → Approved → Assigned → In Progress → Resolved → Closed
```

Alternative path:

```
Pending → Rejected
```

The system will enforce valid state transitions and prevent unauthorized or out-of-sequence transitions.

### 3. Student Complaint Tracking

Students will be able to:
- Submit new complaints with a category, description, and optional image
- View their own submitted complaints
- Track the current status of each complaint
- View the complete status history (timeline) of each complaint

### 4. Warden Complaint Administration

Wardens will be able to:
- View all complaints submitted by students
- Approve or reject Pending complaints (with rejection reason)
- Assign Approved complaints to specific staff members
- Monitor the status of active complaints
- Close Resolved complaints after verification

### 5. Staff Task Management

Staff will be able to:
- View complaints assigned to them by the warden
- View full complaint details
- Update the status of assigned complaints (In Progress, Resolved)

### 6. Complaint History (Audit Trail)

The system will record every status transition for every complaint, including the timestamp, the actor who made the change, and any associated notes (e.g., rejection reason). This history will be visible to the student (for their own complaints) and to the warden.

### 7. Mess Menu Management

The warden will be able to create and update the weekly mess menu. Students will be able to view the current mess menu organized by day and meal type.

### 8. Mess Feedback

Students will be able to submit a rating and optional written comment on mess services. The warden will be able to view a summarized view of submitted feedback.

### 9. Role-Based Dashboards

- **Student Dashboard:** Summary of the student's own complaints by status.
- **Warden Dashboard:** Overview of all hostel complaints by status with basic complaint counts.
- **Staff Dashboard:** List of all complaints currently assigned to the logged-in staff member.

### 10. Authentication

The system will support:
- Student self-registration
- Login for all three roles (Student, Warden, Staff)
- Role identification upon login
- Protection of all role-specific routes and operations

---

## Future Scope

The following features have been identified as potential enhancements for future phases. They are **not** in scope for the current project and will not be implemented at this time.

### FS-01 — Automated SLA Monitoring

A Service Level Agreement (SLA) monitoring system that automatically tracks how long a complaint has been in each state and flags overdue complaints to the warden. This requires a background scheduling mechanism and defined resolution time targets per complaint category.

### FS-02 — Email and SMS Notifications

Automatic email or SMS notifications to inform students of complaint status changes, and to alert wardens of newly submitted complaints or complaints approaching SLA deadlines.

### FS-03 — Advanced Analytics and Reporting

Detailed analytical dashboards showing complaint volume trends, average resolution times, most frequent complaint categories, block-wise complaint distribution, and staff performance metrics. This requires aggregation queries and data visualization libraries.

### FS-04 — Mobile Application

A dedicated mobile application (iOS/Android) for students and staff to access HostelFix from native mobile environments. This may be built as a React Native or similar cross-platform application.

### FS-05 — AI-Based Complaint Classification

Automatic categorization of complaints based on their text description using a machine learning or natural language processing model. This could reduce manual categorization effort for students.

### FS-06 — Predictive Hostel Maintenance

A predictive system that identifies recurring complaint patterns and suggests preventative maintenance actions to the warden before issues escalate.

### FS-07 — Advanced Reporting

Exportable complaint reports in PDF or Excel format for administrative review, institutional inspections, or audit purposes.

### FS-08 — Cloud File Storage Improvements

Integration with cloud storage services (e.g., AWS S3, Cloudinary) for scalable and performant storage of complaint evidence images and other attachments.

---

## Scope Boundary Summary

| Feature | Current Scope | Future Scope |
|---------|--------------|--------------|
| Student registration and login | ✅ | — |
| Complaint submission | ✅ | — |
| Complaint lifecycle (all states) | ✅ | — |
| Complaint history/timeline | ✅ | — |
| Warden complaint management | ✅ | — |
| Staff task management | ✅ | — |
| Mess menu management | ✅ | — |
| Mess feedback | ✅ | — |
| Role-based dashboards | ✅ | — |
| SLA monitoring | — | ✅ |
| Email/SMS notifications | — | ✅ |
| Advanced analytics | — | ✅ |
| Mobile application | — | ✅ |
| AI complaint classification | — | ✅ |
| Predictive maintenance | — | ✅ |
| Exportable reports | — | ✅ |
| Cloud file storage | — | ✅ |

---

## Deployment Context

- The system is intended for deployment in a **single hostel environment** for the current phase.
- Free-tier or low-cost cloud services will be preferred for hosting.
- The system is designed primarily for web browser access on laptop and mobile devices.
