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

  // 2. Horizontal layout: renders prominent white background logo card seamlessly
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center rounded-xl bg-white px-2.5 py-1 shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer select-none group ${className}`} id="tsr-logo-horizontal">
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Logo"
          className="h-9 sm:h-11 md:h-12 w-auto max-w-[220px] sm:max-w-[280px] object-contain rounded-lg"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 3. Full layout: Center-aligned display brand logo with white card
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} id="tsr-logo-full">
      <div className="rounded-2xl bg-white p-3 shadow-xl border border-slate-200/20 transition-transform duration-300 hover:scale-[1.02]">
        <img
          src={logoUrl}
          alt="The Sports Room - TSR Official Sports Lounge Brand Logo"
          className={`${fullSizeClasses[effectiveSize] || fullSizeClasses.lg} object-contain rounded-xl`}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
