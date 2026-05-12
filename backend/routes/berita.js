const express = require('express');
const router = express.Router();
const beritaController = require('../controllers/beritaController');
const { auth, guruOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public - tidak perlu login
router.get('/', beritaController.getAllBerita);
router.get('/:id', beritaController.getBeritaById);

// Private - perlu login guru
router.post('/', auth, guruOnly, upload.single('thumbnail'), beritaController.createBerita);
router.put('/:id', auth, guruOnly, upload.single('thumbnail'), beritaController.updateBerita);
router.delete('/:id', auth, guruOnly, beritaController.deleteBerita);

module.exports = router;
