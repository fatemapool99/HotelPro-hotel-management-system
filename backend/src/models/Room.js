const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide room title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    roomType: {
      type: String,
      required: [true, 'Please specify room type'],
      enum: [
        'Deluxe Room',
        'Executive Suite',
        'Ocean Villa',
        'Presidential Suite',
        'Standard Luxury',
        'Junior Suite',
      ],
      default: 'Deluxe Room',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: [0, 'Price must be positive'],
    },
    capacity: {
      guests: {
        type: Number,
        required: [true, 'Please provide guest capacity'],
        min: [1, 'Must accommodate at least 1 guest'],
        default: 2,
      },
      beds: {
        type: Number,
        default: 1,
      },
      bedType: {
        type: String,
        default: 'King Bed',
      },
    },
    size: {
      type: String,
      default: '450 sq ft',
    },
    description: {
      type: String,
      required: [true, 'Please provide room description'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one room image'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A room must have at least one image',
      },
    },
    roomNumber: {
      type: String,
      required: [true, 'Please specify room number'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
