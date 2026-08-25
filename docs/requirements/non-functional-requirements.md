# Non-Functional Requirements

## Project Title

**HostelFix — Smart Hostel Complaint & Mess Management System**

---

## Overview

Non-functional requirements define the quality attributes and operational constraints that the HostelFix system must satisfy. Unlike functional requirements, which describe *what* the system does, non-functional requirements describe *how well* the system performs its functions.

---

## NFR-01: Security

**Category:** Security

| ID | Requirement |
|----|-------------|
| NFR-01.1 | Passwords must not be stored in plain text. All passwords shall be hashed using a secure cryptographic hashing algorithm before storage. |
| NFR-01.2 | All protected application routes and API endpoints must require a valid authenticated session. Unauthenticated requests to protected resources shall be rejected. |
| NFR-01.3 | Role-based access control must be enforced at the system level. The system must not rely solely on the client-side for access restriction. |
| NFR-01.4 | A user of one role (Student, Warden, Staff) must not be able to access or perform actions belonging to a different role. |
| NFR-01.5 | Students must only be able to view and manage their own complaints. A student shall not have access to another student's complaint data. |

**Rationale:** The system handles complaint records associated with named users and room numbers. Security safeguards protect user privacy, prevent unauthorized access, and maintain the integrity of complaint data.

---

## NFR-02: Usability

**Category:** Usability

| ID | Requirement |
|----|-------------|
| NFR-02.1 | The user interface shall be simple and intuitive. Users should be able to complete core tasks (raise complaint, view complaints, update status) without requiring any training or manual. |
| NFR-02.2 | Navigation between major sections of the application shall be clearly accessible from a persistent navigation element. |
| NFR-02.3 | Complaint status values shall be presented in a visually distinguishable manner (e.g., using color-coded badges or labels) so that status is immediately understandable without reading additional text. |
| NFR-02.4 | Error messages and validation feedback shall be written in plain, non-technical language so that users can understand and correct their input. |
| NFR-02.5 | Confirmation messages shall be displayed after successful actions such as complaint submission, status update, and mess feedback submission. |

**Rationale:** HostelFix will be used by students and staff who may not be technically proficient. The interface must be self-explanatory to ensure adoption and minimize support requirements.

---

## NFR-03: Performance

**Category:** Performance

| ID | Requirement |
|----|-------------|
| NFR-03.1 | Standard user operations such as complaint submission, complaint listing, and status updates shall complete within a reasonable response time under normal load conditions. |
| NFR-03.2 | Dashboard pages shall retrieve only the data required for the current user's role. Unnecessary full-dataset loading shall be avoided. |
| NFR-03.3 | The system should use reasonable data limits when retrieving complaint lists to avoid unnecessarily large responses. Full pagination is not a mandatory evaluation feature and may be implemented in a future version. |

**Rationale:** Poor performance degrades user experience and discourages use of the system. Efficient data retrieval is important even in the academic deployment context.

---

## NFR-04: Reliability

**Category:** Reliability

| ID | Requirement |
|----|-------------|
| NFR-04.1 | Complaint records, once created, shall be persistently stored in the database and shall not be silently lost or deleted by system operations. |
| NFR-04.2 | Each status transition in the complaint lifecycle shall be recorded in the complaint history log. No status change shall overwrite or discard the previous history. |
| NFR-04.3 | The system shall validate all user inputs before processing. Invalid or incomplete inputs shall be rejected with a clear error message rather than stored as corrupt data. |

**Rationale:** The reliability of complaint records is central to the system's value. Students and wardens must be able to trust that submitted complaints and their histories are accurately maintained.

---

## NFR-05: Maintainability

**Category:** Maintainability

| ID | Requirement |
|----|-------------|
| NFR-05.1 | The system shall follow a modular architecture where the frontend, backend, and database layers have clearly separated responsibilities. |
| NFR-05.2 | Code should be organized by feature or module (e.g., authentication, complaints, mess management) to allow independent modification of each area. |
| NFR-05.3 | The system shall use consistent naming conventions and coding style across the codebase to improve readability and ease of maintenance. |

**Rationale:** A maintainable codebase reduces the effort required to make changes, fix defects, and extend the system in future phases. Modular design enables individual features to be updated without disrupting unrelated parts of the system.

---

## NFR-06: Scalability

**Category:** Scalability

| ID | Requirement |
|----|-------------|
| NFR-06.1 | The architecture shall allow additional hostel blocks to be added without requiring fundamental changes to the system design. |
| NFR-06.2 | The architecture shall allow additional staff members to be registered and assigned complaints without requiring structural changes. |
| NFR-06.3 | Complaint categories are defined as a fixed set for the current version (ELECTRICAL, PLUMBING, CLEANING, FURNITURE, INTERNET, OTHER). Support for additional categories may be introduced in a future version. |

**Rationale:** While HostelFix is initially scoped to a single hostel environment, a scalable design ensures the system can be extended to support additional blocks, users, or categories in the future without requiring a system rewrite.

---

## NFR-07: Responsiveness

**Category:** Responsiveness / Compatibility

| ID | Requirement |
|----|-------------|
| NFR-07.1 | The application interface shall be responsive and shall render correctly on standard laptop/desktop screen sizes. |
| NFR-07.2 | The application interface shall be usable on common mobile and tablet screen sizes, allowing students to submit and track complaints from their mobile devices. |
| NFR-07.3 | The application shall function correctly on modern web browsers including Chrome, Firefox, and Edge without requiring browser-specific plugins or extensions. |

**Rationale:** Students commonly access services from mobile devices. Responsive design ensures the system is accessible to all users regardless of device type.

---

## Non-Functional Requirements Summary

| ID | Category | Priority |
|----|----------|----------|
| NFR-01.1 – NFR-01.5 | Security | High |
| NFR-02.1 – NFR-02.5 | Usability | High |
| NFR-03.1 – NFR-03.3 | Performance | Medium |
| NFR-04.1 – NFR-04.3 | Reliability | High |
| NFR-05.1 – NFR-05.3 | Maintainability | Medium |
| NFR-06.1 – NFR-06.3 | Scalability | Low (Future) |
| NFR-07.1 – NFR-07.3 | Responsiveness | High |

---

## Notes

- Security and Reliability requirements are classified as **High** priority and are mandatory for the core system.
- Performance and Maintainability requirements are **Medium** priority and should be addressed as part of standard development practice.
- Scalability requirements are **Low** priority for the current phase but must be considered during architectural design to avoid introducing blockers for future growth.
