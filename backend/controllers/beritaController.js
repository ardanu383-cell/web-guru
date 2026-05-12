const pool = require('../config/database');

exports.createBerita = async (req, res) => {
    try {
        const { judul, isi, kategori } = req.body;
        const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;
        const guru_id = req.user.id;

        const [result] = await pool.query(
            'INSERT INTO berita (judul, isi, kategori, thumbnail_url, guru_id) VALUES (?, ?, ?, ?, ?)',
            [judul, isi, kategori || 'umum', thumbnail_url, guru_id]
        );

        res.status(201).json({ message: 'Berita berhasil dibuat.', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBerita = async (req, res) => {
    try {
        const [berita] = await pool.query(
            `SELECT b.*, u.nama as guru_nama 
             FROM berita b 
             JOIN users u ON b.guru_id = u.id 
             ORDER BY b.created_at DESC`
        );
        res.json(berita);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBeritaById = async (req, res) => {
    try {
        const [berita] = await pool.query(
            `SELECT b.*, u.nama as guru_nama 
             FROM berita b 
             JOIN users u ON b.guru_id = u.id 
             WHERE b.id = ?`,
            [req.params.id]
        );

        if (berita.length === 0) {
            return res.status(404).json({ message: 'Berita tidak ditemukan.' });
        }

        res.json(berita[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBerita = async (req, res) => {
    try {
        const { judul, isi, kategori } = req.body;
        const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;

        let query = 'UPDATE berita SET judul = ?, isi = ?, kategori = ?';
        const params = [judul, isi, kategori || 'umum'];

        if (thumbnail_url) {
            query += ', thumbnail_url = ?';
            params.push(thumbnail_url);
        }

        query += ' WHERE id = ? AND guru_id = ?';
        params.push(req.params.id, req.user.id);

        await pool.query(query, params);
        res.json({ message: 'Berita berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBerita = async (req, res) => {
    try {
        await pool.query('DELETE FROM berita WHERE id = ? AND guru_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Berita berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
