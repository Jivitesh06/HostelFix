const multer = require('multer');
const { sendError } = require('../utils/response');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware wrapper to handle multer errors cleanly.
 */
const uploadSingleImage = (fieldName = 'image') => {
  const multerHandler = upload.single(fieldName);

  return (req, res, next) => {
    multerHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(
            res,
            'File size exceeds 5MB limit. Please upload a smaller image.',
            400
          );
        }
        return sendError(res, `Upload error: ${err.message}`, 400);
      } else if (err) {
        return sendError(res, err.message, err.statusCode || 400);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingleImage,
};
