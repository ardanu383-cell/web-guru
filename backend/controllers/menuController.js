const pool = require('../config/database');

// ── GET semua menu (publik) ───────────────────────────────────────
exports.getMenus = async (req, res) => {
    try {
        const [menus] = await pool.query(
            'SELECT * FROM menus WHERE parent_id IS NULL AND aktif = 1 ORDER BY urutan ASC'
        );
        for (const menu of menus) {
            const [sub] = await pool.query(
                'SELECT * FROM menus WHERE parent_id = ? AND aktif = 1 ORDER BY urutan ASC',
                [menu.id]
            );
            menu.submenu = sub;
        }
        res.json(menus);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── GET semua menu untuk admin ────────────────────────────────────
exports.getAllMenus = async (req, res) => {
    try {
        const [menus] = await pool.query('SELECT * FROM menus ORDER BY parent_id ASC, urutan ASC');
        res.json(menus);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Tambah menu ───────────────────────────────────────────────────
exports.createMenu = async (req, res) => {
    try {
        const { label, parent_id, tipe, link, page_id, urutan, aktif } = req.body;
        const [result] = await pool.query(
            'INSERT INTO menus (label, parent_id, tipe, link, page_id, urutan, aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [label, parent_id || null, tipe || 'link', link || null, page_id || null, urutan || 0, aktif !== false ? 1 : 0]
        );
        res.status(201).json({ message: 'Menu berhasil ditambahkan.', id: result.insertId });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Update menu ───────────────────────────────────────────────────
exports.updateMenu = async (req, res) => {
    try {
        const { label, parent_id, tipe, link, page_id, urutan, aktif } = req.body;
        await pool.query(
            'UPDATE menus SET label=?, parent_id=?, tipe=?, link=?, page_id=?, urutan=?, aktif=? WHERE id=?',
            [label, parent_id || null, tipe || 'link', link || null, page_id || null, urutan || 0, aktif ? 1 : 0, req.params.id]
        );
        res.json({ message: 'Menu berhasil diperbarui.' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Hapus menu ────────────────────────────────────────────────────
exports.deleteMenu = async (req, res) => {
    try {
        await pool.query('DELETE FROM menus WHERE id = ? OR parent_id = ?', [req.params.id, req.params.id]);
        res.json({ message: 'Menu berhasil dihapus.' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── GET semua halaman ─────────────────────────────────────────────
exports.getPages = async (req, res) => {
    try {
        const [pages] = await pool.query('SELECT id, judul, slug, created_at FROM pages ORDER BY created_at DESC');
        res.json(pages);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── GET halaman by slug (publik) ──────────────────────────────────
exports.getPageBySlug = async (req, res) => {
    try {
        const [pages] = await pool.query('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
        if (pages.length === 0) return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
        res.json(pages[0]);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Tambah halaman ────────────────────────────────────────────────
exports.createPage = async (req, res) => {
    try {
        const { judul, konten, slug } = req.body;
        const finalSlug = slug || judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [finalSlug]);
        if (existing.length > 0) return res.status(400).json({ message: 'Slug sudah digunakan.' });
        const [result] = await pool.query(
            'INSERT INTO pages (judul, konten, slug) VALUES (?, ?, ?)',
            [judul, konten, finalSlug]
        );
        res.status(201).json({ message: 'Halaman berhasil dibuat.', id: result.insertId, slug: finalSlug });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Update halaman ────────────────────────────────────────────────
exports.updatePage = async (req, res) => {
    try {
        const { judul, konten, slug } = req.body;
        await pool.query('UPDATE pages SET judul=?, konten=?, slug=? WHERE id=?',
            [judul, konten, slug, req.params.id]);
        res.json({ message: 'Halaman berhasil diperbarui.' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Hapus halaman ─────────────────────────────────────────────────
exports.deletePage = async (req, res) => {
    try {
        await pool.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Halaman berhasil dihapus.' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
