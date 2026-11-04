// src/routes/categories.js
const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY category_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// POST /api/categories  (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { category_name, description } = req.body;
  if (!category_name) return res.status(400).json({ message: 'กรุณาระบุชื่อหมวดหมู่' });
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );
    res.status(201).json({ category_id: result.insertId, category_name, description });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PUT /api/categories/:id  (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { category_name, description } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name, description, req.params.id]
    );
    res.json({ message: 'อัปเดตหมวดหมู่สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// DELETE /api/categories/:id  (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
    res.json({ message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

