import React from "react";

export interface StreamLogoOverlayConfig {
  enabled?: boolean;
  logoUrl?: string;
  linkUrl?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "small" | "medium" | "large" | "giant";
}

interface StreamEmbedProps {
  embedUrl: string;
  title?: string;
  overlayConfig?: StreamLogoOverlayConfig;
}

export default function StreamEmbed({ embedUrl, title = "Live Stream", overlayConfig }: StreamEmbedProps) {
  const isOverlayActive = overlayConfig?.enabled !== false;
  const logoImage = overlayConfig?.logoUrl || "/logo.png";
  const targetLink = overlayConfig?.linkUrl || "https://thesportsroom.online";
  const position = overlayConfig?.position || "top-right";
  const size = overlayConfig?.size || "medium";

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-12 right-4",
    "bottom-left": "bottom-12 left-4"
  }[position] || "top-4 right-4";

  // Size classes
  const sizeClasses = {
    small: "h-8 sm:h-10",
    medium: "h-11 sm:h-14",
    large: "h-14 sm:h-18",
    giant: "h-18 sm:h-24"
  }[size] || "h-11 sm:h-14";

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
      {/* Original Live Stream Video / Iframe */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 absolute inset-0 z-10"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      {/* Watermark Logo Overlay with Clickable Link Overwriting Original Stream */}
      {isOverlayActive && logoImage && (
        <div className={`absolute z-30 ${positionClasses} pointer-events-auto`}>
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            title="The Sports Room Official Stream"
            className="block p-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 hover:border-[#22c55e] transition-all duration-300 hover:scale-105 hover:bg-black/80 shadow-2xl group/logo"
          >
            <img
              src={logoImage}
              alt="The Sports Room Watermark"
              className={`${sizeClasses} w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]`}
            />
          </a>
        </div>
      )}
    </div>
  );
}
