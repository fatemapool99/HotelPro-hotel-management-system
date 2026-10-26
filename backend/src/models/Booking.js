const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    totalNights: {
      type: Number,
      required: true,
      min: [1, 'Must book for at least 1 night'],
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    guestInfo: {
      fullName: {
        type: String,
        required: [true, 'Guest full name is required'],
      },
      email: {
        type: String,
        required: [true, 'Guest email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Guest phone number is required'],
      },
      specialRequests: {
        type: String,
        default: '',
      },
      adults: {
        type: Number,
        default: 1,
      },
      children: {
        type: Number,
        default: 0,
      },
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'pay_at_hotel'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
