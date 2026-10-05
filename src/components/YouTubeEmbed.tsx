import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { getYouTubeId } from '../lib/videoUtils';

interface YouTubeEmbedProps {
  urlOrId: string;
  title?: string;
  className?: string;
  autoPlayOnClick?: boolean;
}

export default function YouTubeEmbed({
  urlOrId,
  title = "Video Player",
  className = "",
  autoPlayOnClick = true,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeId(urlOrId);

  if (!videoId) return null;

  const posterUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isPlaying) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-slate-950 ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlayOnClick ? 1 : 0}&mute=0&controls=1&rel=0&playsinline=1`}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsPlaying(true)}
      className={`group relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-950 select-none ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsPlaying(true);
        }
      }}
    >
      <img
        src={posterUrl}
        alt={title}
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] text-[#022c22] shadow-2xl transition-transform duration-200 group-hover:scale-110">
          <Play className="h-6 w-6 fill-current ml-0.5" />
        </div>
      </div>
    </div>
  );
}
