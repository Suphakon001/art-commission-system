// src/routes/chat.js
const router = require('express').Router();
const pool   = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/chat/admin-info — get primary admin user info
router.get('/admin-info', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, username, email FROM users WHERE role = 'admin' ORDER BY user_id ASC LIMIT 1"
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบแอดมินในระบบ' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/chat/unread-count — get unread messages count for current user
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) AS unread FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [req.user.user_id]
    );
    res.json({ unread: unread || 0 });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// GET /api/chat/messages?other_user_id=&commission_id=
router.get('/messages', authenticate, async (req, res) => {
  let { other_user_id, commission_id } = req.query;
  const currentUserId = req.user.user_id;

  try {
    // If other_user_id not specified and current user is not admin, default to admin
    if (!other_user_id) {
      if (req.user.role === 'admin') {
        return res.status(400).json({ message: 'กรุณาระบุ other_user_id สำหรับแอดมิน' });
      }
      const [[admin]] = await pool.query("SELECT user_id FROM users WHERE role = 'admin' LIMIT 1");
      if (!admin) return res.status(404).json({ message: 'ไม่พบแอดมิน' });
      other_user_id = admin.user_id;
    }

    let query = `
      SELECT m.*, u.username AS sender_name, u.role AS sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
    `;
    const params = [currentUserId, other_user_id, other_user_id, currentUserId];

    if (commission_id) {
      query += ' AND (m.commission_id = ? OR m.commission_id IS NULL)';
      params.push(commission_id);
    }

    query += ' ORDER BY m.created_at ASC';

    const [rows] = await pool.query(query, params);

    // Auto mark as read for messages where receiver is current user
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
      [currentUserId, other_user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// POST /api/chat/send — send a new message
router.post('/send', authenticate, async (req, res) => {
  let { receiver_id, message, commission_id } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'ข้อความต้องไม่ว่างเปล่า' });
  }

  const sender_id = req.user.user_id;

  try {
    // If customer doesn't pass receiver_id, find first admin
    if (!receiver_id) {
      const [[admin]] = await pool.query("SELECT user_id FROM users WHERE role = 'admin' LIMIT 1");
      if (!admin) return res.status(404).json({ message: 'ไม่พบแอดมิน' });
      receiver_id = admin.user_id;
    }

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, commission_id, message) VALUES (?, ?, ?, ?)',
      [sender_id, receiver_id, commission_id || null, message.trim()]
    );

    const [[saved]] = await pool.query(
      `SELECT m.*, u.username AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.message_id = ?`,
      [result.insertId]
    );

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งข้อความ' });
  }
});

// GET /api/chat/conversations — (Admin only) list of customers who messaged
router.get('/conversations', authenticate, requireAdmin, async (req, res) => {
  const adminId = req.user.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.user_id, u.username, u.email, u.role,
         MAX(m.created_at) AS last_message_time,
         (SELECT message FROM messages 
          WHERE (sender_id = u.user_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.user_id)
          ORDER BY created_at DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM messages 
          WHERE sender_id = u.user_id AND receiver_id = ? AND is_read = FALSE) AS unread_count
       FROM users u
       JOIN messages m ON (m.sender_id = u.user_id AND m.receiver_id = ?) 
                       OR (m.sender_id = ? AND m.receiver_id = u.user_id)
       WHERE u.role != 'admin'
       GROUP BY u.user_id
       ORDER BY last_message_time DESC`,
      [adminId, adminId, adminId, adminId, adminId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;

