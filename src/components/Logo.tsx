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

  // 1. Icon variant: renders the high-quality logo in a square aspect ratio thumbnail
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-md ${className}`} id="tsr-logo-icon">
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Logo"
          className={`${iconSizeClasses[effectiveSize] || iconSizeClasses.lg} object-contain rounded-lg`}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 2. Horizontal layout: renders sleek, compact white background logo card seamlessly
  if (variant === 'horizontal') {
    const isSm = size === 'sm';
    const isLg = size === 'lg';

    const maxHeightPx = isSm ? 28 : isLg ? 42 : 34;
    const maxWidthPx = isSm ? 120 : isLg ? 190 : 150;

    return (
      <div 
        className={`inline-flex items-center justify-center rounded-lg bg-white px-2 py-0.5 shadow-sm border border-slate-200/50 transition-transform duration-200 hover:scale-[1.02] cursor-pointer select-none shrink-0 overflow-hidden ${className}`} 
        style={{ maxWidth: maxWidthPx + 16, maxHeight: maxHeightPx + 10 }}
        id="tsr-logo-horizontal"
      >
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Logo"
          className="w-auto h-auto object-contain rounded shrink-0 block"
          style={{
            maxHeight: `${maxHeightPx}px`,
            maxWidth: `${maxWidthPx}px`,
            height: `${maxHeightPx}px`,
            width: 'auto',
          }}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 3. Full layout: Center-aligned display brand logo with white card
  const fullMaxHeight = effectiveSize === 'sm' ? 48 : effectiveSize === 'md' ? 80 : effectiveSize === 'lg' ? 112 : 160;
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} id="tsr-logo-full">
      <div className="rounded-2xl bg-white p-3 shadow-xl border border-slate-200/20 transition-transform duration-300 hover:scale-[1.02]">
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Brand Logo"
          className={`${fullSizeClasses[effectiveSize] || fullSizeClasses.lg} object-contain rounded-xl`}
          style={{ maxHeight: `${fullMaxHeight}px`, width: 'auto' }}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
