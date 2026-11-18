const multer = require('multer');
const path = require('path');

// 4 MB max file size limit (safely under Vercel Serverless Function 4.5 MB gateway payload limit)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

// Store in memory buffer for immediate magic-byte inspection and text extraction
const storage = multer.memoryStorage();

// File filter checking extension and MIME type
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (extname !== '.pdf' || mimeType !== 'application/pdf') {
    const error = new Error('Invalid file type. Only PDF documents (.pdf) are accepted.');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware wrapper to handle Multer specific errors gracefully
 */
const handleResumeUpload = (req, res, next) => {
  const uploader = upload.single('resume');

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 4MB limit. Please upload a PDF under 4MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    next();
  });
};

module.exports = {
  handleResumeUpload,
  MAX_FILE_SIZE,
};

