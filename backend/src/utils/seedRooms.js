const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

dotenv.config();

const sampleRooms = [
  {
    title: 'The Royal Oceanfront Penthouse Suite',
    roomType: 'Presidential Suite',
    pricePerNight: 850,
    capacity: {
      guests: 4,
      beds: 2,
      bedType: 'California King',
    },
    size: '1,200 sq ft',
    description:
      'Perched on the top floor with panoramic ocean vistas, this masterwork suite features an expansive wrap-around private terrace, private marble infinity jacuzzi, dedicated butler service, and bespoke Italian furnishings.',
    amenities: [
      'Panoramic Ocean View',
      'Private Jacuzzi Terrace',
      'Personal Butler Service',
      'Complimentary Champagne & Caviar',
      'High-Speed Wi-Fi 6',
      'Smart Home Automation',
      'Sub-Zero Wine Cooler',
      'Dyson Supersonic Hair Dryer',
      'Bvlgari Bath Amenities',
      '24/7 In-Suite Dining',
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
    title: 'Executive Grand Azure Suite',
    roomType: 'Executive Suite',
    pricePerNight: 490,
    capacity: {
      guests: 3,
      beds: 2,
      bedType: 'King Bed & Daybed',
    },
    size: '780 sq ft',
    description:
      'Engineered for discerning travelers and luxury seekers. Features a separate executive lounge, soundproof acoustics, floor-to-ceiling soundproof glass walls overlooking the harbor, and an Italian marble bathroom with rainfall shower.',
    amenities: [
      'Harbor & City View',
      'Executive Lounge Access',
      'Nespresso Vertuo Barista Station',
      'Italian Marble Rainfall Shower',
      'High-Speed Wi-Fi 6',
      'Ergonomic Herman Miller Workspace',
      '65" OLED Smart TV',
      'Plush Terry Robes & Slippers',
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
    title: 'Private Overwater Coral Villa',
    roomType: 'Ocean Villa',
    pricePerNight: 680,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Plush Canopy Bed',
    },
    size: '950 sq ft',
    description:
      'Immerse in tranquility suspended directly above turquoise azure waters. Features a glass-bottom floor viewing panel, private plunge pool on the sun deck, direct ocean lagoon access ladder, and outdoor soaking tub.',
    amenities: [
      'Direct Lagoon Access',
      'Private Plunge Pool',
      'Glass Floor Ocean Viewing Panel',
      'Outdoor Soaking Tub',
      'Complimentary Sunset Cocktails',
      'Bose SoundLink Sound System',
      'Organic Artisanal Breakfast Included',
      'King Canopy Bed with Egyptian Linen',
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
    title: 'Deluxe Emerald Garden Room',
    roomType: 'Deluxe Room',
    pricePerNight: 295,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Luxury Pillowtop',
    },
    size: '520 sq ft',
    description:
      'A serene sanctuary surrounded by manicured tropical gardens. Indulge in an airy sunlit terrace, handcrafted teak furnishings, a deep soaking tub, and ultra-plush 600-thread-count Egyptian cotton bedding.',
    amenities: [
      'Tropical Garden Veranda',
      'Deep Soaking Tub',
      'Gourmet Mini Bar',
      'Illy Espresso Machine',
      'High-Speed Wi-Fi',
      '55" 4K Smart TV',
      'Botanical Spa Toiletries',
      'Daily Evening Turndown Service',
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
    title: 'Opulent Sunset Horizon Suite',
    roomType: 'Executive Suite',
    pricePerNight: 540,
    capacity: {
      guests: 3,
      beds: 2,
      bedType: '1 King Bed, 1 Queen Sofa Bed',
    },
    size: '820 sq ft',
    description:
      'Positioned strategically on the western wing to capture breath-taking golden hour sunsets every evening. Boasts a dual-vanity spa bathroom, bespoke bar credenza, and custom mood ambient illumination.',
    amenities: [
      'Golden Hour Sunset Balcony',
      'Dual-Vanity Spa Bathroom',
      'Curated Cocktail Station',
      'Chromecast-Enabled TV',
      'High-Speed Wi-Fi',
      'Custom Ambient Lighting System',
      'Walk-In Wardrobe',
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
    title: 'Standard Luxury Coastal King',
    roomType: 'Standard Luxury',
    pricePerNight: 210,
    capacity: {
      guests: 2,
      beds: 1,
      bedType: 'King Bed',
    },
    size: '420 sq ft',
    description:
      'Refined simplicity and unmatched comfort. Designed with clean minimalist aesthetics, warm coastal oak textures, premium acoustic insulation, and an ultra-comfortable cloud mattress for restorative sleep.',
    amenities: [
      'Coastal Breeze Balcony',
      'Cloud Comfort Mattress',
      'Complimentary Bottled Artesian Water',
      'High-Speed Wi-Fi',
      'Rain Shower',
      'In-Room Safe & Mini Fridge',
      'Tea & Coffee Selection',
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
    title: 'The Ambassador Presidential Penthouse',
    roomType: 'Presidential Suite',
    pricePerNight: 980,
    capacity: {
      guests: 6,
      beds: 3,
      bedType: '2 King Beds, 1 Queen Bed',
    },
    size: '1,650 sq ft',
    description:
      'The crown jewel of HotelPro. Spanning across three private balconies with 360-degree skyline and sea panoramas, a grand baby piano, private boardroom dining table for 8, and biometric keyless access.',
    amenities: [
      '360° Skyline & Sea Views',
      '3 Private Balconies',
      'Baby Grand Piano',
      'Formal Dining Room for 8',
      'Personal Chef On-Demand',
      'Private Chauffeur Airport Transfer',
      'Sauna & Steam Shower',
      'Bang & Olufsen Acoustics',
      'Dedicated 24/7 Butler Team',
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
    title: 'Deluxe Twin Skyline Suite',
    roomType: 'Deluxe Room',
    pricePerNight: 320,
    capacity: {
      guests: 4,
      beds: 2,
      bedType: '2 Queen Beds',
    },
    size: '580 sq ft',
    description:
      'Ideal for families and groups traveling in style. Offering two plush queen beds, magnificent city skyline views, a spacious sitting area, and two separate vanity dressing stations.',
    amenities: [
      'City Skyline Views',
      'Two Plush Queen Beds',
      'Twin Vanity Dressing Counter',
      'High-Speed Wi-Fi',
      'Nespresso Bar',
      'Smart TV with Streaming Apps',
      'Signature Bathrobes',
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

    // Create Admin User
    console.log('👤 Creating default Admin user...');
    const adminUser = await User.create({
      name: 'HotelPro General Manager',
      email: 'admin@hotelpro.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+1 (800) 555-0199',
    });
    console.log(`✅ Admin created: admin@hotelpro.com / Admin@123456`);

    // Create Demo Guest User
    console.log('👤 Creating demo guest user...');
    const guestUser = await User.create({
      name: 'Alexander Wright',
      email: 'guest@hotelpro.com',
      password: 'Guest@123456',
      role: 'user',
      phone: '+1 (555) 724-8831',
    });
    console.log(`✅ Guest created: guest@hotelpro.com / Guest@123456`);

    // Insert sample rooms
    console.log('🏨 Seeding luxury rooms...');
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`✅ Inserted ${createdRooms.length} luxury rooms successfully.`);

    // Create a sample booking for demo
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
        fullName: 'Alexander Wright',
        email: 'guest@hotelpro.com',
        phone: '+1 (555) 724-8831',
        specialRequests: 'High floor preferred, late check-in at 8 PM.',
        adults: 2,
        children: 0,
      },
      paymentStatus: 'paid',
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
