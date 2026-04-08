// ============================================================
// server.js — Entry point for the Admin Panel API
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Core Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files (uploaded images) ──────────────────────────
// Uploaded images are accessible at: GET /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/gallery', galleryRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler (must be last middleware) ───────────
app.use(errorHandler);

// ── MongoDB Connection + Server Start ────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
