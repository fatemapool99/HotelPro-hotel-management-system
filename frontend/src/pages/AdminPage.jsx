import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roomAPI, bookingAPI } from '../services/api';
import { formatINR, formatDateDDMMYYYY } from '../utils/formatters';
import {
  ShieldCheck,
  BedDouble,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Search,
  X,
} from 'lucide-react';

export default function AdminPage({ onRoomsUpdated }) {
  const { user, isAdmin, openAuthModal } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'rooms' | 'bookings'
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Room modal state (Add / Edit)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    title: '',
    roomType: 'Deluxe Room',
    pricePerNight: '',
    capacity: { guests: 2, beds: 1, bedType: 'King Bed' },
    size: '500 sq ft',
    description: '',
    amenities: '',
    images: '',
    roomNumber: '',
    floor: 1,
    featured: false,
  });
  const [savingRoom, setSavingRoom] = useState(false);

  // Bookings filter
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  const loadData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes] = await Promise.all([
        bookingAPI.getAdminStats(),
        roomAPI.getRooms({}),
        bookingAPI.getAllBookings({}),
      ]);

      setStats(statsRes.data.stats);
      setRooms(roomsRes.data.rooms || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      console.error('Admin load data error:', err);
      toast.error('Failed to load administrative dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-hotel-navy">
          Admin Privileges Required
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          You must be logged in with a HotelPro administrator account to access the hospitality
          management suite and inventory controls.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-full bg-hotel-gold text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Handle Room Form
  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      title: '',
      roomType: 'Deluxe Room',
      pricePerNight: '',
      capacity: { guests: 2, beds: 1, bedType: 'King Bed' },
      size: '500 sq ft',
      description: '',
      amenities: 'Ocean View, High-Speed Wi-Fi, King Bed, Room Service',
      images:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      roomNumber: '',
      floor: 1,
      featured: false,
    });
    setRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      title: room.title,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity || { guests: 2, beds: 1, bedType: 'King Bed' },
      size: room.size || '500 sq ft',
      description: room.description,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      images: Array.isArray(room.images) ? room.images.join('\n') : '',
      roomNumber: room.roomNumber,
      floor: room.floor || 1,
      featured: Boolean(room.featured),
    });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSavingRoom(true);

    try {
      const amenitiesArray = roomFormData.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const imagesArray = roomFormData.images
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...roomFormData,
        pricePerNight: Number(roomFormData.pricePerNight),
        floor: Number(roomFormData.floor),
        amenities: amenitiesArray,
        images: imagesArray.length > 0 ? imagesArray : [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        ],
      };

      if (editingRoom) {
        await roomAPI.updateRoom(editingRoom._id, payload);
        toast.success(`Suite "${payload.title}" updated successfully!`);
      } else {
        await roomAPI.createRoom(payload);
        toast.success(`New suite "${payload.title}" created successfully!`);
      }

      setRoomModalOpen(false);
      loadData();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      console.error('Save room error:', err);
      toast.error(err.response?.data?.message || 'Failed to save room details.');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${roomTitle}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await roomAPI.deleteRoom(roomId);
      toast.success(`Room "${roomTitle}" has been removed from inventory.`);
      loadData();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      console.error('Delete room error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
      toast.success(`Reservation status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      console.error('Update booking error:', err);
      toast.error(err.response?.data?.message || 'Failed to update reservation status.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'All' && b.status !== bookingFilterStatus.toLowerCase()) {
      return false;
    }
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const guestName = b.guestInfo?.fullName?.toLowerCase() || '';
      const guestEmail = b.guestInfo?.email?.toLowerCase() || '';
      const roomTitle = b.room?.title?.toLowerCase() || '';
      if (!guestName.includes(q) && !guestEmail.includes(q) && !roomTitle.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hotel-sand pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-hotel-goldDark text-xs font-bold uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-hotel-gold" />
            <span>Hospitality Operations Suite</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-hotel-navy">
            HotelPro Executive Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage room inventory, oversee guest reservations, and monitor revenue metrics.
          </p>
        </div>

        <button
          onClick={openAddRoomModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Suite</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-3xl font-extrabold text-hotel-goldDark">
              {stats ? formatINR(stats.totalRevenue) : '₹0'}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Active & Confirmed Stays</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Reservations
          </span>
          <span className="font-serif text-3xl font-extrabold text-hotel-navy block">
            {stats ? stats.totalBookings : '0'}
          </span>
          <p className="text-[10px] text-gray-400">All-time bookings count</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Suites in Inventory
          </span>
          <span className="font-serif text-3xl font-extrabold text-hotel-navy block">
            {stats ? stats.totalRooms : rooms.length}
          </span>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {stats ? stats.availableRooms : rooms.length} Listed & Available
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Confirmed Stays
          </span>
          <span className="font-serif text-3xl font-extrabold text-emerald-600 block">
            {stats ? stats.confirmedBookings : '0'}
          </span>
          <p className="text-[10px] text-gray-400">
            {stats ? stats.cancelledBookings : '0'} Cancelled
          </p>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-hotel-sand pb-2">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'bg-hotel-navy text-hotel-gold shadow-sm'
              : 'text-gray-600 hover:bg-hotel-cream hover:text-hotel-navy'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Room Inventory ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-hotel-navy text-hotel-gold shadow-sm'
              : 'text-gray-600 hover:bg-hotel-cream hover:text-hotel-navy'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Guest Reservations ({bookings.length})</span>
        </button>
      </div>

      {/* TAB 1: ROOMS INVENTORY */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-hotel-sand shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-hotel-sand flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-hotel-navy">
              Live Accommodations Directory
            </h3>
            <button
              onClick={openAddRoomModal}
              className="px-4 py-2 rounded-lg bg-hotel-gold text-hotel-navy text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suite</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-hotel-cream border-b border-hotel-sand text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Room & Type</th>
                  <th className="py-3 px-4">Number & Floor</th>
                  <th className="py-3 px-4">Rate / Night</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-sand text-hotel-charcoal">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-hotel-cream/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&q=80'}
                        alt={room.title}
                        className="w-14 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="font-bold text-hotel-navy block">{room.title}</span>
                        <span className="text-[11px] text-gray-500">{room.roomType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      Suite {room.roomNumber} (Fl. {room.floor || 1})
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-hotel-goldDark text-sm">
                      {formatINR(room.pricePerNight)}
                    </td>
                    <td className="py-3.5 px-4">
                      {room.capacity?.guests || 2} Guests • {room.capacity?.bedType || 'King Bed'}
                    </td>
                    <td className="py-3.5 px-4">
                      {room.featured ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditRoomModal(room)}
                        className="p-1.5 text-gray-600 hover:text-hotel-navy rounded hover:bg-hotel-cream transition-colors"
                        title="Edit Suite"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id, room.title)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Suite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GUEST RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-hotel-sand shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-hotel-sand flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search guest or suite..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs focus:outline-none focus:border-hotel-gold"
                />
              </div>

              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs font-semibold focus:outline-none focus:border-hotel-gold"
              >
                <option value="All">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">
              Showing <strong className="text-hotel-navy">{filteredBookings.length}</strong> reservations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-hotel-cream border-b border-hotel-sand text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Suite Booked</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-sand text-hotel-charcoal">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-hotel-cream/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-hotel-navy">
                      #{b._id.substring(18).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-hotel-navy block">
                        {b.guestInfo?.fullName}
                      </span>
                      <span className="text-[11px] text-gray-500 block">{b.guestInfo?.email}</span>
                      <span className="text-[10px] text-gray-400">{b.guestInfo?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold block">{b.room?.title || 'Suite'}</span>
                      <span className="text-[11px] text-gray-500">
                        Room {b.room?.roomNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>
                        {formatDateDDMMYYYY(b.checkInDate)} —{' '}
                        {formatDateDDMMYYYY(b.checkOutDate)}
                      </span>
                      <span className="text-[11px] text-gray-400 block font-medium">
                        {b.totalNights} Nights • {b.guestInfo?.adults} Adults
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-hotel-goldDark text-sm">
                      {formatINR(b.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-hotel-sand bg-white text-hotel-navy font-semibold focus:outline-none focus:border-hotel-gold"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM MODAL */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-hotel-sand">
            <div className="bg-hotel-navy text-hotel-cream p-6 flex items-center justify-between border-b border-hotel-gold/30">
              <div className="flex items-center gap-2.5">
                <BedDouble className="w-5 h-5 text-hotel-gold" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {editingRoom ? 'Edit Suite Details' : 'Add a room'}
                </h3>
              </div>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Suite Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Presidential Oceanfront Suite"
                    value={roomFormData.title}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={roomFormData.roomType}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, roomType: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  >
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Ocean Villa">Ocean Villa</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                    <option value="Standard Luxury">Standard Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price per Night (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    placeholder="5500"
                    value={roomFormData.pricePerNight}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 504"
                    value={roomFormData.roomNumber}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, roomNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={roomFormData.floor}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, floor: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={roomFormData.capacity.guests}
                    onChange={(e) =>
                      setRoomFormData({
                        ...roomFormData,
                        capacity: { ...roomFormData.capacity, guests: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bedding Configuration
                  </label>
                  <input
                    type="text"
                    placeholder="King Bed"
                    value={roomFormData.capacity.bedType}
                    onChange={(e) =>
                      setRoomFormData({
                        ...roomFormData,
                        capacity: { ...roomFormData.capacity, bedType: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room Size
                  </label>
                  <input
                    type="text"
                    placeholder="650 sq ft"
                    value={roomFormData.size}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, size: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rich narrative describing the architectural details and ocean views..."
                  value={roomFormData.description}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Panoramic Ocean View, Private Jacuzzi, Butler Service, King Bed"
                  value={roomFormData.amenities}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, amenities: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Photo URLs (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={roomFormData.images}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, images: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-hotel-sand bg-hotel-cream focus:outline-none focus:border-hotel-gold font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={roomFormData.featured}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-hotel-gold cursor-pointer"
                />
                <label htmlFor="featuredToggle" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Feature this suite on Home Page signature collection
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hotel-sand">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-gray-600 hover:text-hotel-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm disabled:opacity-50"
                >
                  {savingRoom ? 'Saving Suite...' : editingRoom ? 'Update Suite' : 'Create Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
