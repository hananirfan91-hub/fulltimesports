import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("fts_posts")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (data) {
          setPost(data);
        }
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01140f] text-slate-100 flex items-center justify-center">
        <div className="text-xl font-medium text-[#22c55e]">Loading tactical analysis...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#01140f] text-slate-100 flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Article Not Found</h1>
        <Link to="/" className="text-[#22c55e] hover:underline">Return to Homepage</Link>
      </div>
    );
  }

  const siteOrigin = "https://thesportsroom.online";
  const canonicalUrl = post.canonical_url && post.canonical_url.trim().length > 0
    ? (post.canonical_url.startsWith("http") ? post.canonical_url : `${siteOrigin}${post.canonical_url}`)
    : `${siteOrigin}/blog/${post.slug || slug}`;

  return (
    <article className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title={post.meta_title || `${post.title} | The Sports Room`}
        description={post.meta_description || post.subheading || post.content?.slice(0, 160)}
        canonicalUrl={canonicalUrl}
        ogImage={post.featured_image || "https://thesportsroom.online/logo-preview.png"}
        ogType="article"
      />

      <header className="mb-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">THE SPORTS <span className="text-[#22c55e]">ROOM</span></span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-[#22c55e] hover:underline">
            ← Back to All Articles
          </Link>
        </div>
        <div className="text-sm font-semibold tracking-wider text-[#22c55e] uppercase mb-2">
          {post.category || "Sports Analysis"}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
          {post.title}
        </h1>
        {post.subheading && (
          <p className="text-lg text-slate-300 mb-4">{post.subheading}</p>
        )}
        <div className="flex items-center text-sm text-slate-400 gap-4 border-b border-slate-800 pb-4">
          <span>By {post.author_name || "The Sports Room Editorial"}</span>
          <span>•</span>
          <span>{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </header>

      {post.featured_image && (
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-800">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      <div className="prose prose-invert prose-emerald max-w-none text-slate-200 leading-relaxed space-y-4">
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p>No content available.</p>
        )}
      </div>

      <footer className="mt-12 pt-6 border-t border-slate-800">
        <Link to="/" className="inline-flex items-center text-[#22c55e] hover:text-[#4ade80] font-medium transition-colors">
          ← Back to All Articles
        </Link>
      </footer>
    </article>
  );
}
