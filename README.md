# Art Commission System — คู่มือเริ่มต้นใช้งาน

## 1. ติดตั้งฐานข้อมูล
1. เปิด **DBeaver** → เชื่อมต่อ MySQL
2. เปิดไฟล์ `database/schema.sql` แล้วรัน (F5)
   - สร้าง database `art_commission_db` พร้อม tables และ seed data
   - สร้าง Admin account: `admin@artshop.com` / password: `admin1234`

## 2. ตั้งค่า Backend
แก้ไขไฟล์ `backend/.env`:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_random_secret
```

## 3. รัน Backend
```bash
cd backend
npm run dev    # development (nodemon)
# หรือ
npm start      # production
```
Server จะรันที่ `http://localhost:5000`

## 4. รัน Frontend
```bash
cd frontend
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## โครงสร้างโปรเจกต์

```
art-commission-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js          ← MySQL Pool
│   │   ├── middleware/
│   │   │   ├── auth.js           ← JWT Authentication
│   │   │   └── upload.js         ← Multer (PNG/JPG only)
│   │   ├── routes/
│   │   │   ├── auth.js           ← /api/auth/*
│   │   │   ├── artworks.js       ← /api/artworks/*
│   │   │   ├── categories.js     ← /api/categories/*
│   │   │   ├── orders.js         ← /api/orders/*
│   │   │   ├── commissions.js    ← /api/commissions/*
│   │   │   ├── settings.js       ← /api/settings/*
│   │   │   └── admin.js          ← /api/admin/*
│   │   └── app.js                ← Express entry point
│   ├── uploads/                  ← ไฟล์อัปโหลด (auto-created)
│   │   ├── artworks/
│   │   ├── slips/
│   │   ├── references/
│   │   └── drafts/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/index.js          ← Axios instance + interceptors
│   │   ├── stores/
│   │   │   ├── auth.js           ← Pinia Auth Store
│   │   │   └── cart.js           ← Pinia Cart Store (+ localStorage)
│   │   ├── components/
│   │   │   ├── Navbar.vue
│   │   │   ├── Footer.vue
│   │   │   ├── ArtworkCard.vue
│   │   │   └── FeeCalculator.vue ← แสดงค่าธรรมเนียม 5% แบบ real-time
│   │   ├── pages/
│   │   │   ├── Home.vue
│   │   │   ├── Shop.vue          ← Filter/Search/Pagination
│   │   │   ├── ArtworkDetail.vue ← แสดงราคา + fee breakdown
│   │   │   ├── Commission.vue    ← รายการแพ็กเกจ
│   │   │   ├── CommissionOrder.vue ← ฟอร์ม + FeeCalculator real-time
│   │   │   ├── Cart.vue          ← ตะกร้า + fee summary
│   │   │   ├── Checkout.vue      ← แนบสลิป + ยืนยัน
│   │   │   ├── MyOrders.vue
│   │   │   ├── MyCommissions.vue ← Progress stepper
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── admin/
│   │   │       ├── Dashboard.vue       ← สรุปรายได้ + ค่าธรรมเนียม
│   │   │       ├── ManageArtworks.vue  ← CRUD + upload
│   │   │       ├── ManageOrders.vue    ← อนุมัติ/ปฏิเสธ
│   │   │       ├── ManageCommissions.vue ← track งาน + upload draft/final
│   │   │       └── ManageSettings.vue  ← เปิด/ปิด commission + แก้แพ็กเกจ
│   │   ├── router/index.js       ← Vue Router + route guards
│   │   ├── App.vue
│   │   └── main.js
│   ├── tailwind.config.js        ← Theme: artshop (violet + pink)
│   ├── vite.config.js            ← Proxy /api → localhost:5000
│   └── package.json
│
└── database/
    └── schema.sql                ← DDL + seed data
```

---

## API Endpoints สำคัญ

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|--------|----------|--------|----------|
| POST | `/api/auth/register` | Public | สมัครสมาชิก |
| POST | `/api/auth/login` | Public | เข้าสู่ระบบ |
| GET  | `/api/artworks` | Public | ดูผลงานทั้งหมด (filter/search/page) |
| POST | `/api/orders` | Customer | สั่งซื้อ + แนบสลิป |
| GET  | `/api/commissions/fee-preview` | Public | คำนวณค่าธรรมเนียม real-time |
| POST | `/api/commissions` | Customer | ส่งคำสั่งจ้าง |
| GET  | `/api/admin/summary` | Admin | สรุปรายได้ + ค่าธรรมเนียม 5% |
| PATCH | `/api/orders/:id/status` | Admin | อนุมัติ/ปฏิเสธสลิป |
| PATCH | `/api/commissions/:id/status` | Admin | อัปเดตสถานะงาน |

---

## กฎธุรกิจค่าธรรมเนียม 5%

ทุกธุรกรรมมีการคำนวณอัตโนมัติ:

```
ยอดฐาน + ค่าธรรมเนียม 5% = ยอดชำระสุทธิ
```

- บันทึกแยกคอลัมน์ `service_fee` ใน `orders` และ `commissions`
- Admin ดูรายงานสรุปรายได้ค่าธรรมเนียมได้ที่ `/admin/summary`
- แสดงผลแบบ real-time ใน `FeeCalculator.vue` และ `ArtworkDetail.vue`

