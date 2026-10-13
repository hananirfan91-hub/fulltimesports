import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";
import StreamEmbed from "../components/streamEmbed.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yvjubtmdttrmgxkykndr.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anVidG1kdHRybWd4a3lrbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTE5OTMsImV4cCI6MjEwMjEyNzk5M30.9M_3K5l8p4e2LfNHyFNRFR2jS4nzmYlPp24O49mGjfw";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"streams" | "posts" | "players">("streams");
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Edit / Create Stream Form State
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [streamForm, setStreamForm] = useState({
    title: "",
    match_name: "",
    tournament: "",
    description: "",
    embed_url: "",
    status: "active",
    // Logo Overlay Overwriting Original Stream
    logo_enabled: false,
    custom_logo_url: "",
    logo_link: "https://thesportsroom.online",
    logo_position: "top-right",
    logo_size: "medium"
  });

  // Fetch streams from Supabase
  const loadStreams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fts_live_streams")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setStreams(data);
      }
    } catch (e: any) {
      console.error(e);
      setStatusMessage("Failed to load streams: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "streams") {
      loadStreams();
    }
  }, [activeTab]);

  const handleSelectStreamForEdit = (stream: any) => {
    setEditingStreamId(stream.id);
    setStreamForm({
      title: stream.title || "",
      match_name: stream.match_name || "",
      tournament: stream.tournament || "",
      description: stream.description || "",
      embed_url: stream.embed_url || "",
      status: stream.status || "active",
      logo_enabled: Boolean(stream.logo_type && stream.logo_type !== "none" && stream.custom_logo_url),
      custom_logo_url: stream.custom_logo_url || "",
      logo_link: stream.logo_link || "https://thesportsroom.online",
      logo_position: stream.logo_position || "top-right",
      logo_size: stream.logo_size || "medium"
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleNewStream = () => {
    setEditingStreamId("new");
    setStreamForm({
      title: "",
      match_name: "",
      tournament: "",
      description: "",
      embed_url: "",
      status: "active",
      logo_enabled: false,
      custom_logo_url: "",
      logo_link: "https://thesportsroom.online",
      logo_position: "top-right",
      logo_size: "medium"
    });
  };

  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Saving stream configuration...");

    const payload = {
      title: streamForm.title,
      match_name: streamForm.match_name,
      tournament: streamForm.tournament,
      description: streamForm.description,
      embed_url: streamForm.embed_url,
      status: streamForm.status,
      logo_type: streamForm.logo_enabled ? "custom" : "none",
      custom_logo_url: streamForm.custom_logo_url,
      logo_link: streamForm.logo_link,
      logo_position: streamForm.logo_position,
      logo_size: streamForm.logo_size,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingStreamId === "new") {
        const newId = `stream-${Date.now()}`;
        const { error } = await supabase.from("fts_live_streams").insert([
          {
            id: newId,
            ...payload,
            created_at: new Date().toISOString()
          }
        ]);
        if (error) throw error;
        setStatusMessage("Stream added successfully with logo overlay!");
      } else {
        const { error } = await supabase
          .from("fts_live_streams")
          .update(payload)
          .eq("id", editingStreamId);
        if (error) throw error;
        setStatusMessage("Stream updated successfully with logo watermark & link!");
      }
      loadStreams();
      setEditingStreamId(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Save error: " + (err.message || "Failed to update Supabase"));
    }
  };

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEOMetaTags
        title="Admin Editorial Console | The Sports Room"
        description="Editorial content management system for The Sports Room."
        canonicalUrl="https://thesportsroom.online/admin"
      />

      {/* Admin Header */}
      <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">The Sports Room Admin Console</h1>
          <p className="text-xs text-[#22c55e]">Broadcast, Stream Overlays & Publishing Control</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/live-stream"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            View Live Stream
          </Link>
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] text-slate-950 text-xs font-bold hover:bg-[#4ade80] transition-colors"
          >
            View Site
          </Link>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("streams")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "streams" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Live Streams & Logo Overlay
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "posts" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Articles
        </button>
        <button
          onClick={() => setActiveTab("players")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "players" ? "bg-[#22c55e] text-slate-950" : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          Athletes & Players
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-[#022c22] border border-[#22c55e]/50 text-sm text-[#22c55e] flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Live Stream Admin Tab */}
      {activeTab === "streams" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Live Stream Management</h2>
              <p className="text-xs text-slate-400">
                Configure original video feeds and overlay custom branding logos with clickable links directly on the broadcast player.
              </p>
            </div>
            <button
              onClick={handleNewStream}
              className="px-4 py-2 bg-[#22c55e] text-slate-950 rounded-lg text-xs font-bold hover:bg-[#4ade80] transition-colors shadow-lg"
            >
              + Add New Stream
            </button>
          </div>

          {/* Stream Edit / Creation Form */}
          {editingStreamId && (
            <div className="bg-[#022c22]/60 border border-[#22c55e]/40 rounded-xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  {editingStreamId === "new" ? "Add New Stream with Logo Overlay" : "Edit Stream & Overlay Logo"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingStreamId(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveStream} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Stream Title *</label>
                    <input
                      type="text"
                      required
                      value={streamForm.title}
                      onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
                      placeholder="e.g. India Vs Sri Lanka Test Series 2026"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Match / Subheading</label>
                    <input
                      type="text"
                      value={streamForm.match_name}
                      onChange={(e) => setStreamForm({ ...streamForm, match_name: e.target.value })}
                      placeholder="e.g. 2nd Test Match Day 5"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Original Stream Embed URL (YouTube, Vimeo, Tamasha, HLS iframe) *
                    </label>
                    <input
                      type="url"
                      required
                      value={streamForm.embed_url}
                      onChange={(e) => setStreamForm({ ...streamForm, embed_url: e.target.value })}
                      placeholder="https://www.youtube.com/embed/yEjDDRZZM5w?autoplay=1"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                    />
                  </div>
                </div>

                {/* LOGO OVERLAY SETTINGS BOX */}
                <div className="p-5 bg-slate-950/70 border border-[#22c55e]/30 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Stream Watermark & Logo Overlay (Overwrites Original Video)
                      </h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={streamForm.logo_enabled}
                        onChange={(e) => setStreamForm({ ...streamForm, logo_enabled: e.target.checked })}
                        className="rounded text-[#22c55e] focus:ring-0"
                      />
                      Enable Overlay
                    </label>
                  </div>

                  {streamForm.logo_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Logo Image URL</label>
                        <input
                          type="text"
                          value={streamForm.custom_logo_url}
                          onChange={(e) => setStreamForm({ ...streamForm, custom_logo_url: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          The logo image rendered directly on top of the original stream broadcast.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Logo Clickable Link / Destination URL *
                        </label>
                        <input
                          type="url"
                          value={streamForm.logo_link}
                          onChange={(e) => setStreamForm({ ...streamForm, logo_link: e.target.value })}
                          placeholder="https://thesportsroom.online"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          When users click the logo overlay on top of the stream, they will be redirected to this link.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Overlay Position</label>
                        <select
                          value={streamForm.logo_position}
                          onChange={(e) => setStreamForm({ ...streamForm, logo_position: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                        >
                          <option value="top-right">Top Right (Recommended)</option>
                          <option value="top-left">Top Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Overlay Size</label>
                        <select
                          value={streamForm.logo_size}
                          onChange={(e) => setStreamForm({ ...streamForm, logo_size: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-[#22c55e] outline-none"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium (Standard)</option>
                          <option value="large">Large</option>
                          <option value="giant">Giant Watermark</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Real-Time Live Preview in Admin Console */}
                  {streamForm.embed_url && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">Live Stream Preview with Logo Overlay</div>
                      <div className="max-w-xl mx-auto">
                        <StreamEmbed
                          embedUrl={streamForm.embed_url}
                          title="Admin Preview"
                          overlayConfig={{
                            enabled: streamForm.logo_enabled,
                            logoUrl: streamForm.custom_logo_url,
                            linkUrl: streamForm.logo_link,
                            position: streamForm.logo_position as any,
                            size: streamForm.logo_size as any
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingStreamId(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-[#22c55e] text-slate-950 text-xs font-extrabold hover:bg-[#4ade80] shadow-lg transition-all"
                  >
                    Save & Update Stream
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Existing Streams */}
          <div className="bg-[#022c22]/30 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Configured Broadcast Streams ({streams.length})</h3>
              <button onClick={loadStreams} className="text-xs text-[#22c55e] hover:underline">Refresh</button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading streams from database...</div>
            ) : streams.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No live streams found. Click "+ Add New Stream" above.</div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {streams.map((stream) => (
                  <div key={stream.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-[#22c55e]/30 flex items-center justify-center text-sm font-bold text-[#22c55e] shrink-0">
                        ▶
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{stream.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[10px] ${
                            stream.status === "active" ? "bg-red-900/80 text-red-200" : "bg-slate-800 text-slate-400"
                          }`}>
                            {stream.status || "active"}
                          </span>
                          <span>•</span>
                          <span>Overlay: {stream.logo_type === "none" ? "Disabled" : `Active (${stream.logo_position || "top-right"})`}</span>
                          {stream.logo_link && (
                            <>
                              <span>•</span>
                              <span className="text-[#22c55e] line-clamp-1 max-w-[200px]">Link: {stream.logo_link}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectStreamForEdit(stream)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-[#22c55e] hover:text-slate-950 text-xs font-semibold text-slate-200 transition-all"
                      >
                        Edit Stream & Logo
                      </button>
                      <Link
                        to={`/live-stream?id=${stream.id}`}
                        className="px-3 py-1.5 rounded bg-[#022c22] border border-[#22c55e]/30 text-[#22c55e] text-xs font-semibold hover:bg-[#22c55e] hover:text-slate-950 transition-all"
                      >
                        View Live →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts Tab Placeholder */}
      {activeTab === "posts" && (
        <div className="bg-[#022c22]/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Articles & News Posts Management</h2>
          <p className="text-sm text-slate-300">
            Articles are stored in Supabase table <code className="text-[#22c55e]">fts_posts</code>. All published posts automatically appear on the home page and in the dynamic sitemap.
          </p>
        </div>
      )}

      {/* Players Tab Placeholder */}
      {activeTab === "players" && (
        <div className="bg-[#022c22]/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Athletes & Players Management</h2>
          <p className="text-sm text-slate-300">
            Player profiles are stored in Supabase table <code className="text-[#22c55e]">players</code>.
          </p>
        </div>
      )}
    </div>
  );
}
