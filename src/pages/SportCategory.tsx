import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = [
  "football", "cricket", "basketball", "f1", "esports", "tennis", "hockey", "volleyball"
];

export default function SportCategory() {
  const { category } = useParams<{ category?: string }>();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = category ? category.toLowerCase() : "all";

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        let query = supabase
          .from("fts_posts")
          .select("id, title, slug, subheading, category, featured_image, created_at, author_name")
          .order("created_at", { ascending: false })
          .limit(20);

        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory);
        }

        const { data, error } = await query;
        if (data) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [activeCategory]);

  const siteOrigin = "https://thesportsroom.online";
  const canonicalUrl = activeCategory === "all"
    ? `${siteOrigin}/`
    : `${siteOrigin}/sport/${activeCategory}`;

  const title = activeCategory === "all"
    ? "The Sports Room | Live Cricket Scores, Real-Time Match Updates & Tournaments"
    : `${activeCategory.toUpperCase()} Tactical Analysis & Coverage | The Sports Room`;

  const description = activeCategory === "all"
    ? "Follow live cricket scores, real-time match updates, upcoming schedules, and complete coverage on The Sports Room."
    : `In-depth ${activeCategory} tactical breakdowns, expert match analysis, and telemetry reporting on The Sports Room.`;

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 flex flex-col">
      <SEOMetaTags
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
      />

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-[#022c22]/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="The Sports Room Logo" className="h-10 w-auto object-contain rounded-lg shadow-md" />
            <span className="text-xl font-extrabold tracking-tight text-white hidden sm:inline">
              THE SPORTS <span className="text-[#22c55e]">ROOM</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className={`hover:text-[#22c55e] transition-colors ${activeCategory === "all" ? "text-[#22c55e]" : ""}`}>
              All Sports
            </Link>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat}
                to={`/sport/${cat}`}
                className={`capitalize hover:text-[#22c55e] transition-colors ${activeCategory === cat ? "text-[#22c55e]" : ""}`}
              >
                {cat}
              </Link>
            ))}
            <Link to="/live-stream" className="hover:text-[#22c55e] transition-colors">Live Stream</Link>
            <Link to="/players" className="hover:text-[#22c55e] transition-colors">Players</Link>
          </nav>
        </div>
      </header>

      {/* Hero / Category banner */}
      <section className="bg-gradient-to-b from-[#022c22] to-[#01140f] py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-4">
            {activeCategory === "all" ? "Global Sports Journalism & Tactical Analysis" : `${activeCategory} Breakdown`}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </section>

      {/* Articles Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#22c55e]">Loading latest coverage...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No articles found in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id || post.slug}
                className="bg-[#022c22]/40 border border-slate-800 rounded-xl overflow-hidden hover:border-[#22c55e]/50 transition-all flex flex-col group"
              >
                {post.featured_image && (
                  <Link to={`/blog/${post.slug}`} className="block overflow-hidden h-48 bg-slate-900">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase text-[#22c55e] mb-2 tracking-wider">
                      {post.category || "Editorial"}
                    </div>
                    <h2 className="text-lg font-bold text-white group-hover:text-[#4ade80] transition-colors leading-snug mb-2">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.subheading && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {post.subheading}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-3 mt-4">
                    <span>{post.author_name || "The Sports Room"}</span>
                    <span>{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
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
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
