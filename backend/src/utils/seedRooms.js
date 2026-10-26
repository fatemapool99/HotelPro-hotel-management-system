const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

dotenv.config();

const sampleRooms = [
  {
    title: 'Sea View Penthouse',
    roomType: 'Presidential Suite',
    pricePerNight: 24000,
    capacity: {
      guests: 4,
      beds: 2,
      bedType: 'California King Bed',
    },
    size: '1,200 sq ft',
    description:
      'A top-floor suite with sea views, a private terrace and a separate dining area. Sleeps up to four guests.',
    amenities: [
      'Arabian Sea View',
      'Private Terrace',
      'Dedicated Butler Assistance',
      'Complimentary Breakfast',
      'High-Speed Wi-Fi',
      'Express Check-In',
      'Coffee & Tea Station',
      'Luxury Bath Amenities',
      '24/7 Room Service',
    ],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'PH-101',
    floor: 14,
    rating: 4.95,
    reviewsCount: 48,
    isAvailable: true,
    featured: true,
  },
  {
    title: 'Executive Suite',
    roomType: 'Executive Suite',
    pricePerNight: 9500,
    capacity: {
      guests: 3,
      beds: 2,
      bedType: 'King Bed & Daybed',
    },
    size: '780 sq ft',
    description:
      'A king bed, daybed and separate sitting area, with a desk for work and views across the city. Sleeps up to three guests.',
    amenities: [
      'City Skyline View',
      'Executive Lounge Access',
      'Ergonomic Work Desk',
      'Marble Bathroom with Rain Shower',
      'High-Speed Wi-Fi',
      'Smart TV',
      'Tea & Coffee Maker',
      'Plush Robes & Slippers',
    ],
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'EX-804',
    floor: 8,
    rating: 4.88,
    reviewsCount: 36,
    isAvailable: true,
    featured: true,
  },
  {
    title: 'Private Pool Villa',
    roomType: 'Ocean Villa',
    pricePerNight: 16500,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Canopy Bed',
    },
    size: '950 sq ft',
    description:
      'A one-bedroom villa in Candolim, Goa, with a private plunge pool, sun deck and garden courtyard. A short walk from the beach.',
    amenities: [
      'Private Plunge Pool',
      'Sun Deck with Loungers',
      'Garden Courtyard',
      'Complimentary Evening Refreshments',
      'Breakfast Included',
      'High-Speed Wi-Fi',
      'Handcrafted Teak Furniture',
      'King Canopy Bed',
    ],
    images: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'VIL-07',
    floor: 1,
    rating: 4.97,
    reviewsCount: 62,
    isAvailable: true,
    featured: true,
  },
  {
    title: 'Garden Room',
    roomType: 'Deluxe Room',
    pricePerNight: 5400,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Luxury Pillowtop',
    },
    size: '520 sq ft',
    description:
      'A king room overlooking the garden courtyard, with a veranda and a bathroom with a soaking tub.',
    amenities: [
      'Garden Courtyard Veranda',
      'Deep Soaking Tub',
      'Tea & Coffee Selection',
      'High-Speed Wi-Fi',
      '4K Smart TV',
      'Organic Spa Toiletries',
      'Daily Housekeeping & Turndown',
    ],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'DLX-205',
    floor: 2,
    rating: 4.79,
    reviewsCount: 41,
    isAvailable: true,
    featured: false,
  },
  {
    title: 'Lake View Suite',
    roomType: 'Executive Suite',
    pricePerNight: 11000,
    capacity: {
      guests: 3,
      beds: 2,
      bedType: '1 King Bed, 1 Daybed',
    },
    size: '820 sq ft',
    description:
      'A lake-facing suite with a balcony, window seating and a separate dressing area. Includes a king bed and daybed.',
    amenities: [
      'Lake Pichola View Balcony',
      'Traditional Jharokha Seating',
      'Dual-Vanity Bathroom',
      'Chromecast Smart TV',
      'High-Speed Wi-Fi',
      'Ambient Lighting',
      'Spacious Dressing Area',
    ],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'ST-912',
    floor: 9,
    rating: 4.85,
    reviewsCount: 29,
    isAvailable: true,
    featured: false,
  },
  {
    title: 'King Room',
    roomType: 'Standard Luxury',
    pricePerNight: 3800,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Bed',
    },
    size: '420 sq ft',
    description:
      'A king room for two with a work desk, balcony and walk-in shower. Wi-Fi and tea and coffee are included.',
    amenities: [
      'City Breeze Balcony',
      'Premium Orthopedic Mattress',
      'Complimentary Packaged Water',
      'High-Speed Wi-Fi',
      'Walk-in Rain Shower',
      'In-Room Safe & Mini Fridge',
      'Tea & Coffee Station',
    ],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'STD-114',
    floor: 1,
    rating: 4.74,
    reviewsCount: 53,
    isAvailable: true,
    featured: false,
  },
  {
    title: 'Presidential Suite',
    roomType: 'Presidential Suite',
    pricePerNight: 32000,
    capacity: {
      guests: 6,
      beds: 3,
      bedType: '2 King Beds, 1 Queen Bed',
    },
    size: '1,650 sq ft',
    description:
      'Our largest suite sleeps six, with two king beds and a queen bed. Includes two terraces, a separate lounge and a dining table for eight.',
    amenities: [
      '360° Lake & City Views',
      'Dual Private Terraces',
      'Formal Dining Suite for 8',
      'Dedicated Butler Team',
      'Airport Chauffeur Transfer (Sample Service)',
      'Steam Shower',
      'High-End Sound System',
      'Indian Tea Selection',
    ],
    images: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'PH-102',
    floor: 15,
    rating: 4.99,
    reviewsCount: 31,
    isAvailable: true,
    featured: true,
  },
  {
    title: 'Family Room',
    roomType: 'Deluxe Room',
    pricePerNight: 6200,
    capacity: {
      guests: 4,
      beds: 2,
      bedType: '2 Queen Beds',
    },
    size: '580 sq ft',
    description:
      'Two queen beds and a sitting area, with city views and space for up to four guests.',
    amenities: [
      'City Skyline Views',
      'Two Plush Queen Beds',
      'Double Vanity Dressing Counter',
      'High-Speed Wi-Fi',
      'Coffee & Tea Station',
      'Smart TV with Streaming Support',
      'Plush Bathrobes',
    ],
    images: [
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80',
    ],
    roomNumber: 'DLX-410',
    floor: 4,
    rating: 4.81,
    reviewsCount: 22,
    isAvailable: true,
    featured: false,
  },
];

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DATABASE_RESET !== 'true') {
      throw new Error('Legacy seed resets all data. Use rooms:refresh instead. For an intentional development reset, set ALLOW_DATABASE_RESET=true.');
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment.');
      process.exit(1);
    }

    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Clear existing collections
    console.log('🧹 Clearing existing Users, Rooms, and Bookings...');
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({});

    // Create Admin User with Indian sample phone
    console.log('👤 Creating default Admin user...');
    const adminUser = await User.create({
      name: 'HotelPro General Manager',
      email: 'admin@hotelpro.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+91 98201 00199',
    });
    console.log(`✅ Admin created: admin@hotelpro.com / Admin@123456`);

    // Create Demo Guest User with Indian sample name and phone
    console.log('👤 Creating demo guest user...');
    const guestUser = await User.create({
      name: 'Aarav Sharma',
      email: 'guest@hotelpro.com',
      password: 'Guest@123456',
      role: 'user',
      phone: '+91 98201 72488',
    });
    console.log(`✅ Guest created: guest@hotelpro.com / Guest@123456`);

    // Insert sample rooms
    console.log('🏨 Seeding luxury rooms in INR...');
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`✅ Inserted ${createdRooms.length} luxury rooms successfully.`);

    // Create a sample booking for demo with pay_at_hotel status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 6);

    const sampleBooking = await Booking.create({
      room: createdRooms[0]._id,
      user: guestUser._id,
      checkInDate: tomorrow,
      checkOutDate: dayAfter,
      totalNights: 3,
      pricePerNight: createdRooms[0].pricePerNight,
      totalPrice: Math.round(createdRooms[0].pricePerNight * 3 * 1.12),
      guestInfo: {
        fullName: 'Aarav Sharma',
        email: 'guest@hotelpro.com',
        phone: '+91 98201 72488',
        specialRequests: 'Quiet high-floor room preferred, late check-in at 8 PM.',
        adults: 2,
        children: 0,
      },
      paymentStatus: 'pay_at_hotel',
      status: 'confirmed',
    });

    console.log(`✅ Created initial sample reservation ID: ${sampleBooking._id}`);
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleRooms };
