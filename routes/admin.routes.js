const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth.middleware');
const {
  login,
  logout,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
} = require('../controllers/admin.controller');

router.post('/login',  login);
router.post('/logout', auth, logout);

router.get('/submissions',               auth, listSubmissions);
router.patch('/submissions/:id/approve', auth, approveSubmission);
router.patch('/submissions/:id/reject',  auth, rejectSubmission);
router.delete('/submissions/:id',        auth, deleteSubmission);

module.exports = router;
