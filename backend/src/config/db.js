// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const isTiDB = process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || (isTiDB ? 4000 : 3306),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database:           process.env.DB_NAME     || (isTiDB ? 'test' : 'art_commission_db'),
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
  ssl:                (process.env.DB_SSL === 'true' || isTiDB)
                        ? { minVersion: 'TLSv1.2', rejectUnauthorized: false }
                        : undefined,
});

module.exports = pool;

