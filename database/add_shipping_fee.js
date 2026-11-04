const mysql = require('../backend/node_modules/mysql2/promise');
const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../backend/.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await conn.query("ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00 AFTER service_fee");
    console.log("Column 'shipping_fee' added to orders successfully!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column 'shipping_fee' already exists.");
    } else {
      console.error("Error adding shipping_fee:", err.message);
    }
  }

  await conn.end();
})();

