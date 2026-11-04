const fs = require('fs');
const path = require('path');
const mysql = require('../backend/node_modules/mysql2/promise');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../backend/.env') });

(async () => {
  const uploadsDir = path.join(__dirname, '../backend/uploads/artworks');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buf = Buffer.from(pngBase64, 'base64');
  fs.writeFileSync(path.join(uploadsDir, 'sample1.png'), buf);
  fs.writeFileSync(path.join(uploadsDir, 'sample2.png'), buf);
  fs.writeFileSync(path.join(uploadsDir, 'sample3.png'), buf);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [existing] = await conn.query('SELECT COUNT(*) as count FROM artworks');
  if (existing[0].count === 0) {
    await conn.query(
      `INSERT INTO artworks (category_id, title, description, price, preview_image, high_res_file, file_format, is_active) VALUES
       (1, 'Cyberpunk Samurai (Line Art)', 'ภาพลายเส้นขาว-ดำ สไตล์มังงะ ไซเบอร์พังก์ ความละเอียด 4K', 450.00, 'sample1.png', 'sample1.png', 'PNG', 1),
       (2, 'Magical Girl Aurora', 'ภาพวาดสาวน้อยเวทมนตร์ ลงสีเต็มรูปแบบ สไตล์อนิเมะ', 890.00, 'sample2.png', 'sample2.png', 'PNG', 1),
       (3, 'Chibi Cat Cafe Barista', 'ภาพมาสคอตแมวจิบิในร้านกาแฟ น่ารักสดใส เหมาะทำสติกเกอร์', 250.00, 'sample3.png', 'sample3.png', 'PNG', 1)`
    );
    console.log('Sample artworks inserted successfully!');
  } else {
    console.log('Artworks already exist.');
  }

  await conn.end();
})();

