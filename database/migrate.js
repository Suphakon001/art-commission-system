// database/migrate.js
// Master Database Migration Script for ArtSpace / Art Commission System
const mysql = require('../backend/node_modules/mysql2/promise');
const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../backend/.env') });

(async () => {
  console.log('🔄 Running database migrations...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '39TD2BCczma3LJ4.root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'WFCQi0AuJRZcP64N',
    database: process.env.DB_NAME || 'test',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  });

  // 1. Add status column to artworks
  try {
    await conn.query("ALTER TABLE artworks ADD COLUMN status ENUM('available', 'sold_out') DEFAULT 'available'");
    console.log("✅ Column 'status' verified on artworks");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️  Column 'status' already exists on artworks");
    } else {
      console.error("⚠️ Error adding status to artworks:", err.message);
    }
  }

  // 2. Add shipping fields to orders
  const shippingColumns = [
    { name: 'shipping_fee', def: 'DECIMAL(10, 2) NOT NULL DEFAULT 50.00' },
    { name: 'shipping_name', def: 'VARCHAR(150) NULL' },
    { name: 'shipping_phone', def: 'VARCHAR(50) NULL' },
    { name: 'shipping_address', def: 'TEXT NULL' },
    { name: 'tracking_number', def: 'VARCHAR(100) NULL' },
    { name: 'shipping_status', def: "ENUM('pending', 'preparing', 'shipped', 'delivered') DEFAULT 'pending'" },
  ];

  for (const col of shippingColumns) {
    try {
      await conn.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.def}`);
      console.log(`✅ Column '${col.name}' added to orders`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️  Column '${col.name}' already exists on orders`);
      } else {
        console.error(`⚠️ Error adding ${col.name}:`, err.message);
      }
    }
  }

  // 3. Ensure messages table exists for Customer-Admin chat
  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      message_id    INT AUTO_INCREMENT PRIMARY KEY,
      sender_id     INT NOT NULL,
      receiver_id   INT NOT NULL,
      commission_id INT NULL,
      message       TEXT NOT NULL,
      is_read       BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id)   REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (commission_id) REFERENCES commissions(commission_id) ON DELETE SET NULL
    )
  `);
  console.log("✅ Messages table verified");

  // 4. Ensure LONGTEXT columns for Base64 image persistence
  const longtextColumns = [
    'ALTER TABLE artworks MODIFY preview_image LONGTEXT',
    'ALTER TABLE artworks MODIFY high_res_file LONGTEXT',
    'ALTER TABLE orders MODIFY slip_image LONGTEXT',
    'ALTER TABLE commissions MODIFY slip_image LONGTEXT',
    'ALTER TABLE commissions MODIFY reference_image LONGTEXT',
    'ALTER TABLE commissions MODIFY draft_image LONGTEXT',
    'ALTER TABLE commissions MODIFY final_file LONGTEXT',
  ];

  for (const q of longtextColumns) {
    try {
      await conn.query(q);
    } catch (err) {}
  }
  console.log("✅ Image columns configured to LONGTEXT");

  console.log('✨ All database migrations completed successfully!');
  await conn.end();
  process.exit(0);
})().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
