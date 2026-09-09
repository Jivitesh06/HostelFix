const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public student registration
router.post('/register', authController.register);
// Secure administrative staff and warden onboarding portal
router.post('/staff-register', authController.staffRegister);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
