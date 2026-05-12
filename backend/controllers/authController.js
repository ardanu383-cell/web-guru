const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.register = async (req, res) => {
    try {
        const { nama, email, password, role, kelas, invite_code } = req.body;

        // Blokir pendaftaran guru tanpa kode undangan
        if (role === 'guru') {
            const validCode = process.env.GURU_INVITE_CODE;
            if (!invite_code || invite_code !== validCode) {
                return res.status(403).json({ message: 'Kode undangan guru tidak valid.' });
            }
        }

        // Hanya izinkan role siswa dan guru dari form publik
        if (!['siswa', 'guru'].includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }

        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Guru dengan kode valid langsung approved, siswa pending
        const status = (role === 'guru') ? 'approved' : 'pending';

        const [result] = await pool.query(
            'INSERT INTO users (nama, email, password, role, kelas, status) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, email, hashedPassword, role, kelas || null, status]
        );

        const message = status === 'pending'
            ? 'Registrasi berhasil. Akun Anda menunggu persetujuan admin.'
            : 'Registrasi berhasil. Silakan login.';

        res.status(201).json({ message, userId: result.insertId, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email atau password salah.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah.' });
        }

        // Cek status akun
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Akun Anda belum disetujui admin. Silakan tunggu konfirmasi.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Akun Anda ditolak. Hubungi admin untuk informasi lebih lanjut.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, nama: user.nama },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                kelas: user.kelas
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyInvite = async (req, res) => {
    const { invite_code } = req.body;
    const validCode = process.env.GURU_INVITE_CODE;
    if (!invite_code || invite_code !== validCode) {
        return res.status(403).json({ message: 'Kode undangan tidak valid.' });
    }
    res.json({ message: 'Kode valid.' });
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nama, email, role, kelas FROM users WHERE id = ?', [req.user.id]);
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ubah password
exports.changePassword = async (req, res) => {
    try {
        const { password_lama, password_baru } = req.body;
        if (!password_lama || !password_baru) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi.' });
        }
        if (password_baru.length < 6) {
            return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        const isMatch = await bcrypt.compare(password_lama, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password lama tidak sesuai.' });
        }

        const hashed = await bcrypt.hash(password_baru, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
        res.json({ message: 'Password berhasil diubah.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lihat kode undangan (kode penuh)
exports.getInviteCode = async (req, res) => {
    if (req.user.role !== 'guru') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    const code = process.env.GURU_INVITE_CODE || '(belum diset)';
    res.json({ code });
};

// Update kode undangan — simpan ke file .env
exports.updateInviteCode = async (req, res) => {
    if (req.user.role !== 'guru') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    const { kode_baru, password } = req.body;
    if (!kode_baru || kode_baru.length < 6) {
        return res.status(400).json({ message: 'Kode undangan minimal 6 karakter.' });
    }

    // Verifikasi password admin sebelum ubah kode
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Password tidak sesuai.' });
    }

    try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '../../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (envContent.includes('GURU_INVITE_CODE=')) {
            envContent = envContent.replace(/GURU_INVITE_CODE=.*/g, `GURU_INVITE_CODE=${kode_baru}`);
        } else {
            envContent += `\nGURU_INVITE_CODE=${kode_baru}`;
        }

        fs.writeFileSync(envPath, envContent);
        process.env.GURU_INVITE_CODE = kode_baru;

        res.json({ message: 'Kode undangan berhasil diperbarui.' });
    } catch (e) {
        res.status(500).json({ message: 'Gagal menyimpan kode: ' + e.message });
    }
};
