/**
 * Centralized Complaint Workflow & State Machine
 * Defines valid states, transitions, categories, and role permissions.
 */

const COMPLAINT_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

const COMPLAINT_CATEGORIES = [
  'ELECTRICAL',
  'PLUMBING',
  'CLEANING',
  'FURNITURE',
  'INTERNET',
  'OTHER',
];

// Valid state transition map
const VALID_TRANSITIONS = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  REJECTED: [], // Terminal state
  CLOSED: [],   // Terminal state
};

// Transition to authorized actor role map
const TRANSITION_ROLES = {
  'PENDING->APPROVED': ['WARDEN'],
  'PENDING->REJECTED': ['WARDEN'],
  'APPROVED->ASSIGNED': ['WARDEN'],
  'ASSIGNED->IN_PROGRESS': ['STAFF'],
  'IN_PROGRESS->RESOLVED': ['STAFF'],
  'RESOLVED->CLOSED': ['WARDEN'],
};

/**
 * Validates if a status transition is permitted in the workflow
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, nextStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(nextStatus));
};

/**
 * Validates if the given role is authorized to perform the transition
 * @param {string} role 'STUDENT' | 'WARDEN' | 'STAFF'
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
const canRolePerformTransition = (role, currentStatus, nextStatus) => {
  const key = `${currentStatus}->${nextStatus}`;
  const allowedRoles = TRANSITION_ROLES[key];
  return Boolean(allowedRoles && allowedRoles.includes(role));
};

module.exports = {
  COMPLAINT_STATUSES,
  COMPLAINT_CATEGORIES,
  VALID_TRANSITIONS,
  isValidTransition,
  canRolePerformTransition,
};
