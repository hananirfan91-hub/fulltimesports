import React, { useState, useEffect } from 'react';
import { Tv, Newspaper, BarChart3, Radio, Play, ArrowRight, Flame, Sparkles, ShieldCheck, Building2, HelpCircle, Info, Globe } from 'lucide-react';
import { Post, HeroConfig } from '../types';
import { DB } from '../lib/db';
import { getYouTubeId } from '../lib/videoUtils';

interface HeroProps {
  onNavigate: (path: string) => void;
  activeGeo?: string;
}

const sortPostsByGeo = (postsList: Post[], geoCode?: string): Post[] => {
  if (!geoCode || geoCode === 'global') return postsList;

  const geoKeywordsMap: { [key: string]: string[] } = {
    AU: ['australia', 'aussie', 'ashes', 'bbl', 'sheffield', 'melbourne', 'sydney', 'tennis', 'australian', 'rugby', 'cricket', 'f1'],
    IN: ['india', 'indian', 'ipl', 'bcci', 'subcontinent', 'rashid', 'delhi', 'asia', 't20', 'badminton', 'cricket', 'hockey'],
    UK: ['uk', 'united kingdom', 'england', 'premier', 'league', 'epl', 'chelsea', 'arsenal', 'liverpool', 'manchester', 'wimbledon', 'f1'],
    US: ['usa', 'us', 'america', 'american', 'nba', 'basketball', 'esports', 'faze', 'boston', 'super bowl', 'mls'],
  };

  const keywords = geoKeywordsMap[geoCode] || [];
  if (keywords.length === 0) return postsList;

  const scored = postsList.map(post => {
    let score = 0;
    const textToMatch = `${post.title} ${post.category} ${post.tags.join(' ')} ${post.meta_description || ''}`.toLowerCase();
    
    for (const kw of keywords) {
      if (textToMatch.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    return { post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.post);
};

export default function Hero({ onNavigate, activeGeo }: HeroProps) {
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => DB.getHeroConfig());
  const [rawPosts, setRawPosts] = useState<Post[]>(() => DB.getPosts());
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      setHeroConfig(DB.getHeroConfig());
      setRawPosts(DB.getPosts());
    };

    handleSync();
    window.addEventListener('fts_db_sync', handleSync);
    return () => {
      window.removeEventListener('fts_db_sync', handleSync);
    };
  }, []);

  // Defer heavy background YouTube iframe to idle time so initial FCP/LCP are immediate
  useEffect(() => {
    if (!heroConfig.backgroundVideoUrl) return;
    
    let timer: NodeJS.Timeout;
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => {
        setShouldLoadIframe(true);
      }, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      timer = setTimeout(() => {
        setShouldLoadIframe(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [heroConfig.backgroundVideoUrl]);

  const allPosts = sortPostsByGeo(rawPosts, activeGeo);

  if (heroConfig.enabled === false) {
    return null;
  }

  // Determine Featured Article
  const featuredArticle = (heroConfig.featuredArticleId
    ? allPosts.find(p => p.id === heroConfig.featuredArticleId)
    : null) || allPosts.find(p => p.is_featured) || allPosts[0];

  // Determine Background Media
  const videoUrl = heroConfig.backgroundVideoUrl || featuredArticle?.video_url || '';
  const imageUrl = heroConfig.backgroundImageUrl || featuredArticle?.featured_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=75';

  // Video embed helper
  const youtubeId = videoUrl ? getYouTubeId(videoUrl, '') : '';
  const isDirectMp4 = videoUrl ? /\.(mp4|webm|m3u8)(\?.*)?$/i.test(videoUrl) : false;

  const rightSidePosts = (() => {
    const trending = allPosts.filter(p => p.is_trending && p.id !== featuredArticle?.id);
    const others = allPosts.filter(p => p.id !== featuredArticle?.id && !trending.some(t => t.id === p.id));
    const combined = [...trending, ...others];
    return combined.slice(0, 5);
  })();

  return (
    <header className="relative w-full overflow-hidden bg-[#01140f] text-white border-b border-emerald-950 min-h-[480px] sm:min-h-[520px]" id="hero-header-section">
      {/* Background Media Container with Instant LCP Poster & Deferred Heavy Iframe */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {youtubeId && shouldLoadIframe ? (
          <div className="relative w-full h-full pointer-events-none overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 object-cover scale-125 opacity-40 filter contrast-110 brightness-90"
              allow="autoplay; encrypted-media; picture-in-picture"
              title="Hero Background Media"
              loading="lazy"
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
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width={1200}
            height={675}
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

      {/* Hero Body Content Grid (Full 100vw Width) */}
      <section className="relative z-10 w-full max-w-[100vw] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10 sm:py-14 md:py-20" id="hero-main-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: MAIN HERO EDITORIAL TITLE & BUTTONS */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5 sm:space-y-6">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#022c22]/90 border border-[#22c55e]/40 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]"></span>
              </span>
              <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#22c55e]">
                {heroConfig.liveBadgeText || "🔴 LIVE MATCH STREAMS • DAILY NEWS • TACTICAL METRICS"}
              </span>
            </div>

            {/* Headline */}
            <h1 
              className="font-display font-black text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-white tracking-tight leading-[1.1] uppercase"
              id="hero-main-heading"
            >
              {heroConfig.heading}
            </h1>

            {/* Subtitle */}
            <p 
              className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl font-sans"
              id="hero-main-subtitle"
            >
              {heroConfig.subtitle}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 w-full">
              <button
                onClick={() => onNavigate('/live-streams')}
                className="w-full sm:w-auto justify-center bg-[#22c55e] hover:bg-[#4ade80] text-[#022c22] font-mono font-black text-xs sm:text-sm uppercase tracking-wider px-5 py-3 rounded-2xl transition duration-200 flex items-center space-x-2 shadow-xl shadow-emerald-950/40 cursor-pointer active:scale-98"
                id="hero-watch-live-btn"
              >
                <Radio className="h-4 w-4 animate-pulse text-[#022c22]" />
                <span>WATCH LIVE MATCHES</span>
              </button>

              <button
                onClick={() => onNavigate('/what-is-the-sports-room')}
                className="w-full sm:w-auto justify-center bg-[#022c22]/90 hover:bg-[#022c22] text-white border border-[#22c55e]/40 hover:border-[#22c55e] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-4 py-3 rounded-2xl transition duration-200 flex items-center space-x-2 backdrop-blur-md cursor-pointer active:scale-98"
                id="hero-what-is-tsr-btn"
              >
                <Building2 className="h-4 w-4 text-[#22c55e]" />
                <span>WHAT IS THE SPORTS ROOM?</span>
              </button>

              {featuredArticle && (
                <button
                  onClick={() => onNavigate(`/blog/${featuredArticle.slug}`)}
                  className="w-full sm:w-auto justify-center bg-[#01140f]/90 hover:bg-[#01140f] text-slate-300 hover:text-white border border-emerald-900/80 hover:border-[#22c55e]/50 font-mono font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-2xl transition duration-200 flex items-center space-x-1.5 backdrop-blur-md cursor-pointer active:scale-98"
                  id="hero-read-featured-btn"
                >
                  <Newspaper className="h-4 w-4 text-[#22c55e]" />
                  <span>FEATURED ARTICLE</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#22c55e]" />
                </button>
              )}
            </div>

            {/* Service Cards / Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-emerald-900/40">
              <div 
                onClick={() => onNavigate('/what-is-the-sports-room')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    What is TSR?
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Platform identity, Co-Founders Hanan Irfan &amp; Urwah Farooq &amp; AI search facts.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('/why-choose-us')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    Why Choose Us?
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  10 key reasons for independent journalism &amp; verified metrics.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('/live-streams')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                    <Tv className="h-4 w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    HD Live Streams
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Cricket, Football, &amp; F1 embedded feeds with live commentary.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('/topic/tactical-breakdowns')}
                className="bg-[#022c22]/60 border border-emerald-900/50 p-3.5 rounded-2xl backdrop-blur-md cursor-pointer hover:border-[#22c55e]/50 hover:-translate-y-0.5 transition-all duration-200 group"
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
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: TRENDING EDITORIAL SPOTLIGHT CARD */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center">
            <div 
              className="bg-[#022c22]/95 border border-[#22c55e]/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-white space-y-3"
              id="hero-editorial-spotlight-card"
            >
              {/* Spotlight Header */}
              <div className="flex items-center justify-between border-b border-[#22c55e]/20 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4.5 w-4.5 text-[#22c55e] animate-bounce" />
                  <h2 className="font-mono font-black text-xs uppercase tracking-widest text-[#22c55e]">
                    🔥 TRENDING SPOTLIGHT
                  </h2>
                </div>
                <span className="bg-emerald-950/80 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-800">
                  TOP 5 EDITORIAL
                </span>
              </div>

              {/* Minimum 5 Featured / Trending Article List */}
              <div className="space-y-2">
                {rightSidePosts.map((post, idx) => (
                  <div 
                    key={post.id}
                    onClick={() => onNavigate(`/blog/${post.slug}`)}
                    className="group cursor-pointer p-2 rounded-xl bg-[#01140f]/70 hover:bg-[#01140f] border border-emerald-900/60 hover:border-[#22c55e]/50 transition-all duration-200 flex items-center space-x-2.5 sm:space-x-3"
                  >
                    {/* Responsive 16:9 Image Container */}
                    <div className="w-16 sm:w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-emerald-950 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={post.featured_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80'} 
                        alt={post.image_alt || post.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 block"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-[#22c55e] truncate">
                          #{idx + 1} {post.category.toUpperCase()}
                        </span>
                        {post.created_at && (
                          <>
                            <span className="text-slate-600 text-[8px]">•</span>
                            <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono truncate">
                              {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-xs text-white group-hover:text-[#22c55e] transition line-clamp-1 leading-snug">
                        {post.title}
                      </h3>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5 truncate">
                        By {post.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spotlight CTA Button & Footer Links */}
              <div className="pt-2 border-t border-[#22c55e]/20 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
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

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => onNavigate('/sport/cricket')}
                    className="bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/40 px-2 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-1"
                    id="spotlight-cricket-btn"
                  >
                    <Sparkles className="h-3 w-3 text-[#22c55e]" />
                    <span>Cricket →</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/why-choose-us')}
                    className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 px-2 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-1"
                    id="spotlight-why-choose-btn"
                  >
                    <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                    <span>Why Us? →</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/what-is-the-sports-room')}
                    className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 px-2 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-1"
                    id="spotlight-what-is-tsr-btn"
                  >
                    <Building2 className="h-3 w-3 text-[#22c55e]" />
                    <span>What is TSR? →</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </header>
  );
}
