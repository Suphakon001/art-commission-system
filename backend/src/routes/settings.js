// src/routes/settings.js
const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/settings  — public (is_commission_open, max_queue)
router.get('/', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM shop_settings WHERE setting_id = 1');
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PUT /api/settings  (admin)
router.put('/', authenticate, requireAdmin, async (req, res) => {
  const { is_commission_open, max_queue } = req.body;
  try {
    await pool.query(
      'UPDATE shop_settings SET is_commission_open = ?, max_queue = ? WHERE setting_id = 1',
      [is_commission_open, max_queue]
    );
    res.json({ message: 'อัปเดตการตั้งค่าสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

