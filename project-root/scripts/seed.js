// ============================================================
// scripts/seed.js — Create initial admin user
// Run once:  node scripts/seed.js
// ============================================================

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'changeme123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      return process.exit(0);
    }

    await User.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    console.log(`✅  Admin user created — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
    console.log('⚠️   Change the password immediately after first login!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
})();
