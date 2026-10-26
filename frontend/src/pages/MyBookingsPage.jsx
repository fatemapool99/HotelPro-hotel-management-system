import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingAPI } from '../services/api';
import { formatINR, formatDateDDMMYYYY } from '../utils/formatters';
import {
  Calendar,
  BedDouble,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function MyBookingsPage({ onNavigate, onBookRoom }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      toast.error('Unable to fetch your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelReservation = async (bookingId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this reservation? This action cannot be undone.'
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Your reservation has been cancelled successfully.');
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      const msg = err.response?.data?.message || 'Failed to cancel reservation.';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-hotel-gold/15 text-hotel-goldDark flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-hotel-navy">
          Access Your Reservations
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Please sign in to your HotelPro guest account to view your upcoming itineraries,
          receipts, and booking history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-sm hover:brightness-110 shadow-gold-glow"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus.toLowerCase();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hotel-sand pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-hotel-goldDark text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Itinerary Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-hotel-navy">
            My Reservations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View your upcoming stays and past bookings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('rooms')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-hotel-navy text-hotel-cream text-xs font-semibold hover:bg-hotel-navyLight transition-colors"
        >
          <BedDouble className="w-4 h-4 text-hotel-gold" />
          <span>Book Another Stay</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-hotel-sand pb-2 overflow-x-auto">
        {['All', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === status
                ? 'bg-hotel-navy text-hotel-gold shadow-sm'
                : 'text-gray-600 hover:bg-hotel-cream hover:text-hotel-navy'
            }`}
          >
            {status} ({bookings.filter((b) => status === 'All' || b.status === status.toLowerCase()).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-hotel-cream border border-hotel-sand animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const checkInFormatted = formatDateDDMMYYYY(b.checkInDate);
            const checkOutFormatted = formatDateDDMMYYYY(b.checkOutDate);

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-hotel-sand shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
              >
                {/* Room Image */}
                <div className="md:w-64 h-48 md:h-auto bg-gray-100 shrink-0 relative">
                  <img
                    src={
                      b.room?.images?.[0] ||
                      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={b.room?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/30'
                          : b.status === 'cancelled'
                          ? 'bg-rose-950/80 text-rose-200 border border-rose-500/30'
                          : 'bg-hotel-navy/80 text-gray-200 border border-gray-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-xl text-hotel-navy">
                        {b.room?.title || 'Room'}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Ref: #{b._id.substring(18).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Suite {b.room?.roomNumber} • {b.room?.roomType}
                    </p>
                  </div>

                  {/* Dates & Pricing Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-hotel-cream border border-hotel-sand text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Check-In</span>
                      <span className="font-bold text-hotel-navy block">{checkInFormatted}</span>
                      <span className="text-[10px] text-gray-400">3:00 PM</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Check-Out</span>
                      <span className="font-bold text-hotel-navy block">{checkOutFormatted}</span>
                      <span className="text-[10px] text-gray-400">11:00 AM</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Customer Phone</span>
                      <span className="font-bold text-hotel-navy block">{b.guestInfo?.phone || 'N/A'}</span>
                      <span className="text-[10px] text-gray-400">{b.guestInfo?.fullName}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Duration & Guests</span>
                      <span className="font-bold text-hotel-navy block">
                        {b.totalNights} {b.totalNights === 1 ? 'Night' : 'Nights'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {b.guestInfo?.adults || 1} Adults, {b.guestInfo?.children || 0} Kids
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Total Amount</span>
                      <span className="font-serif font-bold text-hotel-goldDark text-base block">
                        {formatINR(b.totalPrice)}
                      </span>
                      <span className="text-[10px] text-emerald-700 capitalize font-medium">
                        {b.paymentStatus === 'paid'
                          ? 'Paid Online'
                          : b.paymentStatus === 'pay_at_hotel'
                          ? 'Pay at Check-In'
                          : 'Payment Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-gray-500">
                      Guest: <strong className="text-hotel-charcoal">{b.guestInfo?.fullName}</strong> • Phone: <strong className="text-hotel-goldDark">{b.guestInfo?.phone || 'N/A'}</strong> ({b.guestInfo?.email})
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg border border-hotel-sand text-xs text-gray-600 hover:text-hotel-navy hover:bg-hotel-cream flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      {b.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancelReservation(b._id)}
                          disabled={cancellingId === b._id}
                          className="px-4 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {b.status === 'cancelled' ? 'Booking Cancelled' : 'Completed'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-hotel-sand p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-hotel-cream flex items-center justify-center text-hotel-goldDark mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-hotel-navy">
            No Reservations Found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You do not currently have any bookings under the "{filterStatus}" status.
          </p>
          <button
            onClick={() => onNavigate('rooms')}
            className="px-6 py-2.5 rounded-full bg-hotel-gold text-hotel-navy text-xs font-bold hover:brightness-110 shadow-sm"
          >
            Explore Available Suites
          </button>
        </div>
      )}
    </div>
  );
}
