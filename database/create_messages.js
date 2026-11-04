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

  console.log('Messages table created successfully!');
  await conn.end();
})();

