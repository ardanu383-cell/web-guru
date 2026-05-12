const express = require('express');
const router = express.Router();
const nilaiController = require('../controllers/nilaiController');
const { auth, guruOnly } = require('../middleware/auth');

router.get('/siswa', auth, nilaiController.getNilaiSiswa);
router.get('/kuis/:kuisId', auth, guruOnly, nilaiController.getNilaiByKuis);

module.exports = router;