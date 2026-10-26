import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roomAPI, bookingAPI, authAPI } from '../services/api';
import {
  ShieldCheck,
  Calendar,
  BedDouble,
  PlusCircle,
  Users,
  LogOut,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function AdminHome({ onRoomsUpdated, onNavigate }) {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();

  // 4 Tabs: 'bookings' | 'rooms' | 'add-room' | 'users'
  const [activeTab, setActiveTab] = useState('bookings');

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Room Form State (Tab 3)
  const [newRoom, setNewRoom] = useState({
    title: '',
    roomType: 'Deluxe Room',
    pricePerNight: '',
    description: '',
    capacity: { guests: 2, beds: 1, bedType: 'King Bed' },
    size: '520 sq ft',
    features: 'Panoramic Ocean View, High-Speed Wi-Fi, King Bed, Mini Bar',
    images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    roomNumber: '',
    floor: 1,
    featured: false,
  });
  const [savingRoom, setSavingRoom] = useState(false);

  // Filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  const loadAllAdminData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [bookingsRes, roomsRes, usersRes] = await Promise.all([
        bookingAPI.getAllBookings({}),
        roomAPI.getRooms({}),
        authAPI.getAllUsers(),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setRooms(roomsRes.data.rooms || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
      toast.error('Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    toast.info('Administrator signed out.');
    if (onNavigate) onNavigate('home');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-hotel-navy">
          Access Restricted: Admin Privileges Required
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          You must be logged in as an administrator to access the HotelPro management dashboard.
        </p>
      </div>
    );
  }

  // Handle Tab 3: Add Room Form Submission
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setSavingRoom(true);

    try {
      const amenitiesArray = newRoom.features
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const imagesArray = newRoom.images
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: newRoom.title.trim(),
        roomType: newRoom.roomType,
        pricePerNight: Number(newRoom.pricePerNight),
        description: newRoom.description.trim(),
        capacity: {
          guests: Number(newRoom.capacity.guests || 2),
          beds: Number(newRoom.capacity.beds || 1),
          bedType: newRoom.capacity.bedType || 'King Bed',
        },
        size: newRoom.size || '500 sq ft',
        amenities: amenitiesArray.length > 0 ? amenitiesArray : ['High-Speed Wi-Fi', 'King Bed'],
        images: imagesArray.length > 0 ? imagesArray : [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        ],
        roomNumber: newRoom.roomNumber.trim(),
        floor: Number(newRoom.floor || 1),
        featured: Boolean(newRoom.featured),
      };

      await roomAPI.createRoom(payload);
      toast.success(`Suite "${payload.title}" created successfully and added to MongoDB!`);

      // Reset form
      setNewRoom({
        title: '',
        roomType: 'Deluxe Room',
        pricePerNight: '',
        description: '',
        capacity: { guests: 2, beds: 1, bedType: 'King Bed' },
        size: '520 sq ft',
        features: 'Panoramic Ocean View, High-Speed Wi-Fi, King Bed, Mini Bar',
        images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        roomNumber: '',
        floor: 1,
        featured: false,
      });

      // Switch to All Rooms tab and reload
      setActiveTab('rooms');
      loadAllAdminData();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      console.error('Create room error:', err);
      toast.error(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${roomTitle}" from MongoDB?`)) {
      return;
    }
    try {
      await roomAPI.deleteRoom(roomId);
      toast.success(`Suite "${roomTitle}" deleted.`);
      loadAllAdminData();
      if (onRoomsUpdated) onRoomsUpdated();
    } catch (err) {
      console.error('Delete room error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
      toast.success(`Reservation status updated to "${newStatus}".`);
      loadAllAdminData();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update status.');
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
      const guestPhone = b.guestInfo?.phone?.toLowerCase() || '';
      const roomTitle = b.room?.title?.toLowerCase() || '';
      const bookingId = b._id?.toLowerCase() || '';
      return guestName.includes(q) || guestEmail.includes(q) || guestPhone.includes(q) || roomTitle.includes(q) || bookingId.includes(q);
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. ADMIN DASHBOARD HEADER & PERSONALIZED GREETING (SkillWallet Requirement) */}
      <div className="bg-gradient-to-r from-hotel-navy via-hotel-navyLight to-hotel-navy rounded-3xl p-8 border border-hotel-gold/30 shadow-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-gold/20 text-hotel-goldLight text-xs font-bold uppercase tracking-wider border border-hotel-gold/40">
            <ShieldCheck className="w-4 h-4 text-hotel-gold" />
            <span>Administrator Control Center</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Hi, {user?.name || 'Administrator'}
          </h1>

          <p className="text-xs text-gray-300">
            Manage live guest bookings, inspect rooms inventory, add new accommodations, and view registered users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 hover:bg-rose-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR SPECIFIED TABS (SkillWallet Requirement) */}
      {/* Tab 1: All Bookings | Tab 2: All Rooms | Tab 3: Add Room | Tab 4: All Users */}
      <div className="bg-white rounded-2xl border border-hotel-sand shadow-sm overflow-hidden">
        <div className="flex border-b border-hotel-sand bg-hotel-cream overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-white text-hotel-navy border-b-2 border-hotel-gold shadow-sm'
                : 'text-gray-500 hover:text-hotel-navy hover:bg-hotel-creamDark'
            }`}
          >
            <Calendar className="w-4 h-4 text-hotel-goldDark" />
            <span>Tab 1: All Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-white text-hotel-navy border-b-2 border-hotel-gold shadow-sm'
                : 'text-gray-500 hover:text-hotel-navy hover:bg-hotel-creamDark'
            }`}
          >
            <BedDouble className="w-4 h-4 text-hotel-goldDark" />
            <span>Tab 2: All Rooms ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add-room')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'add-room'
                ? 'bg-white text-hotel-navy border-b-2 border-hotel-gold shadow-sm'
                : 'text-gray-500 hover:text-hotel-navy hover:bg-hotel-creamDark'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-hotel-goldDark" />
            <span>Tab 3: Add Room</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white text-hotel-navy border-b-2 border-hotel-gold shadow-sm'
                : 'text-gray-500 hover:text-hotel-navy hover:bg-hotel-creamDark'
            }`}
          >
            <Users className="w-4 h-4 text-hotel-goldDark" />
            <span>Tab 4: All Users ({users.length})</span>
          </button>
        </div>

        {/* TAB 1 CONTENT: ALL BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-hotel-sand">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search guest, email, phone..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs focus:outline-none focus:border-hotel-gold text-hotel-navy"
                  />
                </div>

                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs font-semibold text-hotel-navy focus:outline-none focus:border-hotel-gold"
                >
                  <option value="All">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <span className="text-xs text-gray-500">
                Displaying <strong>{filteredBookings.length}</strong> user reservations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-hotel-cream text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Guest & Contact</th>
                    <th className="py-3 px-3">Room Type / Title</th>
                    <th className="py-3 px-3">Dates</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotel-sand text-hotel-charcoal">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-hotel-cream/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-hotel-navy">
                          #{b._id.substring(18).toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-hotel-navy block">{b.guestInfo?.fullName}</span>
                          <span className="text-[11px] text-gray-500 block">{b.guestInfo?.email}</span>
                          <span className="text-[11px] text-hotel-goldDark font-medium block">
                            📞 {b.guestInfo?.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold block">{b.room?.roomType || 'Deluxe'}</span>
                          <span className="text-[11px] text-gray-500">{b.room?.title} (Suite {b.room?.roomNumber})</span>
                        </td>
                        <td className="py-3 px-3">
                          <span>
                            {new Date(b.checkInDate).toLocaleDateString()} — {new Date(b.checkOutDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-medium">
                            {b.totalNights} Nights • {b.guestInfo?.adults} Adults
                          </span>
                        </td>
                        <td className="py-3 px-3 font-serif font-bold text-hotel-goldDark text-sm">
                          ${b.totalPrice}
                        </td>
                        <td className="py-3 px-3">
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
                        <td className="py-3 px-3 text-right">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                            className="px-2.5 py-1 text-[11px] rounded-lg border border-hotel-sand bg-white font-semibold text-hotel-navy focus:outline-none focus:border-hotel-gold"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No reservations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2 CONTENT: ALL ROOMS (SkillWallet Requirement) */}
        {activeTab === 'rooms' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hotel-sand">
              <h3 className="font-serif font-bold text-lg text-hotel-navy">
                All Rooms Stored in MongoDB
              </h3>
              <button
                onClick={() => setActiveTab('add-room')}
                className="px-4 py-2 rounded-xl bg-hotel-gold text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-hotel-cream text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Room Image</th>
                    <th className="py-3 px-3">Room Type & Name</th>
                    <th className="py-3 px-3">Suite #</th>
                    <th className="py-3 px-3">Price / Night</th>
                    <th className="py-3 px-3">Capacity</th>
                    <th className="py-3 px-3">Features & Amenities</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotel-sand text-hotel-charcoal">
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-hotel-cream/40 transition-colors">
                      <td className="py-3 px-3">
                        <img
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&q=80'}
                          alt={room.title}
                          className="w-16 h-11 rounded-lg object-cover shadow-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-hotel-navy block">{room.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-hotel-cream text-hotel-goldDark border border-hotel-sand inline-block mt-0.5">
                          {room.roomType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">
                        Suite {room.roomNumber}
                      </td>
                      <td className="py-3 px-3 font-serif font-bold text-hotel-goldDark text-sm">
                        ${room.pricePerNight}
                      </td>
                      <td className="py-3 px-3">
                        {room.capacity?.guests || 2} Guests • {room.capacity?.bedType || 'King Bed'}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities &&
                            room.amenities.slice(0, 3).map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-hotel-cream text-[10px] text-gray-700">
                                {f}
                              </span>
                            ))}
                          {room.amenities && room.amenities.length > 3 && (
                            <span className="text-[10px] text-hotel-goldDark font-bold">
                              +{room.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRoom(room._id, room.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
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

        {/* TAB 3 CONTENT: ADD ROOM FORM (SkillWallet Requirement) */}
        {activeTab === 'add-room' && (
          <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="border-b border-hotel-sand pb-4">
              <h3 className="font-serif font-bold text-2xl text-hotel-navy">
                Add New Room to MongoDB
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter room details, pricing, features, and photography. Newly added rooms will immediately appear in the catalog.
              </p>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Room Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Horizon Villa"
                    value={newRoom.title}
                    onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={newRoom.roomType}
                    onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy font-semibold focus:outline-none focus:border-hotel-gold"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Price per Night ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    placeholder="350"
                    value={newRoom.pricePerNight}
                    onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Room / Suite Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 702"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Capacity (Max Guests) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRoom.capacity.guests}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        capacity: { ...newRoom.capacity, guests: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of room aesthetics, layout, balcony, views, and comforts..."
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Features / Amenities (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Panoramic Ocean View, High-Speed Wi-Fi, King Bed, Jacuzzi"
                  value={newRoom.features}
                  onChange={(e) => setNewRoom({ ...newRoom, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy focus:outline-none focus:border-hotel-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Room Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newRoom.images}
                  onChange={(e) => setNewRoom({ ...newRoom, images: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hotel-sand bg-hotel-cream text-xs text-hotel-navy font-mono focus:outline-none focus:border-hotel-gold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all disabled:opacity-50"
                >
                  {savingRoom ? 'Saving Suite to MongoDB...' : 'Save & Publish Room'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4 CONTENT: ALL USERS (SkillWallet Requirement) */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-hotel-sand">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search registered user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs focus:outline-none focus:border-hotel-gold text-hotel-navy"
                />
              </div>

              <span className="text-xs text-gray-500">
                Displaying <strong>{filteredUsers.length}</strong> registered users (passwords securely hidden)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-hotel-cream text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Phone Number</th>
                    <th className="py-3 px-3">Account Role</th>
                    <th className="py-3 px-3">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotel-sand text-hotel-charcoal">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-hotel-cream/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-hotel-navy flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-hotel-gold text-hotel-navy font-bold flex items-center justify-center text-[11px]">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-hotel-cream text-hotel-charcoal border border-hotel-sand'
                          }`}
                        >
                          {u.role === 'admin' ? '🛡️ Administrator' : '👤 Ordinary User'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
