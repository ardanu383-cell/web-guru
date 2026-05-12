const pool = require('../config/database');

// Default settings homepage
const DEFAULTS = {
    hero_judul: 'Belajar Jadi Lebih Mudah & Menyenangkan',
    hero_subjudul: 'Platform pembelajaran digital untuk guru dan siswa. Akses materi, kerjakan kuis, dan tingkatkan prestasi belajar Anda.',
    hero_tombol1_teks: 'Mulai Belajar',
    hero_tombol1_link: 'register.html?role=siswa',
    hero_tombol1_tampil: 'true',
    hero_tombol2_teks: 'Daftar sebagai Guru',
    hero_tombol2_link: 'register-guru.html',
    hero_tombol2_tampil: 'true',
    fitur1_judul: 'Materi Lengkap',
    fitur1_deskripsi: 'Akses ratusan materi pembelajaran dalam bentuk video, dokumen, dan teks interaktif.',
    fitur1_tampil: 'true',
    fitur2_judul: 'Kuis Interaktif',
    fitur2_deskripsi: 'Uji pemahaman Anda dengan kuis online yang langsung menampilkan nilai dan pembahasan.',
    fitur2_tampil: 'true',
    fitur3_judul: 'Progress Real-time',
    fitur3_deskripsi: 'Pantau perkembangan belajar Anda dengan dashboard yang informatif dan mudah dipahami.',
    fitur3_tampil: 'true',
    cta_judul: 'Siap Untuk Meningkatkan Prestasi?',
    cta_subjudul: 'Bergabunglah dengan ribuan siswa dan guru yang telah menggunakan GuruOnline.',
    cta_tombol_teks: 'Daftar Gratis Sekarang',
    cta_tampil: 'true',
    nama_website: 'GuruOnline',
};

// Ambil semua settings
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT key_name, value FROM site_settings');
        const settings = { ...DEFAULTS };
        rows.forEach(r => { settings[r.key_name] = r.value; });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update settings (bulk)
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await pool.query(
                'INSERT INTO site_settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
                [key, value, value]
            );
        }
        res.json({ message: 'Pengaturan berhasil disimpan.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
