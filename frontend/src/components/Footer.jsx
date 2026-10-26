import React, { useState } from 'react';
import { Sparkles, Mail, Phone, MapPin, Award, Shield, Heart } from 'lucide-react';


export default function Footer({ setActivePage }) {
  const [policy, setPolicy] = useState(null);
  const policies = {
    'Privacy Policy': 'This demonstration stores your account details and bookings in its database. Passwords are hashed. Sign-in tokens are stored in your browser. Administrators can view guest and booking information. Room photos and fonts load from external services. Please use test details for this project.',
    'Terms & conditions': 'HotelPro is a project demonstration. Reservations do not reserve accommodation at a real hotel. No online payments are collected. The displayed total includes an estimated 12% combined tax and service charge for this demo. You can cancel a reservation from My Bookings.',
    'Guest Security': 'Use a unique password and sign out on shared devices. HotelPro never asks for card details. Contact details shown here are samples and should not be used for assistance.'
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
              Rooms, suites and villas in Mumbai, Goa and Udaipur.
              Find your room, check the details and book your next stay.
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs text-hotel-gold">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-hotel-gold" />
                <span>Rooms & suites</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-hotel-gold" />
                <span>Villas & city stays</span>
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
                  Home
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
                <span>HotelPro Pavilion (Sample Property), BKC, Mumbai 400051, Maharashtra</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-hotel-gold shrink-0" />
                <span>+91 22 6123 4567 (Sample Desk)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-hotel-gold shrink-0" />
                <span>1800 200 4567 (Sample Helpline)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-hotel-gold shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-hotel-gold font-serif font-semibold text-base">Before you book</h4>
            <p className="text-xs text-gray-400">Check the room capacity, choose your dates and review the total before confirming.</p>
            <button onClick={() => navigateTo('rooms')} className="text-sm text-hotel-gold underline">Browse rooms</button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 HotelPro Hospitality Group (SkillWallet Project Demo). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setPolicy('Privacy Policy')} className="hover:text-hotel-gold transition-colors">Privacy Policy</button>
            <button onClick={() => setPolicy('Terms & conditions')} className="hover:text-hotel-gold transition-colors">Terms & conditions</button>
            <button onClick={() => setPolicy('Guest Security')} className="hover:text-hotel-gold transition-colors">Guest Security</button>
          </div>
        </div>
      </div>
      {policy && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setPolicy(null)}>
          <section role="dialog" aria-modal="true" aria-label={policy} className="max-w-lg bg-hotel-navy border border-hotel-gold rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setPolicy(null); }}>
            <h2 className="text-xl text-hotel-gold">{policy}</h2>
            <p className="text-sm leading-relaxed">{policies[policy]}</p>
            <button autoFocus onClick={() => setPolicy(null)} className="px-4 py-2 bg-hotel-gold text-hotel-navy rounded-lg">Close</button>
          </section>
        </div>
      )}
    </footer>
  );
}
