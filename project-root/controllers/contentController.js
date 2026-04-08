// ============================================================
// controllers/contentController.js — Website text content
// ============================================================

const Content = require('../models/Content');

/**
 * GET /api/content
 * Public. Returns the singleton content document.
 */
const getContent = async (req, res, next) => {
  try {
    // There is only ever one content doc; create it on first request if absent
    let content = await Content.findOne();
    if (!content) {
      content = await Content.create({ title: '', description: '', aboutText: '' });
    }
    res.json(content);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/content
 * Protected. Updates (or creates) the singleton content document.
 * Body: { title?, description?, aboutText? }
 */
const updateContent = async (req, res, next) => {
  try {
    const { title, description, aboutText } = req.body;

    // Build only the fields that were actually sent
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (aboutText !== undefined) updates.aboutText = aboutText.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const content = await Content.findOneAndUpdate(
      {},                          // match the single document
      { $set: updates },
      { new: true, upsert: true }  // create if it doesn't exist
    );

    res.json({ message: 'Content updated successfully.', content });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContent, updateContent };
