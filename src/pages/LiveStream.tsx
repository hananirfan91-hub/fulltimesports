import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";
import StreamEmbed, { StreamLogoOverlayConfig } from "../components/streamEmbed.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yvjubtmdttrmgxkykndr.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anVidG1kdHRybWd4a3lrbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTE5OTMsImV4cCI6MjEwMjEyNzk5M30.9M_3K5l8p4e2LfNHyFNRFR2jS4nzmYlPp24O49mGjfw";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LiveStream() {
  const [searchParams] = useSearchParams();
  const streamId = searchParams.get("id");
  const [streams, setStreams] = useState<any[]>([]);
  const [activeStream, setActiveStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreams() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("fts_live_streams")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setStreams(data);
          if (streamId) {
            const found = data.find((s) => String(s.id) === String(streamId));
            setActiveStream(found || data[0]);
          } else {
            setActiveStream(data[0]);
          }
        }
      } catch (err) {
        console.error("Error loading live streams:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStreams();
  }, [streamId]);

  const siteOrigin = "https://thesportsroom.online";
  const canonicalUrl = streamId
    ? `${siteOrigin}/live-stream?id=${streamId}`
    : `${siteOrigin}/live-stream`;

  // Calculate overlay configuration from active stream database fields
  const overlayConfig: StreamLogoOverlayConfig = {
    enabled: activeStream?.logo_type !== "none",
    logoUrl: activeStream?.custom_logo_url?.trim() || "/logo.png",
    linkUrl: activeStream?.logo_link?.trim() || "https://thesportsroom.online",
    position: (activeStream?.logo_position as any) || "top-right",
    size: (activeStream?.logo_size as any) || "medium"
  };

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 flex flex-col">
      <SEOMetaTags
        title={activeStream?.title ? `${activeStream.title} - Live Stream | The Sports Room` : "Live Sports Streaming | The Sports Room"}
        description={activeStream?.description || "Watch verified live sports streams, telemetry, and live match updates on The Sports Room."}
        canonicalUrl={canonicalUrl}
        ogImage="/logo.png"
      />

      {/* Top Navbar with TSR Logo */}
      <header className="border-b border-slate-800 bg-[#022c22]/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Sports Room Logo" className="h-10 w-auto object-contain rounded-lg shadow-md" />
            <span className="text-xl font-extrabold tracking-tight text-white hidden sm:inline">
              THE SPORTS <span className="text-[#22c55e]">ROOM</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-slate-300 hover:text-[#22c55e] transition-colors">Home</Link>
            <Link to="/players" className="text-slate-300 hover:text-[#22c55e] transition-colors">Players</Link>
            <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-[#022c22] border border-[#22c55e]/40 text-[#22c55e] text-xs font-semibold hover:bg-[#22c55e] hover:text-slate-950 transition-all">
              Admin Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main Stream Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600/90 text-white animate-pulse">
                LIVE BROADCAST
              </span>
              <span className="text-xs text-slate-400">
                {activeStream?.tournament || "The Sports Room Stream Arena"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {activeStream?.title || "Live Stream Broadcast"}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-[#22c55e] font-semibold text-lg">
            Connecting to live sports satellite telemetry...
          </div>
        ) : activeStream ? (
          <div className="space-y-6">
            {/* Live Stream with Watermark Logo & Clickable Link */}
            <StreamEmbed
              embedUrl={activeStream.embed_url || "https://www.youtube.com/embed/live_stream"}
              title={activeStream.title}
              overlayConfig={overlayConfig}
            />

            {/* Stream Metadata & Info */}
            <div className="bg-[#022c22]/40 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {activeStream.match_name || activeStream.title}
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {activeStream.description}
                </p>
                {activeStream.team_one && activeStream.team_two && (
                  <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-[#22c55e]">
                    <span>{activeStream.team_one}</span>
                    <span className="text-slate-500">VS</span>
                    <span>{activeStream.team_two}</span>
                  </div>
                )}
              </div>

              {/* Official Channel Link */}
              <a
                href={overlayConfig.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-[#22c55e] transition-all group shrink-0"
              >
                <img
                  src={overlayConfig.logoUrl || "/logo.png"}
                  alt="Official Broadcaster"
                  className="h-9 w-auto object-contain rounded"
                />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#22c55e] transition-colors">
                    Official Broadcaster
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Visit Official Stream Channel →
                  </div>
                </div>
              </a>
            </div>

            {/* Other Available Streams */}
            {streams.length > 1 && (
              <section className="mt-10">
                <h3 className="text-lg font-bold text-white mb-4">Other Match Broadcasts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {streams.map((stream) => (
                    <Link
                      key={stream.id}
                      to={`/live-stream?id=${stream.id}`}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        String(stream.id) === String(activeStream.id)
                          ? "bg-[#022c22] border-[#22c55e]"
                          : "bg-[#022c22]/20 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <h4 className="text-sm font-bold text-white line-clamp-1">{stream.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{stream.description}</p>
                      <span className="mt-3 text-[11px] font-semibold text-[#22c55e]">
                        {String(stream.id) === String(activeStream.id) ? "● Now Watching" : "Watch Stream →"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            No live streams currently scheduled. Check back shortly.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#022c22]/30 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="The Sports Room Logo" className="h-8 w-auto object-contain rounded-lg" />
            <p>© {new Date().getFullYear()} The Sports Room. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
