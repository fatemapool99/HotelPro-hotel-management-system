// Update listing copy and rates without resetting rooms, users or bookings.
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const { sampleRooms } = require('./seedRooms');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function refreshRoomContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const rooms = mongoose.connection.db.collection('rooms');
    const listings = sampleRooms.map(({ roomNumber, title, description, pricePerNight, amenities }) =>
      ({ roomNumber, title, description, pricePerNight, amenities }));
    listings.push({
      roomNumber: 'SW-5729',
      title: 'Penthouse Suite',
      description: 'A penthouse with a separate living area and space for up to four guests. See the room details for included facilities.',
      pricePerNight: 28000,
    });
    const previous = await rooms.find({ roomNumber: { $in: listings.map(r => r.roomNumber) } }).toArray();
    const backup = path.resolve(__dirname, `../../room-content-backup-${Date.now()}.log`);
    fs.writeFileSync(backup, JSON.stringify(previous, null, 2));
    let updated = 0;
    let inserted = 0;
    for (const { roomNumber, ...content } of listings) {
      const sample = sampleRooms.find(room => room.roomNumber === roomNumber);
      // Only standard sample rooms can be inserted; the custom room has no full template.
      const insertOnly = sample ? { ...new Room(sample).toObject() } : undefined;
      if (insertOnly) {
        delete insertOnly._id;
        for (const key of Object.keys(content)) delete insertOnly[key];
      }
      const result = await rooms.updateOne({ roomNumber }, {
        $set: content,
        ...(insertOnly ? { $setOnInsert: insertOnly } : {}),
      }, { upsert: Boolean(sample) });
      updated += result.modifiedCount;
      inserted += result.upsertedCount;
    }
    console.log(`Updated ${updated} room listings; inserted ${inserted}. Previous room records saved to ${backup}`);
    console.log('Users and existing booking records were not changed.');
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  refreshRoomContent().catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { refreshRoomContent };
