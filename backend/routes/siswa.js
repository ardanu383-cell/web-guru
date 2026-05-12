const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswaController');
const { auth, guruOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Upload temp untuk import
const uploadTemp = multer({
    dest: 'uploads/temp/',
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.xlsx', '.xls', '.csv'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file Excel (.xlsx, .xls) atau CSV yang diizinkan'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get('/', auth, guruOnly, siswaController.getAllSiswa);
router.get('/pending', auth, guruOnly, siswaController.getPendingSiswa);
router.post('/tambah', auth, guruOnly, siswaController.tambahSiswa);
router.put('/:id/approve', auth, guruOnly, siswaController.approveSiswa);
router.put('/:id/reject', auth, guruOnly, siswaController.rejectSiswa);
router.put('/:id', auth, guruOnly, siswaController.updateSiswa);
router.delete('/:id', auth, guruOnly, siswaController.deleteSiswa);
router.post('/import', auth, guruOnly, uploadTemp.single('file'), siswaController.importSiswa);
router.get('/export', auth, guruOnly, siswaController.exportSiswa);
router.get('/template', auth, guruOnly, siswaController.downloadTemplate);

module.exports = router;
