import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  BedDouble,
  Calendar,
  LogOut,
  CheckCircle2,
  ArrowRight,
  Star,
  Search,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function UserHome({
  rooms = [],
  loading = false,
  onNavigate,
  onSelectRoom,
  onBookRoom,
}) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    toast.info('You have logged out successfully.');
    onNavigate('home');
  };

  const filteredRooms = rooms.filter((room) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      room.title.toLowerCase().includes(q) ||
      room.roomType.toLowerCase().includes(q) ||
      room.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. TOP DASHBOARD HEADER & PERSONALIZED GREETING (SkillWallet Requirement) */}
      <div className="bg-gradient-to-r from-hotel-navy via-hotel-navyLight to-hotel-navy rounded-3xl p-8 sm:p-10 border border-hotel-gold/30 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-gold/20 text-hotel-goldLight text-xs font-semibold uppercase tracking-wider border border-hotel-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-hotel-gold" />
            <span>Your account</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Hi, {user?.name || 'Guest'}
          </h1>

          <p className="text-sm text-gray-300 max-w-xl">
            Find a room for your next trip, view your bookings or update your details.
          </p>
        </div>

        {/* Navigation Action Buttons (Rooms, My Bookings, Logout) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('rooms')}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-hotel-gold text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all flex items-center justify-center gap-2"
          >
            <BedDouble className="w-4 h-4" />
            <span>All Rooms</span>
          </button>

          <button
            onClick={() => onNavigate('my-bookings')}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-hotel-gold/60 text-hotel-gold hover:bg-hotel-gold/15 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-950/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            title="Log out from HotelPro"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. WELCOME SECTION (SkillWallet Requirement) */}
      <section className="bg-white rounded-2xl border border-hotel-sand p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-2 md:col-span-2">
          <h2 className="font-serif font-bold text-2xl text-hotel-navy">
            Your next stay starts here
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            As an authenticated HotelPro guest, you enjoy priority suite reservations, guaranteed best rates,
            flexible cancellations, and zero double-booking conflicts. Choose any signature suite below to start
            your reservation.
          </p>
          <div className="flex items-center gap-4 pt-2 text-xs text-hotel-goldDark font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant Confirmation
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Cancellation
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 Concierge
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-hotel-cream border border-hotel-sand text-center space-y-1">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Your Account</span>
          <p className="font-serif font-bold text-lg text-hotel-navy truncate">{user?.email}</p>
          <p className="text-xs text-hotel-goldDark font-semibold">{user?.phone || 'No phone registered'}</p>
        </div>
      </section>

      {/* 3. AVAILABLE ROOMS LISTING (SkillWallet Requirement) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-hotel-sand pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-hotel-navy">
              Available rooms
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Showing {filteredRooms.length} rooms retrieved live from MongoDB database.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by suite or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-hotel-cream border border-hotel-sand rounded-xl text-xs focus:outline-none focus:border-hotel-gold text-hotel-navy"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-hotel-cream animate-pulse border border-hotel-sand"></div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const coverImg =
                room.images?.[0] ||
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80';

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl overflow-hidden border border-hotel-sand shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Room Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={coverImg}
                      alt={room.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-hotel-navy/90 text-hotel-gold border border-hotel-gold/30">
                        {room.roomType}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span>{room.rating ? room.rating.toFixed(1) : '4.8'}</span>
                    </div>
                  </div>

                  {/* Room Details: Title, Description, Features, Price per night */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-hotel-navy mb-1.5 line-clamp-1">
                        {room.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                        {room.description}
                      </p>

                      {/* Features / Amenities */}
                      <div className="space-y-1.5 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Suite Features
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities &&
                            room.amenities.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-hotel-cream border border-hotel-sand text-[11px] text-hotel-charcoal"
                              >
                                {feature}
                              </span>
                            ))}
                          {room.amenities && room.amenities.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-[11px] text-hotel-goldDark font-semibold">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price per night and Book Now Button */}
                    <div className="pt-3 border-t border-hotel-sand flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-medium block">
                          Price per night
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-2xl font-extrabold text-hotel-navy">
                            {formatINR(room.pricePerNight)}
                          </span>
                          <span className="text-xs text-gray-500">/ night</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectRoom(room)}
                          className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-hotel-navy"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onBookRoom(room)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm flex items-center gap-1.5"
                        >
                          <span>Book Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-hotel-sand p-12 text-center space-y-3">
            <p className="text-sm text-gray-500">No rooms matched your search query.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs font-bold text-hotel-goldDark underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
