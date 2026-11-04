-- ============================================================
--  Art Commission System — Database Schema & Seed Data
--  Engine: MySQL 8+  |  Character Set: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS art_commission_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE art_commission_db;

-- ──────────────────────────────────────────────
--  TABLES
-- ──────────────────────────────────────────────

CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('customer', 'admin') DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description   TEXT
);

CREATE TABLE artworks (
    artwork_id    INT AUTO_INCREMENT PRIMARY KEY,
    category_id   INT NOT NULL,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    price         DECIMAL(10, 2) NOT NULL,
    preview_image VARCHAR(255) NOT NULL,
    high_res_file VARCHAR(255) NOT NULL,
    file_format   ENUM('PNG', 'JPG') DEFAULT 'PNG',
    status        ENUM('available', 'sold_out') DEFAULT 'available',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    subtotal         DECIMAL(10, 2) NOT NULL,
    service_fee      DECIMAL(10, 2) NOT NULL,
    total_amount     DECIMAL(10, 2) NOT NULL,
    slip_image       VARCHAR(255),
    payment_status   ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    shipping_name    VARCHAR(150),
    shipping_phone   VARCHAR(50),
    shipping_address TEXT,
    tracking_number  VARCHAR(100),
    shipping_status  ENUM('pending', 'preparing', 'shipped', 'delivered') DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    artwork_id    INT NOT NULL,
    price         DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(order_id)   ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE TABLE commission_packages (
    package_id   INT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(150) NOT NULL,
    description  TEXT,
    base_price   DECIMAL(10, 2) NOT NULL,
    is_open      BOOLEAN DEFAULT TRUE
);

CREATE TABLE shop_settings (
    setting_id          INT PRIMARY KEY DEFAULT 1,
    is_commission_open  BOOLEAN DEFAULT TRUE,
    max_queue           INT DEFAULT 5
);

CREATE TABLE commissions (
    commission_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    package_id     INT NOT NULL,
    brief_detail   TEXT NOT NULL,
    reference_image VARCHAR(255),
    addon_price    DECIMAL(10, 2) DEFAULT 0.00,
    base_amount    DECIMAL(10, 2) NOT NULL,
    service_fee    DECIMAL(10, 2) NOT NULL,
    total_amount   DECIMAL(10, 2) NOT NULL,
    slip_image     VARCHAR(255),
    payment_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    work_status    ENUM('รอคิว', 'ร่างภาพ', 'ตัดเส้น/ลงสี', 'เสร็จสมบูรณ์') DEFAULT 'รอคิว',
    draft_image    VARCHAR(255),
    final_file     VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(user_id)                ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES commission_packages(package_id) ON DELETE CASCADE
);

CREATE TABLE messages (
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
);

-- ──────────────────────────────────────────────
--  SEED DATA
-- ──────────────────────────────────────────────

INSERT INTO shop_settings (setting_id, is_commission_open, max_queue)
VALUES (1, TRUE, 5);

INSERT INTO categories (category_name, description) VALUES
('Manga & Line Art',       'ภาพลายเส้นมังงะขาว-ดำ และงานตัดเส้น'),
('Character Illustration', 'ภาพวาดคาแรคเตอร์ดีไซน์และภาพประกอบลงสีสมบูรณ์'),
('Chibi Art',              'ภาพวาดตัวละครสไตล์จิบิน่ารัก');

INSERT INTO commission_packages (package_name, description, base_price, is_open) VALUES
('Headshot / Bust-up (หัวถึงอก)', 'ภาพวาดสเกลตั้งแต่ศีรษะถึงช่วงอก ความละเอียด 300 DPI (PNG/JPG)', 350.00,  TRUE),
('Half-Body (ครึ่งตัว)',           'ภาพวาดสเกลครึ่งตัว เหมาะสำหรับทำปกหรือภาพประกอบ',                 600.00,  TRUE),
('Full-Body (เต็มตัว)',             'ภาพวาดคาแรคเตอร์เต็มตัวพร้อมจัดท่าทาง',                           1000.00, TRUE);

-- Default admin account  (password: admin1234)
-- bcrypt hash generated with saltRounds = 10
INSERT INTO users (username, email, password_hash, role) VALUES
('Admin', 'admin@artshop.com',
 '$2a$10$059z/6P6.pbtnP3uiDElWuz95Oka96IMZfyd4EXoOQhrxcLdHEstO',
 'admin');

