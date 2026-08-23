import React, { useState, useEffect } from 'react';
import { DB } from '../lib/db';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'giant';
  showTagline?: boolean;
}

export default function Logo({ 
  className = '', 
  variant = 'full', 
  size,
  showTagline = true 
}: LogoProps) {
  const [adminConfig, setAdminConfig] = useState(() => DB.getHeroConfig());

  useEffect(() => {
    const handleSync = () => {
      setAdminConfig(DB.getHeroConfig());
    };
    window.addEventListener('fts_db_sync', handleSync);
    return () => window.removeEventListener('fts_db_sync', handleSync);
  }, []);

  // Determine active size: prop override takes precedence, fallback to admin config, default to 'large'
  const effectiveSize = size || adminConfig.logo_size || 'large';
  const logoUrl = adminConfig.custom_logo_url || '/logo-preview.png';

  const iconSizeClasses: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-12 w-12 sm:h-14 sm:w-14',
    xl: 'h-14 w-14 sm:h-16 sm:w-16',
    '2xl': 'h-18 w-18 sm:h-20 sm:w-20',
    giant: 'h-22 w-22 sm:h-24 sm:w-24',
  };

  const fullSizeClasses: Record<string, string> = {
    sm: 'h-12 w-auto',
    md: 'h-20 w-auto',
    lg: 'h-28 w-auto',
    xl: 'h-40 w-auto',
    '2xl': 'h-52 w-auto',
    giant: 'h-64 w-auto',
  };

  const textSizeClasses: Record<string, { title: string; subtitle: string }> = {
    sm: { title: 'text-base sm:text-lg', subtitle: 'text-[7px] sm:text-[8px]' },
    md: { title: 'text-lg sm:text-xl md:text-2xl', subtitle: 'text-[8px] sm:text-[9px]' },
    lg: { title: 'text-xl sm:text-2xl md:text-3xl', subtitle: 'text-[8.5px] sm:text-[10px]' },
    xl: { title: 'text-2xl sm:text-3xl md:text-4xl', subtitle: 'text-[9.5px] sm:text-[11px]' },
    '2xl': { title: 'text-3xl sm:text-4xl md:text-5xl', subtitle: 'text-[11px] sm:text-[13px]' },
    giant: { title: 'text-4xl sm:text-5xl md:text-6xl', subtitle: 'text-[13px] sm:text-[15px]' },
  };

  // 1. Icon variant: renders the high-quality logo in a square aspect ratio thumbnail
  if (variant === 'icon') {
    return (
      <img
        src={logoUrl}
        alt="The Sports Room - TSR Official Sports Lounge Logo"
        className={`${iconSizeClasses[effectiveSize] || iconSizeClasses.lg} rounded-xl object-contain drop-shadow ${className}`}
        id="tsr-logo-icon"
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
      />
    );
  }

  // 2. Horizontal layout: renders prominent logo badge alongside crisp, bold brand typography
  if (variant === 'horizontal') {
    const textStyle = textSizeClasses[effectiveSize] || textSizeClasses.lg;
    const iconStyle = iconSizeClasses[effectiveSize] || iconSizeClasses.lg;

    return (
      <div className={`flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer select-none group ${className}`} id="tsr-logo-horizontal">
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Logo"
          className={`${iconStyle} shrink-0 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(34,197,94,0.25)]`}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
        <div className="flex flex-col text-left">
          <div className={`flex items-baseline font-black tracking-tight uppercase font-display text-white leading-none ${textStyle.title}`}>
            <span className="text-white drop-shadow-sm">THE SPORTS</span>
            <span className="text-[#22c55e] ml-1.5 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">ROOM</span>
          </div>
          {showTagline && (
            <span className={`${textStyle.subtitle} font-mono tracking-[0.22em] text-[#22c55e] font-black uppercase mt-1 whitespace-nowrap opacity-90`}>
              SCIENTIFIC COVERAGE • METRIC DRIVEN
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Full layout: Center-aligned display brand logo
  return (
    <div className={`flex flex-col items-center justify-center text-center p-3 font-sans ${className}`} id="tsr-logo-full">
      <img
        src={logoUrl}
        alt="The Sports Room - TSR Official Sports Lounge Brand Logo"
        className={`${fullSizeClasses[effectiveSize] || fullSizeClasses.lg} rounded-2xl shadow-2xl object-contain border border-slate-800/60 bg-slate-950/40 p-2 transition-transform duration-300 hover:scale-[1.03]`}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
