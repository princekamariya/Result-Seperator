const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    ALLOWED_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG or PDF files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
