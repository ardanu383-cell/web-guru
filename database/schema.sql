CREATE DATABASE IF NOT EXISTS guru_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE guru_website;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('guru','siswa') DEFAULT 'siswa',
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    kelas VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    konten TEXT,
    tipe ENUM('video','dokumen','teks') DEFAULT 'teks',
    file_url VARCHAR(255),
    mapel VARCHAR(50),
    kelas_target VARCHAR(20),
    guru_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE kuis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    materi_id INT,
    guru_id INT,
    waktu_menit INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kuis_id INT,
    pertanyaan TEXT NOT NULL,
    pilihan_a VARCHAR(255),
    pilihan_b VARCHAR(255),
    pilihan_c VARCHAR(255),
    pilihan_d VARCHAR(255),
    jawaban_benar ENUM('A','B','C','D'),
    FOREIGN KEY (kuis_id) REFERENCES kuis(id) ON DELETE CASCADE
);

CREATE TABLE nilai_kuis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT,
    kuis_id INT,
    total_nilai INT,
    total_soal INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kuis_id) REFERENCES kuis(id) ON DELETE CASCADE
);

CREATE TABLE jawaban_siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT,
    soal_id INT,
    jawaban ENUM('A','B','C','D'),
    is_benar BOOLEAN,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);

CREATE TABLE komentar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materi_id INT,
    siswa_id INT,
    isi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'umum',
    thumbnail_url VARCHAR(255),
    guru_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert data awal (Guru)
INSERT INTO users (nama, email, password, role) VALUES 
('Guru Admin', 'guru@sekolah.id', '$2b$10$YourHashedPasswordHere', 'guru');