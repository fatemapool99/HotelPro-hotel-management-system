/**
 * HotelPro Safe Room Price & Content Migration Script
 *
 * SAFELY updates room records in MongoDB to INR pricing and localized descriptions.
 * CRITICAL RULE: DOES NOT delete, truncate, or overwrite existing bookings or users!
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');
const { sampleRooms } = require('./seedRooms');

dotenv.config();

const updateRoomsSafe = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment.');
      process.exit(1);
    }

    console.log('⏳ Connecting to MongoDB for non-destructive room update...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    console.log(`📋 Found ${sampleRooms.length} localized Indian suites with INR pricing.`);

    let updatedCount = 0;
    let createdCount = 0;

    for (const roomData of sampleRooms) {
      // Find room by its unique roomNumber
      const existing = await Room.findOne({ roomNumber: roomData.roomNumber });

      if (existing) {
        // Update prices, titles, descriptions, and amenities without affecting existing bookings attached by ObjectId
        existing.title = roomData.title;
        existing.roomType = roomData.roomType;
        existing.pricePerNight = roomData.pricePerNight;
        existing.capacity = roomData.capacity;
        existing.size = roomData.size;
        existing.description = roomData.description;
        existing.amenities = roomData.amenities;
        existing.images = roomData.images;
        existing.floor = roomData.floor;
        existing.featured = roomData.featured;

        await existing.save();
        console.log(`  🔄 Updated Suite ${roomData.roomNumber}: "${roomData.title}" -> ₹${roomData.pricePerNight}/night`);
        updatedCount++;
      } else {
        // If room does not exist yet, create it safely
        await Room.create(roomData);
        console.log(`  ➕ Added New Suite ${roomData.roomNumber}: "${roomData.title}" -> ₹${roomData.pricePerNight}/night`);
        createdCount++;
      }
    }

    // Also check for any custom rooms that might have legacy USD prices (e.g. pricePerNight < 1500)
    const legacyRooms = await Room.find({
      roomNumber: { $nin: sampleRooms.map((r) => r.roomNumber) },
      pricePerNight: { $lt: 1500 },
    });

    if (legacyRooms.length > 0) {
      console.log(`⚠️ Found ${legacyRooms.length} custom rooms with legacy USD rates (< ₹1,500). Scaling them safely to INR...`);
      for (const customRoom of legacyRooms) {
        const oldPrice = customRoom.pricePerNight;
        // Reasonable INR adjustment: roughly multiply by 50 or floor at ₹3,500
        const newPrice = Math.max(3500, Math.round(oldPrice * 50));
        customRoom.pricePerNight = newPrice;
        await customRoom.save();
        console.log(`  ✨ Scaled custom room "${customRoom.title}" (Suite ${customRoom.roomNumber}): ${oldPrice} -> ₹${newPrice}`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Non-destructive migration complete!`);
    console.log(`   - Rooms updated: ${updatedCount}`);
    console.log(`   - Rooms added: ${createdCount}`);
    console.log(`   - Users and Bookings preserved intact with 0 data loss.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Safe room update error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  updateRoomsSafe();
}

module.exports = { updateRoomsSafe };
