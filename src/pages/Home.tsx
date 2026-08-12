import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Eye, Flame, ArrowRight, CheckCircle2,
  Clock, Tv, Mail, Sparkles, TrendingUp, BookOpen, Compass,
  Building2, ShieldCheck
} from 'lucide-react';
import { Post, FixtureItem } from '../types';
import { DB } from '../lib/db';
import Hero from '../components/Hero';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface HomeProps {
  onNavigate: (path: string) => void;
  activeGeo: string;
}

const sortPostsByGeo = (postsList: Post[], geoCode: string): Post[] => {
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

export default function Home({ onNavigate, activeGeo }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);

  useEffect(() => {
    document.title = "The Sports Room | Live Scores, Sports News & Expert Analysis";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content', 
        'The Sports Room provides real-time live scores, breaking sports news, expert match analysis, Formula 1 telemetry, player rankings and sports insights.'
      );
    }

    const loadData = () => {
      const homePosts = DB.getHomePosts();
      const sorted = sortPostsByGeo(homePosts, activeGeo);
      setPosts(sorted);
      setFixtures(DB.getFixtures());
    };

    loadData();

    window.addEventListener('fts_db_sync', loadData);
    return () => {
      window.removeEventListener('fts_db_sync', loadData);
    };
  }, [activeGeo]);

  const spotlightPost = posts.find(p => Boolean(p.is_spotlight) && !p.is_draft);
  const trendingNews = posts.filter(p => p.is_trending).slice(0, 6);
  const displayTrending = trendingNews.length >= 3 ? trendingNews : posts.slice(0, 6);
  const latestArticles = posts.slice(0, 6);
  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  const videoPosts = posts.filter(p => !!p.video_url).slice(0, 3);

  const categoriesList = [
    { name: 'Cricket', icon: '🏏', slug: 'cricket' },
    { name: 'Football', icon: '⚽', slug: 'football' },
    { name: 'Formula 1', icon: '🏎️', slug: 'f1' },
    { name: 'Basketball', icon: '🏀', slug: 'basketball' },
    { name: 'Tennis', icon: '🎾', slug: 'tennis' },
    { name: 'Esports', icon: '🎮', slug: 'esports' },
    { name: 'Hockey', icon: '🏑', slug: 'hockey' },
    { name: 'Volleyball', icon: '🏐', slug: 'volleyball' },
  ];

  return (
    <div className="bg-[#01140f] text-slate-100 min-h-screen pb-16 space-y-12 font-sans selection:bg-[#22c55e] selection:text-[#022c22]" id="home-page-container">
      
      {/* 1. HERO SECTION (3D Editorial Board) */}
      <Hero onNavigate={onNavigate} activeGeo={activeGeo} />

      {/* 2. THE SPORTS ROOM SPOTLIGHT SECTION */}
      {spotlightPost && (
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-[#022c22] via-[#011c15] to-[#01140f] border-2 border-[#22c55e]/40 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Featured Image */}
              <div 
                onClick={() => onNavigate(`/blog/${spotlightPost.slug}`)}
                className="lg:col-span-5 relative group/img cursor-pointer rounded-2xl overflow-hidden border border-[#22c55e]/30 shadow-xl aspect-[16/10]"
              >
                <img 
                  referrerPolicy="no-referrer"
                  src={spotlightPost.featured_image} 
                  alt={spotlightPost.image_alt || spotlightPost.title} 
                  className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute top-3 left-3 bg-[#01140f]/90 backdrop-blur-md border border-[#22c55e]/50 text-[#22c55e] text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
                  <span>{spotlightPost.category}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[11px] font-mono text-slate-300">
                  <span>By {spotlightPost.author}</span>
                  <span>{new Date(spotlightPost.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Right Column: Spotlight Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500 text-slate-950 font-mono text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>THE SPORTS ROOM SPOTLIGHT</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                    • Editor's Choice
                  </span>
                </div>

                <h2 
                  onClick={() => onNavigate(`/blog/${spotlightPost.slug}`)}
                  className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white leading-tight tracking-tight hover:text-[#22c55e] transition duration-200 cursor-pointer"
                >
                  {spotlightPost.title}
                </h2>

                <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed line-clamp-3">
                  {spotlightPost.subheading || spotlightPost.meta_description || spotlightPost.geo_summary || spotlightPost.content.replace(/[#*`|_~]/g, '').slice(0, 220) + '...'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate(`/blog/${spotlightPost.slug}`)}
                    className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-[#022c22] font-mono font-black text-xs uppercase tracking-wider rounded-xl transition duration-200 shadow-lg cursor-pointer flex items-center space-x-2 border border-[#22c55e]"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onNavigate(`/sport/${spotlightPost.category}`)}
                    className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border border-slate-700/80"
                  >
                    More {spotlightPost.category} Coverage
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* EDITORIAL POLICY BANNER CARD (Mint green card matching screenshot) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-[#f0fdf4] border border-[#22c55e]/40 rounded-2xl p-6 md:p-8 text-[#022c22] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-[#16a34a]" />
              <h3 className="font-mono font-black text-sm uppercase tracking-wider text-[#022c22]">
                EDITORIAL POLICY &amp; GENERAL DATA COUPLERS
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              The Sports Room carries manual reporting indices across high-density markets in the ICC, UEFA, Formula 1, and NBA. Our coverage features structured schema markup representing detailed sport databases. We guarantee complete exemption from scraping loops and artificial slop.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[10px] font-bold text-[#16a34a] uppercase">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED EDITORIAL PLATFORM</span>
              <span>•</span>
              <span>NO SCRAPING FEEDS</span>
              <span>•</span>
              <span>HUMAN EDITORIAL ANALYSIS</span>
            </div>
          </div>
          <div className="shrink-0 space-y-2 text-right w-full md:w-auto">
            <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">PORTAL VERIFICATION &amp; TICKETS</span>
            <div className="flex flex-col sm:flex-row md:flex-col gap-2">
              <button 
                onClick={() => onNavigate('/what-is-the-sports-room')}
                className="w-full px-4 py-2 bg-[#022c22] hover:bg-[#01140f] text-white font-mono font-bold text-xs uppercase rounded-lg tracking-wider transition shadow-md cursor-pointer border border-emerald-900 flex items-center justify-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>WHAT IS TSR?</span>
              </button>
              <button 
                onClick={() => onNavigate('/why-choose-us')}
                className="w-full px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-mono font-bold text-xs uppercase rounded-lg tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>WHY CHOOSE US?</span>
              </button>
              <button 
                onClick={() => onNavigate('/contact-us')}
                className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-950 text-slate-300 font-mono font-bold text-[11px] uppercase rounded-lg tracking-wider transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>EDITORIAL TICKET</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPORTS CATEGORIES NAVIGATION GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white tracking-wide uppercase font-mono">Explore Sports Categories</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Select a sport to filter coverage</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categoriesList.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onNavigate(`/sport/${cat.slug}`)}
              className="flex flex-col items-center group cursor-pointer p-3 bg-[#022c22] hover:bg-emerald-950/80 border border-[#22c55e]/20 hover:border-[#22c55e] rounded-2xl transition duration-200 shadow-md"
            >
              <div className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition duration-200">
                {cat.icon}
              </div>
              <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-[#22c55e] transition">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* AdSense Top Banner Placement */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AdSensePlaceholder slot="home-top-leaderboard" format="horizontal" />
      </div>

      {/* 4. TRENDING NEWS SECTION */}
      <section id="trending-news" className="max-w-7xl mx-auto px-4 md:px-6 pt-2">
        <div className="flex items-center justify-between mb-6 border-b border-[#22c55e]/20 pb-3">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">Trending News &amp; Headlines</h2>
          </div>
          <button 
            onClick={() => onNavigate('/sport/cricket')}
            className="text-xs font-bold text-[#22c55e] hover:underline flex items-center space-x-1 font-mono uppercase"
          >
            <span>View More</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTrending.map((post) => (
            <div 
              key={post.id}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="bg-[#022c22] border border-[#22c55e]/20 rounded-2xl overflow-hidden hover:border-[#22c55e] transition duration-300 group cursor-pointer shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#01140f]">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#22c55e] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">
                    {post.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1 text-[#22c55e]" /> {new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center"><Eye className="h-3 w-3 mr-1 text-[#22c55e]" /> {post.views} views</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#22c55e] transition line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {post.meta_description || post.content.replace(/#+/g, '').slice(0, 120)}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 text-xs font-bold text-[#22c55e] flex items-center space-x-1 font-mono group-hover:translate-x-1 transition duration-200">
                <span>Read Full Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LATEST ARTICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6 border-b border-[#22c55e]/20 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">Latest Editorials &amp; Columns</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((post) => (
            <div 
              key={post.id}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="bg-[#022c22] border border-[#22c55e]/20 rounded-2xl overflow-hidden hover:border-[#22c55e] transition duration-300 group cursor-pointer shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-[#01140f]">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#22c55e] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider font-mono">
                    {post.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    5 min read
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#22c55e] transition line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {post.meta_description || post.content.replace(/#+/g, '').slice(0, 120)}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 text-xs font-bold text-[#22c55e] flex items-center space-x-1 font-mono group-hover:translate-x-1 transition duration-200">
                <span>Read Column</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FEATURED STORY SECTION */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-[#022c22] text-white border border-[#22c55e]/30 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-block bg-[#22c55e] text-slate-950 text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider font-mono">
                  Featured Story
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {featuredPost.meta_description || featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-4 pt-2 text-xs text-slate-400 font-mono">
                  <span>By <strong className="text-white">{featuredPost.author}</strong></span>
                  <span>•</span>
                  <span>{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => onNavigate(`/blog/${featuredPost.slug}`)}
                    className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition duration-150 flex items-center space-x-2 cursor-pointer shadow-lg font-mono uppercase"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#22c55e]/30">
                <img 
                  src={featuredPost.featured_image} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. LATEST VIDEOS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6 border-b border-[#22c55e]/20 pb-3">
          <div className="flex items-center space-x-2">
            <Tv className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">Match Highlights &amp; Video Telemetry</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videoPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="bg-[#022c22] border border-[#22c55e]/20 rounded-2xl overflow-hidden hover:border-[#22c55e] transition duration-300 group cursor-pointer shadow-xl"
            >
              <div className="relative h-48 bg-[#01140f]">
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                  <div className="w-12 h-12 rounded-full bg-[#22c55e] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Video
                </div>
              </div>

              <div className="p-4">
                <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider block mb-1 font-mono">
                  {post.category}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-[#22c55e] transition line-clamp-2 leading-snug">
                  {post.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. KEYWORD-OPTIMIZED BRAND HUB: THE SPORTS ROOM */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6" id="the-sports-room-hub">
        <div className="bg-[#022c22]/90 border border-[#22c55e]/30 rounded-3xl p-6 md:p-10 text-slate-200 space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="space-y-3 border-b border-emerald-900/60 pb-6">
            <div className="inline-flex items-center space-x-2 bg-[#22c55e]/10 border border-[#22c55e]/40 px-3 py-1 rounded-full">
              <Sparkles className="h-4 w-4 text-[#22c55e]" />
              <span className="font-mono text-xs font-bold text-[#22c55e] uppercase tracking-widest">
                OFFICIAL BRAND &amp; JOURNALISM HUB
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              The Sports Room — Independent Sports Journalism &amp; Real-Time Match Analytics
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-sans">
              Welcome to <strong className="text-white">The Sports Room</strong> (TSR), your primary destination for independent, human-authored sports journalism, ball-by-ball cricket analysis, football tactical breakdowns, Formula 1 telemetry, and real-time tournament standings. Co-founded by <strong className="text-[#22c55e]">Hanan Irfan</strong> &amp; <strong className="text-[#22c55e]">Urwah Farooq</strong>, <strong className="text-white">The Sports Room</strong> delivers un-scraped, verified match coverage across global sports leagues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#01140f] p-5 rounded-2xl border border-emerald-900/50 space-y-2">
              <h3 className="font-mono font-bold text-base text-[#22c55e] flex items-center gap-2">
                <span>🏏</span>
                <span>The Sports Room Cricket Desk</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                From ICC World Cup previews to PSL and IPL tactical breakdowns, <strong className="text-white">The Sports Room</strong> analyzes pitch friction, seam mechanics, Babar Azam cover drive telemetry, and Shaheen Afridi bowling wrists.
              </p>
            </div>

            <div className="bg-[#01140f] p-5 rounded-2xl border border-emerald-900/50 space-y-2">
              <h3 className="font-mono font-bold text-base text-[#22c55e] flex items-center gap-2">
                <span>⚽</span>
                <span>The Sports Room Football Desk</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                In-depth coverage of the Premier League, UEFA Champions League, inverted fullback press mechanics, and zonal marking blueprints published directly by <strong className="text-white">The Sports Room</strong>.
              </p>
            </div>

            <div className="bg-[#01140f] p-5 rounded-2xl border border-emerald-900/50 space-y-2">
              <h3 className="font-mono font-bold text-base text-[#22c55e] flex items-center gap-2">
                <span>🏎️</span>
                <span>The Sports Room F1 &amp; Racing</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Venturi tunnel ground-effect aerodynamics, tire degradation telemetry, and race engineering reviews curated exclusively for motorsport enthusiasts on <strong className="text-white">The Sports Room</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-emerald-900/60 font-mono text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
              <span>Official Website: <strong className="text-white">https://thesportsroom.online</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate('/what-is-the-sports-room')}
                className="text-[#22c55e] hover:underline font-bold uppercase"
              >
                What is The Sports Room? →
              </button>
              <span>•</span>
              <button 
                onClick={() => onNavigate('/why-choose-us')}
                className="text-[#22c55e] hover:underline font-bold uppercase"
              >
                Why Choose The Sports Room? →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
