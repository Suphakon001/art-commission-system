// src/routes/admin.js  — dashboard summary routes
const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/admin/summary
router.get('/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[orders]]      = await pool.query(`SELECT COUNT(*) AS total, SUM(total_amount) AS revenue, SUM(service_fee) AS fee_revenue FROM orders WHERE payment_status = 'approved'`);
    const [[commissions]] = await pool.query(`SELECT COUNT(*) AS total, SUM(total_amount) AS revenue, SUM(service_fee) AS fee_revenue FROM commissions WHERE payment_status = 'approved'`);
    const [[pendingOrders]] = await pool.query(`SELECT COUNT(*) AS total FROM orders WHERE payment_status = 'pending'`);
    const [[pendingComm]]   = await pool.query(`SELECT COUNT(*) AS total FROM commissions WHERE payment_status = 'pending'`);
    const [[queue]]  = await pool.query(`SELECT COUNT(*) AS total FROM commissions WHERE payment_status = 'approved' AND work_status != 'เสร็จสมบูรณ์'`);
    const [[settings]] = await pool.query('SELECT max_queue FROM shop_settings WHERE setting_id = 1');

    res.json({
      orders: {
        approved_count:  orders.total       || 0,
        total_revenue:   orders.revenue     || 0,
        fee_revenue:     orders.fee_revenue || 0,
        pending_count:   pendingOrders.total || 0,
      },
      commissions: {
        approved_count:  commissions.total       || 0,
        total_revenue:   commissions.revenue     || 0,
        fee_revenue:     commissions.fee_revenue || 0,
        pending_count:   pendingComm.total || 0,
        queue_count:     queue.total || 0,
        max_queue:       settings.max_queue,
      },
      total_fee_revenue: ((orders.fee_revenue || 0) + (commissions.fee_revenue || 0)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง' });
  }
  try {
    await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ message: 'อัปเดตบทบาทผู้ใช้สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

