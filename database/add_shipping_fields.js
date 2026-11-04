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

  const columns = [
    { name: 'shipping_name', def: 'VARCHAR(150) NULL' },
    { name: 'shipping_phone', def: 'VARCHAR(50) NULL' },
    { name: 'shipping_address', def: 'TEXT NULL' },
    { name: 'tracking_number', def: 'VARCHAR(100) NULL' },
    { name: 'shipping_status', def: "ENUM('pending', 'preparing', 'shipped', 'delivered') DEFAULT 'pending'" }
  ];

  for (const col of columns) {
    try {
      await conn.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.def}`);
      console.log(`Added column ${col.name}`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`Column ${col.name} already exists.`);
      } else {
        console.error(`Error adding ${col.name}:`, err.message);
      }
    }
  }

  console.log('Orders table shipping columns verified!');
  await conn.end();
})();

