import React from 'react';
import { Play, Lock, CheckCircle, Zap } from 'lucide-react';

const PlaylistCard = ({ item, onPlay, user, onBuy }) => {
  const isAdmin = user?.role === 'ADMIN';
  const isPremium = user?.isPremium;
  const isOwner = user?.purchasedAudioIds?.includes(item.id);
  const isFree = item.isFree;
  const canPlay = isAdmin || isPremium || isOwner || isFree;

  const isNew = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) < 7; // Less than 7 days old

  return (
    <div
      className="group relative bg-[#181825] rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-900/20"
      onClick={() => canPlay ? onPlay(item) : onBuy(item)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={item.img || item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button className={`${!canPlay ? 'bg-amber-500' : 'bg-[#E50914]'} text-white p-4 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100`}>
            {!canPlay ? <Lock size={24} /> : <Play size={24} fill="currentColor" />}
          </button>
        </div>

        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse">
              NEW
            </span>
          )}
          {item.playCount > 50 && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> HOT
            </span>
          )}
        </div>
        {!canPlay && (
          <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded-full text-amber-400 backdrop-blur-md border border-amber-500/30"><Lock size={14} /></div>
        )}
        {isOwner && !user?.isPremium && (
          <div className="absolute top-2 right-2 bg-green-900/90 p-1.5 rounded-full text-green-400 backdrop-blur-md border border-green-500/30"><CheckCircle size={14} /></div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold truncate mb-1 text-lg">{item.title}</h3>
        <div className="flex justify-between items-center text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <span>{item.episodesCount} Eps</span>
          <span className="flex items-center gap-1">
            {item.playCount > 0 ? `${item.playCount} Plays` : 'New'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {!canPlay ? (
            <span className="text-[10px] font-bold text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded bg-amber-400/10">PREMIUM</span>
          ) : item.isFree ? (
            <span className="text-[10px] font-bold text-gray-400 border border-gray-600 px-2 py-0.5 rounded">FREE</span>
          ) : (
            <span className="text-[10px] font-bold text-green-400 border border-green-600 px-2 py-0.5 rounded">UNLOCKED</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;