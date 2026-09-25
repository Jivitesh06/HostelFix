const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public student registration & verification
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Secure administrative staff and warden onboarding portal
router.post('/staff-register', authController.staffRegister);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
