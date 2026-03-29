/**
 * Tax Wizard — Express Backend
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDb } = require('./db');

const authRoutes = require('./routes/auth');
const taxRoutes = require('./routes/tax');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/ai', aiRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve React build in production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'dist')));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
}

// ── Connect DB & Start ─────────────────────────────────────────────────────
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Tax Wizard API running on http://localhost:${PORT}`);
    });
});
