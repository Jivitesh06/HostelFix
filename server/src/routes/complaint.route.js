const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Staff list for warden assignment dropdown (must be before /:id)
router.get(
  '/staff-list',
  verifyToken,
  requireRole('WARDEN'),
  complaintController.getStaffList
);

// Create complaint (Student only)
router.post(
  '/',
  verifyToken,
  requireRole('STUDENT'),
  complaintController.createComplaint
);

// List complaints (Role-scoped: Student own, Staff assigned, Warden all)
router.get(
  '/',
  verifyToken,
  complaintController.getComplaints
);

// Complaint details (Role-checked)
router.get(
  '/:id',
  verifyToken,
  complaintController.getComplaintById
);

// Approve complaint (Warden only)
router.patch(
  '/:id/approve',
  verifyToken,
  requireRole('WARDEN'),
  complaintController.approveComplaint
);

// Reject complaint (Warden only)
router.patch(
  '/:id/reject',
  verifyToken,
  requireRole('WARDEN'),
  complaintController.rejectComplaint
);

// Assign complaint to staff (Warden only)
router.patch(
  '/:id/assign',
  verifyToken,
  requireRole('WARDEN'),
  complaintController.assignComplaint
);

// Update status: IN_PROGRESS or RESOLVED (Staff only)
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('STAFF'),
  complaintController.updateComplaintStatus
);

// Close complaint (Warden only)
router.patch(
  '/:id/close',
  verifyToken,
  requireRole('WARDEN'),
  complaintController.closeComplaint
);

module.exports = router;
