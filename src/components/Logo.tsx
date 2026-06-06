import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', variant = 'full', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto',
    xl: 'h-36 w-auto',
  };

  // 1. Icon variant: renders the high-quality logo in a square aspect ratio thumbnail
  if (variant === 'icon') {
    return (
      <img
        src="/logo-preview.png"
        alt="TSR Logo"
        className={`${sizeClasses[size]} rounded-lg object-contain ${className}`}
        id="tsr-logo-icon"
        referrerPolicy="no-referrer"
      />
    );
  }

  // 2. Horizontal layout: renders the logo next to standard high-contrast text branding
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center space-x-3 cursor-pointer select-none ${className}`} id="tsr-logo-horizontal">
        <img
          src="/logo-preview.png"
          alt="TSR Logo"
          className="h-9 w-9 shrink-0 rounded-md object-contain"
          referrerPolicy="no-referrer"
        />
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

  // 3. Full layout: Ultimate exact match rendering of the stunning 3D brand logo!
  return (
    <div className={`flex flex-col items-center justify-center text-center p-3 font-sans ${className}`} id="tsr-logo-full">
      <img
        src="/logo-preview.png"
        alt="The Sports Room Logo"
        className={`${sizeClasses[size]} rounded-2xl shadow-2xl object-contain border border-slate-800/40 bg-slate-950/20 p-1.5 transition-transform duration-300 hover:scale-[1.02]`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
