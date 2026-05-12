const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

// ── Daftar semua siswa (approved) ────────────────────────────────
exports.getAllSiswa = async (req, res) => {
    try {
        const [siswa] = await pool.query(
            "SELECT id, nama, email, kelas, status, created_at FROM users WHERE role = 'siswa' ORDER BY created_at DESC"
        );
        res.json(siswa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Daftar siswa pending ──────────────────────────────────────────
exports.getPendingSiswa = async (req, res) => {
    try {
        const [siswa] = await pool.query(
            "SELECT id, nama, email, kelas, status, created_at FROM users WHERE role = 'siswa' AND status = 'pending' ORDER BY created_at DESC"
        );
        res.json(siswa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Approve siswa ─────────────────────────────────────────────────
exports.approveSiswa = async (req, res) => {
    try {
        await pool.query(
            "UPDATE users SET status = 'approved' WHERE id = ? AND role = 'siswa'",
            [req.params.id]
        );
        res.json({ message: 'Siswa berhasil disetujui.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Reject siswa ──────────────────────────────────────────────────
exports.rejectSiswa = async (req, res) => {
    try {
        await pool.query(
            "UPDATE users SET status = 'rejected' WHERE id = ? AND role = 'siswa'",
            [req.params.id]
        );
        res.json({ message: 'Siswa ditolak.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Hapus siswa ───────────────────────────────────────────────────
exports.deleteSiswa = async (req, res) => {
    try {
        await pool.query("DELETE FROM users WHERE id = ? AND role = 'siswa'", [req.params.id]);
        res.json({ message: 'Siswa berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Import siswa dari Excel/CSV ───────────────────────────────────
exports.importSiswa = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan.' });

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'File kosong atau format tidak sesuai.' });
        }

        let berhasil = 0;
        let gagal = 0;
        const errors = [];

        for (const row of rows) {
            const nama = row['nama'] || row['Nama'] || row['NAMA'];
            const email = row['email'] || row['Email'] || row['EMAIL'];
            const kelas = row['kelas'] || row['Kelas'] || row['KELAS'] || '';
            const password = row['password'] || row['Password'] || String(row['nisn'] || row['NISN'] || 'siswa123');

            if (!nama || !email) {
                gagal++;
                errors.push(`Baris ${berhasil + gagal}: nama/email kosong`);
                continue;
            }

            try {
                const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
                if (existing.length > 0) {
                    gagal++;
                    errors.push(`${email}: email sudah terdaftar`);
                    continue;
                }

                const hashedPassword = await bcrypt.hash(String(password), 10);
                await pool.query(
                    "INSERT INTO users (nama, email, password, role, kelas, status) VALUES (?, ?, ?, 'siswa', ?, 'approved')",
                    [nama, email, hashedPassword, kelas]
                );
                berhasil++;
            } catch (e) {
                gagal++;
                errors.push(`${email}: ${e.message}`);
            }
        }

        // Hapus file temp
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            message: `Import selesai. Berhasil: ${berhasil}, Gagal: ${gagal}`,
            berhasil, gagal, errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Export siswa ke Excel ─────────────────────────────────────────
exports.exportSiswa = async (req, res) => {
    try {
        const [siswa] = await pool.query(
            "SELECT nama, email, kelas, status, created_at FROM users WHERE role = 'siswa' ORDER BY kelas, nama"
        );

        const data = siswa.map(s => ({
            'Nama': s.nama,
            'Email': s.email,
            'Kelas': s.kelas || '-',
            'Status': s.status,
            'Tanggal Daftar': new Date(s.created_at).toLocaleDateString('id-ID')
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set lebar kolom
        worksheet['!cols'] = [
            { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="data-siswa.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Download template import ──────────────────────────────────────
exports.downloadTemplate = async (req, res) => {
    try {
        const template = [
            { nama: 'Contoh Siswa 1', email: 'siswa1@email.com', kelas: 'X-A', password: 'password123' },
            { nama: 'Contoh Siswa 2', email: 'siswa2@email.com', kelas: 'X-B', password: 'password123' },
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(template);
        worksheet['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="template-import-siswa.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
