const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms with filtering, search, and sorting
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
  try {
    const {
      roomType,
      minPrice,
      maxPrice,
      guests,
      amenity,
      search,
      sort,
      featured,
    } = req.query;

    const query = { isAvailable: true };

    if (roomType && roomType !== 'All') {
      query.roomType = roomType;
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (guests) {
      query['capacity.guests'] = { $gte: Number(guests) };
    }

    if (amenity) {
      const amenitiesList = Array.isArray(amenity) ? amenity : [amenity];
      query.amenities = { $all: amenitiesList };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { roomType: { $regex: search, $options: 'i' } },
      ];
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let sortOptions = {};
    if (sort === 'price_asc') {
      sortOptions = { pricePerNight: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { pricePerNight: -1 };
    } else if (sort === 'rating_desc') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const rooms = await Room.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching rooms.',
    });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching room details.',
    });
  }
};

// @desc    Check availability for a room between checkIn and checkOut
// @route   GET /api/rooms/:id/availability
// @access  Public
const checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Both checkIn and checkOut dates are required.',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.',
      });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.',
      });
    }

    // Overlapping condition: ExistingCheckIn < RequestedCheckOut && ExistingCheckOut > RequestedCheckIn
    const conflictingBookings = await Booking.find({
      room: req.params.id,
      status: { $ne: 'cancelled' },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    });

    const isAvailable = conflictingBookings.length === 0;

    return res.status(200).json({
      success: true,
      isAvailable,
      conflictsCount: conflictingBookings.length,
      message: isAvailable
        ? 'Room is available for the selected dates.'
        : 'Room is already booked for these dates.',
    });
  } catch (error) {
    console.error('Check room availability error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error checking room availability.',
    });
  }
};

// @desc    Create a new room (Admin only)
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const {
      title,
      roomType,
      pricePerNight,
      capacity,
      size,
      description,
      amenities,
      images,
      roomNumber,
      floor,
      featured,
    } = req.body;

    if (!title || !pricePerNight || !description || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Title, pricePerNight, description, and roomNumber are required.',
      });
    }

    const existingRoom = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists.`,
      });
    }

    const room = await Room.create({
      title,
      roomType: roomType || 'Deluxe Room',
      pricePerNight: Number(pricePerNight),
      capacity: {
        guests: Number(capacity?.guests || 2),
        beds: Number(capacity?.beds || 1),
        bedType: capacity?.bedType || 'King Bed',
      },
      size: size || '450 sq ft',
      description,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map((s) => s.trim()) : []),
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      ],
      roomNumber: roomNumber.trim(),
      floor: Number(floor || 1),
      featured: Boolean(featured),
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating room.',
    });
  }
};

// @desc    Update a room (Admin only)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // If roomNumber is being changed, ensure it's not taken by another room
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const existing = await Room.findOne({
        roomNumber: req.body.roomNumber.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Room number ${req.body.roomNumber} is already in use.`,
        });
      }
    }

    // Parse amenities if passed as string
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((s) => s.trim());
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room,
    });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating room.',
    });
  }
};

// @desc    Delete a room (Admin only)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Check if there are active bookings for this room
    const activeBookings = await Booking.find({
      room: req.params.id,
      status: 'confirmed',
      checkOutDate: { $gte: new Date() },
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room: There are ${activeBookings.length} upcoming or ongoing confirmed reservations for this room.`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting room.',
    });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
