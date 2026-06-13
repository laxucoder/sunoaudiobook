import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, CreditCard, Crown, Phone, Mail, HelpCircle, Loader,
  ChevronRight, LayoutDashboard, SettingsIcon, Home, Headphones, BookOpen,
  User, Play, Pause, X, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronDown, ListMusic, Music, Maximize2, Gauge, Lock
} from "lucide-react";

import { formatTime } from '../utils/formatTime';

const QueueList = ({ queue, currentIndex, setCurrentIndex, setShowQueueMobile, className, isPlaying, isEnded, checkCanPlay, onRequirePurchase, track }) => {
  const getBarStyle = () => {
    if (isEnded) {
      return { height: '20%', animation: 'none', backgroundColor: '#4b5563' };
    }
    return { animationPlayState: isPlaying ? 'running' : 'paused' };
  };

  return (
    <div className={`bg-[#121212] flex flex-col h-full border-l border-white/10 ${className}`}>
      <div className="p-6 border-b border-white/5">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <ListMusic className="text-[#E50914]" /> Current Queue
        </h3>
        <p className="text-gray-500 text-sm mt-1">{queue.length} Tracks</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {queue.map((ep, idx) => {
          const isActive = idx === currentIndex;
          const canPlay = checkCanPlay(ep);
          return (
            <div
              key={ep.id}
              onClick={() => {
                if (canPlay) {
                  setCurrentIndex(idx); setShowQueueMobile(false);
                } else {
                  if (onRequirePurchase) onRequirePurchase(track);
                }
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 select-none border ${isActive
                ? 'bg-[#181825] border-[#E50914]/30'
                : 'border-transparent hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-4 overflow-hidden w-full">
                <div className="w-6 flex justify-center shrink-0">
                  {isActive ? (
                    <div className="w-4 h-4 flex items-end justify-between gap-[2px] mb-1">
                      <div className={`music-bar music-bar-1`} style={getBarStyle()}></div>
                      <div className={`music-bar music-bar-2`} style={getBarStyle()}></div>
                      <div className={`music-bar music-bar-3`} style={getBarStyle()}></div>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-gray-500">{idx + 1}</span>
                  )}
                </div>
                <div className="flex flex-col truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold truncate text-sm ${isActive ? 'text-[#E50914]' : 'text-gray-300 group-hover:text-white'}`}>
                      {ep.title}
                    </span>
                    {!canPlay && <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded shrink-0">PREMIUM</span>}
                  </div>
                  <span className="text-xs text-gray-600">
                    {formatTime(ep.duration || 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AudioPlayer = ({ track, isPlaying, togglePlay, close, user, onRequirePurchase }) => {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueueMobile, setShowQueueMobile] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const queue = track?.episodes && track.episodes.length > 0 ? track.episodes : (track ? [track] : []);
  const activeEpisode = queue[currentIndex];
  const nextEpisode = currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;
  const streamUrl = activeEpisode?.streamUrl || (activeEpisode ? `${import.meta.env.VITE_BACKEND_URL}/api/audio/stream/${activeEpisode.id}` : '');

  const checkCanPlay = (ep) => {
    if (!ep) return false;
    const isAdmin = user?.role === "ADMIN";
    const isPremium = user?.isPremium;
    const isOwner = user?.purchasedAudioIds?.includes(ep.id) ||
      (track?.id && user?.purchasedAudioIds?.includes(track.id)) ||
      (ep.playlistId && user?.purchasedAudioIds?.includes(ep.playlistId));
    return isAdmin || isPremium || isOwner || ep.isFree;
  };

  useEffect(() => {
    if (track) {
      const firstPlayableIndex = queue.findIndex(ep => checkCanPlay(ep));
      setCurrentIndex(firstPlayableIndex !== -1 ? firstPlayableIndex : 0);
      setIsExpanded(true);
      setIsEnded(false);
      setPlaybackRate(1);
    }
  }, [track?.id]);

  useEffect(() => {
    if (activeEpisode && audioRef.current) {
      setIsEnded(false);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      togglePlay(true);
    }
  }, [activeEpisode]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) setIsEnded(false);
      isPlaying ? audioRef.current.play().catch(() => { }) : audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setIsEnded(false);
  };

  const handleVolume = (e) => {
    const newVol = Number(e.target.value);
    if (audioRef.current) audioRef.current.volume = newVol;
    setVolume(newVol);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const nextSpeedIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextSpeedIndex]);
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextEp = queue[currentIndex + 1];
      if (checkCanPlay(nextEp)) {
        setIsEnded(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsEnded(true);
        togglePlay(false);
        if (onRequirePurchase) onRequirePurchase(track);
      }
    } else {
      setIsEnded(true);
      togglePlay(false);
    }
  };

  const playPrev = () => {
    if (currentIndex > 0) {
      const prevEp = queue[currentIndex - 1];
      if (checkCanPlay(prevEp)) {
        setIsEnded(false);
        setCurrentIndex(prev => prev - 1);
      } else {
        if (onRequirePurchase) onRequirePurchase(track);
      }
    }
  };

  if (!track || !activeEpisode) return null;

  const displayImage = activeEpisode.thumbnail || activeEpisode.img || track.thumbnail || track.img || "https://placehold.co/400";
  const displayTitle = activeEpisode.title;
  const displayArtist = activeEpisode.artist || track.artist;

  return (
    <div
      className={`fixed z-[90] bg-[#0a0a14] border-t border-white/10 overflow-hidden left-0 right-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isExpanded
          ? 'bottom-0 h-dvh'
          : 'bottom-18 md:bottom-0 h-24'
        }`}
    >
      <audio
        ref={audioRef}
        src={streamUrl}
        crossOrigin="use-credentials"
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className={`flex w-full h-full transition-opacity duration-500 ${isExpanded ? 'opacity-100 visible delay-100' : 'opacity-0 invisible absolute top-0 left-0 pointer-events-none'}`}>

        <div className="flex-1 flex flex-col relative h-full">
          <div className="flex justify-between items-center p-6 md:p-8">
            <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><ChevronDown size={32} /></button>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold hidden md:block">Now Playing</span>
            <button onClick={() => setShowQueueMobile(!showQueueMobile)} className="lg:hidden text-gray-400 hover:text-[#E50914]"><ListMusic size={28} /></button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-8 pb-20 relative">
            <img src={displayImage} alt="Cover" className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover mb-8 md:mb-12 animate-fade-in" />

            <div className="text-center mb-8 max-w-2xl w-full">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">{displayTitle}</h2>
              <p className="text-lg text-gray-400">{displayArtist}</p>
            </div>


            <div className="w-full max-w-2xl flex items-center gap-4 text-xs font-medium text-gray-400 mb-8">
              <span>{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#E50914] hover:h-2 transition-all" />
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-10 md:gap-14 mb-8">
              <button onClick={playPrev} className={`text-gray-400 hover:text-white transition transform active:scale-95 ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}><SkipBack size={36} /></button>

              <button onClick={() => { setIsEnded(false); togglePlay(!isPlaying); }} className="bg-white text-black w-20 h-20 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg shadow-white/20">
                {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
              </button>

              <button onClick={playNext} className={`text-gray-400 hover:text-white transition transform active:scale-95 ${currentIndex === queue.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}><SkipForward size={36} /></button>
            </div>

            <div className="flex items-center gap-4 bg-[#181825] py-2 px-4 rounded-full border border-white/10 shadow-xl">
              <button
                onClick={toggleSpeed}
                className="text-xs font-bold text-gray-400 hover:text-white border border-gray-600 hover:border-white px-2 py-1 rounded-full transition-colors w-12 text-center"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              <div className="w-px h-6 bg-white/10"></div>

              <button onClick={() => { if (audioRef.current) { audioRef.current.volume = volume === 0 ? 1 : 0; setVolume(volume === 0 ? 1 : 0); } }} className="text-gray-400 hover:text-white">
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} className="w-24 h-1 bg-gray-600 rounded-lg accent-white cursor-pointer" />
            </div>
          </div>

          {nextEpisode && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#181825]/90 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 animate-slide-up shadow-xl max-w-[90%] md:max-w-md cursor-pointer hover:bg-[#202030]" onClick={playNext}>
              <div className="bg-[#E50914] p-1.5 rounded-full">
                {!checkCanPlay(nextEpisode) ? <Lock size={12} className="text-white" /> : <Music size={12} className="text-white" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Up Next</span>
                <span className="text-sm font-bold text-white truncate max-w-50">{nextEpisode.title}</span>
              </div>
              <SkipForward size={16} className="text-gray-500 ml-2" />
            </div>
          )}
        </div>

        <div className="hidden lg:block w-100 xl:w-112.5">
          <QueueList
            queue={queue}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            setShowQueueMobile={setShowQueueMobile}
            className="h-full"
            isPlaying={isPlaying}
            isEnded={isEnded}
            checkCanPlay={checkCanPlay}
            onRequirePurchase={onRequirePurchase}
            track={track}
          />
        </div>

        {showQueueMobile && (
          <div className="absolute inset-0 bg-black/95 z-50 lg:hidden animate-fade-in flex flex-col">
            <div className="flex justify-end p-6">
              <button onClick={() => setShowQueueMobile(false)} className="bg-white/10 p-2 rounded-full text-white"><X size={24} /></button>
            </div>
            <QueueList
              queue={queue}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              setShowQueueMobile={setShowQueueMobile}
              className="flex-1 border-none bg-transparent"
              isPlaying={isPlaying}
              isEnded={isEnded}
              checkCanPlay={checkCanPlay}
              onRequirePurchase={onRequirePurchase}
              track={track}
            />
          </div>
        )}
      </div>

      <div className={`flex items-center justify-between px-4 md:px-8 h-full w-full absolute top-0 left-0 transition-opacity duration-300 ${isExpanded ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible delay-200'}`}>
        <div className="flex items-center gap-4 w-[40%] cursor-pointer" onClick={() => setIsExpanded(true)}>
          <img src={displayImage} className="w-14 h-14 rounded-lg object-cover shadow-md" alt="mini" />
          <div className="overflow-hidden">
            <h4 className="text-white font-bold truncate text-sm md:text-base">{displayTitle}</h4>
            <p className="text-gray-400 text-xs truncate">{displayArtist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={(e) => { e.stopPropagation(); playPrev(); }} className="hidden md:block text-gray-400 hover:text-white"><SkipBack size={20} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIsEnded(false); togglePlay(!isPlaying); }} className="bg-white text-black p-2.5 rounded-full hover:scale-105 transition shadow-lg">
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="text-gray-400 hover:text-white"><SkipForward size={20} /></button>
          <button onClick={close} className="text-gray-500 hover:text-[#E50914] ml-2"><X size={20} /></button>
        </div>

        <div className="hidden md:flex items-center gap-2 w-[20%] justify-end">
          <Volume2 size={18} className="text-gray-400" />
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} className="w-20 h-1 bg-gray-700 rounded-lg accent-white cursor-pointer" />
          <button onClick={() => setIsExpanded(true)} className="ml-4 text-gray-400 hover:text-white"><Maximize2 size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;