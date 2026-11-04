// src/routes/orders.js
const router = require('express').Router();
const pool   = require('../config/db');
const path   = require('path');
const fs     = require('fs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadSlip } = require('../middleware/upload');

const FEE_RATE = parseFloat(process.env.SERVICE_FEE_RATE || '0.05');

// POST /api/orders  — place an order (customer)
router.post(
  '/',
  authenticate,
  uploadSlip.single('slip_image'),
  async (req, res) => {
    // body: { items: JSON string of [{ artwork_id, price }], shipping_name, shipping_phone, shipping_address }
    let items;
    try { items = JSON.parse(req.body.items); }
    catch { return res.status(400).json({ message: 'รูปแบบ items ไม่ถูกต้อง' }); }

    if (!items?.length) return res.status(400).json({ message: 'ไม่มีสินค้าในคำสั่งซื้อ' });

    const { shipping_name, shipping_phone, shipping_address } = req.body;
    if (!shipping_name?.trim())    return res.status(400).json({ message: 'กรุณาระบุชื่อ-นามสกุลผู้รับ' });
    if (!shipping_phone?.trim())   return res.status(400).json({ message: 'กรุณาระบุเบอร์โทรศัพท์สำหรับจัดส่ง' });
    if (!shipping_address?.trim()) return res.status(400).json({ message: 'กรุณาระบุที่อยู่สำหรับจัดส่ง' });

    const slipFilename = req.file?.filename || null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verify prices & stock status from DB
      const ids = items.map(i => i.artwork_id);
      const [artworks] = await conn.query(
        `SELECT artwork_id, title, price, status FROM artworks WHERE artwork_id IN (${ids.map(() => '?').join(',')}) AND is_active = TRUE`,
        ids
      );

      for (const a of artworks) {
        if (a.status === 'sold_out') {
          throw new Error(`ขออภัย ผลงาน "${a.title}" มีผู้สั่งซื้อไปแล้ว (สินค้าหมด)`);
        }
      }

      const priceMap = Object.fromEntries(artworks.map(a => [a.artwork_id, parseFloat(a.price)]));

      let subtotal = 0;
      for (const item of items) {
        if (!priceMap[item.artwork_id])
          throw new Error(`ไม่พบผลงาน ID ${item.artwork_id}`);
        subtotal += priceMap[item.artwork_id];
      }

      const SHIPPING_FEE  = 50.00;
      const service_fee   = parseFloat((subtotal * FEE_RATE).toFixed(2));
      const total_amount  = parseFloat((subtotal + service_fee + SHIPPING_FEE).toFixed(2));

      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, subtotal, service_fee, shipping_fee, total_amount, slip_image, shipping_name, shipping_phone, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.user_id, subtotal, service_fee, SHIPPING_FEE, total_amount, slipFilename, shipping_name.trim(), shipping_phone.trim(), shipping_address.trim()]
      );
      const order_id = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          'INSERT INTO order_items (order_id, artwork_id, price) VALUES (?, ?, ?)',
          [order_id, item.artwork_id, priceMap[item.artwork_id]]
        );
      }

      // Automatically update purchased artworks status to 'sold_out'
      await conn.query(
        `UPDATE artworks SET status = 'sold_out' WHERE artwork_id IN (${ids.map(() => '?').join(',')})`,
        ids
      );

      await conn.commit();
      res.status(201).json({ order_id, subtotal, service_fee, shipping_fee: SHIPPING_FEE, total_amount, message: 'สั่งซื้อสำเร็จ' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ message: err.message || 'เกิดข้อผิดพลาด' });
    } finally {
      conn.release();
    }
  }
);

// GET /api/orders/my  — customer's own orders with item details & download links
router.get('/my', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.user_id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, a.title, a.preview_image, a.high_res_file, a.file_format
         FROM order_items oi
         JOIN artworks a ON oi.artwork_id = a.artwork_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
      order.artwork_titles = items.map(i => i.title).join(', ');
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/orders/:id/download/:artwork_id — secure high-res file download
router.get('/:id/download/:artwork_id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (!orders.length) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    if (orders[0].user_id !== req.user.user_id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    if (orders[0].payment_status !== 'approved')
      return res.status(400).json({ message: 'คำสั่งซื้อยังไม่ได้รับการอนุมัติการชำระเงิน' });

    const [items] = await pool.query(
      `SELECT a.* FROM order_items oi
       JOIN artworks a ON oi.artwork_id = a.artwork_id
       WHERE oi.order_id = ? AND a.artwork_id = ?`,
      [req.params.id, req.params.artwork_id]
    );
    if (!items.length) return res.status(404).json({ message: 'ไม่พบผลงานในคำสั่งซื้อนี้' });

    const filePath = path.join(__dirname, '../../uploads/artworks', items[0].high_res_file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'ไม่พบไฟล์ต้นฉบับบนเซิร์ฟเวอร์' });

    res.download(filePath, `${items[0].title}.${items[0].file_format.toLowerCase()}`);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดาวน์โหลด' });
  }
});

// GET /api/orders/:id  — single order detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_id = ?', [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    if (orders[0].user_id !== req.user.user_id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });

    const [items] = await pool.query(
      `SELECT oi.*, a.title, a.preview_image, a.file_format
       FROM order_items oi
       JOIN artworks a ON oi.artwork_id = a.artwork_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/orders/:id/slip  — upload slip after order
router.patch('/:id/slip', authenticate, uploadSlip.single('slip_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'กรุณาแนบสลิป' });
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (!orders.length) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
    if (orders[0].user_id !== req.user.user_id)
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });

    await pool.query(
      'UPDATE orders SET slip_image = ?, payment_status = "pending" WHERE order_id = ?',
      [req.file.filename, req.params.id]
    );
    res.json({ message: 'อัปโหลดสลิปสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/orders  (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = '';
  if (status) { where = 'WHERE o.payment_status = ?'; params.push(status); }

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT o.*, u.username, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/orders/:id/status  (admin)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { payment_status, tracking_number, shipping_status } = req.body;
  const updates = [];
  const params  = [];

  if (payment_status) {
    if (!['pending', 'approved', 'rejected'].includes(payment_status))
      return res.status(400).json({ message: 'สถานะการชำระเงินไม่ถูกต้อง' });
    updates.push('payment_status = ?');
    params.push(payment_status);
  }

  if (tracking_number !== undefined) {
    updates.push('tracking_number = ?');
    params.push(tracking_number);
  }

  if (shipping_status) {
    if (!['pending', 'preparing', 'shipped', 'delivered'].includes(shipping_status))
      return res.status(400).json({ message: 'สถานะการจัดส่งไม่ถูกต้อง' });
    updates.push('shipping_status = ?');
    params.push(shipping_status);
  }

  if (!updates.length) return res.status(400).json({ message: 'ไม่มีข้อมูลที่จะอัปเดต' });

  params.push(req.params.id);

  try {
    await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
      params
    );

    // If payment is rejected, restore items back to available
    if (payment_status === 'rejected') {
      await pool.query(
        `UPDATE artworks a
         JOIN order_items oi ON a.artwork_id = oi.artwork_id
         SET a.status = 'available'
         WHERE oi.order_id = ?`,
        [req.params.id]
      );
    } else if (payment_status === 'approved') {
      await pool.query(
        `UPDATE artworks a
         JOIN order_items oi ON a.artwork_id = oi.artwork_id
         SET a.status = 'sold_out'
         WHERE oi.order_id = ?`,
        [req.params.id]
      );
    }

    res.json({ message: 'อัปเดตข้อมูลคำสั่งซื้อสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

