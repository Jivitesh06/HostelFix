const express = require('express');
const router = express.Router();
const messController = require('../controllers/mess.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Public to all authenticated users
router.get('/', verifyToken, messController.getMenu);

// Feedback retrieval for warden
router.get('/feedback', verifyToken, requireRole('WARDEN'), messController.getFeedback);

// Menu management for warden
router.post('/', verifyToken, requireRole('WARDEN'), messController.createMenuItem);
router.put('/:id', verifyToken, requireRole('WARDEN'), messController.updateMenuItem);
router.delete('/:id', verifyToken, requireRole('WARDEN'), messController.deleteMenuItem);

// Student submits meal feedback
router.post('/:id/feedback', verifyToken, requireRole('STUDENT'), messController.submitFeedback);

module.exports = router;
