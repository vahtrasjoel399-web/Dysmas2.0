// ============================================================
// controllers/authController.js — Login logic
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/login
 * Body: { email, password }
 * Returns a signed JWT on success.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Input validation ─────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // ── Find user ────────────────────────────────────────────
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // ── Verify password ──────────────────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // ── Sign JWT ─────────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
