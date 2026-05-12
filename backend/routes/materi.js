const express = require('express');
const router = express.Router();
const materiController = require('../controllers/materiController');
const { auth, guruOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, guruOnly, upload.single('file'), materiController.createMateri);
router.get('/', auth, materiController.getAllMateri);
router.get('/:id', auth, materiController.getMateriById);
router.delete('/:id', auth, guruOnly, materiController.deleteMateri);
router.post('/:id/komentar', auth, materiController.addKomentar);

module.exports = router;