// ============================================================
// controllers/galleryController.js — Gallery image management
// ============================================================

const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');

/**
 * GET /api/gallery
 * Public. Returns all gallery images, newest first.
 */
const getGallery = async (req, res, next) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/gallery
 * Protected. Uploads an image via multer and saves the path to DB.
 * Expects multipart/form-data with field name "image".
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    // Build a URL-friendly path: /uploads/<filename>
    const imageUrl = `/uploads/${req.file.filename}`;

    const image = await Gallery.create({ imageUrl });
    res.status(201).json({ message: 'Image uploaded successfully.', image });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/gallery/:id
 * Protected. Removes the DB record and the file from disk.
 */
const deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Build absolute path to the stored file and remove it
    const filePath = path.join(__dirname, '..', image.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();
    res.json({ message: 'Image deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGallery, uploadImage, deleteImage };
