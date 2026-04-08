// ============================================================
// routes/galleryRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const { getGallery, uploadImage, deleteImage } = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// GET    /api/gallery        — public
router.get('/', getGallery);

// POST   /api/gallery        — protected; multipart field name: "image"
router.post('/', authMiddleware, upload.single('image'), uploadImage);

// DELETE /api/gallery/:id    — protected
router.delete('/:id', authMiddleware, deleteImage);

module.exports = router;
