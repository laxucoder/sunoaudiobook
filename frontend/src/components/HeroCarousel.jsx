import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Lock, Crown } from 'lucide-react';

const HeroCarousel = ({ items, onPlay, onBuy, user }) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden group">
      {items.map((item, index) => {
        const isAdmin = user?.role === 'ADMIN';
        const isPremium = user?.isPremium;
        const isOwner = user?.purchasedAudioIds?.includes(item.id);
        const isFree = item.isFree;
        const canPlay = isAdmin || isPremium || isOwner || isFree;

        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img src={item.thumbnail || item.img || "https://placehold.co/800x600"} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-16 max-w-2xl px-4 animate-slide-up">
              <span className="inline-block bg-[#E50914] text-white text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider shadow-lg">
                {item.category || 'Trending'}
              </span>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                {item.title}
              </h1>

              <p className="text-gray-200 text-lg md:text-xl mb-8 font-medium drop-shadow-md line-clamp-3">
                {item.description || "Immerse yourself in this gripping audio experience. Listen now on Suno Audiobook."}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => canPlay ? onPlay(item) : onBuy(item)}
                  className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform transform active:scale-95 shadow-xl ${canPlay
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-[#E50914] text-white hover:bg-red-600'
                    }`}
                >
                  {canPlay ? (
                    <>
                      <Play fill="currentColor" size={20} /> Play Now
                    </>
                  ) : (
                    <>
                      {item.price > 0 ? <Lock size={20} /> : <Crown size={20} />}
                      {item.price > 0 ? `Unlock for ₹${item.price}` : 'Get Premium'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 z-20 p-3 bg-black/30 hover:bg-[#E50914] rounded-full text-white transition-all backdrop-blur-sm border border-white/10">
        <ChevronLeft size={28} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 z-20 p-3 bg-black/30 hover:bg-[#E50914] rounded-full text-white transition-all backdrop-blur-sm border border-white/10">
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'w-8 bg-[#E50914]' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;