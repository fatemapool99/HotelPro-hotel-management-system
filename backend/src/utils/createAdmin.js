const path = require('node:path');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD (at least 12 characters) privately before running this command.');
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, phone: ADMIN_PHONE, password: ADMIN_PASSWORD, role: 'admin' });
    console.log('Admin account created.');
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
