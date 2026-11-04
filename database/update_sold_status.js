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

  // Mark all artworks that have already been purchased and approved as sold_out
  await conn.query(`
    UPDATE artworks 
    SET status = 'sold_out' 
    WHERE artwork_id IN (
      SELECT DISTINCT oi.artwork_id 
      FROM order_items oi 
      JOIN orders o ON oi.order_id = o.order_id 
      WHERE o.payment_status = 'approved'
    )
  `);

  const [rows] = await conn.query('SELECT artwork_id, title, status FROM artworks');
  console.log('Current Artworks Status:');
  console.table(rows);

  await conn.end();
})();

