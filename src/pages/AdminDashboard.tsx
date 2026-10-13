import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"posts" | "streams" | "players">("posts");

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="admin-panel-container">
      <SEOMetaTags
        title="Admin Editorial Console | The Sports Room"
        description="Editorial content management system for The Sports Room."
        canonicalUrl="https://thesportsroom.online/admin"
      />
      <header className="mb-8 border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-1 block">← Return to Site</Link>
          <h1 className="text-3xl font-extrabold text-white">The Sports Room Editorial Console</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "posts" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800 text-slate-200"}`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("streams")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "streams" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800 text-slate-200"}`}
          >
            Live Streams
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "players" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800 text-slate-200"}`}
          >
            Players
          </button>
        </div>
      </header>
      <main className="bg-[#022c22]/40 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-300">
          Managing {activeTab}. Use Supabase tables (<code className="text-[#22c55e]">fts_posts</code>, <code className="text-[#22c55e]">fts_live_streams</code>, <code className="text-[#22c55e]">players</code>) to manage publication records directly or through editorial workflows.
        </p>
      </main>
    </div>
  );
}
