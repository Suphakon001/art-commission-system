// src/app.js  — Express application entry point
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const authRouter        = require('./routes/auth');
const categoriesRouter  = require('./routes/categories');
const artworksRouter    = require('./routes/artworks');
const ordersRouter      = require('./routes/orders');
const commissionsRouter = require('./routes/commissions');
const settingsRouter    = require('./routes/settings');
const adminRouter       = require('./routes/admin');
const chatRouter        = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (uploaded images) ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/categories',  categoriesRouter);
app.use('/api/artworks',    artworksRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/commissions', commissionsRouter);
app.use('/api/settings',    settingsRouter);
app.use('/api/admin',       adminRouter);
app.use('/api/chat',        chatRouter);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Serve Frontend SPA ───────────────────────────────────
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

