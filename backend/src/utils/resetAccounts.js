// Explicitly removes accounts and bookings, preserving the room catalogue.
const path = require('node:path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  if (!process.argv.includes('--confirm-delete-all-accounts-and-bookings')) {
    throw new Error('This deletes ALL users and bookings. Pass --confirm-delete-all-accounts-and-bookings to proceed.');
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;
    const bookings = await db.collection('bookings').deleteMany({});
    const users = await db.collection('users').deleteMany({});
    await db.collection('rooms').updateMany({}, { $unset: { reservationClaims: '' } });
    console.log(`Deleted ${users.deletedCount} accounts and ${bookings.deletedCount} bookings. Rooms preserved.`);
    console.log(`Remaining accounts: ${await db.collection('users').countDocuments()}; bookings: ${await db.collection('bookings').countDocuments()}; rooms: ${await db.collection('rooms').countDocuments()}`);
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
