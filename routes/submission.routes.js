const express            = require('express');
const router             = express.Router();
const upload             = require('../middleware/upload');
const { createSubmission } = require('../controllers/submission.controller');

// Public — no auth required
router.post('/', upload.single('result_image'), createSubmission);

module.exports = router;
