const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/dropdown.controller');

// Single call for everything (used by the form on page load)
router.get('/all',       ctrl.getAll);

// Individual endpoints (useful for admin or future use)
router.get('/standards', ctrl.getStandards);
router.get('/boards',    ctrl.getBoards);
router.get('/degrees',   ctrl.getDegrees);

module.exports = router;
