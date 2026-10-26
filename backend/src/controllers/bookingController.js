const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// @desc    Create a new booking (with strict overlapping double-booking prevention)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  let claimId;
  let claimedRoom;
  let saved = false;
  try {
    const {
      roomId,
      checkInDate: checkInStr,
      checkOutDate: checkOutStr,
      guestInfo,
      paymentStatus,
    } = req.body;

    if (!roomId || !checkInStr || !checkOutStr || !guestInfo) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, check-out date, and guest information are required.',
      });
    }

    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Guest full name, email, and phone number are required.',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'The selected room was not found.',
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This room is currently not available for bookings.',
      });
    }

    const adults = Number(guestInfo.adults ?? 1);
    const children = Number(guestInfo.children ?? 0);
    if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0 || adults + children > room.capacity.guests) {
      return res.status(400).json({ success: false, message: 'Guest count must fit the room capacity, with at least one adult.' });
    }
    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format.',
      });
    }

    // Normalize to midnight UTC or local date comparison to avoid partial hour anomalies
    checkInDate.setUTCHours(0, 0, 0, 0);
    checkOutDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past.',
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least one day after check-in date.',
      });
    }

    // STRICT OVERLAPPING DOUBLE-BOOKING CHECK
    // Existing reservation overlaps if:
    // Existing.checkInDate < Requested.checkOutDate AND Existing.checkOutDate > Requested.checkInDate
    const conflictingBookings = await Booking.find({
      room: roomId,
      status: { $ne: 'cancelled' },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'This room is already reserved for the selected dates. Please choose different dates or select another room.',
        conflicts: conflictingBookings.map((b) => ({
          checkIn: b.checkInDate,
          checkOut: b.checkOutDate,
        })),
      });
    }

    // Calculate total nights and pricing
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pricePerNight = room.pricePerNight;
    const subtotal = totalNights * pricePerNight;
    // Include 12% estimated taxes and hotel service fee
    const taxAndServiceFee = Math.round(subtotal * 0.12);
    const totalPrice = subtotal + taxAndServiceFee;

    // Determine safe initial payment status (without live gateway, non-admins cannot auto-set 'paid')
    let resolvedPaymentStatus = 'pending';
    if (paymentStatus === 'pay_at_hotel') {
      resolvedPaymentStatus = 'pay_at_hotel';
    } else if (paymentStatus === 'paid' && req.user.role === 'admin') {
      resolvedPaymentStatus = 'paid';
    } else {
      resolvedPaymentStatus = 'pending';
    }

    // Claim the range atomically on one room document, across all API instances.
    claimId = new mongoose.Types.ObjectId();
    const claim = await Room.updateOne({
      _id: room._id,
      isAvailable: true,
      reservationClaims: { $not: { $elemMatch: { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } } } },
    }, { $push: { reservationClaims: { booking: claimId, checkIn: checkInDate, checkOut: checkOutDate } } });
    if (!claim.modifiedCount) {
      return res.status(409).json({ success: false, message: 'This room was just reserved. Please choose different dates.' });
    }
    claimedRoom = room._id;
    const booking = await Booking.create({
      _id: claimId,
      room: room._id,
      user: req.user._id,
      checkInDate,
      checkOutDate,
      totalNights,
      pricePerNight,
      totalPrice,
      guestInfo: {
        fullName: guestInfo.fullName.trim(),
        email: guestInfo.email.trim(),
        phone: guestInfo.phone.trim(),
        specialRequests: guestInfo.specialRequests || '',
        adults,
        children,
      },
      paymentStatus: resolvedPaymentStatus,
      status: 'confirmed',
    });

    saved = true;
    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    if (claimedRoom && !saved) {
      // A timed-out write may have succeeded. Only release a confirmed unused claim.
      try {
        if (!await Booking.exists({ _id: claimId })) {
          await Room.updateOne({ _id: claimedRoom }, { $pull: { reservationClaims: { booking: claimId } } });
        }
      } catch (cleanupError) { console.error('Reservation claim requires reconciliation:', cleanupError.message); }
    }
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking reservation.',
    });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your reservations.',
    });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Only owner or admin can view
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching booking.',
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reservation not found.',
      });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    booking.status = 'cancelled';
    await booking.save();
    await Room.updateOne({ _id: booking.room }, { $pull: { reservationClaims: { booking: booking._id } } });

    const updatedBooking = await Booking.findById(booking._id).populate('room');

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling booking.',
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    let bookings = await Booking.find(query)
      .populate('room')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const guestName = b.guestInfo?.fullName?.toLowerCase() || '';
        const guestEmail = b.guestInfo?.email?.toLowerCase() || '';
        const roomTitle = b.room?.title?.toLowerCase() || '';
        const bookingId = b._id.toString();
        return (
          guestName.includes(searchLower) ||
          guestEmail.includes(searchLower) ||
          roomTitle.includes(searchLower) ||
          bookingId.includes(searchLower)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching all bookings.',
    });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status === 'cancelled' && status && status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled bookings cannot be reopened. Create a new booking to check availability.' });
    }
    if (status) {
      if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be confirmed, cancelled, or completed.',
        });
      }
      booking.status = status;
    }

    if (paymentStatus) {
      if (!['paid', 'pending', 'pay_at_hotel'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status.',
        });
      }
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    if (booking.status === 'cancelled') {
      await Room.updateOne({ _id: booking.room }, { $pull: { reservationClaims: { booking: booking._id } } });
    }
    const updated = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      booking: updated,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating booking.',
    });
  }
};

// @desc    Get admin dashboard metrics & stats
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });

    // Revenue calculation from non-cancelled bookings
    const activeBookings = await Booking.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const recentBookings = await Booking.find()
      .populate('room', 'title roomNumber pricePerNight')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRooms,
        availableRooms,
      },
      recentBookings,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching admin stats.',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAdminStats,
};
