const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadSingleImage } = require('../middleware/upload.middleware');

// POST /api/upload
router.post(
  '/',
  verifyToken,
  uploadSingleImage('image'),
  uploadController.uploadImage
);

module.exports = router;
