// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const isTiDB = !process.env.DB_HOST || process.env.DB_HOST.includes('tidbcloud');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port:               parseInt(process.env.DB_PORT) || 4000,
  user:               process.env.DB_USER     || '39TD2BCczma3LJ4.root',
  password:           process.env.DB_PASSWORD || process.env.DB_PASS || 'WFCQi0AuJRZcP64N',
  database:           process.env.DB_NAME     || 'test',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
  ssl:                { minVersion: 'TLSv1.2', rejectUnauthorized: false },
});

module.exports = pool;

