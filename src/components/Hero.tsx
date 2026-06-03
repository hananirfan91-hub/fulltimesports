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
      </div>

      {/* Grid Layout conforming to Left panel, Right panel, Floating video block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative min-h-[500px]">
        
        {/* ================= LEFT PANEL =================
            PRIMARY FEATURE: HIGHEST Z-LAYER (Z-20) */}
        <motion.div 
          onClick={() => onNavigate(`/blog/${featuredNews.slug}`)}
          className="lg:col-span-7 bg-[#022c22] border border-emerald-950 rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl z-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 3}deg) rotateX(${mousePos.y * -3}deg)`
          }}
        >
          {/* Cover image with zoom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#022c22]/70 to-transparent z-10"></div>
          <img 
            referrerPolicy="no-referrer"
            src={featuredNews.featured_image} 
            alt={featuredNews.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Article detail overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-20 flex flex-col justify-end h-full">
            <span className="bg-[#22c55e] text-slate-950 font-mono text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded w-fit mb-3 flex items-center space-x-1.5 border border-emerald-950">
              <Award className="h-3 w-3" />
              <span>{featuredNews.category} BREAKING</span>
            </span>
            <h2 className="font-display text-2xl md:text-3.5xl font-extrabold text-white tracking-tight leading-tight uppercase group-hover:text-[#22c55e] transition line-clamp-3">
              {featuredNews.title}
            </h2>
            <p className="text-slate-200 text-xs md:text-sm mt-3 line-clamp-2 leading-relaxed">
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


        {/* ================= RIGHT PANEL =================
            STACKED CAROUSEL: SMOOTH ANIMATED FLOW (Z-10) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 z-15">
          <div className="flex justify-between items-center px-1 font-mono text-[10px] text-slate-500 font-bold uppercase">
            <span>Trending Feed</span>
            <span>Carousel Rotation</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={carouselIndex}
              className="flex flex-col space-y-4"
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
                    className="bg-white border border-slate-200 hover:border-[#22c55e] p-4 rounded-xl flex items-center space-x-4 cursor-pointer shadow-sm group hover:shadow-md transition"
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative border border-slate-100">
                      <img 
                        referrerPolicy="no-referrer"
                        src={item.featured_image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-mono font-bold text-[#22c55e] uppercase tracking-widest">{item.category}</span>
                      <h3 className="font-display text-sm font-bold text-slate-900 leading-snug line-clamp-2 uppercase mt-0.5 group-hover:text-[#22c55e] transition">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-[10px] text-slate-400 font-mono">
                        <span>{item.author}</span>
                        <span>{item.views} VIEWS</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#22c55e] transition" />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>


        {/* ================= FLOATING VIDEO BLOCK =================
            CENTER OVERLAY CARD WITH PARALLAX Z-AXIS LIFT (Z-30) */}
        <motion.div 
          className="absolute hidden md:block w-72 lg:w-80 h-44 bg-[#01140f] rounded-2xl border-2 border-[#22c55e] shadow-2xl z-30 overflow-hidden"
          style={{
            top: '42%',
            left: '52%',
            transform: `translate(-50%, -50%) perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${mousePos.y * -12}deg) translateZ(40px)`
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 cursor-pointer group">
            <div className="bg-[#22c55e] text-slate-950 p-3.5 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-[#f0fdf4] transition">
              <Play className="h-6 w-6 fill-current ml-0.5 text-slate-950" />
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-left">
              <span className="bg-slate-950/80 text-[8px] font-mono font-bold px-2 py-0.5 rounded text-[#22c55e] tracking-widest uppercase">
                Floating Editorial Feature
              </span>
              <p className="text-[10px] text-white font-sans font-bold line-clamp-1 mt-1">
                FTS TV • Video Highlight
              </p>
            </div>
          </div>
          <iframe 
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=1&playlist=${activeVideoId}&loop=1&controls=0&modestbranding=1`}
            title="Sports Video Stream"
            className="w-full h-full object-cover pointer-events-none opacity-80"
            allow="autoplay; encrypted-media"
          />
        </motion.div>

      </div>


      {/* ================= BOTTOM STRIP (BLOGS) =================
          HORIZONTAL SLIDING CAROUSEL / CONTINUOUS TICKER (Z-10) */}
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
