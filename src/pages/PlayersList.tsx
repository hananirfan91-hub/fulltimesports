import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlayersList() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const { data } = await supabase.from("players").select("*").order("name");
        if (data) setPlayers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <SEOMetaTags
        title="Sports Players Directory & Profiles | The Sports Room"
        description="Comprehensive athlete profiles, statistics, records, and career performance metrics."
        canonicalUrl="https://thesportsroom.online/players"
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← Home</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Athletes & Players Directory</h1>
      </header>
      {loading ? (
        <div className="py-20 text-center text-[#22c55e]">Loading players directory...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((p) => (
            <Link
              key={p.slug || p.id}
              to={`/player/${p.slug}`}
              className="p-4 bg-[#022c22]/40 border border-slate-800 rounded-xl hover:border-[#22c55e] transition-all"
            >
              <h2 className="text-lg font-bold text-white">{p.name}</h2>
              <p className="text-xs text-[#22c55e] uppercase mt-1">{p.sport || "Cricket"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
