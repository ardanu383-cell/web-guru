const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};

const guruOnly = (req, res, next) => {
    if (req.user.role !== 'guru') {
        return res.status(403).json({ message: 'Akses khusus guru.' });
    }
    next();
};

module.exports = { auth, guruOnly };