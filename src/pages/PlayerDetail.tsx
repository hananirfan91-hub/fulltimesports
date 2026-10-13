import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlayerDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayer() {
      if (!slug) return;
      try {
        const { data } = await supabase.from("players").select("*").eq("slug", slug).maybeSingle();
        if (data) setPlayer(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPlayer();
  }, [slug]);

  const canonicalUrl = `https://thesportsroom.online/player/${slug}`;

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title={player ? `${player.name} Career Stats & Profile | The Sports Room` : "Player Profile | The Sports Room"}
        description={player ? `${player.name} career stats, performance metrics, and match biography.` : "Player profile"}
        canonicalUrl={canonicalUrl}
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/players" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← All Players</Link>
        <h1 className="text-3xl font-bold text-white">{player?.name || "Player Profile"}</h1>
      </header>
      {loading ? (
        <div className="py-20 text-center text-[#22c55e]">Loading athlete metrics...</div>
      ) : player ? (
        <div className="space-y-4 text-slate-300">
          <p><strong>Sport:</strong> {player.sport || "Cricket"}</p>
          <p><strong>Country:</strong> {player.country || "International"}</p>
          {player.bio && <p>{player.bio}</p>}
        </div>
      ) : (
        <p className="text-slate-400">Player profile not found.</p>
      )}
    </div>
  );
}
