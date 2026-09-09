const express = require('express');
const router = express.Router();

const healthRoute = require('./health.route');

// Health check
router.use('/health', healthRoute);

// ── Phase 3B: Authentication ──────────────────────────────────────────────────
// const authRoute = require('./auth.route');
// router.use('/auth', authRoute);

// ── Phase 3C: Complaints ──────────────────────────────────────────────────────
// const complaintRoute = require('./complaint.route');
// router.use('/complaints', complaintRoute);

// ── Phase 3D: Mess Management ─────────────────────────────────────────────────
// const messRoute = require('./mess.route');
// router.use('/mess', messRoute);

module.exports = router;
