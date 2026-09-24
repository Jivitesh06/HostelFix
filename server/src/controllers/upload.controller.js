const { uploadToCloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/upload
 * Accepts an image file (multipart/form-data) and uploads to Cloudinary.
 * Protected: Requires authenticated user.
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided. Please select an image to upload.', 400);
    }

    // Determine target folder
    const folderType = req.body.folder || req.query.folder || 'complaints/issues';
    const validFolders = ['complaints/issues', 'complaints/completions'];
    const targetFolder = validFolders.includes(folderType) ? folderType : 'complaints/issues';

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: targetFolder,
      mimeType: req.file.mimetype,
    });

    return sendSuccess(res, {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    }, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
