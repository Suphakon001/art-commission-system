// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'ไม่มี Token กรุณาเข้าสู่ระบบ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'artshop_jwt_secret_2026_xyz');
    req.user = decoded; // { user_id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'สิทธิ์เข้าถึงสำหรับ Admin เท่านั้น' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };

