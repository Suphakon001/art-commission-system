// src/routes/artworks.js
const router  = require('express').Router();
const pool    = require('../config/db');
const path    = require('path');
const fs      = require('fs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadArtwork } = require('../middleware/upload');

// GET /api/artworks?category_id=&search=&page=&limit=&all=
router.get('/', async (req, res) => {
  const { category_id, search, page = 1, limit = 12, all } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const whereClauses = [];
  const params = [];

  // Show all for admin management if all=true, otherwise only show active for customer shop
  if (all !== 'true' && all !== '1') {
    whereClauses.push('a.is_active = TRUE');
  }

  if (category_id) { whereClauses.push('a.category_id = ?'); params.push(category_id); }
  if (search)       { whereClauses.push('a.title LIKE ?');   params.push(`%${search}%`); }

  const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM artworks a ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT a.*, c.category_name
       FROM artworks a
       JOIN categories c ON a.category_id = c.category_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/artworks/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.category_name
       FROM artworks a
       JOIN categories c ON a.category_id = c.category_id
       WHERE a.artwork_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบผลงาน' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// POST /api/artworks  (admin) — multipart: preview_image, high_res_file
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadArtwork.fields([
    { name: 'preview_image', maxCount: 1 },
    { name: 'high_res_file', maxCount: 1 },
  ]),
  async (req, res) => {
    const { category_id, title, description, price, file_format, status, is_active } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'กรุณาระบุชื่อผลงาน' });
    if (!category_id) return res.status(400).json({ message: 'กรุณาเลือกหมวดหมู่' });
    if (!price || parseFloat(price) <= 0) return res.status(400).json({ message: 'กรุณาระบุราคาที่ถูกต้อง' });
    if (!req.files?.preview_image) return res.status(400).json({ message: 'กรุณาแนบภาพตัวอย่าง (Preview)' });
    if (!req.files?.high_res_file) return res.status(400).json({ message: 'กรุณาแนบไฟล์ความละเอียดสูง (High-Res File)' });

    const preview = req.files.preview_image[0].filename;
    const highRes = req.files.high_res_file[0].filename;
    const active = (is_active === '0' || is_active === 0 || is_active === false || is_active === 'false') ? 0 : 1;

    try {
      const [result] = await pool.query(
        `INSERT INTO artworks
         (category_id, title, description, price, preview_image, high_res_file, file_format, status, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [category_id, title, description || null, price, preview, highRes, file_format || 'PNG', status || 'available', active]
      );
      res.status(201).json({ artwork_id: result.insertId, message: 'เพิ่มผลงานสำเร็จ' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  }
);

// PUT /api/artworks/:id  (admin)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  uploadArtwork.fields([
    { name: 'preview_image', maxCount: 1 },
    { name: 'high_res_file', maxCount: 1 },
  ]),
  async (req, res) => {
    const { category_id, title, description, price, file_format, status, is_active } = req.body;
    try {
      const [current] = await pool.query(
        'SELECT preview_image, high_res_file, status FROM artworks WHERE artwork_id = ?',
        [req.params.id]
      );
      if (!current.length) return res.status(404).json({ message: 'ไม่พบผลงาน' });

      const preview = req.files?.preview_image?.[0]?.filename || current[0].preview_image;
      const highRes = req.files?.high_res_file?.[0]?.filename  || current[0].high_res_file;
      const finalStatus = status || current[0].status || 'available';
      const active = (is_active === '0' || is_active === 0 || is_active === false || is_active === 'false') ? 0 : 1;

      await pool.query(
        `UPDATE artworks SET
         category_id = ?, title = ?, description = ?, price = ?,
         preview_image = ?, high_res_file = ?, file_format = ?, status = ?, is_active = ?
         WHERE artwork_id = ?`,
        [category_id, title, description, price, preview, highRes,
         file_format || 'PNG', finalStatus, active,
         req.params.id]
      );
      res.json({ message: 'อัปเดตผลงานสำเร็จ' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
  }
);

// PATCH /api/artworks/:id/toggle-active (admin — toggle show/hide)
router.patch('/:id/toggle-active', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT is_active, title FROM artworks WHERE artwork_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบผลงาน' });

    const newActive = !rows[0].is_active;
    await pool.query('UPDATE artworks SET is_active = ? WHERE artwork_id = ?', [newActive, req.params.id]);

    res.json({
      is_active: newActive,
      message: newActive ? `แสดงผลงาน "${rows[0].title}" ในหน้าร้านแล้ว` : `ซ่อนผลงาน "${rows[0].title}" จากหน้าร้านแล้ว`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแสดงผล' });
  }
});

// DELETE /api/artworks/:id (admin — hard delete if not in any orders)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // 1. Check if artwork exists
    const [rows] = await pool.query('SELECT * FROM artworks WHERE artwork_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบผลงาน' });
    const artwork = rows[0];

    // 2. Check if artwork is referenced in orders
    const [orderItems] = await pool.query('SELECT order_item_id FROM order_items WHERE artwork_id = ? LIMIT 1', [req.params.id]);
    if (orderItems.length > 0) {
      return res.status(400).json({
        message: 'ไม่สามารถลบผลงานนี้ได้ เนื่องจากมีประวัติคำสั่งซื้อของลูกค้าในระบบแล้ว แนะนำให้ใช้การ "ซ่อน" แทน'
      });
    }

    // 3. Delete from database
    await pool.query('DELETE FROM artworks WHERE artwork_id = ?', [req.params.id]);

    // 4. Safely delete associated files from disk
    const uploadsDir = path.join(__dirname, '../../uploads/artworks');
    if (artwork.preview_image && !artwork.preview_image.startsWith('sample')) {
      const previewPath = path.join(uploadsDir, artwork.preview_image);
      if (fs.existsSync(previewPath)) {
        try { fs.unlinkSync(previewPath); } catch {}
      }
    }
    if (artwork.high_res_file && !artwork.high_res_file.startsWith('sample')) {
      const highResPath = path.join(uploadsDir, artwork.high_res_file);
      if (fs.existsSync(highResPath)) {
        try { fs.unlinkSync(highResPath); } catch {}
      }
    }

    res.json({ message: `ลบผลงาน "${artwork.title}" ออกจากระบบเรียบร้อยแล้ว` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบผลงาน' });
  }
});

module.exports = router;

