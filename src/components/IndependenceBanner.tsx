import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface IndependenceBannerProps {
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

export default function IndependenceBanner({ onNavigate, onClose }: IndependenceBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Live JS countdown logic targeting 14 August 2026 00:00:00 PKT (UTC+5)
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 12,
    minutes: 35,
    seconds: 20,
    isExpired: false,
  });

  useEffect(() => {
    // Target date: August 14, 2026 00:00:00 PKT (which is August 13, 2026 19:00:00 UTC)
    const targetDate = new Date('2026-08-14T00:00:00+05:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  // Format helper to always show 2 digits
  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className="w-full bg-[#001c13] border-b border-[#22c55e]/30 relative overflow-hidden select-none" 
      id="tsr-independence-banner-bar"
    >
      {/* Container forced/optimized to standard 728x90 advertisement ratio */}
      <div 
        onClick={() => onNavigate && onNavigate('/topic/pakistan-cricket')}
        className="max-w-[728px] mx-auto h-[90px] relative bg-gradient-to-r from-[#00281b] via-[#023e2b] to-[#00281b] rounded-xl border border-[#22c55e]/40 shadow-[0_0_25px_rgba(34,197,94,0.15)] flex items-center justify-between px-3 md:px-4 cursor-pointer group transition-all duration-300 hover:border-[#22c55e] overflow-hidden"
      >
        {/* Decorative Vector Elements: Fireworks, Glowing Crescent & Minar-e-Pakistan Silhouette */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          {/* Subtle Radial Glows */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 bg-[#22c55e]/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-36 h-36 bg-emerald-400/15 rounded-full blur-xl"></div>

          {/* Minar-e-Pakistan Silhouette vector (center-right backdrop) */}
          <svg className="absolute bottom-0 left-[28%] h-20 w-24 text-emerald-300/20 fill-current" viewBox="0 0 100 120">
            <path d="M50 5 L53 25 L55 50 L58 85 L65 105 L72 115 L28 115 L35 105 L42 85 L45 50 L47 25 Z M48 2 L52 2 L51 15 L49 15 Z M30 115 L70 115 L75 120 L25 120 Z" />
            <circle cx="50" cy="8" r="3" className="fill-emerald-400/40" />
          </svg>

          {/* Fireworks Sparks Art */}
          <svg className="absolute -top-1 left-[45%] w-24 h-24 text-[#22c55e]/40 animate-pulse" viewBox="0 0 100 100">
            <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="50" x2="70" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="50" x2="70" y2="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="50" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="50" cy="20" r="1.5" className="fill-emerald-300" />
            <circle cx="70" cy="30" r="1.5" className="fill-amber-300" />
            <circle cx="80" cy="50" r="1.5" className="fill-emerald-300" />
            <circle cx="30" cy="30" r="1.5" className="fill-white" />
          </svg>

          {/* Fireworks Burst Right Side */}
          <svg className="absolute bottom-1 right-[26%] w-20 h-20 text-amber-300/30" viewBox="0 0 100 100">
            <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="50" y1="50" x2="80" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="50" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="50" y1="50" x2="20" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="50" cy="15" r="2" className="fill-amber-200" />
            <circle cx="80" cy="25" r="1.5" className="fill-emerald-400" />
          </svg>

          {/* Subtle Starbursts & Shimmer */}
          <div className="absolute top-2 left-10 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-3 right-1/3 w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse"></div>
        </div>
        {/* LEFT SECTION: The Sports Room Branding */}
        <div className="flex items-center space-x-2.5 z-10 shrink-0">
          {/* Animated Waving Pakistan Flag Ribbon Emblem with Crescent & Star */}
          <div className="relative w-10 h-10 rounded-lg bg-[#002e1f]/90 border border-[#22c55e]/60 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.4)] overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {/* White stripe on left */}
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-white"></div>
            {/* Dark green area on right with Crescent and Star */}
            <div className="absolute left-2.5 right-0 top-0 bottom-0 bg-[#00402b] flex items-center justify-center">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                {/* Crescent */}
                <path d="M11.5 3C7.36 3 4 6.36 4 10.5S7.36 18 11.5 18c2.12 0 4.04-.88 5.41-2.3-3.13-.18-5.91-2.56-5.91-6.2 0-3.64 2.78-6.02 5.91-6.2C15.54 3.88 13.62 3 11.5 3z" />
                {/* Star */}
                <path d="M17.5 7.5l1.18 2.39 2.64.38-1.91 1.86.45 2.63-2.36-1.24-2.36 1.24.45-2.63-1.91-1.86 2.64-.38z" />
              </svg>
            </div>
            {/* Subtle glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
          </div>

          <div className="text-left">
            <div className="flex items-center space-x-1">
              <span className="font-display font-black text-xs md:text-[13px] tracking-wider text-white uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                THE SPORTS ROOM
              </span>
            </div>
            <p className="font-mono text-[9px] md:text-[10px] text-[#22c55e] font-bold tracking-widest uppercase mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              All Sports. One Room.
            </p>
          </div>
        </div>

        {/* CENTER SECTION: Patriotic Headline */}
        <div className="text-center z-10 px-1 hidden sm:block">
          <div className="inline-flex items-center space-x-1 bg-[#001910]/80 backdrop-blur-md border border-[#22c55e]/50 px-2.5 py-0.5 rounded-full mb-0.5 shadow-md">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />
            <span className="font-display font-black text-[11px] md:text-[12px] tracking-tight uppercase text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              CELEBRATING PAKISTAN INDEPENDENCE DAY
            </span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />
          </div>
          <p className="font-mono text-[9px] md:text-[10px] font-semibold text-emerald-200 tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            One Nation. One Spirit. One Passion.
          </p>
        </div>

        {/* RIGHT SECTION: Digital Countdown Panel */}
        <div className="flex items-center space-x-2 z-10 shrink-0">
          <div className="text-right">
            <div className="font-mono text-[8px] md:text-[9px] font-bold text-amber-300 uppercase tracking-wider mb-0.5 flex items-center justify-end space-x-1 drop-shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping"></span>
              <span>INDEPENDENCE DAY COUNTDOWN</span>
            </div>

            {/* Glowing Digital Countdown Boxes */}
            <div className="flex items-center space-x-1">
              {/* DAYS */}
              <div className="bg-[#001810]/90 backdrop-blur-sm border border-[#22c55e]/70 rounded px-1.5 py-0.5 text-center min-w-[34px] shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <span className="font-mono font-black text-xs md:text-sm text-white block leading-none">
                  {pad(timeLeft.days)}
                </span>
                <span className="font-mono text-[7px] text-emerald-400 uppercase font-bold block leading-none mt-0.5">
                  DAYS
                </span>
              </div>

              <span className="font-mono font-bold text-xs text-[#22c55e] animate-pulse">:</span>

              {/* HOURS */}
              <div className="bg-[#001810]/90 backdrop-blur-sm border border-[#22c55e]/70 rounded px-1.5 py-0.5 text-center min-w-[34px] shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <span className="font-mono font-black text-xs md:text-sm text-white block leading-none">
                  {pad(timeLeft.hours)}
                </span>
                <span className="font-mono text-[7px] text-emerald-400 uppercase font-bold block leading-none mt-0.5">
                  HOURS
                </span>
              </div>

              <span className="font-mono font-bold text-xs text-[#22c55e] animate-pulse">:</span>

              {/* MINUTES */}
              <div className="bg-[#001810]/90 backdrop-blur-sm border border-[#22c55e]/70 rounded px-1.5 py-0.5 text-center min-w-[34px] shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <span className="font-mono font-black text-xs md:text-sm text-white block leading-none">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="font-mono text-[7px] text-emerald-400 uppercase font-bold block leading-none mt-0.5">
                  MINUTES
                </span>
              </div>

              <span className="font-mono font-bold text-xs text-[#22c55e] animate-pulse">:</span>

              {/* SECONDS */}
              <div className="bg-[#001810]/90 backdrop-blur-sm border border-[#22c55e]/70 rounded px-1.5 py-0.5 text-center min-w-[34px] shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <span className="font-mono font-black text-xs md:text-sm text-[#22c55e] block leading-none animate-pulse">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="font-mono text-[7px] text-emerald-400 uppercase font-bold block leading-none mt-0.5">
                  SECONDS
                </span>
              </div>
            </div>

            {/* Small Line near countdown */}
            <p className="font-sans text-[8px] md:text-[9px] text-slate-200 italic mt-0.5 tracking-tight text-right drop-shadow">
              Celebrating the spirit of Pakistan
            </p>
          </div>

          {/* Dismiss button */}
          <button 
            onClick={handleDismiss} 
            title="Dismiss banner"
            className="p-1 text-emerald-300/80 hover:text-white hover:bg-emerald-900/80 rounded-full transition duration-150 ml-1 backdrop-blur-sm bg-black/30"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
