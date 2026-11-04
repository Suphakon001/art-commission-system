// src/routes/commissions.js
const router   = require('express').Router();
const pool     = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadSlip, uploadReference, uploadDraft, uploadCommission } = require('../middleware/upload');
const multer   = require('multer');

const FEE_RATE = parseFloat(process.env.SERVICE_FEE_RATE || '0.05');

// GET /api/commissions/packages  — public
router.get('/packages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM commission_packages ORDER BY base_price');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/commissions/fee-preview?base_price=&addon_price=
router.get('/fee-preview', (req, res) => {
  const base  = parseFloat(req.query.base_price  || 0);
  const addon = parseFloat(req.query.addon_price || 0);
  const baseAmount  = parseFloat((base + addon).toFixed(2));
  const service_fee = parseFloat((baseAmount * FEE_RATE).toFixed(2));
  const total       = parseFloat((baseAmount + service_fee).toFixed(2));
  res.json({ base_amount: baseAmount, service_fee, total_amount: total, fee_rate: FEE_RATE });
});

// POST /api/commissions  — submit commission (customer)
router.post('/', authenticate, uploadCommission, async (req, res) => {
  const { package_id, brief_detail, addon_price = 0 } = req.body;
  if (!package_id || !brief_detail)
    return res.status(400).json({ message: 'กรุณากรอก package และรายละเอียด' });

  try {
    // Check if commission is open
    const [[settings]] = await pool.query('SELECT * FROM shop_settings WHERE setting_id = 1');
    if (!settings.is_commission_open)
      return res.status(403).json({ message: 'ระบบรับจ้างวาดภาพปิดรับชั่วคราว' });

    // Check queue
    const [[{ queue_count }]] = await pool.query(
      `SELECT COUNT(*) AS queue_count FROM commissions
       WHERE payment_status = 'approved' AND work_status != 'เสร็จสมบูรณ์'`
    );
    if (queue_count >= settings.max_queue)
      return res.status(403).json({ message: 'คิวเต็มแล้ว กรุณารอรอบถัดไป' });

    const [[pkg]] = await pool.query(
      'SELECT base_price FROM commission_packages WHERE package_id = ? AND is_open = TRUE',
      [package_id]
    );
    if (!pkg) return res.status(404).json({ message: 'ไม่พบแพ็กเกจหรือแพ็กเกจปิดรับ' });

    const addonNum   = parseFloat(addon_price) || 0;
    const base_amount = parseFloat((parseFloat(pkg.base_price) + addonNum).toFixed(2));
    const service_fee = parseFloat((base_amount * FEE_RATE).toFixed(2));
    const total_amount = parseFloat((base_amount + service_fee).toFixed(2));

    const refImage   = req.files?.reference_image?.[0]?.filename || null;
    const slipImage  = req.files?.slip_image?.[0]?.filename      || null;

    const [result] = await pool.query(
      `INSERT INTO commissions
       (user_id, package_id, brief_detail, reference_image, addon_price,
        base_amount, service_fee, total_amount, slip_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.user_id, package_id, brief_detail, refImage,
       addonNum, base_amount, service_fee, total_amount, slipImage]
    );
    res.status(201).json({
      commission_id: result.insertId,
      base_amount, service_fee, total_amount,
      message: 'ส่งคำสั่งจ้างสำเร็จ',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/commissions/my  — customer's commissions
router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, cp.package_name
       FROM commissions c
       JOIN commission_packages cp ON c.package_id = cp.package_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/commissions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, cp.package_name, cp.base_price
       FROM commissions c
       JOIN commission_packages cp ON c.package_id = cp.package_id
       WHERE c.commission_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบงาน Commission' });
    if (rows[0].user_id !== req.user.user_id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/commissions/:id/slip  — upload slip
router.patch('/:id/slip', authenticate, uploadSlip.single('slip_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาแนบสลิป' });
  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM commissions WHERE commission_id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบงาน' });
    if (rows[0].user_id !== req.user.user_id)
      return res.status(403).json({ message: 'ไม่มีสิทธิ์' });

    await pool.query(
      'UPDATE commissions SET slip_image = ?, payment_status = "pending" WHERE commission_id = ?',
      [req.file.filename, req.params.id]
    );
    res.json({ message: 'อัปโหลดสลิปสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/commissions  (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { payment_status, work_status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const wheres = [];

  if (payment_status) { wheres.push('c.payment_status = ?'); params.push(payment_status); }
  if (work_status)    { wheres.push('c.work_status = ?');    params.push(work_status); }
  const where = wheres.length ? 'WHERE ' + wheres.join(' AND ') : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM commissions c ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.email, cp.package_name
       FROM commissions c
       JOIN users u ON c.user_id = u.user_id
       JOIN commission_packages cp ON c.package_id = cp.package_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/commissions/:id/status  (admin)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { payment_status, work_status } = req.body;
  const updates = [];
  const params  = [];

  if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status); }
  if (work_status)    { updates.push('work_status = ?');    params.push(work_status); }
  if (!updates.length) return res.status(400).json({ message: 'ไม่มีข้อมูลที่จะอัปเดต' });

  params.push(req.params.id);
  try {
    await pool.query(
      `UPDATE commissions SET ${updates.join(', ')} WHERE commission_id = ?`, params
    );
    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/commissions/:id/upload-draft  (admin)
router.patch('/:id/upload-draft', authenticate, requireAdmin, uploadDraft.single('draft_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาแนบไฟล์' });
  try {
    await pool.query(
      'UPDATE commissions SET draft_image = ? WHERE commission_id = ?',
      [req.file.filename, req.params.id]
    );
    res.json({ message: 'อัปโหลดร่างสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/commissions/:id/upload-final  (admin)
router.patch('/:id/upload-final', authenticate, requireAdmin, uploadDraft.single('final_file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาแนบไฟล์สุดท้าย' });
  try {
    await pool.query(
      'UPDATE commissions SET final_file = ?, work_status = "เสร็จสมบูรณ์" WHERE commission_id = ?',
      [req.file.filename, req.params.id]
    );
    res.json({ message: 'อัปโหลดงานสุดท้ายสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/commissions/packages/:id  (admin)
router.patch('/packages/:id', authenticate, requireAdmin, async (req, res) => {
  const { package_name, description, base_price, is_open } = req.body;
  try {
    await pool.query(
      `UPDATE commission_packages
       SET package_name = ?, description = ?, base_price = ?, is_open = ?
       WHERE package_id = ?`,
      [package_name, description, base_price, is_open, req.params.id]
    );
    res.json({ message: 'อัปเดตแพ็กเกจสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

