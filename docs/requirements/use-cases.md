# Use Cases

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document specifies the use cases for all three user roles in HostelFix: **Student**, **Warden**, and **Staff**. Each use case describes a specific interaction between an actor and the system.

---

## Actor Summary

| Actor | Role Description |
|-------|-----------------|
| Student | Registered hostel student who submits and tracks complaints |
| Warden | Hostel authority who manages complaints and mess services |
| Staff | Maintenance personnel who resolves assigned complaints |

---

## Section 1: Student Use Cases

### UC-S01 — Register

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S01 |
| **Name** | Register |
| **Actor** | Student |
| **Description** | A new student creates an account in HostelFix to access the system. |
| **Preconditions** | The student does not already have an account. The student has a valid email address. |
| **Main Flow** | 1. Student navigates to the registration page. 2. Student enters name, email, room number, hostel block, and password. 3. Student submits the registration form. 4. System validates all fields. 5. System creates the student account with the Student role. 6. System confirms successful registration. |
| **Alternative Flow** | 4a. Validation fails (missing fields, invalid email, password too short): System displays specific error messages. Student corrects input and resubmits. |
| **Exception Flow** | 4b. Email already registered: System informs the student that the email is already in use. |
| **Postconditions** | A new Student account is created. The student can now log in. |

---

### UC-S02 — Login

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S02 |
| **Name** | Login |
| **Actor** | Student |
| **Description** | An existing student logs in to access their account. |
| **Preconditions** | The student has a registered account. |
| **Main Flow** | 1. Student navigates to the login page. 2. Student enters email and password. 3. Student submits the login form. 4. System validates credentials. 5. System identifies the user's role as Student. 6. System grants access to the student dashboard. |
| **Alternative Flow** | 4a. Invalid credentials: System displays a generic authentication error. |
| **Exception Flow** | None. |
| **Postconditions** | Student is authenticated and redirected to the student dashboard. |

---

### UC-S03 — Raise Complaint

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S03 |
| **Name** | Raise Complaint |
| **Actor** | Student |
| **Description** | An authenticated student submits a new complaint about a hostel issue. |
| **Preconditions** | Student is authenticated. |
| **Main Flow** | 1. Student navigates to the "Raise Complaint" section. 2. Student selects a complaint category. 3. Student enters a description of the issue. 4. (Optional) Student attaches an image as evidence. 5. Student submits the complaint. 6. System validates the form. 7. System creates a new complaint record with status **Pending**. 8. System displays a confirmation message with the complaint reference. |
| **Alternative Flow** | 6a. Category or description is missing: System displays a validation error. Student corrects input and resubmits. |
| **Exception Flow** | None. |
| **Postconditions** | A new complaint is created with status Pending. The complaint is visible to the student and the warden. |

---

### UC-S04 — View Complaints

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S04 |
| **Name** | View Complaints |
| **Actor** | Student |
| **Description** | An authenticated student views the list of complaints they have submitted. |
| **Preconditions** | Student is authenticated. |
| **Main Flow** | 1. Student navigates to the complaints section. 2. System retrieves all complaints submitted by the logged-in student. 3. System displays the complaint list with complaint ID, category, submission date, and current status. |
| **Alternative Flow** | 2a. No complaints found: System displays a message indicating no complaints have been submitted. |
| **Exception Flow** | None. |
| **Postconditions** | Student can view their complaint list. |

---

### UC-S05 — View Complaint Status

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S05 |
| **Name** | View Complaint Status |
| **Actor** | Student |
| **Description** | A student views the current status of a specific complaint. |
| **Preconditions** | Student is authenticated. Student has at least one submitted complaint. |
| **Main Flow** | 1. Student selects a complaint from their complaint list. 2. System displays the complaint details including category, description, current status, and submission date. |
| **Alternative Flow** | None. |
| **Exception Flow** | 1a. Student attempts to access a complaint that does not belong to them: System denies access. |
| **Postconditions** | Student can see the current status of the selected complaint. |

---

### UC-S06 — View Complaint Timeline

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S06 |
| **Name** | View Complaint Timeline |
| **Actor** | Student |
| **Description** | A student views the complete status history of a specific complaint. |
| **Preconditions** | Student is authenticated. Student has at least one submitted complaint. |
| **Main Flow** | 1. Student opens a specific complaint. 2. Student views the timeline/history section. 3. System displays the chronological list of all status changes, each with a timestamp and actor. |
| **Alternative Flow** | None. |
| **Exception Flow** | None. |
| **Postconditions** | Student can see the full history of actions taken on their complaint. |

---

### UC-S07 — View Mess Menu

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S07 |
| **Name** | View Mess Menu |
| **Actor** | Student |
| **Description** | A student views the current weekly mess menu. |
| **Preconditions** | Student is authenticated. Warden has published a mess menu. |
| **Main Flow** | 1. Student navigates to the Mess section. 2. System retrieves the current weekly mess menu. 3. System displays the menu organized by day and meal type. |
| **Alternative Flow** | 2a. No menu has been published: System displays a message indicating the menu is not yet available. |
| **Exception Flow** | None. |
| **Postconditions** | Student can view the weekly mess schedule. |

---

### UC-S08 — Submit Mess Feedback

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S08 |
| **Name** | Submit Mess Feedback |
| **Actor** | Student |
| **Description** | A student submits a rating and optional comment on mess services. |
| **Preconditions** | Student is authenticated. |
| **Main Flow** | 1. Student navigates to the Mess Feedback section. 2. Student selects a rating (e.g., 1–5 stars). 3. Student optionally enters a written comment. 4. Student submits the feedback. 5. System saves the feedback and displays a confirmation. |
| **Alternative Flow** | 4a. No rating selected: System displays a validation error. |
| **Exception Flow** | None. |
| **Postconditions** | Feedback is saved and becomes visible to the warden in the summarized feedback view. |

---

### UC-S09 — Logout

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-S09 |
| **Name** | Logout |
| **Actor** | Student |
| **Description** | An authenticated student ends their session. |
| **Preconditions** | Student is authenticated. |
| **Main Flow** | 1. Student clicks the logout option. 2. System terminates the current session. 3. System redirects the student to the login page. |
| **Alternative Flow** | None. |
| **Exception Flow** | None. |
| **Postconditions** | Student session is terminated. Subsequent navigation requires re-authentication. |

---

## Section 2: Warden Use Cases

### UC-W01 — Login

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W01 |
| **Name** | Login |
| **Actor** | Warden |
| **Description** | An authorized warden logs in to access the warden panel. |
| **Preconditions** | Warden account has been created in the system (by administration). |
| **Main Flow** | 1. Warden navigates to the login page. 2. Warden enters email and password. 3. System validates credentials. 4. System identifies the user's role as Warden. 5. System grants access to the warden dashboard. |
| **Alternative Flow** | 3a. Invalid credentials: System displays an authentication error. |
| **Exception Flow** | None. |
| **Postconditions** | Warden is authenticated and redirected to the warden dashboard. |

---

### UC-W02 — View All Complaints

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W02 |
| **Name** | View All Complaints |
| **Actor** | Warden |
| **Description** | The warden views all complaints submitted by all students. |
| **Preconditions** | Warden is authenticated. |
| **Main Flow** | 1. Warden navigates to the complaints section. 2. System retrieves all complaint records. 3. System displays the list with complaint ID, student name, category, submission date, and current status. 4. Warden can filter complaints by status. |
| **Alternative Flow** | 2a. No complaints exist: System displays an empty state message. |
| **Exception Flow** | None. |
| **Postconditions** | Warden has a full view of all hostel complaints. |

---

### UC-W03 — Approve Complaint

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W03 |
| **Name** | Approve Complaint |
| **Actor** | Warden |
| **Description** | The warden reviews a Pending complaint and approves it for staff assignment. |
| **Preconditions** | Warden is authenticated. At least one complaint is in Pending status. |
| **Main Flow** | 1. Warden opens a Pending complaint. 2. Warden reviews the complaint details. 3. Warden selects the Approve action. 4. System changes the complaint status to **Approved**. 5. System records the status change in the complaint history. |
| **Alternative Flow** | None. |
| **Exception Flow** | 3a. Complaint is not in Pending status: Approve action is not available. |
| **Postconditions** | Complaint status changes to Approved. It is now eligible for staff assignment. |

---

### UC-W04 — Reject Complaint

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W04 |
| **Name** | Reject Complaint |
| **Actor** | Warden |
| **Description** | The warden reviews a Pending complaint and rejects it, providing a reason. |
| **Preconditions** | Warden is authenticated. At least one complaint is in Pending status. |
| **Main Flow** | 1. Warden opens a Pending complaint. 2. Warden selects the Reject action. 3. Warden enters a rejection reason. 4. Warden confirms the rejection. 5. System changes complaint status to **Rejected**. 6. System records the status change and rejection reason in the complaint history. |
| **Alternative Flow** | 3a. Rejection reason is empty: System displays a validation error. |
| **Exception Flow** | 3b. Complaint is not in Pending status: Reject action is not available. |
| **Postconditions** | Complaint status changes to Rejected. The rejection reason is recorded. This is a terminal state. |

---

### UC-W05 — Assign Staff

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W05 |
| **Name** | Assign Staff |
| **Actor** | Warden |
| **Description** | The warden assigns an Approved complaint to a specific staff member. |
| **Preconditions** | Warden is authenticated. At least one complaint is in Approved status. At least one staff account exists. |
| **Main Flow** | 1. Warden opens an Approved complaint. 2. Warden selects the Assign action. 3. System presents a list of available staff members. 4. Warden selects a staff member. 5. Warden confirms the assignment. 6. System changes the complaint status to **Assigned**. 7. System records the assignment and staff member in the complaint history. |
| **Alternative Flow** | 4a. No staff members exist: System displays a message indicating no staff available. |
| **Exception Flow** | None. |
| **Postconditions** | Complaint status changes to Assigned. The selected staff member can now see the complaint in their task list. |

---

### UC-W06 — Monitor Complaint

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W06 |
| **Name** | Monitor Complaint |
| **Actor** | Warden |
| **Description** | The warden monitors the progress of an active complaint. |
| **Preconditions** | Warden is authenticated. At least one complaint is in an active state (Assigned, In Progress, or Resolved). |
| **Main Flow** | 1. Warden views the complaint list filtered by active status. 2. Warden selects a complaint to view full details. 3. System displays current status, assigned staff, and the complaint history timeline. |
| **Alternative Flow** | None. |
| **Exception Flow** | None. |
| **Postconditions** | Warden has visibility into the current state and history of the complaint. |

---

### UC-W07 — Close Complaint

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W07 |
| **Name** | Close Complaint |
| **Actor** | Warden |
| **Description** | The warden verifies a Resolved complaint and officially closes it. |
| **Preconditions** | Warden is authenticated. At least one complaint is in Resolved status. |
| **Main Flow** | 1. Warden opens a Resolved complaint. 2. Warden reviews the complaint and resolution details. 3. Warden selects the Close action. 4. System changes complaint status to **Closed**. 5. System records the closure in the complaint history. |
| **Alternative Flow** | None. |
| **Exception Flow** | 3a. Complaint is not in Resolved status: Close action is not available. |
| **Postconditions** | Complaint status changes to Closed. This is a terminal state. |

---

### UC-W08 — Manage Mess Menu

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W08 |
| **Name** | Manage Mess Menu |
| **Actor** | Warden |
| **Description** | The warden creates or updates the weekly mess menu. |
| **Preconditions** | Warden is authenticated. |
| **Main Flow** | 1. Warden navigates to the Mess Menu management section. 2. Warden enters or updates the meal details for each day of the week. 3. Warden saves the menu. 4. System stores the updated menu. 5. System confirms successful save. |
| **Alternative Flow** | 3a. Required fields are empty: System displays a validation error. |
| **Exception Flow** | None. |
| **Postconditions** | The updated mess menu is published and visible to all students. |

---

### UC-W09 — View Mess Feedback

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W09 |
| **Name** | View Mess Feedback |
| **Actor** | Warden |
| **Description** | The warden views summarized feedback submitted by students on mess services. |
| **Preconditions** | Warden is authenticated. At least one feedback entry exists. |
| **Main Flow** | 1. Warden navigates to the Mess Feedback section. 2. System retrieves submitted feedback entries. 3. System displays feedback entries with student identifiers, ratings, and comments. |
| **Alternative Flow** | 2a. No feedback submitted: System displays an empty state message. |
| **Exception Flow** | None. |
| **Postconditions** | Warden can review student feedback on mess services. |

---

### UC-W10 — Logout

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-W10 |
| **Name** | Logout |
| **Actor** | Warden |
| **Description** | The warden ends their authenticated session. |
| **Preconditions** | Warden is authenticated. |
| **Main Flow** | 1. Warden clicks logout. 2. System terminates the session. 3. System redirects to the login page. |
| **Alternative Flow** | None. |
| **Exception Flow** | None. |
| **Postconditions** | Warden session is terminated. |

---

## Section 3: Staff Use Cases

### UC-ST01 — Login

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-ST01 |
| **Name** | Login |
| **Actor** | Staff |
| **Description** | An authorized staff member logs in to access their task dashboard. |
| **Preconditions** | Staff account has been created in the system. |
| **Main Flow** | 1. Staff navigates to the login page. 2. Staff enters email and password. 3. System validates credentials. 4. System identifies the role as Staff. 5. System grants access to the staff dashboard. |
| **Alternative Flow** | 3a. Invalid credentials: System displays an authentication error. |
| **Exception Flow** | None. |
| **Postconditions** | Staff member is authenticated and redirected to the staff dashboard. |

---

### UC-ST02 — View Assigned Complaints

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-ST02 |
| **Name** | View Assigned Complaints |
| **Actor** | Staff |
| **Description** | A staff member views all complaints currently assigned to them. |
| **Preconditions** | Staff is authenticated. |
| **Main Flow** | 1. Staff navigates to their dashboard or complaints list. 2. System retrieves all complaints assigned to the logged-in staff member. 3. System displays the list with complaint ID, category, assignment date, and current status. |
| **Alternative Flow** | 2a. No complaints assigned: System displays an empty state message. |
| **Exception Flow** | None. |
| **Postconditions** | Staff can see all complaints assigned to them. |

---

### UC-ST03 — Update Complaint Status

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-ST03 |
| **Name** | Update Complaint Status |
| **Actor** | Staff |
| **Description** | A staff member updates the status of an assigned complaint to reflect current work progress. |
| **Preconditions** | Staff is authenticated. At least one complaint is assigned to the staff member with status Assigned. |
| **Main Flow** | 1. Staff opens an assigned complaint. 2. Staff selects the Update Status action. 3. Staff selects the new status (In Progress). 4. Staff confirms the update. 5. System updates the complaint status. 6. System records the change in the complaint history. |
| **Alternative Flow** | None. |
| **Exception Flow** | 3a. Staff attempts to set an invalid status: System rejects the action. |
| **Postconditions** | Complaint status is updated. The change is visible to the warden and the student. |

---

### UC-ST04 — Mark Complaint Resolved

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-ST04 |
| **Name** | Mark Complaint Resolved |
| **Actor** | Staff |
| **Description** | A staff member marks an In Progress complaint as resolved upon completion of work. |
| **Preconditions** | Staff is authenticated. Complaint is in In Progress status and assigned to this staff member. |
| **Main Flow** | 1. Staff opens an In Progress complaint. 2. Staff selects the Mark as Resolved action. 3. Staff confirms the action. 4. System changes complaint status to **Resolved**. 5. System records the resolution in the complaint history. |
| **Alternative Flow** | None. |
| **Exception Flow** | 2a. Complaint is not In Progress: Resolve action is not available. |
| **Postconditions** | Complaint status changes to Resolved. The warden is now able to close the complaint. |

---

### UC-ST05 — Logout

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-ST05 |
| **Name** | Logout |
| **Actor** | Staff |
| **Description** | An authenticated staff member ends their session. |
| **Preconditions** | Staff is authenticated. |
| **Main Flow** | 1. Staff clicks logout. 2. System terminates the session. 3. System redirects to the login page. |
| **Alternative Flow** | None. |
| **Exception Flow** | None. |
| **Postconditions** | Staff session is terminated. |

---

## Use Case Index

| Use Case ID | Name | Actor |
|-------------|------|-------|
| UC-S01 | Register | Student |
| UC-S02 | Login | Student |
| UC-S03 | Raise Complaint | Student |
| UC-S04 | View Complaints | Student |
| UC-S05 | View Complaint Status | Student |
| UC-S06 | View Complaint Timeline | Student |
| UC-S07 | View Mess Menu | Student |
| UC-S08 | Submit Mess Feedback | Student |
| UC-S09 | Logout | Student |
| UC-W01 | Login | Warden |
| UC-W02 | View All Complaints | Warden |
| UC-W03 | Approve Complaint | Warden |
| UC-W04 | Reject Complaint | Warden |
| UC-W05 | Assign Staff | Warden |
| UC-W06 | Monitor Complaint | Warden |
| UC-W07 | Close Complaint | Warden |
| UC-W08 | Manage Mess Menu | Warden |
| UC-W09 | View Mess Feedback | Warden |
| UC-W10 | Logout | Warden |
| UC-ST01 | Login | Staff |
| UC-ST02 | View Assigned Complaints | Staff |
| UC-ST03 | Update Complaint Status | Staff |
| UC-ST04 | Mark Complaint Resolved | Staff |
| UC-ST05 | Logout | Staff |
