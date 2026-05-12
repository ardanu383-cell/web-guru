const express = require('express');
const router = express.Router();
const kuisController = require('../controllers/kuisController');
const { auth, guruOnly } = require('../middleware/auth');

router.post('/', auth, guruOnly, kuisController.createKuis);
router.get('/', auth, kuisController.getAllKuis);
router.get('/:id', auth, kuisController.getKuisById);
router.post('/:id/submit', auth, kuisController.submitKuis);

module.exports = router;