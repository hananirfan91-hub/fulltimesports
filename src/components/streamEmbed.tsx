import React from "react";

interface StreamEmbedProps {
  embedUrl: string;
  title?: string;
}

export default function StreamEmbed({ embedUrl, title = "Live Stream" }: StreamEmbedProps) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
