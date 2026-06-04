import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, TrendingUp, ChevronRight, BookOpen, Clock, Award } from 'lucide-react';
import { Post } from '../types';
import { DB } from '../lib/db';

interface HeroProps {
  onNavigate: (path: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  // Fetch active dynamically from local DB
  const allPosts = DB.getPosts();

  // Find Featured News (Left Panel)
  const featuredNews = allPosts.find(p => p.is_featured) || allPosts[0];

  // Find news posts for Carousel (excluding featuredNews if possible, or selecting next news)
  const newsPosts = allPosts.filter(p => p.id !== featuredNews?.id && p.type === 'news');
  const carouselPool = newsPosts.length >= 2 ? newsPosts : allPosts.slice(1, 4);

  // We need exactly 2 news cards for the Right Panel Carousel
  // We can cycle them out of the carouselPool
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Continuous scroll ticker for blog cards (Need exactly 2 blog posts)
  const blogPosts = allPosts.filter(p => p.type === 'blog').slice(0, 2);
  const finalBlogPosts = blogPosts.length === 2 ? blogPosts : allPosts.filter(p => p.category === 'football' || p.category === 'esports');

  // Parallax tracking values (using local state to avoid performance bottleneck)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto rotate carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 2) % carouselPool.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselPool.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Safe checks
  if (!featuredNews) return <div className="h-44 bg-slate-100 animate-pulse"></div>;

  // Active items in the carousel (2 at a time)
  const carouselItem1 = carouselPool[carouselIndex % carouselPool.length];
  const carouselItem2 = carouselPool[(carouselIndex + 1) % carouselPool.length];

  // Video embed (YouTube highlight from primary featured card or stable fallback)
  const activeVideoId = featuredNews.video_url || 'H9T9e03d_jE';

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="max-w-7xl mx-auto px-4 md:px-6 py-6 overflow-hidden relative select-none"
      id="layered-hero-section"
    >
      <div className="font-mono text-[10px] md:text-xs font-bold text-[#22c55e] uppercase tracking-widest flex items-center mb-4 space-x-1">
        <TrendingUp className="h-4 w-4 animate-bounce" />
        <span>3D Layered Editorial Board • Live Coverage</span>
      </div>      {/* Grid Layout conforming to Left panel, Right panel, Floating video block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 relative min-h-[480px]">
        
        {/* ================= LEFT PANEL =================
            PRIMARY FEATURE: HIGHEST Z-LAYER (Z-20) */}
        <motion.div 
          onClick={() => onNavigate(`/blog/${featuredNews.slug}`)}
          className="lg:col-span-6 md:col-span-2 bg-[#022c22] border border-emerald-950 rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl z-20 min-h-[380px] flex flex-col justify-end"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 2}deg) rotateX(${mousePos.y * -2}deg)`
          }}
        >
          {/* Cover image with zoom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#022c22]/70 to-transparent z-10"></div>
          <img 
            referrerPolicy="no-referrer"
            src={featuredNews.featured_image} 
            alt={featuredNews.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Article detail overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-20 flex flex-col justify-end h-full">
            <span className="bg-[#22c55e] text-slate-950 font-mono text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded w-fit mb-3 flex items-center space-x-1.5 border border-emerald-950">
              <Award className="h-3 w-3" />
              <span>{featuredNews.category} BREAKING</span>
            </span>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight uppercase group-hover:text-[#22c55e] transition line-clamp-3">
              {featuredNews.title}
            </h2>
            <p className="text-slate-200 text-xs mt-3 line-clamp-2 leading-relaxed">
              {featuredNews.meta_description || featuredNews.content.slice(0, 150) + "..."}
            </p>
            
            <div className="flex items-center space-x-6 mt-5 pt-4 border-t border-emerald-900/50 font-mono text-[10px] text-[#22c55e]/90">
              <span>BY: {featuredNews.author.toUpperCase()}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(featuredNews.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} EST</span>
              </span>
            </div>
          </div>
        </motion.div>


        {/* ================= MIDDLE COLUMN: LIVE STREAM (Z-20) ================= */}
        <motion.div 
          className="lg:col-span-3 bg-[#01140f] border border-emerald-900 rounded-2xl p-4 flex flex-col justify-between shadow-xl z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <span className="bg-slate-950 font-mono text-[9px] font-black tracking-widest text-[#22c55e] px-2.5 py-1.5 rounded w-fit mb-3 block border border-emerald-950 uppercase">
                FTS TV • Video Preview
              </span>
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-emerald-950/40">
                <iframe 
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=1&playlist=${activeVideoId}&loop=1&controls=0&modestbranding=1`}
                  title="FTS Live Video Feed"
                  className="w-full h-full object-cover pointer-events-none opacity-90"
                  allow="autoplay; encrypted-media"
                />
              </div>
              <h3 className="text-white font-display font-black text-xs uppercase tracking-tight mt-4">
                Strategy & Live Telemetry
              </h3>
              <p className="text-slate-300 text-[10px] leading-relaxed mt-1.5">
                Monitoring ball speeds, strategic formulas, and professional coaching adjustments instantly.
              </p>
            </div>
            <button 
              onClick={() => onNavigate(`/blog/${featuredNews.slug}`)}
              className="w-full mt-4 py-2.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] border border-emerald-950 text-white font-mono font-bold text-[9px] uppercase rounded-lg text-center transition tracking-widest cursor-pointer"
            >
              Read Full Breakdown
            </button>
          </div>
        </motion.div>


        {/* ================= RIGHT PANEL =================
            STACKED CAROUSEL: SMOOTH ANIMATED FLOW (Z-10) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center px-1 font-mono text-[10px] text-slate-500 font-bold uppercase">
            <span>Trending Feed</span>
            <span>Carousel Rotate</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={carouselIndex}
              className="flex flex-col space-y-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {[carouselItem1, carouselItem2].map((item, idx) => {
                if (!item) return null;
                return (
                  <motion.div
                    key={item.id}
                    onClick={() => onNavigate(`/blog/${item.slug}`)}
                    className="bg-white border border-slate-200 hover:border-[#22c55e] p-3 rounded-xl flex items-center space-x-3 cursor-pointer shadow-sm group hover:shadow-md transition"
                    whileHover={{ scale: 1.02, x: 3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative border border-slate-100">
                      <img 
                        referrerPolicy="no-referrer"
                        src={item.featured_image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-mono font-bold text-[#22c55e] uppercase tracking-widest">{item.category}</span>
                      <h3 className="font-display text-xs font-bold text-slate-900 leading-snug line-clamp-2 uppercase mt-0.5 group-hover:text-[#22c55e] transition">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                        <span className="truncate">{item.author}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#22c55e] transition shrink-0" />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* ================= BOTTOM STRIP (BLOGS) ================= */}
      <div className="mt-8 pt-4 border-t border-slate-200" id="editorial-columns-strip">
        <div className="flex justify-between items-center mb-3 px-1 font-mono text-[10px] text-slate-500 font-bold uppercase">
          <span className="flex items-center space-x-1">
            <BookOpen className="h-3.5 w-3.5 text-[#22c55e]" />
            <span>FTS Editorial Columns & Blogs</span>
          </span>
          <span>Sliding Loop Slider</span>
        </div>

        {/* Ticker Stage */}
        <div className="relative overflow-hidden w-full bg-[#f0fdf4]/60 border border-[#22c55e]/15 rounded-xl p-3">
          <div className="ticker-animate flex space-x-6">
            {/* Repeat items to create authentic seamless infinite loop */}
            {[...finalBlogPosts, ...finalBlogPosts, ...finalBlogPosts].map((blog, idx) => {
              if (!blog) return null;
              return (
                <div 
                  key={`${blog.id}-${idx}`}
                  onClick={() => onNavigate(`/blog/${blog.slug}`)}
                  className="w-80 md:w-96 bg-white border border-slate-150 p-3 rounded-lg shrink-0 flex items-center space-x-3 cursor-pointer hover:border-[#22c55e] shadow-sm hover:shadow transition group"
                >
                  <img 
                    referrerPolicy="no-referrer"
                    src={blog.featured_image} 
                    alt={blog.title} 
                    className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0" 
                  />
                  <div className="overflow-hidden">
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block">
                      {blog.category} Opinion column • {blog.author}
                    </span>
                    <h4 className="font-display text-xs font-bold text-slate-800 line-clamp-2 uppercase mt-1 leading-tight group-hover:text-[#22c55e] transition">
                      {blog.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
