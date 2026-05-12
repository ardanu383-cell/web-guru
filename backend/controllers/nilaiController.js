const pool = require('../config/database');

exports.getNilaiSiswa = async (req, res) => {
    try {
        const [nilai] = await pool.query(
            `SELECT nk.*, k.judul as kuis_judul, m.judul as materi_judul
             FROM nilai_kuis nk
             JOIN kuis k ON nk.kuis_id = k.id
             LEFT JOIN materi m ON k.materi_id = m.id
             WHERE nk.siswa_id = ?
             ORDER BY nk.created_at DESC`,
            [req.user.id]
        );
        res.json(nilai);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNilaiByKuis = async (req, res) => {
    try {
        const [nilai] = await pool.query(
            `SELECT nk.*, u.nama as siswa_nama, u.kelas
             FROM nilai_kuis nk
             JOIN users u ON nk.siswa_id = u.id
             WHERE nk.kuis_id = ?
             ORDER BY nk.total_nilai DESC`,
            [req.params.kuisId]
        );
        res.json(nilai);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};