const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Configured successfully with cloud:', cloudName);
} else {
  console.warn('[Cloudinary] Credentials not fully set in environment. Running with local fallback mode for development.');
}

/**
 * Uploads a buffer directly to Cloudinary using upload_stream.
 * Fallback to base64 Data URI if Cloudinary credentials are not supplied.
 * 
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - { folder, public_id, mimeType }
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      // In dev fallback mode if user hasn't set keys in .env
      const mime = options.mimeType || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64}`;
      return resolve({
        url: dataUri,
        publicId: `dev_mock_${Date.now()}`,
      });
    }

    const folderPath = options.folder ? `hostelfix/${options.folder}` : 'hostelfix/complaints';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error);
          return reject(new Error(error.message || 'Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary,
};
