// Update listing copy and rates without resetting rooms, users or bookings.
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
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
    for (const { roomNumber, ...content } of listings) {
      const result = await rooms.updateOne({ roomNumber }, { $set: content });
      updated += result.modifiedCount;
    }
    console.log(`Updated ${updated} room listings. Previous room records saved to ${backup}`);
    console.log('Users and existing booking records were not changed.');
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  refreshRoomContent().catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { refreshRoomContent };
