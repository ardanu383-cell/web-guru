const pool = require('../config/database');

exports.createKuis = async (req, res) => {
    try {
        const { judul, deskripsi, materi_id, waktu_menit, soal } = req.body;
        const guru_id = req.user.id;

        const [kuisResult] = await pool.query(
            'INSERT INTO kuis (judul, deskripsi, materi_id, guru_id, waktu_menit) VALUES (?, ?, ?, ?, ?)',
            [judul, deskripsi, materi_id, guru_id, waktu_menit]
        );

        const kuis_id = kuisResult.insertId;

        // Insert soal
        for (const s of soal) {
            await pool.query(
                'INSERT INTO soal (kuis_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [kuis_id, s.pertanyaan, s.pilihan_a, s.pilihan_b, s.pilihan_c, s.pilihan_d, s.jawaban_benar]
            );
        }

        res.status(201).json({ message: 'Kuis berhasil dibuat.', id: kuis_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllKuis = async (req, res) => {
    try {
        const [kuis] = await pool.query(
            `SELECT k.*, m.judul as materi_judul, u.nama as guru_nama,
             (SELECT COUNT(*) FROM soal WHERE kuis_id = k.id) as total_soal
             FROM kuis k 
             JOIN users u ON k.guru_id = u.id 
             LEFT JOIN materi m ON k.materi_id = m.id
             ORDER BY k.created_at DESC`
        );
        res.json(kuis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getKuisById = async (req, res) => {
    try {
        const [kuis] = await pool.query(
            `SELECT k.*, m.judul as materi_judul 
             FROM kuis k 
             LEFT JOIN materi m ON k.materi_id = m.id 
             WHERE k.id = ?`,
            [req.params.id]
        );

        if (kuis.length === 0) {
            return res.status(404).json({ message: 'Kuis tidak ditemukan.' });
        }

        const [soal] = await pool.query(
            'SELECT id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d FROM soal WHERE kuis_id = ?',
            [req.params.id]
        );

        res.json({ ...kuis[0], soal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitKuis = async (req, res) => {
    try {
        const { jawaban } = req.body; // { soal_id: jawaban, ... }
        const siswa_id = req.user.id;
        const kuis_id = req.params.id;

        const [soalList] = await pool.query('SELECT * FROM soal WHERE kuis_id = ?', [kuis_id]);
        
        let benar = 0;
        const total = soalList.length;

        for (const soal of soalList) {
            const jawabanSiswa = jawaban[soal.id];
            const isBenar = jawabanSiswa === soal.jawaban_benar;
            if (isBenar) benar++;

            await pool.query(
                'INSERT INTO jawaban_siswa (siswa_id, soal_id, jawaban, is_benar) VALUES (?, ?, ?, ?)',
                [siswa_id, soal.id, jawabanSiswa, isBenar]
            );
        }

        const nilai = Math.round((benar / total) * 100);
        
        await pool.query(
            'INSERT INTO nilai_kuis (siswa_id, kuis_id, total_nilai, total_soal) VALUES (?, ?, ?, ?)',
            [siswa_id, kuis_id, nilai, total]
        );

        res.json({ message: 'Kuis selesai.', nilai, benar, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};