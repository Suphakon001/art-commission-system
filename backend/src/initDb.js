// backend/src/initDb.js
const pool = require('./config/db');
const bcrypt = require('bcryptjs');
const { createArtSvg } = require('./sampleArtworks');

async function initDatabase() {
  console.log('🔄 Checking database structure & initializing...');
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
      } catch (err) {
        // Table or column might already be configured or table not yet created
      }
    }
    console.log('✅ Image storage columns configured to LONGTEXT');

    // 2. Ensure default admin user exists and password is verified
    const adminPasswordHash = await bcrypt.hash('admin1234', 10);
    const [existingAdmin] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['admin@artshop.com']);
    if (existingAdmin.length === 0) {
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin Studio', 'admin@artshop.com', adminPasswordHash, 'admin']
      );
      console.log('✅ Created admin account: admin@artshop.com / admin1234');
    } else {
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [adminPasswordHash, 'admin@artshop.com']
      );
      console.log('✅ Admin password verified (admin@artshop.com / admin1234)');
    }

    // 3. Ensure categories exist
    const [cats] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (cats[0].count === 0) {
      await pool.query(`INSERT INTO categories (category_name, description) VALUES
        ('Manga & Line Art', 'ภาพลายเส้นมังงะขาว-ดำ และงานตัดเส้นสไตล์โมเดิร์น'),
        ('Character Illustration', 'ภาพวาดคาแรคเตอร์ดีไซน์และภาพประกอบสมบูรณ์'),
        ('Chibi Art', 'ภาพวาดตัวละครสไตล์จิบิน่ารัก'),
        ('Fine Art & Concept', 'ภาพวาดดิจิทัลเพนต์และคอนเซปต์อาร์ตระดับแกลเลอรี')`);
      console.log('✅ Default categories initialized');
    }

    // 4. Update broken artwork images with high-aesthetic base64 artworks
    const [allArtworks] = await pool.query('SELECT artwork_id, title, preview_image FROM artworks');
    
    // Check if artworks have broken filenames (e.g., sample1.png, local filenames that Render deleted)
    for (const art of allArtworks) {
      const isBroken = !art.preview_image || 
        art.preview_image.startsWith('sample') || 
        art.preview_image.endsWith('.jpg') || 
        art.preview_image.endsWith('.png') ||
        art.preview_image.length < 50;

      if (isBroken) {
        let type = 'samurai';
        if (art.title && art.title.toLowerCase().includes('chibi')) type = 'chibi';
        else if (art.title && (art.title.toLowerCase().includes('botanica') || art.title.toLowerCase().includes('landscape'))) type = 'botanical';
        else if (art.title && (art.title.toLowerCase().includes('girl') || art.title.toLowerCase().includes('aurora') || art.title.toLowerCase().includes('magic'))) type = 'fantasy';
        
        const newArtData = createArtSvg(type, art.title);
        await pool.query(
          'UPDATE artworks SET preview_image = ?, high_res_file = ? WHERE artwork_id = ?',
          [newArtData, newArtData, art.artwork_id]
        );
        console.log(`🖼️ Restored artwork #${art.artwork_id} (${art.title}) with permanent high-res art data`);
      }
    }

    // If no artworks exist at all, insert 4 curated gallery artworks
    const [artCount] = await pool.query('SELECT COUNT(*) as count FROM artworks');
    if (artCount[0].count === 0) {
      const [firstCat] = await pool.query('SELECT category_id FROM categories LIMIT 1');
      const catId = firstCat[0]?.category_id || 1;
      
      const art1 = createArtSvg('samurai');
      const art2 = createArtSvg('fantasy');
      const art3 = createArtSvg('botanical');
      const art4 = createArtSvg('chibi');

      await pool.query(
        `INSERT INTO artworks (category_id, title, description, price, preview_image, high_res_file, file_format, status, is_active) VALUES
         (?, 'Neon Ronin: Cyber Samurai', 'ภาพประกอบสไตล์ไซเบอร์นัวร์ ลายเส้นคมชัด 4K Resolution', 650.00, ?, ?, 'PNG', 'available', 1),
         (?, 'Celestial Guardian: Aurora', 'ภาพวาดคาแรคเตอร์สไตล์แฟนตาซีพรีเมียม สวยสง่า', 1200.00, ?, ?, 'PNG', 'available', 1),
         (?, 'Moonlit Botanica (Fine Art)', 'งานจิตรกรรมพฤกษศาสตร์ร่วมสมัย โทนสีทองและเขียวมรกต', 850.00, ?, ?, 'PNG', 'available', 1),
         (?, 'Artisan Cafe Chibi Barista', 'ภาพวาดจิบิน่ารัก คอนเซปต์บาริสต้า เหมาะสำหรับสะสมหรือใช้งาน', 250.00, ?, ?, 'PNG', 'available', 1)`,
        [catId, art1, art1, catId, art2, art2, catId, art3, art3, catId, art4, art4]
      );
      console.log('✅ Curated sample artworks created successfully');
    }

    console.log('✨ Database initialization & image verification complete!');
  } catch (err) {
    console.error('⚠️ Database init error (continuing app boot):', err.message);
  }
}

module.exports = { initDatabase };

