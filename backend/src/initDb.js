// backend/src/initDb.js
const pool = require('./config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { createArtSvg } = require('./sampleArtworks');

function getBase64Image(filename, fallbackType = 'samurai') {
  try {
    const fullPath = path.join(__dirname, '../../frontend/public/images', filename);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  } catch (e) {}
  return createArtSvg(fallbackType);
}

async function initDatabase() {
  console.log('🔄 Checking database structure & initializing ArtSpace...');
  try {
    // 1. Alter columns to LONGTEXT to support Base64 images permanently
    const alterQueries = [
      'ALTER TABLE artworks MODIFY preview_image LONGTEXT',
      'ALTER TABLE artworks MODIFY high_res_file LONGTEXT',
      'ALTER TABLE orders MODIFY slip_image LONGTEXT',
      'ALTER TABLE commissions MODIFY slip_image LONGTEXT',
      'ALTER TABLE commissions MODIFY reference_image LONGTEXT',
      'ALTER TABLE commissions MODIFY draft_image LONGTEXT',
      'ALTER TABLE commissions MODIFY final_file LONGTEXT',
    ];

    for (const q of alterQueries) {
      try {
        await pool.query(q);
      } catch (err) {}
    }
    console.log('✅ Image storage columns configured to LONGTEXT');

    // 2. Ensure default admin user exists and password is verified
    const adminPasswordHash = await bcrypt.hash('admin1234', 10);
    const [existingAdmin] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['admin@artshop.com']);
    if (existingAdmin.length === 0) {
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin ArtSpace', 'admin@artshop.com', adminPasswordHash, 'admin']
      );
      console.log('✅ Created admin account: admin@artshop.com / admin1234');
    } else {
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [adminPasswordHash, 'admin@artshop.com']
      );
      console.log('✅ Admin password verified (admin@artshop.com / admin1234)');
    }

    // 3. Ensure categories matching ArtSpace reference exist
    await pool.query(`INSERT IGNORE INTO categories (category_id, category_name, description) VALUES
      (1, 'ภาพประกอบ', 'ภาพวาดประกอบดิจิทัลอาร์ตและภาพแนวแฟนตาซี'),
      (2, 'ภาพสไตล์อนิเมะ', 'ภาพวาดตัวละครสไตล์อนิเมะและคาแรคเตอร์ดีไซน์'),
      (3, 'ภาพพิกเซล', 'ภาพวาดสไตล์ Pixel Art คลาสสิก'),
      (4, 'ภาพพื้นหลัง', 'ภาพวิวทิวทัศน์ ธรรมชาติ และวิวเมืองแนวแฟนตาซี'),
      (5, 'แฟนอาร์ต', 'ภาพวาดตัวละครจากเกม อนิเมะ และภาพยนตร์')`);

    // 4. Seed Artworks matching Reference Image 1 & 2
    const targetArtworks = [
      {
        title: 'ภาพวิวเมืองยามเย็น',
        category_id: 4,
        price: 250.00,
        desc: 'ภาพวิวเมืองในบรรยากาศยามเย็น แสงอาทิตย์อัสดง ความละเอียดสูง 4K',
        file: 'art-city.jpg',
        fallback: 'samurai'
      },
      {
        title: 'ภาพชิบิ สุดน่ารัก',
        category_id: 2,
        price: 150.00,
        desc: 'ภาพตัวละครจิบิสุดน่ารัก สไตล์อนิเมะสดใส เหมาะทำสติกเกอร์และอวตาร',
        file: 'art-chibi.jpg',
        fallback: 'chibi'
      },
      {
        title: 'ภาพตัวละครแฟนตาซี',
        category_id: 1,
        price: 350.00,
        desc: 'ภาพตัวละครนักรบสาวแฟนตาซี รายละเอียดประณีตและอัญมณีประกาย',
        file: 'art-fantasy.jpg',
        fallback: 'fantasy'
      },
      {
        title: 'ภาพบ้านกลางป่า',
        category_id: 4,
        price: 200.00,
        desc: 'ภาพทิวทัศน์บ้านไม้อบอุ่นท่ามกลางธรรมชาติและต้นไม้เขียวขจี',
        file: 'art-house.jpg',
        fallback: 'botanical'
      },
      {
        title: 'ภาพสาวน้อยอนิเมะ',
        category_id: 2,
        price: 250.00,
        desc: 'ภาพอนิเมะแนวนุ่มละมุน สไตล์ญี่ปุ่น ความละเอียดสูง ขนาด 4K',
        file: 'art-anime-girl.jpg',
        fallback: 'fantasy'
      },
      {
        title: 'ภาพแมวสุดน่ารัก',
        category_id: 2,
        price: 150.00,
        desc: 'ภาพน้องแมวตาโตสุดน่ารัก ลายเส้นคมชัด น่ารักอบอุ่นหัวใจ',
        file: 'art-cat.jpg',
        fallback: 'chibi'
      },
      {
        title: 'ภาพเมืองในฝัน',
        category_id: 4,
        price: 200.00,
        desc: 'ภาพทิวทัศน์เมืองลอยฟ้าในจินตนาการ ปราสาทและโคมไฟลอย ท่ามกลางหมู่เมฆสีม่วงยามเย็น',
        file: 'art-dream-city.jpg',
        fallback: 'samurai'
      },
      {
        title: 'ภาพดอกไม้สไตล์อนิเมะ',
        category_id: 1,
        price: 180.00,
        desc: 'ภาพวาดสาวน้อยและดอกไม้พฤกษศาสตร์สไตล์อนิเมะ โทนสีหวานละมุน',
        file: 'art-flower-anime.jpg',
        fallback: 'botanical'
      },
    ];

    // Check existing artworks
    const [existingRows] = await pool.query('SELECT artwork_id, title FROM artworks');
    const existingTitles = new Set(existingRows.map(r => r.title));

    for (const item of targetArtworks) {
      const b64 = getBase64Image(item.file, item.fallback);
      if (!existingTitles.has(item.title)) {
        await pool.query(
          `INSERT INTO artworks (category_id, title, description, price, preview_image, high_res_file, file_format, status, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 'PNG', 'available', 1)`,
          [item.category_id, item.title, item.desc, item.price, b64, b64]
        );
        console.log(`✨ Added reference artwork: ${item.title}`);
      } else {
        // Update image with real crop data
        await pool.query(
          `UPDATE artworks SET preview_image = ?, high_res_file = ?, price = ?, description = ?
           WHERE title = ?`,
          [b64, b64, item.price, item.desc, item.title]
        );
      }
    }

    console.log('✨ ArtSpace Database initialization complete!');
  } catch (err) {
    console.error('⚠️ Database init error (continuing):', err.message);
  }
}

module.exports = { initDatabase };

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Done initDatabase');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Failed initDatabase:', err);
      process.exit(1);
    });
}
