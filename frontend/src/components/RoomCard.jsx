import React from 'react';
import { Users, Bed, Sparkles, Star, ArrowRight, ShieldCheck, Maximize2 } from 'lucide-react';

export default function RoomCard({ room, onSelectRoom, onBookRoom }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
  const coverImage = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-hotel-sand shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onSelectRoom(room)}>
        <img
          src={coverImage}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hotel-navy/80 via-transparent to-black/20 opacity-90 group-hover:opacity-80 transition-opacity"></div>

        {/* Room Type Tag */}
        <div className="absolute top-3.5 left-3.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-hotel-navy/90 text-hotel-gold border border-hotel-gold/30 backdrop-blur-md shadow-md">
            {room.roomType}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>{room.rating ? room.rating.toFixed(1) : '4.9'}</span>
          <span className="text-gray-300 text-[10px]">({room.reviewsCount || 18})</span>
        </div>

        {/* Room Number & Floor Pill */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-xs font-medium text-hotel-goldLight tracking-wide">
            Suite {room.roomNumber} • Floor {room.floor || 1}
          </p>
        </div>
      </div>

      {/* Room Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelectRoom(room)}
            className="font-serif text-lg font-bold text-hotel-navy hover:text-hotel-goldDark transition-colors cursor-pointer line-clamp-1 mb-2"
          >
            {room.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {room.description}
          </p>

          {/* Key Specs Icons */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-hotel-cream border border-hotel-sand text-xs text-gray-700 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-hotel-goldDark shrink-0" />
              <span className="font-medium text-[11px] truncate">
                {room.capacity?.guests || 2} Guests
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-hotel-goldDark shrink-0" />
              <span className="font-medium text-[11px] truncate">
                {room.capacity?.beds || 1} Bed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-hotel-goldDark shrink-0" />
              <span className="font-medium text-[11px] truncate">
                {room.size || '500 sq ft'}
              </span>
            </div>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities &&
              room.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-hotel-creamDark text-hotel-charcoal border border-hotel-sand"
                >
                  {amenity}
                </span>
              ))}
            {room.amenities && room.amenities.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] text-hotel-goldDark font-semibold">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer Pricing & CTA */}
        <div className="pt-4 border-t border-hotel-sand flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-extrabold text-hotel-navy">
                ${room.pricePerNight}
              </span>
              <span className="text-xs text-gray-500 font-medium">/ night</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectRoom(room)}
              className="px-3 py-2 text-xs font-semibold rounded-lg text-hotel-slate hover:text-hotel-navy hover:bg-hotel-cream transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onBookRoom(room)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-hotel-gold to-hotel-goldDark text-hotel-navy hover:brightness-110 shadow-sm hover:shadow-gold-glow transition-all flex items-center gap-1"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
