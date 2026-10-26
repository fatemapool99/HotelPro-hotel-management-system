import React, { useState, useMemo } from 'react';
import RoomCard from '../components/RoomCard';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  Sparkles,
  BedDouble,
  Check,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

const ROOM_TYPES = [
  'All',
  'Presidential Suite',
  'Executive Suite',
  'Ocean Villa',
  'Deluxe Room',
  'Standard Luxury',
];

const POPULAR_AMENITIES = [
  'Sea View',
  'Private Plunge Pool',
  'Butler Service',
  'King Bed',
  'High-Speed Wi-Fi',
  'Lake View',
  'Garden Veranda',
];

export default function RoomsPage({
  rooms = [],
  loading = false,
  onSelectRoom,
  onBookRoom,
  initialFilters = {},
}) {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedType, setSelectedType] = useState(initialFilters.roomType || 'All');
  const [maxPrice, setMaxPrice] = useState(40000);
  const [minGuests, setMinGuests] = useState(initialFilters.guests || '1');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setMaxPrice(40000);
    setMinGuests('1');
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Room Type
      if (selectedType !== 'All' && room.roomType !== selectedType) {
        return false;
      }

      // Max Price
      if (room.pricePerNight > maxPrice) {
        return false;
      }

      // Guests
      if (minGuests && Number(minGuests) > 1) {
        if ((room.capacity?.guests || 2) < Number(minGuests)) {
          return false;
        }
      }

      // Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = room.title.toLowerCase().includes(query);
        const matchesDesc = room.description?.toLowerCase().includes(query);
        const matchesType = room.roomType.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesType) {
          return false;
        }
      }

      // Amenities filter (must have all selected amenities)
      if (selectedAmenities.length > 0) {
        const roomAmenities = (room.amenities || []).map((a) => a.toLowerCase());
        const hasAll = selectedAmenities.every((sa) =>
          roomAmenities.some((ra) => ra.includes(sa.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      if (sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
      return 0; // Default / recommended
    });
  }, [rooms, search, selectedType, maxPrice, minGuests, selectedAmenities, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Title & Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotel-gold/15 text-hotel-goldDark text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Sanctuary Portfolio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-hotel-navy">
          Rooms & Signature Suites
        </h1>
        <p className="text-sm text-gray-600">
          Find a room by type, number of guests, nightly rate and facilities.
        </p>
      </div>

      {/* Main Filter & Rooms Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* FILTERS SIDEBAR */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl border border-hotel-sand shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-hotel-sand pb-4">
            <div className="flex items-center gap-2 text-hotel-navy font-serif font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5 text-hotel-goldDark" />
              <span>Filter Stays</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-hotel-goldDark flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Search by Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Suite name, terrace, villa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-hotel-cream border border-hotel-sand rounded-xl text-xs text-hotel-navy placeholder-gray-400 focus:outline-none focus:border-hotel-gold"
              />
            </div>
          </div>

          {/* Room Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Accommodation Type
            </label>
            <div className="space-y-1">
              {ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedType === type
                      ? 'bg-hotel-navy text-hotel-gold font-bold shadow-sm'
                      : 'text-gray-600 hover:bg-hotel-cream hover:text-hotel-navy'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Max Price per Night
              </label>
              <span className="text-xs font-bold text-hotel-goldDark font-serif">
                {formatINR(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="40000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-hotel-gold cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>₹2,000</span>
              <span>₹20,000</span>
              <span>₹40,000+</span>
            </div>
          </div>

          {/* Guest Capacity Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Minimum Guests
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '2', '3', '4+'].map((count) => {
                const countVal = count === '4+' ? '4' : count;
                return (
                  <button
                    key={count}
                    onClick={() => setMinGuests(countVal)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      minGuests === countVal
                        ? 'bg-hotel-gold text-hotel-navy'
                        : 'bg-hotel-cream border border-hotel-sand text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="space-y-2 pt-2 border-t border-hotel-sand">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Featured Amenities
            </label>
            <div className="space-y-2">
              {POPULAR_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none hover:text-hotel-navy"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-hotel-gold border-hotel-gold text-hotel-navy'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ROOMS CATALOG LIST */}
        <main className="lg:col-span-3 space-y-6">
          {/* Header Bar with Count & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-hotel-sand">
            <p className="text-xs text-gray-600">
              Showing <strong className="text-hotel-navy">{filteredRooms.length}</strong> available{' '}
              {filteredRooms.length === 1 ? 'residence' : 'residences'}
            </p>

            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500 whitespace-nowrap">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs bg-hotel-cream border border-hotel-sand rounded-xl font-medium text-hotel-navy focus:outline-none focus:border-hotel-gold cursor-pointer"
              >
                <option value="recommended">Featured & Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Guest Rating</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-hotel-cream animate-pulse border border-hotel-sand"
                ></div>
              ))}
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onSelectRoom={onSelectRoom}
                  onBookRoom={onBookRoom}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-hotel-sand p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-hotel-cream flex items-center justify-center text-hotel-goldDark mx-auto">
                <BedDouble className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-hotel-navy">
                No Residences Match Your Filters
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try widening your price range, choosing "All" room types, or clearing your selected amenities.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-hotel-gold text-hotel-navy text-xs font-bold hover:brightness-110 shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
