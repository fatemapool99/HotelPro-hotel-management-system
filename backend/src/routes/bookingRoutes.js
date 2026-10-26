const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAdminStats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// Private guest routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin-only routes
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.put('/admin/:id/status', protect, adminOnly, updateBookingStatus);

module.exports = router;
