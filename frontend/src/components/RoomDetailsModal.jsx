import React, { useState } from 'react';
import {
  X,
  Users,
  Bed,
  Maximize2,
  Star,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function RoomDetailsModal({ room, isOpen, onClose, onBookRoom }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !room) return null;

  const defaultImages = [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
  ];

  const images = room.images && room.images.length > 0 ? room.images : defaultImages;
  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-hotel-sand animate-fadeIn">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Hero Photo Gallery */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-gray-900 overflow-hidden">
          <img
            src={currentImage}
            alt={room.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-hotel-navy/90 via-transparent to-black/30"></div>

          {/* Badges Floating */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-hotel-navy/90 text-hotel-gold border border-hotel-gold/30 backdrop-blur-md">
              {room.roomType}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{room.rating ? room.rating.toFixed(1) : '4.9'}</span>
              <span className="text-gray-300 text-[10px]">({room.reviewsCount || 24} reviews)</span>
            </div>
          </div>

          {/* Bottom Title Bar */}
          <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-hotel-goldLight tracking-wider uppercase">
                Suite {room.roomNumber} • Level {room.floor || 1}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                {room.title}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-300 uppercase block">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-extrabold text-hotel-gold">
                  {formatINR(room.pricePerNight)}
                </span>
                <span className="text-xs text-gray-300">/ night</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Switcher if multiple images */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-hotel-cream border-b border-hotel-sand overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  activeImageIndex === idx
                    ? 'border-hotel-gold scale-105 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Room Information & Specifications */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-hotel-cream border border-hotel-sand text-hotel-charcoal">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-goldDark shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase block font-semibold">
                  Capacity
                </span>
                <span className="text-sm font-bold text-hotel-navy">
                  {room.capacity?.guests || 2} Guests
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-goldDark shadow-sm">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase block font-semibold">
                  Bedding
                </span>
                <span className="text-sm font-bold text-hotel-navy">
                  {room.capacity?.bedType || 'King Bed'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-goldDark shadow-sm">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase block font-semibold">
                  Room Size
                </span>
                <span className="text-sm font-bold text-hotel-navy">
                  {room.size || '520 sq ft'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-goldDark shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 uppercase block font-semibold">
                  Check-In
                </span>
                <span className="text-sm font-bold text-hotel-navy">3:00 PM</span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-xl text-hotel-navy">
              Residence Overview
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Curated Amenities Checklist */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-hotel-navy">
              Curated Amenities & Inclusions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {room.amenities &&
                room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-hotel-cream border border-hotel-sand text-xs font-medium text-hotel-charcoal"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Hotel Policies Card */}
          <div className="p-4 rounded-2xl bg-hotel-creamDark border border-hotel-sand space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-hotel-navy font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-hotel-goldDark" />
              <span>Hospitality & Cancellation Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Full refund available if cancelled at least 24 hours prior to check-in. Non-smoking
              suites. Daily housekeeping and evening turndown service included with every stay.
            </p>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-hotel-sand">
            <div>
              <span className="text-xs text-gray-400 uppercase block">Total Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-extrabold text-hotel-navy">
                  {formatINR(room.pricePerNight)}
                </span>
                <span className="text-xs text-gray-500">/ night</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-hotel-sand text-hotel-navy font-semibold text-xs hover:bg-hotel-cream transition-colors"
              >
                Back to Catalog
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBookRoom(room);
                }}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy font-serif font-bold text-sm hover:brightness-110 shadow-gold-glow transition-all flex items-center justify-center gap-2"
              >
                <span>Reserve This Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
