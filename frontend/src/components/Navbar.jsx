import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BedDouble,
  Home,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenBookingModal }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.info('You have been signed out.');
    setActivePage('home');
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandClick = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigateTo('admin-home');
      } else {
        navigateTo('user-home');
      }
    } else {
      navigateTo('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-hotel-navy/95 backdrop-blur-md border-b border-hotel-gold/20 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-hotel-gold to-hotel-goldDark flex items-center justify-center text-hotel-navy shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 fill-hotel-navy" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-hotel-cream flex items-center gap-1.5">
                HOTEL<span className="text-hotel-gold">PRO</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-hotel-goldLight font-medium -mt-1">
                Rooms, suites & villas
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigateTo('home')}
              className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                activePage === 'home'
                  ? 'text-hotel-gold font-semibold'
                  : 'text-gray-300 hover:text-hotel-gold'
              }`}
            >
              Home
            </button>

            {/* If Ordinary User is logged in, provide User Dashboard link */}
            {isAuthenticated && !isAdmin && (
              <button
                onClick={() => navigateTo('user-home')}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1.5 ${
                  activePage === 'user-home'
                    ? 'text-hotel-gold font-semibold'
                    : 'text-gray-300 hover:text-hotel-gold'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-hotel-gold" />
                User Dashboard
              </button>
            )}

            <button
              onClick={() => navigateTo('rooms')}
              className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                activePage === 'rooms'
                  ? 'text-hotel-gold font-semibold'
                  : 'text-gray-300 hover:text-hotel-gold'
              }`}
            >
              Rooms & Suites
            </button>

            {isAuthenticated && (
              <button
                onClick={() => navigateTo('my-bookings')}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1.5 ${
                  activePage === 'my-bookings'
                    ? 'text-hotel-gold font-semibold'
                    : 'text-gray-300 hover:text-hotel-gold'
                }`}
              >
                <Calendar className="w-4 h-4 text-hotel-gold" />
                My Bookings
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigateTo('admin-home')}
                className={`text-sm font-semibold tracking-wide px-3 py-1.5 rounded-full border border-hotel-gold/40 transition-colors duration-200 flex items-center gap-1.5 ${
                  activePage === 'admin-home'
                    ? 'bg-hotel-gold text-hotel-navy'
                    : 'text-hotel-gold hover:bg-hotel-gold/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 py-1.5 px-3 rounded-full bg-hotel-navyLight/80 border border-hotel-gold/30 hover:border-hotel-gold transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-hotel-gold text-hotel-navy font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-white leading-tight">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-hotel-goldLight capitalize">
                      {user?.role === 'admin' ? 'Administrator' : 'Guest'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-hotel-gold ml-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-hotel-navyLight rounded-xl shadow-2xl border border-hotel-gold/30 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-700/60">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => navigateTo('user-home')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-hotel-navy hover:text-hotel-gold flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-hotel-gold" />
                        UserHome Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => navigateTo('my-bookings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-hotel-navy hover:text-hotel-gold flex items-center gap-2.5 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-hotel-gold" />
                      My Bookings
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => navigateTo('admin-home')}
                        className="w-full text-left px-4 py-2 text-sm text-hotel-gold font-medium hover:bg-hotel-navy flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-hotel-gold" />
                        AdminHome Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => navigateTo('profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-hotel-navy hover:text-hotel-gold flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-hotel-gold" />
                      Profile Settings
                    </button>

                    <div className="border-t border-gray-700/60 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-medium text-hotel-cream hover:text-hotel-gold transition-colors px-3 py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-semibold text-sm hover:brightness-110 shadow-md hover:shadow-gold-glow transition-all duration-200"
                >
                  SignUp
                </button>
              </div>
            )}

            <button
              onClick={() => navigateTo('rooms')}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full border border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-navy text-sm font-semibold transition-all duration-200"
            >
              <BedDouble className="w-4 h-4" />
              Book a Suite
            </button>
          </div>

          {!isAuthenticated && (
            <button onClick={() => openAuthModal('admin')} className="hidden md:block text-xs text-hotel-gold hover:underline">Admin Sign In</button>
          )}

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-hotel-navyLight focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-hotel-navyLight border-b border-hotel-gold/30 px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => navigateTo('home')}
            className="w-full text-left py-2 text-base font-medium text-gray-200 hover:text-hotel-gold"
          >
            Home
          </button>

          {isAuthenticated && !isAdmin && (
            <button
              onClick={() => navigateTo('user-home')}
              className="w-full text-left py-2 text-base font-medium text-gray-200 hover:text-hotel-gold flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-hotel-gold" />
              User Dashboard
            </button>
          )}

          <button
            onClick={() => navigateTo('rooms')}
            className="w-full text-left py-2 text-base font-medium text-gray-200 hover:text-hotel-gold"
          >
            Rooms & Suites
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigateTo('my-bookings')}
                className="w-full text-left py-2 text-base font-medium text-gray-200 hover:text-hotel-gold flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-hotel-gold" />
                My Bookings
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigateTo('admin-home')}
                  className="w-full text-left py-2 text-base font-semibold text-hotel-gold flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </button>
              )}

              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-base font-medium text-rose-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({user?.name})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-gray-700/60 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-lg border border-hotel-gold/50 text-hotel-gold text-center font-medium"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="w-full py-2.5 rounded-lg bg-hotel-gold text-hotel-navy text-center font-semibold"
              >
                SignUp
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
