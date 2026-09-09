const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Public endpoint to verify the API is running.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HostelFix API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
