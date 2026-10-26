import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingAPI, roomAPI } from '../services/api';
import {
  X,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Sparkles,
  Bed,
  Clock,
} from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  selectedRoom,
  allRooms = [],
  onBookingSuccess,
}) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [activeRoom, setActiveRoom] = useState(selectedRoom || allRooms[0] || null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    adults: 2,
    children: 0,
  });
  const [paymentOption, setPaymentOption] = useState('paid');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // { available: bool, message: string }
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  // Sync selectedRoom prop
  useEffect(() => {
    if (selectedRoom) {
      setActiveRoom(selectedRoom);
    } else if (allRooms.length > 0 && !activeRoom) {
      setActiveRoom(allRooms[0]);
    }
  }, [selectedRoom, allRooms]);

  // Sync user details when logged in
  useEffect(() => {
    if (user) {
      setGuestInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Set default dates: checkIn tomorrow, checkOut in 3 days
  useEffect(() => {
    if (isOpen && !checkInDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 4);

      setCheckInDate(tomorrow.toISOString().split('T')[0]);
      setCheckOutDate(dayAfter.toISOString().split('T')[0]);
      setBookingConfirmed(null);
      setAvailabilityStatus(null);
    }
  }, [isOpen]);

  // Calculate nights and prices
  const calculateTotals = () => {
    if (!checkInDate || !checkOutDate || !activeRoom) {
      return { nights: 0, subtotal: 0, tax: 0, total: 0 };
    }
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    const nights = Math.max(0, Math.ceil(diff));
    const subtotal = nights * activeRoom.pricePerNight;
    const tax = Math.round(subtotal * 0.12);
    const total = subtotal + tax;
    return { nights, subtotal, tax, total };
  };

  const { nights, subtotal, tax, total } = calculateTotals();

  // Check live availability whenever dates or active room changes
  useEffect(() => {
    if (!activeRoom || !checkInDate || !checkOutDate || nights <= 0) return;

    let isMounted = true;
    const verifyAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const res = await roomAPI.checkAvailability(
          activeRoom._id,
          checkInDate,
          checkOutDate
        );
        if (isMounted) {
          setAvailabilityStatus({
            available: res.data.isAvailable,
            message: res.data.message,
          });
        }
      } catch (err) {
        if (isMounted) {
          setAvailabilityStatus(null);
        }
      } finally {
        if (isMounted) setCheckingAvailability(false);
      }
    };

    verifyAvailability();
    return () => {
      isMounted = false;
    };
  }, [activeRoom, checkInDate, checkOutDate, nights]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleGuestInfoChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please sign in to confirm and save your booking.');
      openAuthModal('login');
      return;
    }

    if (!activeRoom) {
      toast.error('Please select a suite to book.');
      return;
    }

    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    if (availabilityStatus && !availabilityStatus.available) {
      toast.error('This room is already reserved for the chosen dates. Please choose different dates.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomId: activeRoom._id,
        checkInDate,
        checkOutDate,
        guestInfo,
        paymentStatus: paymentOption,
      };

      const res = await bookingAPI.createBooking(payload);
      setBookingConfirmed(res.data.booking);
      toast.success('Your luxury reservation is confirmed!');
      if (onBookingSuccess) onBookingSuccess(res.data.booking);
    } catch (err) {
      console.error('Booking submission error:', err);
      const msg =
        err.response?.data?.message || 'Failed to complete booking. Please try again.';
      toast.error(msg);
      if (err.response?.status === 409) {
        setAvailabilityStatus({
          available: false,
          message: 'Date conflict detected. Please select alternative dates.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-hotel-sand animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-hotel-navy text-hotel-cream p-6 flex items-center justify-between border-b border-hotel-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hotel-gold/20 border border-hotel-gold/40 flex items-center justify-center text-hotel-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {bookingConfirmed ? 'Reservation Confirmation' : 'Reserve Your Stay'}
              </h3>
              <p className="text-xs text-hotel-goldLight">
                HotelPro Luxury Hospitality & Boutique Living
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Confirmed State View */}
        {bookingConfirmed ? (
          <div className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-600 shadow-lg">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-hotel-goldDark">
                Booking Reference: #{bookingConfirmed._id.substring(18).toUpperCase()}
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-hotel-navy mt-1">
                We Look Forward to Welcoming You
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                A confirmation voucher and check-in instructions have been sent to{' '}
                <strong className="text-hotel-navy">{bookingConfirmed.guestInfo?.email}</strong>.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-hotel-cream border border-hotel-sand rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-hotel-sand pb-4">
                <div>
                  <h4 className="font-serif font-bold text-lg text-hotel-navy">
                    {bookingConfirmed.room?.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Suite {bookingConfirmed.room?.roomNumber} • {bookingConfirmed.room?.roomType}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Confirmed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Check-In</span>
                  <span className="font-bold text-hotel-navy text-sm">
                    {new Date(bookingConfirmed.checkInDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-gray-500 block">3:00 PM</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Check-Out</span>
                  <span className="font-bold text-hotel-navy text-sm">
                    {new Date(bookingConfirmed.checkOutDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-gray-500 block">11:00 AM</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Duration</span>
                  <span className="font-bold text-hotel-navy text-sm">
                    {bookingConfirmed.totalNights} Nights
                  </span>
                  <span className="text-gray-500 block">
                    {bookingConfirmed.guestInfo?.adults} Adults
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Total Paid</span>
                  <span className="font-bold text-hotel-goldDark text-base">
                    ${bookingConfirmed.totalPrice}
                  </span>
                  <span className="text-gray-500 block capitalize">
                    {bookingConfirmed.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-hotel-navy text-white font-semibold text-sm hover:bg-hotel-navyLight transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hotel-sand">
            {/* Left Column: Room & Date Configuration */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              {/* Room Selection Dropdown if multiple */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Select Accommodation
                </label>
                {allRooms.length > 1 ? (
                  <select
                    value={activeRoom?._id || ''}
                    onChange={(e) => {
                      const found = allRooms.find((r) => r._id === e.target.value);
                      if (found) setActiveRoom(found);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-hotel-sand bg-hotel-cream text-hotel-navy font-semibold text-sm focus:outline-none focus:border-hotel-gold"
                  >
                    {allRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title} — ${r.pricePerNight}/night ({r.roomType})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-2xl bg-hotel-cream border border-hotel-sand flex items-center gap-4">
                    <img
                      src={activeRoom?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80'}
                      alt={activeRoom?.title}
                      className="w-20 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-hotel-navy text-base">
                        {activeRoom?.title}
                      </h4>
                      <p className="text-xs text-hotel-goldDark font-semibold">
                        ${activeRoom?.pricePerNight} / night • {activeRoom?.roomType}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Check-In Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-hotel-sand bg-hotel-cream text-sm font-semibold text-hotel-navy focus:outline-none focus:border-hotel-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Check-Out Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={checkInDate || todayStr}
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-hotel-sand bg-hotel-cream text-sm font-semibold text-hotel-navy focus:outline-none focus:border-hotel-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Live Availability Status Indicator */}
              <div className="p-3.5 rounded-xl border text-xs flex items-center justify-between">
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-hotel-gold border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking room availability...</span>
                  </div>
                ) : availabilityStatus ? (
                  availabilityStatus.available ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{availabilityStatus.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-700 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{availabilityStatus.message}</span>
                    </div>
                  )
                ) : (
                  <span className="text-gray-500">Select dates to verify availability.</span>
                )}
                <span className="text-xs text-gray-400 font-medium">Instant Confirmation</span>
              </div>

              {/* Guest Information */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif font-bold text-hotel-navy text-base">
                  Guest Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Alexander Wright"
                      value={guestInfo.fullName}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alexander@example.com"
                      value={guestInfo.email}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={guestInfo.phone}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Adults
                    </label>
                    <select
                      name="adults"
                      value={guestInfo.adults}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Children
                    </label>
                    <select
                      name="children"
                      value={guestInfo.children}
                      onChange={handleGuestInfoChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                    >
                      <option value="0">0 Children</option>
                      <option value="1">1 Child</option>
                      <option value="2">2 Children</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    name="specialRequests"
                    placeholder="e.g. Quiet high floor, late airport arrival, extra pillows"
                    value={guestInfo.specialRequests}
                    onChange={handleGuestInfoChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-hotel-sand text-xs focus:outline-none focus:border-hotel-gold"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Breakdown & Payment */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-hotel-cream/60 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="font-serif font-bold text-hotel-navy text-lg mb-4">
                  Reservation Summary
                </h4>

                <div className="space-y-3 text-xs text-gray-600 pb-4 border-b border-hotel-sand">
                  <div className="flex justify-between">
                    <span>Rate per night</span>
                    <span className="font-semibold text-hotel-navy">
                      ${activeRoom?.pricePerNight || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stay length</span>
                    <span className="font-semibold text-hotel-navy">
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Subtotal</span>
                    <span className="font-semibold text-hotel-navy">${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Luxury Hospitality Tax & Service Fee (12%)</span>
                    <span className="font-semibold text-hotel-navy">${tax}</span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="pt-4 flex items-baseline justify-between mb-6">
                  <div>
                    <span className="font-serif text-lg font-bold text-hotel-navy block">
                      Total Amount
                    </span>
                    <span className="text-[11px] text-gray-400">All taxes & fees included</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-3xl font-extrabold text-hotel-goldDark">
                      ${total}
                    </span>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-2 mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Payment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentOption('paid')}
                      className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        paymentOption === 'paid'
                          ? 'border-hotel-gold bg-hotel-navy text-white shadow-md'
                          : 'border-hotel-sand bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-hotel-gold" />
                      <span>Instant Card Guarantee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOption('pay_at_hotel')}
                      className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                        paymentOption === 'pay_at_hotel'
                          ? 'border-hotel-gold bg-hotel-navy text-white shadow-md'
                          : 'border-hotel-sand bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-hotel-gold" />
                      <span>Pay Upon Check-In</span>
                    </button>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between mb-4">
                    <span>You are booking as a guest.</span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="font-bold underline text-amber-900"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || nights <= 0 || (availabilityStatus && !availabilityStatus.available)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-serif font-bold text-base hover:brightness-110 shadow-gold-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-hotel-navy border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirm Luxury Reservation • ${total}</span>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  Free cancellation up to 24 hours prior to check-in.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
