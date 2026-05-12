const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { auth, guruOnly } = require('../middleware/auth');

router.get('/', settingsController.getSettings);           // publik
router.put('/', auth, guruOnly, settingsController.updateSettings); // guru only

module.exports = router;
