const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Use memory storage — we stream directly to Cloudinary so the
// timestamp is generated at upload time, never stale.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

/**
 * Upload a single buffer to Cloudinary.
 * Returns the secure_url string.
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const isVideo = mimetype.startsWith('video/');
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ethio-tourism',
        resource_type: isVideo ? 'video' : 'image',
        // Fresh timestamp on every call — no stale request errors
        timestamp: Math.round(Date.now() / 1000),
        transformation: isVideo
          ? undefined
          : [{ width: 1200, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Upload all files in req.files to Cloudinary and return URL array.
 */
const uploadFiles = async (files = []) => {
  return Promise.all(files.map(f => uploadToCloudinary(f.buffer, f.mimetype)));
};

module.exports = { cloudinary, upload, uploadToCloudinary, uploadFiles };
