// ============================================================
// routes/contentRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');

// GET  /api/content  — public
router.get('/', getContent);

// PUT  /api/content  — protected
router.put('/', authMiddleware, updateContent);

module.exports = router;
