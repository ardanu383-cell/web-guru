const pool = require('../config/database');

exports.createMateri = async (req, res) => {
    try {
        const { judul, deskripsi, konten, tipe, mapel, kelas_target } = req.body;
        const file_url = req.file ? `/uploads/${req.file.filename}` : null;
        const guru_id = req.user.id;

        const [result] = await pool.query(
            'INSERT INTO materi (judul, deskripsi, konten, tipe, file_url, mapel, kelas_target, guru_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [judul, deskripsi, konten, tipe, file_url, mapel, kelas_target, guru_id]
        );

        res.status(201).json({ message: 'Materi berhasil dibuat.', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllMateri = async (req, res) => {
    try {
        const { mapel, kelas } = req.query;
        let query = 'SELECT m.*, u.nama as guru_nama FROM materi m JOIN users u ON m.guru_id = u.id';
        const params = [];

        if (mapel || kelas) {
            query += ' WHERE';
            if (mapel) {
                query += ' m.mapel = ?';
                params.push(mapel);
            }
            if (kelas) {
                query += params.length > 0 ? ' AND' : '';
                query += ' m.kelas_target = ?';
                params.push(kelas);
            }
        }

        query += ' ORDER BY m.created_at DESC';
        const [materi] = await pool.query(query, params);
        res.json(materi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMateriById = async (req, res) => {
    try {
        const [materi] = await pool.query(
            'SELECT m.*, u.nama as guru_nama FROM materi m JOIN users u ON m.guru_id = u.id WHERE m.id = ?',
            [req.params.id]
        );
        
        if (materi.length === 0) {
            return res.status(404).json({ message: 'Materi tidak ditemukan.' });
        }

        // Ambil komentar
        const [komentar] = await pool.query(
            `SELECT k.*, u.nama as siswa_nama 
             FROM komentar k 
             JOIN users u ON k.siswa_id = u.id 
             WHERE k.materi_id = ? 
             ORDER BY k.created_at DESC`,
            [req.params.id]
        );

        res.json({ ...materi[0], komentar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMateri = async (req, res) => {
    try {
        await pool.query('DELETE FROM materi WHERE id = ? AND guru_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Materi berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addKomentar = async (req, res) => {
    try {
        const { isi } = req.body;
        const [result] = await pool.query(
            'INSERT INTO komentar (materi_id, siswa_id, isi) VALUES (?, ?, ?)',
            [req.params.id, req.user.id, isi]
        );
        res.status(201).json({ message: 'Komentar ditambahkan.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};