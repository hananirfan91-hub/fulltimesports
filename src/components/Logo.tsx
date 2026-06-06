import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', variant = 'full', size = 'md' }: LogoProps) {
  // Color codes matching the logo uploaded
  const neonGreen = '#22c55e'; // light-green accent
  const deepGreen = '#064e3b'; // forest green
  const darkShieldBg = '#022c22'; // deep slate green

  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto',
    xl: 'h-36 w-auto',
  };

  // 1. Icon component: sleek soccer/cricket shield with "TSR"
  if (variant === 'icon') {
    return (
      <svg
        className={`${sizeClasses[size]} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="tsr-logo-icon"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={deepGreen} />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor={neonGreen} />
          </linearGradient>
        </defs>
        {/* Shield Border */}
        <path
          d="M10 20 L50 10 L90 20 C90 60 50 90 50 90 C50 90 10 60 10 20 Z"
          fill="url(#shieldGrad)"
          stroke="url(#neonGrad)"
          strokeWidth="4"
        />
        {/* Soccer network details hidden subtle design */}
        <path d="M50 10 L50 90 M10 20 L90 20 M12 40 L88 40 M20 60 L80 60 M30 75 L70 75" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="1" />
        
        {/* Monogram TSR */}
        <text
          x="50"
          y="58"
          fill="#ffffff"
          fontSize="26"
          fontWeight="950"
          fontStyle="italic"
          textAnchor="middle"
          fontFamily="system-ui"
          letterSpacing="-1.5"
        >
          TS
          <tspan fill={neonGreen}>R</tspan>
        </text>
      </svg>
    );
  }

  // 2. Horizontal component: Perfect for narrow Navbar strip or Footer strip
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center space-x-3 cursor-pointer select-none ${className}`} id="tsr-logo-horizontal">
        <svg
          className="h-10 w-10 shrink-0"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGradH" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14532d" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="neonGradH" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M10 20 L50 10 L90 20 C90 60 50 90 50 90 C50 90 10 60 10 20 Z"
            fill="url(#shieldGradH)"
            stroke="url(#neonGradH)"
            strokeWidth="4"
          />
          <text
            x="50"
            y="58"
            fill="#ffffff"
            fontSize="28"
            fontWeight="950"
            fontStyle="italic"
            textAnchor="middle"
            fontFamily="system-ui"
            letterSpacing="-1"
          >
            TS<tspan fill="#22c55e">R</tspan>
          </text>
        </svg>
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-black tracking-tighter uppercase font-display text-white leading-none text-lg">
            <span>THE SPORTS</span>
            <span className="text-[#22c55e] ml-1">ROOM</span>
          </div>
          <span className="text-[7.5px] font-mono tracking-[0.25em] text-[#22c55e] font-bold uppercase mt-0.5 whitespace-nowrap">
            SCIENTIFIC COVERAGE. METRIC DRIVEN.
          </span>
        </div>
      </div>
    );
  }

  // 3. Full layout: Ultimate exact match for the logo branded with The Sports Room!
  return (
    <div className={`flex flex-col items-center justify-center text-center p-3 font-sans ${className}`} id="tsr-logo-full">
      <svg
        className={`${sizeClasses[size]} drop-shadow-xl`}
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="shieldMainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#052e16" />
            <stop offset="60%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="tsrTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          {/* Soft shadow */}
          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Circular Flow / Curved Swoosh */}
        <path
          d="M 60 180 A 190 190 0 0 1 440 180"
          fill="none"
          stroke="url(#goldHighlight)"
          strokeWidth="6"
          strokeDasharray="16 8"
          opacity="0.7"
        />

        {/* Main Team Shield Panel */}
        <path
          d="M 120 100 L 250 50 L 380 100 C 380 230 250 330 250 330 C 250 330 120 230 120 100 Z"
          fill="url(#shieldMainGrad)"
          stroke="#1b4332"
          strokeWidth="8"
          filter="url(#shadowFilter)"
        />

        {/* Thin Neon Inner Border */}
        <path
          d="M 132 110 L 250 63 L 368 110 C 368 220 250 314 250 314 C 250 314 132 220 132 110 Z"
          fill="none"
          stroke="url(#goldHighlight)"
          strokeWidth="3"
        />

        {/* --- Top Sports Balls Assembly --- */}
        <g id="sports-balls">
          {/* 1. Cricket Ball (Left) */}
          <circle cx="180" cy="80" r="24" fill="#ffffff" stroke="#166534" strokeWidth="2" />
          {/* Cricket seams */}
          <path d="M 180 56 A 24 24 0 0 1 180 104" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M 177 57 A 24 24 0 0 1 177 103" fill="none" stroke="#b91c1c" strokeWidth="1" />
          <path d="M 183 57 A 24 24 0 0 1 183 103" fill="none" stroke="#b91c1c" strokeWidth="1" />

          {/* 2. Soccer Ball (Center Primary) */}
          <circle cx="250" cy="70" r="34" fill="#ffffff" stroke="#14532d" strokeWidth="2.5" />
          {/* Soccer Pentagons details */}
          <polygon points="250,56 261,64 257,76 243,76 239,64" fill="#14532d" />
          {/* Connected lines */}
          <line x1="250" y1="56" x2="250" y2="36" stroke="#14532d" strokeWidth="2" />
          <line x1="261" y1="64" x2="280" y2="58" stroke="#14532d" strokeWidth="2" />
          <line x1="257" y1="76" x2="271" y2="92" stroke="#14532d" strokeWidth="2" />
          <line x1="243" y1="76" x2="229" y2="92" stroke="#14532d" strokeWidth="2" />
          <line x1="239" y1="64" x2="220" y2="58" stroke="#14532d" strokeWidth="2" />
          {/* Outer edge pentagons segments */}
          <polygon points="250,36 265,40 258,45" fill="none" stroke="#14532d" strokeWidth="1.5" />
          <polygon points="280,58 290,70 282,74" fill="#14532d" />
          <polygon points="271,92 258,102 248,96" fill="#14532d" />
          <polygon points="229,92 242,102 252,96" fill="none" stroke="#14532d" strokeWidth="1.5" />
          <polygon points="220,58 210,70 218,74" fill="#14532d" />

          {/* 3. Basketball (Right) */}
          <circle cx="320" cy="80" r="26" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
          {/* Basketball seams */}
          <path d="M 294 80 Q 320 62 346 80" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M 294 80 Q 320 98 346 80" fill="none" stroke="#000000" strokeWidth="1.5" />
          <line x1="320" y1="54" x2="320" y2="106" stroke="#000000" strokeWidth="1.5" />
          <line x1="294" y1="80" x2="346" y2="80" stroke="#000000" strokeWidth="1.5" />

          {/* 4. Small tennis ball highlight */}
          <circle cx="360" cy="100" r="8" fill="#a3e635" stroke="#15803d" strokeWidth="1" />
          <path d="M 353 100 Q 360 95 367 100" fill="none" stroke="#ffffff" strokeWidth="1" />
        </g>

        {/* --- Dynamic TSR Monogram --- */}
        <g id="tsr-italic-monogram">
          <text
            x="248"
            y="170"
            fill="url(#tsrTextGrad)"
            fontSize="85"
            fontWeight="950"
            fontStyle="italic"
            textAnchor="middle"
            fontFamily="Arial Black, Impact, system-ui"
            stroke="#022c22"
            strokeWidth="4"
            letterSpacing="-4"
          >
            TS<tspan fill="#22c55e">R</tspan>
          </text>
        </g>

        {/* --- SPORTS ROOM banner with border --- */}
        <g id="sports-room-banner">
          {/* Green banner ribbon backing */}
          <polygon
            points="60,225 440,225 420,285 80,285"
            fill="#022c22"
            stroke="url(#goldHighlight)"
            strokeWidth="3.5"
          />
          {/* Inner banner strip */}
          <polygon
            points="70,233 430,233 413,277 87,277"
            fill="#052e16"
          />

          {/* Bold text: THE SPORTS ROOM */}
          <text
            x="250"
            y="266"
            fill="#ffffff"
            fontSize="28"
            fontWeight="950"
            fontFamily="Arial Black, Impact, sans-serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            THE SPORTS ROOM
          </text>
        </g>

        {/* --- DEEP ANALYTICS tagline layout --- */}
        <g id="sports-banner">
          {/* Line separator lines on left & right of "ANALYTICS" */}
          <line x1="110" y1="316" x2="175" y2="316" stroke="url(#goldHighlight)" strokeWidth="3" />
          <line x1="325" y1="316" x2="390" y2="316" stroke="url(#goldHighlight)" strokeWidth="3" />

          <text
            x="250"
            y="322"
            fill="#22c55e"
            fontSize="20"
            fontWeight="bold"
            fontFamily="Space Grotesk, system-ui, sans-serif"
            textAnchor="middle"
            letterSpacing="6"
          >
            ANALYTICS
          </text>
        </g>

        {/* --- Brand Tagline tag --- */}
        <text
          x="250"
          y="350"
          fill="#4ade80"
          fontSize="10"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          letterSpacing="1.5"
          opacity="0.9"
        >
          SCIENTIFIC COVERAGE. METRIC DRIVEN.
        </text>

        {/* --- Small custom icons on bottom rim (Cricket Bat & F1 outline symbols) --- */}
        <g id="sport-icons-bottom-rim" opacity="0.8">
          {/* Cricket batter silhouette */}
          <path d="M 150 375 L 158 365 L 160 367 L 152 377 Z" fill="#22c55e" />
          <circle cx="160" cy="363" r="1.5" fill="#22c55e" />
          {/* Soccer Ball icon */}
          <circle cx="190" cy="370" r="4" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="190" cy="370" r="1.5" fill="#22c55e" />
          {/* Basketball icon */}
          <circle cx="220" cy="370" r="4" fill="none" stroke="#22c55e" strokeWidth="1" />
          <line x1="216" y1="370" x2="224" y2="370" stroke="#22c55e" strokeWidth="0.8" />
          {/* F1 Car silhouette icon */}
          <path d="M 270 372 L 285 372 L 283 369 L 273 369 Z" fill="#22c55e" />
          {/* Controller icon */}
          <rect x="305" y="367" width="10" height="6" rx="2" fill="none" stroke="#22c55e" strokeWidth="0.8" />
          {/* Baseball/Tennis icon */}
          <circle cx="340" cy="370" r="4" fill="#ffffff" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
}
