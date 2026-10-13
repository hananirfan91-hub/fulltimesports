import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
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
        const { data } = await supabase
          .from("fts_live_streams")
          .select("*")
          .order("created_at", { ascending: false });

        if (data) {
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

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <SEOMetaTags
        title="Live Sports Stream & Real-Time Commentary | The Sports Room"
        description="Watch verified live sports streams, telemetry, and live match updates on The Sports Room."
        canonicalUrl={canonicalUrl}
      />
      <header className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-1 block">
            ← Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Live Stream & Commentary Hub</h1>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center text-[#22c55e]">Loading stream data...</div>
      ) : activeStream ? (
        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {activeStream.embed_url ? (
              <iframe
                src={activeStream.embed_url}
                title={activeStream.title}
                className="w-full h-full border-0"
                allowFullScreen
              />
            ) : (
              <div className="text-slate-400">Live stream player placeholder</div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{activeStream.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{activeStream.description}</p>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400">No active streams at the moment.</div>
      )}
    </div>
  );
}
