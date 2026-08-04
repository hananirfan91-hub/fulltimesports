import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tv, Newspaper, BarChart3, Radio, Play, ArrowRight, Flame, Sparkles, ShieldCheck } from 'lucide-react';
import { Post, HeroConfig } from '../types';
import { DB } from '../lib/db';
import { getYouTubeId } from '../lib/videoUtils';

interface HeroProps {
  onNavigate: (path: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => DB.getHeroConfig());
  const [allPosts, setAllPosts] = useState<Post[]>(() => DB.getPosts());

  useEffect(() => {
    const handleSync = () => {
      setHeroConfig(DB.getHeroConfig());
      setAllPosts(DB.getPosts());
    };

    handleSync();
    window.addEventListener('fts_db_sync', handleSync);
    return () => {
      window.removeEventListener('fts_db_sync', handleSync);
    };
  }, []);

  if (heroConfig.enabled === false) {
    return null;
  }

  // Determine Featured Article
  const featuredArticle = (heroConfig.featuredArticleId
    ? allPosts.find(p => p.id === heroConfig.featuredArticleId)
    : null) || allPosts.find(p => p.is_featured) || allPosts[0];

  // Determine Background Media
  const videoUrl = heroConfig.backgroundVideoUrl || featuredArticle?.video_url || '';
  const imageUrl = heroConfig.backgroundImageUrl || featuredArticle?.featured_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80';

  // Video embed helper
  const youtubeId = videoUrl ? getYouTubeId(videoUrl, '') : '';
  const isDirectMp4 = videoUrl ? /\.(mp4|webm|m3u8)(\?.*)?$/i.test(videoUrl) : false;

  const trendingPosts = allPosts.filter(p => p.is_trending).slice(0, 3);

  return (
    <header className="relative w-full overflow-hidden bg-[#01140f] text-white border-b border-emerald-950" id="hero-header-section">
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {youtubeId ? (
          <div className="relative w-full h-full pointer-events-none overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 object-cover scale-125 opacity-40 filter contrast-110 brightness-90"
              allow="autoplay; encrypted-media; picture-in-picture"
              title="Hero Background Media"
            />
          </div>
        ) : isDirectMp4 ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 filter contrast-110"
          />
        ) : (
          <img
            src={imageUrl}
            alt="Sports Stadium Atmosphere"
            className="w-full h-full object-cover opacity-35 filter contrast-110 scale-105"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Dynamic Dark Gradient Overlays */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[#01140f] via-[#01140f]/80 to-transparent"
          style={{ opacity: heroConfig.overlayOpacity ?? 0.65 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#01140f] via-[#01140f]/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* Hero Body Content Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20" id="hero-main-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: MAIN HERO EDITORIAL TITLE & BUTTONS */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5 sm:space-y-6">
            
            {/* Live Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 bg-[#022c22]/90 border border-[#22c55e]/40 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]"></span>
              </span>
              <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#22c55e]">
                {heroConfig.liveBadgeText || "🔴 LIVE MATCH STREAMS • DAILY NEWS • TACTICAL METRICS"}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-white tracking-tight leading-[1.1] uppercase"
              id="hero-main-heading"
            >
              {heroConfig.heading}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl font-sans"
              id="hero-main-subtitle"
            >
              {heroConfig.subtitle}
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <button
                onClick={() => onNavigate('/live-streams')}
                className="bg-[#22c55e] hover:bg-[#4ade80] text-[#022c22] font-mono font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-2xl transition duration-200 flex items-center space-x-2 shadow-xl shadow-emerald-950/40 cursor-pointer"
                id="hero-watch-live-btn"
              >
                <Radio className="h-4 w-4 animate-pulse text-[#022c22]" />
                <span>WATCH LIVE MATCHES</span>
              </button>

              {featuredArticle && (
                <button
                  onClick={() => onNavigate(`/article/${featuredArticle.slug}`)}
                  className="bg-[#022c22]/90 hover:bg-[#022c22] text-white border border-[#22c55e]/40 hover:border-[#22c55e] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-3.5 rounded-2xl transition duration-200 flex items-center space-x-2 backdrop-blur-md cursor-pointer"
                  id="hero-read-featured-btn"
                >
                  <Newspaper className="h-4 w-4 text-[#22c55e]" />
                  <span>READ FEATURED ARTICLE</span>
                  <ArrowRight className="h-4 w-4 text-[#22c55e]" />
                </button>
              )}
            </motion.div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-900/40">
              <motion.div 
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('/live-streams')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 transition group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <Tv className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    HD Live Streaming
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Cricket, Football, and F1 embedded feeds with live commentary.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('/category/cricket')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 transition group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    Verified Reporting
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  100% human editorial coverage, match statistics & standings.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('/topic/tactical-breakdowns')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 transition group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    Tactical Metrics
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Biomechanics, heatmaps, player metrics, and F1 telemetry.
                </p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT SIDE: TRENDING EDITORIAL SPOTLIGHT CARD */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#022c22]/95 border border-[#22c55e]/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl text-white space-y-4"
              id="hero-editorial-spotlight-card"
            >
              {/* Spotlight Header */}
              <div className="flex items-center justify-between border-b border-[#22c55e]/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-[#22c55e] animate-bounce" />
                  <span className="font-mono font-black text-xs uppercase tracking-widest text-[#22c55e]">
                    🔥 TRENDING SPOTLIGHT
                  </span>
                </div>
                <span className="bg-emerald-950/80 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-800">
                  EDITORIAL DESK
                </span>
              </div>

              {/* Featured / Trending Article List */}
              <div className="space-y-3">
                {trendingPosts.length > 0 ? (
                  trendingPosts.map((post, idx) => (
                    <div 
                      key={post.id}
                      onClick={() => onNavigate(`/article/${post.slug}`)}
                      className="group cursor-pointer p-2.5 rounded-2xl bg-[#01140f]/60 hover:bg-[#01140f] border border-emerald-900/60 hover:border-[#22c55e]/50 transition flex items-center space-x-3"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-emerald-950">
                        <img 
                          src={post.featured_image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#22c55e] block mb-0.5">
                          #{idx + 1} {post.category.toUpperCase()}
                        </span>
                        <h4 className="font-display font-bold text-xs text-white group-hover:text-[#22c55e] transition truncate">
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          By {post.author}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div 
                    onClick={() => featuredArticle && onNavigate(`/article/${featuredArticle.slug}`)}
                    className="group cursor-pointer p-3 rounded-2xl bg-[#01140f] border border-[#22c55e]/30 space-y-2"
                  >
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-emerald-900">
                      <img 
                        src={featuredArticle?.featured_image || imageUrl} 
                        alt="Featured" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="font-display font-extrabold text-sm text-white group-hover:text-[#22c55e] transition leading-snug">
                      {featuredArticle?.title || "Explore Live Sports Analysis & Tactical Coverage"}
                    </h4>
                  </div>
                )}
              </div>

              {/* Footer Badge */}
              <div className="pt-2 border-t border-[#22c55e]/20 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Verified Human Analysis</span>
                </span>
                <button
                  onClick={() => onNavigate('/live-streams')}
                  className="text-[#22c55e] hover:underline font-bold"
                >
                  Live Feeds →
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </section>
    </header>
  );
}
