# Complaint Workflow

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

This document describes the complete lifecycle of a complaint in the HostelFix system. The complaint workflow defines every valid state a complaint can be in, the transitions between states, and the actor responsible for each transition.

The workflow is designed to enforce accountability and prevent complaints from being skipped, lost, or resolved without proper verification.

---

## Complete Complaint Lifecycle

```
Student raises complaint
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
Staff starts work
    ↓
[In Progress]
    ↓
Staff completes work
    ↓
  [Resolved]
    ↓
Warden verifies resolution
    ↓
  [Closed]
```

---

## State Descriptions

### 1. Pending

**Definition:** The complaint has been submitted by a student and is awaiting review by the warden.

**Entry Condition:** Student successfully submits a new complaint.

**Exit Condition:** Warden reviews the complaint and either approves or rejects it.

**Responsible Actor:** System sets this status automatically upon complaint submission.

**Why this stage exists:** The Pending state ensures that every complaint is formally reviewed by an authority before any action is taken. This prevents invalid, duplicate, or inappropriate complaints from entering the active workflow.

---

### 2. Approved

**Definition:** The warden has reviewed the complaint and confirmed that it is valid and actionable.

**Entry Condition:** Warden reviews a Pending complaint and marks it as Approved.

**Exit Condition:** Warden assigns the complaint to a staff member.

**Responsible Actor:** Warden

**Why this stage exists:** Approval provides a formal checkpoint that validates the complaint before assigning resources (staff) to it. This prevents staff from being burdened with invalid or redundant complaints.

---

### 3. Rejected

**Definition:** The warden has reviewed the complaint and determined that it is invalid, out of scope, or does not require action.

**Entry Condition:** Warden reviews a Pending complaint and marks it as Rejected, providing a rejection reason.

**Exit Condition:** None. Rejected is a terminal state.

**Responsible Actor:** Warden

**Why this stage exists:** Not all submitted complaints will be valid or actionable. Rejection allows the warden to formally close unfounded complaints while providing the student with a reason. This state is terminal — a rejected complaint cannot be reopened.

---

### 4. Assigned

**Definition:** The warden has assigned the approved complaint to a specific staff member who is responsible for resolution.

**Entry Condition:** Warden assigns an Approved complaint to a staff member.

**Exit Condition:** The assigned staff member begins work on the complaint.

**Responsible Actor:** Warden

**Why this stage exists:** The Assigned state creates formal accountability by recording which staff member is responsible for resolving the complaint. This enables the warden to track unstarted assignments and follow up if necessary.

---

### 5. In Progress

**Definition:** The assigned staff member has acknowledged the complaint and has begun active work on it.

**Entry Condition:** Staff member updates the status of an Assigned complaint to In Progress.

**Exit Condition:** Staff member completes the work and marks the complaint as Resolved.

**Responsible Actor:** Staff

**Why this stage exists:** The In Progress state allows students and the warden to know that a complaint is actively being worked on, as opposed to simply being assigned but not yet started. This provides meaningful progress visibility.

---

### 6. Resolved

**Definition:** The assigned staff member has completed the required work and considers the complaint resolved.

**Entry Condition:** Staff member marks an In Progress complaint as Resolved.

**Exit Condition:** Warden reviews the resolution and closes the complaint.

**Responsible Actor:** Staff

**Why this stage exists:** The Resolved state separates the staff's declaration of completion from the warden's verification. This ensures that the warden independently confirms that the issue has been actually addressed before the complaint is officially closed.

---

### 7. Closed

**Definition:** The warden has reviewed the resolution and officially closed the complaint. The complaint lifecycle is complete.

**Entry Condition:** Warden verifies a Resolved complaint and marks it as Closed.

**Exit Condition:** None. Closed is a terminal state.

**Responsible Actor:** Warden

**Why this stage exists:** Closure provides the final formal confirmation that the hostel issue has been resolved to a satisfactory standard. The Closed state serves as the definitive end of the complaint lifecycle and contributes to accountable complaint records.

---

## State Transition Table

| From State | To State | Actor | Trigger |
|------------|----------|-------|---------|
| — | Pending | System | Student submits complaint |
| Pending | Approved | Warden | Warden approves complaint |
| Pending | Rejected | Warden | Warden rejects complaint |
| Approved | Assigned | Warden | Warden assigns complaint to staff |
| Assigned | In Progress | Staff | Staff begins work |
| In Progress | Resolved | Staff | Staff completes work |
| Resolved | Closed | Warden | Warden verifies and closes |

---

## Transition Rules and Constraints

The following rules govern the complaint lifecycle:

1. **No State Skipping:** A complaint must pass through each state in the defined sequence. No actor may force a complaint from an early state to a terminal state without following the full sequence (except for Rejection from Pending).

2. **No Unauthorized Transitions:** Only the designated actor for each transition may perform that transition. A student cannot approve, assign, or close a complaint. A staff member cannot approve or close a complaint.

3. **Rejected is Terminal:** Once a complaint is rejected by the warden, it cannot be reinstated, reassigned, or moved to any other state.

4. **Closed is Terminal:** Once a complaint is closed by the warden, it cannot be reopened, reassigned, or returned to any prior state.

5. **Assignment Requires Approval:** A complaint may only be assigned to staff after it has been approved by the warden. Pending complaints cannot be assigned directly.

6. **Closure Requires Resolution:** A complaint may only be closed after the staff member has marked it as Resolved. The warden cannot close a complaint that is still In Progress or Assigned.

7. **History is Preserved:** Every status transition is recorded in the complaint history with a timestamp and the name of the user who made the change. History records are immutable.

---

## Complaint History (Timeline)

For every complaint, the system maintains a chronological history of all status changes. Each history entry records:

- The previous status
- The new status
- The timestamp of the change
- The user who made the change
- Any notes or reasons associated with the change (e.g., rejection reason)

This timeline is visible to:
- The **student** who submitted the complaint (read-only)
- The **warden** (read-only)

It is not editable by any user after it has been recorded.

---

## Visual Summary

| State | Color Indicator | Terminal? | Actor Who Sets It |
|-------|----------------|-----------|-------------------|
| Pending | Yellow / Amber | No | System |
| Approved | Blue | No | Warden |
| Rejected | Red | Yes | Warden |
| Assigned | Purple | No | Warden |
| In Progress | Orange | No | Staff |
| Resolved | Teal / Cyan | No | Staff |
| Closed | Green | Yes | Warden |
