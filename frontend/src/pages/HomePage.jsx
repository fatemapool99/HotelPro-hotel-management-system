import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Search,
  Star,
  ShieldCheck,
  Award,
  Coffee,
  Waves,
  Utensils,
  Wine,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BedDouble,
  Heart,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage({
  rooms = [],
  onNavigate,
  onSelectRoom,
  onBookRoom,
  onQuickSearch,
}) {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    roomType: 'All',
  });

  // Hero carousel slides based on rooms or luxury defaults
  const carouselSlides = rooms.length > 0 ? rooms.slice(0, 4) : [
    {
      _id: 'c1',
      title: 'The Royal Oceanfront Penthouse Suite',
      roomType: 'Presidential Suite',
      pricePerNight: 850,
      description: 'Perched on the top floor with panoramic ocean vistas, private marble infinity jacuzzi, and dedicated butler service.',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1800&q=85'],
    },
    {
      _id: 'c2',
      title: 'Private Overwater Coral Villa',
      roomType: 'Ocean Villa',
      pricePerNight: 680,
      description: 'Suspended directly above crystal turquoise waters with private plunge pool and glass floor ocean viewing panel.',
      images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1800&q=85'],
    },
    {
      _id: 'c3',
      title: 'Executive Grand Azure Suite',
      roomType: 'Executive Suite',
      pricePerNight: 490,
      description: 'Floor-to-ceiling soundproof glass walls overlooking the harbor, Italian marble rainfall shower, and executive lounge.',
      images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1800&q=85'],
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onQuickSearch) {
      onQuickSearch(searchParams);
    }
    onNavigate('rooms');
  };

  const activeSlideData = carouselSlides[currentSlide] || carouselSlides[0];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-hotel-navy overflow-hidden">
        {/* Slides Images with Transition */}
        {carouselSlides.map((slide, idx) => (
          <div
            key={slide._id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 -z-10 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85'}
              alt={slide.title}
              className="w-full h-full object-cover object-center brightness-[0.38] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hotel-navy via-hotel-navy/40 to-transparent"></div>
          </div>
        ))}

        {/* Carousel Prev/Next Navigation Controls */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-36 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotel-gold/20 border border-hotel-gold/40 text-hotel-goldLight text-xs font-semibold uppercase tracking-widest backdrop-blur-md animate-fadeIn">
            <Sparkles className="w-4 h-4 text-hotel-gold" />
            <span>Featured Suite: {activeSlideData.roomType || 'Luxury Residence'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-hotel-cream tracking-tight leading-[1.15] max-w-4xl mx-auto drop-shadow-md">
            {activeSlideData.title}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-200 font-light leading-relaxed drop-shadow">
            {activeSlideData.description}
          </p>

          {/* Pricing & Slide Action */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-hotel-gold/30 text-white">
              <span className="text-xs text-hotel-goldLight block uppercase">Starting from</span>
              <span className="font-serif text-2xl font-extrabold text-hotel-gold">
                ${activeSlideData.pricePerNight || 450}
              </span>
              <span className="text-xs text-gray-300"> / night</span>
            </div>

            <button
              onClick={() => {
                if (activeSlideData._id && activeSlideData.pricePerNight) {
                  onBookRoom(activeSlideData);
                } else {
                  onNavigate('rooms');
                }
              }}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all flex items-center gap-2"
            >
              <span>Book This Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Search Bar Floating Box */}
          <div className="pt-6 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-full shadow-2xl border border-hotel-sand grid grid-cols-1 sm:grid-cols-4 gap-3 text-left"
            >
              {/* Check-In */}
              <div className="px-4 py-2 rounded-xl sm:rounded-full bg-hotel-cream hover:bg-hotel-creamDark transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Check-In
                </label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkIn: e.target.value })
                  }
                  className="w-full bg-transparent text-xs font-bold text-hotel-navy focus:outline-none"
                />
              </div>

              {/* Check-Out */}
              <div className="px-4 py-2 rounded-xl sm:rounded-full bg-hotel-cream hover:bg-hotel-creamDark transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Check-Out
                </label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkOut: e.target.value })
                  }
                  className="w-full bg-transparent text-xs font-bold text-hotel-navy focus:outline-none"
                />
              </div>

              {/* Guests Selection */}
              <div className="px-4 py-2 rounded-xl sm:rounded-full bg-hotel-cream hover:bg-hotel-creamDark transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Guests & Suite
                </label>
                <select
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, guests: e.target.value })
                  }
                  className="w-full bg-transparent text-xs font-bold text-hotel-navy focus:outline-none cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 sm:py-0 px-6 rounded-xl sm:rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Stays</span>
              </button>
            </form>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-hotel-gold' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. ABOUT HOTELPRO SECTION (SkillWallet Requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-hotel-sand shadow-luxury p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-gold/15 text-hotel-goldDark text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About HotelPro Hospitality</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-hotel-navy leading-tight">
              A Legacy of Coastal Elegance & Bespoke Living
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Founded on the shores of Marina Bay, <strong>HotelPro</strong> is an architectural marvel
              dedicated to uncompromising hospitality. Every suite, from our private overwater villas
              to panoramic royal penthouses, is crafted with artisanal materials, Italian marble baths,
              and private oceanfront terraces.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-hotel-cream border border-hotel-sand space-y-1">
                <div className="flex items-center gap-2 text-hotel-goldDark">
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider text-hotel-navy">Forbes 5-Star</span>
                </div>
                <p className="text-[11px] text-gray-500">Consecutive excellence in personalized guest service</p>
              </div>

              <div className="p-4 rounded-xl bg-hotel-cream border border-hotel-sand space-y-1">
                <div className="flex items-center gap-2 text-hotel-goldDark">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider text-hotel-navy">Private Sanctuary</span>
                </div>
                <p className="text-[11px] text-gray-500">24/7 dedicated butler team & keyless biometric access</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('rooms')}
                className="px-6 py-3 rounded-full bg-hotel-navy text-hotel-gold font-bold text-xs uppercase tracking-wider hover:bg-hotel-navyLight transition-colors"
              >
                Discover Our Residences
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-6 py-3 rounded-full border border-hotel-gold text-hotel-navy font-bold text-xs uppercase tracking-wider hover:bg-hotel-gold/10 transition-colors"
                >
                  Create Guest Account
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
              alt="HotelPro Suite Interior"
              className="rounded-2xl object-cover h-64 w-full shadow-md"
            />
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
              alt="HotelPro Spa & Plunge Pool"
              className="rounded-2xl object-cover h-64 w-full mt-6 shadow-md"
            />
          </div>
        </div>
      </section>

      {/* 3. ROOM PREVIEW SECTION (SkillWallet Requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-hotel-goldDark text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-hotel-navy">
              Room & Suite Previews
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Preview our handpicked accommodations available for immediate booking. Explore full amenities,
              live pricing, and reserve in seconds.
            </p>
          </div>

          <button
            onClick={() => onNavigate('rooms')}
            className="inline-flex items-center gap-2 text-sm font-bold text-hotel-goldDark hover:text-hotel-navy transition-colors group"
          >
            <span>View All {rooms.length} Suites</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.slice(0, 6).map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onSelectRoom={onSelectRoom}
              onBookRoom={onBookRoom}
            />
          ))}
        </div>
      </section>

      {/* 4. CURATED RESORT AMENITIES */}
      <section className="bg-hotel-creamDark py-20 border-y border-hotel-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-hotel-goldDark">
              World-Class Leisure
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-hotel-navy">
              The HotelPro Amenities
            </h2>
            <p className="text-sm text-gray-600">
              Immerse yourself in unrivaled amenities designed to awaken the senses and rejuvenate mind, body, and spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-hotel-gold/15 flex items-center justify-center text-hotel-goldDark">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-hotel-navy">
                Heated Ocean Infinity Pool
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Seamlessly blending into the horizon with private poolside cabanas, fresh fruit skewers, and cocktail service.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-hotel-gold/15 flex items-center justify-center text-hotel-goldDark">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-hotel-navy">
                Michelin-Star Gastronomy
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Award-winning dining crafted with locally sourced coastal ingredients, rare truffles, and sommelier selection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-hotel-gold/15 flex items-center justify-center text-hotel-goldDark">
                <Wine className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-hotel-navy">
                Sub-Zero Wine Cellar & Bar
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Private tastings of rare vintages and masterclasses led by acclaimed sommeliers in our climate cellar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-hotel-gold/15 flex items-center justify-center text-hotel-goldDark">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-hotel-navy">
                Private Yacht Charters
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sunset cruises, secluded cove excursions, and deep-sea angling aboard our private hotel fleet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION WITH LOGIN / SIGNUP PROMPTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-hotel-navy p-10 sm:p-16 text-center text-white border border-hotel-gold/30 shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-hotel-goldLight block">
              Experience HotelPro
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Begin Your Unforgettable Journey With Us
            </h2>
            <p className="text-sm text-gray-300">
              Sign up today to explore suites, make real-time reservations without overlapping conflicts,
              and manage your booking itinerary.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => onNavigate('rooms')}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all"
                >
                  Browse Available Rooms
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow transition-all"
                  >
                    Create Account (Sign Up)
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-8 py-3.5 rounded-full border border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-navy font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
