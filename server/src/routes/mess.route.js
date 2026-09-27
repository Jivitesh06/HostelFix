const express = require('express');
const router = express.Router();
const messController = require('../controllers/mess.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { uploadSingleImage } = require('../middleware/upload.middleware');

// Public to all authenticated users
router.get('/', verifyToken, messController.getMenu);

// Feedback retrieval for warden
router.get('/feedback', verifyToken, requireRole('WARDEN'), messController.getFeedback);

// Photo OCR extraction for Warden (analyzes image, returns 28-slot preview, does NOT publish)
router.post('/extract-menu-photo', verifyToken, requireRole('WARDEN'), uploadSingleImage('image'), messController.extractMenuFromPhoto);

// Publish confirmed 28-slot weekly menu for Warden
router.post('/publish-weekly-menu', verifyToken, requireRole('WARDEN'), messController.publishWeeklyMenu);

// Menu management for warden (manual items)
router.post('/', verifyToken, requireRole('WARDEN'), messController.createMenuItem);
router.put('/:id', verifyToken, requireRole('WARDEN'), messController.updateMenuItem);
router.delete('/:id', verifyToken, requireRole('WARDEN'), messController.deleteMenuItem);

// Student submits meal feedback
router.post('/:id/feedback', verifyToken, requireRole('STUDENT'), messController.submitFeedback);

module.exports = router;
