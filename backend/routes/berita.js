const express = require('express');
const router = express.Router();
const beritaController = require('../controllers/beritaController');
const { auth, guruOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, guruOnly, upload.single('thumbnail'), beritaController.createBerita);
router.get('/', auth, beritaController.getAllBerita);
router.get('/:id', auth, beritaController.getBeritaById);
router.put('/:id', auth, guruOnly, upload.single('thumbnail'), beritaController.updateBerita);
router.delete('/:id', auth, guruOnly, beritaController.deleteBerita);

module.exports = router;
