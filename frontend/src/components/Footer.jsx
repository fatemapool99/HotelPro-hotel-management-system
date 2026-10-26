import React, { useState } from 'react';
import { Sparkles, Mail, Phone, MapPin, Award, Shield, Heart } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer({ setActivePage }) {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing! Exclusive member privileges sent to your inbox.');
    setEmail('');
  };

  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-hotel-navy text-hotel-cream border-t border-hotel-gold/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-hotel-gold to-hotel-goldDark flex items-center justify-center text-hotel-navy shadow-gold-glow">
                <Sparkles className="w-5 h-5 fill-hotel-navy" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-hotel-cream">
                HOTEL<span className="text-hotel-gold">PRO</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed pr-6">
              HotelPro represents the pinnacle of modern luxury hospitality. From panoramic
              oceanfront penthouses to personalized 24/7 butler services, every detail is
              curated to provide an unforgettable stay.
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs text-hotel-gold">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-hotel-gold" />
                <span>Forbes 5-Star Rated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-hotel-gold" />
                <span>Best Luxury Hotel 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-hotel-gold font-serif font-semibold text-base tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-hotel-gold transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('rooms')}
                  className="hover:text-hotel-gold transition-colors"
                >
                  Rooms & Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('rooms')}
                  className="hover:text-hotel-gold transition-colors"
                >
                  Oceanfront Villas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('rooms')}
                  className="hover:text-hotel-gold transition-colors"
                >
                  Presidential Suites
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Contact */}
          <div className="space-y-3">
            <h4 className="text-hotel-gold font-serif font-semibold text-base tracking-wider uppercase">
              Concierge Desk
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-hotel-gold shrink-0 mt-0.5" />
                <span>1000 Oceanfront Promenade, Marina Bay, CA 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-hotel-gold shrink-0" />
                <span>+1 (800) 555-PRO-HOTEL</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-hotel-gold shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
          </div>

          {/* VIP Newsletter */}
          <div className="space-y-3">
            <h4 className="text-hotel-gold font-serif font-semibold text-base tracking-wider uppercase">
              Exclusive Offers
            </h4>
            <p className="text-xs text-gray-400">
              Subscribe for private invitations, complimentary suite upgrades, and bespoke getaway packages.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-hotel-navyLight border border-hotel-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-hotel-gold"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy rounded-lg hover:brightness-110 shadow-sm transition-all"
              >
                Join VIP Club
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 HotelPro Luxury Hospitality Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-hotel-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-hotel-gold cursor-pointer transition-colors">Terms of Hospitality</span>
            <span className="hover:text-hotel-gold cursor-pointer transition-colors">Guest Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
