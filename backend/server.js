const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files untuk upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import middleware (harus sebelum dipakai)
const upload = require('./middleware/upload');
const { auth } = require('./middleware/auth');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materi', require('./routes/materi'));
app.use('/api/kuis', require('./routes/kuis'));
app.use('/api/nilai', require('./routes/nilai'));
app.use('/api/berita', require('./routes/berita'));
app.use('/api/siswa', require('./routes/siswa'));
app.use('/api/settings', require('./routes/settings'));

// Upload gambar untuk Summernote
app.post('/api/upload/image', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Tidak ada file.' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Upload background hero
app.post('/api/settings/upload-bg', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Tidak ada file.' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server berjalan dengan baik!' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
