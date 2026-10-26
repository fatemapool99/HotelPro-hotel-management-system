const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/availability', checkRoomAvailability);

// Admin-only routes
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
