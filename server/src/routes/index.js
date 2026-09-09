const express = require('express');
const router = express.Router();

const healthRoute = require('./health.route');
const authRoute = require('./auth.route');
const complaintRoute = require('./complaint.route');
const userRoute = require('./user.route');
const messRoute = require('./mess.route');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Health check
router.use('/health', healthRoute);

// ── Phase 3B: Authentication ──────────────────────────────────────────────────
router.use('/auth', authRoute);

// ── Phase 3C: Complaints & Users ──────────────────────────────────────────────
router.use('/complaints', complaintRoute);
router.use('/users', userRoute);

// ── Phase 3D: Mess Management & Feedback ──────────────────────────────────────
router.use('/mess', messRoute);

// ── Role Authorization Test Routes (Used to verify role enforcement) ──────────
router.get(
  '/test/student-only',
  verifyToken,
  requireRole('STUDENT'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Student authorization verified',
      user: req.user,
    });
  }
);

router.get(
  '/test/warden-only',
  verifyToken,
  requireRole('WARDEN'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Warden authorization verified',
      user: req.user,
    });
  }
);

router.get(
  '/test/staff-only',
  verifyToken,
  requireRole('STAFF'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Staff authorization verified',
      user: req.user,
    });
  }
);

module.exports = router;
