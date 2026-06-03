import React from 'react';

interface AdProps {
  slot?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function AdSensePlaceholder({ slot = 'xxxxxxxxx', format = 'horizontal', className = '' }: AdProps) {
  const formatStyles = {
    horizontal: 'w-full h-24 md:h-28 bg-slate-100 border border-slate-200 rounded text-slate-400 font-mono text-xs flex flex-col justify-center items-center overflow-hidden relative',
    vertical: 'w-[160px] h-[600px] bg-slate-100 border border-slate-200 rounded text-slate-400 font-mono text-xs flex flex-col justify-center items-center overflow-hidden relative',
    rectangle: 'w-full min-h-[250px] bg-slate-100 border border-slate-200 rounded text-slate-400 font-mono text-xs flex flex-col justify-center items-center overflow-hidden relative',
  };

  return (
    <div className={`my-6 select-none ${className}`} id={`adsense-${slot}`}>
      <div className={formatStyles[format]}>
        {/* Subtle grid pattern background to resemble real ads skeleton */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <span className="bg-slate-200 text-slate-500 font-sans font-semibold tracking-wider uppercase text-[9px] px-2 py-0.5 rounded shadow-sm z-10 mb-2">
          Sponsored Advertisement
        </span>
        <div className="text-center z-10">
          <p className="font-semibold text-slate-600">Google AdSense Space</p>
          <p className="text-[10px] text-slate-400 mt-1">Slot ID: {slot} • Format: {format}</p>
        </div>
        
        {/* Simulating code hooks */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-fts-news"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
