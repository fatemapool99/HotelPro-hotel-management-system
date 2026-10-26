import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { roomAPI } from './services/api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import RoomDetailsModal from './components/RoomDetailsModal';

// Pages
import HomePage from './pages/HomePage';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import RoomsPage from './pages/RoomsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

function HotelProApp() {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);

  // Quick search criteria passed from HomePage hero
  const [quickSearchFilters, setQuickSearchFilters] = useState({});

  const toast = useToast();

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await roomAPI.getRooms();
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.warn('Could not fetch rooms from backend yet:', err.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // SkillWallet Requirement 3: Login and Role-Based Redirection
  // Ordinary users → UserHome, Administrators → AdminHome
  const handleLoginSuccess = (loggedInUser) => {
    if (loggedInUser.role === 'admin') {
      setActivePage('admin-home');
    } else {
      setActivePage('user-home');
    }
  };

  // SkillWallet Requirement 3: Route Protection Guard
  useEffect(() => {
    if (!isAuthenticated) {
      if (activePage === 'user-home' || activePage === 'admin-home' || activePage === 'my-bookings' || activePage === 'profile') {
        setActivePage('home');
      }
    } else {
      if (activePage === 'admin-home' && !isAdmin) {
        toast.error('Admin privileges required to view AdminHome.');
        setActivePage('user-home');
      }
    }
  }, [activePage, isAuthenticated, isAdmin]);

  const handleOpenDetails = (room) => {
    setSelectedRoomForDetails(room);
    setDetailsModalOpen(true);
  };

  const handleOpenBooking = (room = null) => {
    setSelectedRoomForBooking(room || rooms[0] || null);
    setBookingModalOpen(true);
  };

  const handleQuickSearch = (searchData) => {
    setQuickSearchFilters(searchData);
    setActivePage('rooms');
  };

  return (
    <div className="min-h-screen flex flex-col bg-hotel-cream text-hotel-charcoal">
      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenBookingModal={() => handleOpenBooking(null)}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {/* Public Homepage (SkillWallet Requirement 1) */}
        {activePage === 'home' && (
          <HomePage
            rooms={rooms}
            onNavigate={setActivePage}
            onSelectRoom={handleOpenDetails}
            onBookRoom={handleOpenBooking}
            onQuickSearch={handleQuickSearch}
          />
        )}

        {/* User Dashboard / UserHome (SkillWallet Requirement 4) */}
        {activePage === 'user-home' && (
          <UserHome
            rooms={rooms}
            loading={loadingRooms}
            onNavigate={setActivePage}
            onSelectRoom={handleOpenDetails}
            onBookRoom={handleOpenBooking}
          />
        )}

        {/* Admin Dashboard / AdminHome (SkillWallet Requirement 7) */}
        {activePage === 'admin-home' && (
          <AdminHome
            onRoomsUpdated={fetchRooms}
            onNavigate={setActivePage}
          />
        )}

        {/* All Rooms & Suites Catalog */}
        {activePage === 'rooms' && (
          <RoomsPage
            rooms={rooms}
            loading={loadingRooms}
            onSelectRoom={handleOpenDetails}
            onBookRoom={handleOpenBooking}
            initialFilters={quickSearchFilters}
          />
        )}

        {/* My Bookings Page (SkillWallet Requirement 6) */}
        {activePage === 'my-bookings' && (
          <MyBookingsPage
            onNavigate={setActivePage}
            onBookRoom={handleOpenBooking}
          />
        )}

        {/* Profile Settings */}
        {activePage === 'profile' && <ProfilePage />}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Global Interactive Modals */}
      <AuthModal onLoginSuccess={handleLoginSuccess} />

      <RoomDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        room={selectedRoomForDetails}
        onBookRoom={(room) => {
          setDetailsModalOpen(false);
          handleOpenBooking(room);
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        allRooms={rooms}
        onBookingSuccess={() => {
          fetchRooms();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HotelProApp />
      </AuthProvider>
    </ToastProvider>
  );
}
