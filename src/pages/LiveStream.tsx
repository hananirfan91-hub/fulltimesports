import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Radio, 
  Share2, 
  Copy, 
  Check, 
  Search, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Play, 
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shield
} from 'lucide-react';
import { LiveStreamItem } from '../types';
import { DB } from '../lib/db';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface LiveStreamProps {
  onNavigate: (path: string) => void;
  streamId?: string;
}

export default function LiveStream({ onNavigate, streamId }: LiveStreamProps) {
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStreamItem | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState<boolean>(true);
  const [showLiveChat, setShowLiveChat] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(Date.now());

  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Search & Sport Category Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    loadStreams();

    const handleSync = () => {
      loadStreams();
    };

    window.addEventListener('fts_db_sync', handleSync);
    return () => window.removeEventListener('fts_db_sync', handleSync);
  }, []);

  const loadStreams = () => {
    const list = DB.getLiveStreams();
    setStreams(list);

    if (list.length > 0) {
      if (streamId) {
        const found = list.find(s => s.id === streamId);
        if (found) {
          setActiveStream(found);
          return;
        }
      }
      // Default to featured stream or first active stream
      const featured = list.find(s => s.is_featured && s.status === 'active') || list.find(s => s.status === 'active') || list[0];
      setActiveStream(featured);
    }
  };

  const handleSelectStream = (stream: LiveStreamItem) => {
    setActiveStream(stream);
    setLoadingPlayer(true);
    setPlayerKey(Date.now());
    DB.incrementStreamViews(stream.id);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleReloadPlayer = () => {
    setLoadingPlayer(true);
    setPlayerKey(Date.now());
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const handleCopyShareLink = () => {
    if (!activeStream) return;
    const url = `${window.location.origin}/live-stream?id=${activeStream.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    if (!activeStream) return;
    const streamUrl = `${window.location.origin}/live-stream?id=${activeStream.id}`;
    const text = encodeURIComponent(`Watch ${activeStream.title} Live on The Sports Room! 🎥`);
    const encodedUrl = encodeURIComponent(streamUrl);

    let shareLink = '';
    if (platform === 'whatsapp') shareLink = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
    if (platform === 'twitter') shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}&via=thesportsroom`;
    if (platform === 'facebook') shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  // Filter Streams by Search, Cricket Category, and Status
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = searchQuery === '' || 
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.tournament.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.match_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.team_one.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.team_two.toLowerCase().includes(searchQuery.toLowerCase());

    const tLower = (stream.tournament || '').toLowerCase();
    const titleLower = (stream.title || '').toLowerCase();
    const matchLower = (stream.match_name || '').toLowerCase();

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'tests' && (tLower.includes('test') || titleLower.includes('test') || matchLower.includes('test') || tLower.includes('ashes'))) ||
      (selectedCategory === 't20' && (tLower.includes('t20') || tLower.includes('psl') || tLower.includes('tnpl') || tLower.includes('ipl') || titleLower.includes('t20') || titleLower.includes('psl') || titleLower.includes('tnpl') || titleLower.includes('ipl'))) ||
      (selectedCategory === 'icc' && (tLower.includes('icc') || tLower.includes('world cup') || tLower.includes('trophy') || titleLower.includes('icc') || titleLower.includes('world cup')));

    const matchesStatus = selectedStatus === 'all' || stream.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = streams.filter(s => s.status === 'active').length;
  const upcomingCount = streams.filter(s => s.status === 'upcoming').length;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-20 font-sans" id="live-stream-module-page">
      {/* Dynamic Structured JSON-LD VideoObject & Breadcrumbs Schema */}
      {activeStream && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": activeStream.title,
            "description": activeStream.description,
            "thumbnailUrl": activeStream.thumbnail || `${window.location.origin}/logo-preview.png`,
            "uploadDate": activeStream.created_at,
            "embedUrl": activeStream.embed_url,
            "publication": {
              "@type": "BroadcastEvent",
              "isLiveBroadcast": activeStream.status === 'active',
              "startDate": activeStream.stream_start,
              "endDate": activeStream.stream_end || new Date(Date.now() + 14400000).toISOString()
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Sports Room",
              "url": "https://thesportsroom.online",
              "logo": {
                "@type": "ImageObject",
                "url": "https://thesportsroom.online/logo-preview.png"
              }
            }
          })}
        </script>
      )}

      {/* TOP HERO HEADER STRIP */}
      <div className="bg-gradient-to-b from-[#011a14] via-slate-950 to-slate-950 border-b border-emerald-950/60 pt-8 pb-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center space-x-1.5 bg-emerald-950 text-[#22c55e] border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping"></span>
                  <span>Official Cricket Live Center</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeCount} Matches Live • {upcomingCount} Scheduled
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tight flex items-center gap-3">
                <Radio className="h-8 w-8 text-[#22c55e] animate-pulse shrink-0" />
                <span>Live Cricket Matches</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                Watch real-time live cricket match streams, high-definition Test & T20 tournament broadcasts, ball-by-ball commentary, and pitch analytics directly on <strong className="text-[#22c55e]">The Sports Room</strong>.
              </p>
            </div>

            {/* Clean Category Badges */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-slate-900 border border-emerald-800/60 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                <span className="text-xs font-mono font-bold text-slate-200">Live Cricket HD</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono font-bold text-slate-200">Test & T20 Leagues</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-xs font-mono font-bold text-slate-200">PSL & ICC Cups</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-xl">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cricket match, tournament, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e] transition"
              />
            </div>

            {/* Cricket Category Filter */}
            <div className="md:col-span-5 flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedCategory === 'all' ? 'bg-[#22c55e] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All Cricket
              </button>
              <button
                onClick={() => setSelectedCategory('tests')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedCategory === 'tests' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Test Series
              </button>
              <button
                onClick={() => setSelectedCategory('t20')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedCategory === 't20' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                T20 Leagues
              </button>
              <button
                onClick={() => setSelectedCategory('icc')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedCategory === 'icc' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ICC World Cup
              </button>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3 flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedStatus === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedStatus === 'active' ? 'bg-[#e11d48] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                🔴 Live
              </button>
              <button
                onClick={() => setSelectedStatus('upcoming')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedStatus === 'upcoming' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ⏳ Upcoming
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-8">
        
        {/* MAIN EMBEDDED PLAYER CONTAINER */}
        {activeStream ? (
          <div className="space-y-4">
            {/* Top Match Title Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  {/* Status Badge */}
                  {activeStream.status === 'active' ? (
                    <span className="inline-flex items-center space-x-1.5 bg-rose-950 text-rose-400 border border-rose-800 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <span>🔴 LIVE NOW</span>
                    </span>
                  ) : activeStream.status === 'upcoming' ? (
                    <span className="inline-flex items-center space-x-1.5 bg-amber-950 text-amber-400 border border-amber-800 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      <span>UPCOMING MATCH</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      <span>MATCH ENDED</span>
                    </span>
                  )}

                  {/* Tournament Tag */}
                  <span className="bg-emerald-950 text-[#22c55e] border border-emerald-850 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase">
                    {activeStream.tournament}
                  </span>

                  {/* Stream Quality Tag */}
                  <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                    HD Broadcast
                  </span>
                </div>

                <h2 className="text-xl md:text-3xl font-black font-display text-white tracking-tight leading-tight">
                  {activeStream.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>🏆 {activeStream.match_name}</span>
                  <span>•</span>
                  <span>⚔️ {activeStream.team_one} vs {activeStream.team_two}</span>
                  <span>•</span>
                  <span>📅 Scheduled: {new Date(activeStream.stream_start).toLocaleString()}</span>
                  {activeStream.views !== undefined && (
                    <>
                      <span>•</span>
                      <span>👁️ {activeStream.views.toLocaleString()} Views</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {activeStream.enable_chat && (
                  <button
                    onClick={() => setShowLiveChat(!showLiveChat)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition border ${showLiveChat ? 'bg-[#22c55e] text-slate-950 border-[#22c55e]' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{showLiveChat ? 'Hide Chat' : 'Live Chat'}</span>
                  </button>
                )}

                <button
                  onClick={handleReloadPlayer}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold transition"
                  title="Re-sync Stream"
                >
                  <RotateCcw className="h-4 w-4 text-[#22c55e]" />
                  <span>Re-Sync</span>
                </button>

                <button
                  onClick={handleToggleFullscreen}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold transition"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-[#22c55e]" /> : <Maximize2 className="h-4 w-4 text-[#22c55e]" />}
                  <span>{isFullscreen ? 'Exit' : 'Full Screen'}</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold transition"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-[#22c55e]" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                </button>

                <div className="flex items-center space-x-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                  <button onClick={() => handleSocialShare('whatsapp')} title="Share on WhatsApp" className="p-1.5 hover:bg-emerald-950 rounded text-emerald-400 transition">
                    📱
                  </button>
                  <button onClick={() => handleSocialShare('twitter')} title="Share on Twitter" className="p-1.5 hover:bg-slate-800 rounded text-sky-400 transition">
                    🐦
                  </button>
                  <button onClick={() => handleSocialShare('facebook')} title="Share on Facebook" className="p-1.5 hover:bg-blue-950 rounded text-blue-400 transition">
                    📘
                  </button>
                </div>
              </div>
            </div>

            {/* PLAYER + CHAT GRID */}
            <div className={`grid grid-cols-1 ${showLiveChat ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-4`}>
              
              {/* VIDEO PLAYER WINDOW */}
              <div className={`${showLiveChat ? 'lg:col-span-8' : 'w-full'} space-y-3`}>
                
                {/* PLAYER FRAME WRAPPER */}
                <div 
                  ref={playerContainerRef}
                  className="relative w-full aspect-video bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group select-none"
                >
                  {/* Spinner Loader while loading */}
                  {loadingPlayer && (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
                        Connecting to Live Cricket Broadcast...
                      </span>
                    </div>
                  )}

                  {/* 🛡️ TOP SPORTS ROOM BROADCAST HEADER & CLICK SHIELD */}
                  <div className="absolute top-0 left-0 right-0 h-11 sm:h-13 bg-gradient-to-b from-slate-950 via-slate-950/95 to-transparent z-25 pointer-events-auto px-3 sm:px-4 pt-1.5 flex items-center justify-between border-t border-emerald-500/20">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping shrink-0"></span>
                      <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider text-[#22c55e] drop-shadow">
                        THE SPORTS ROOM
                      </span>
                      <span className="hidden md:inline text-slate-500">•</span>
                      <span className="hidden md:inline text-[11px] font-mono text-slate-300 font-medium truncate max-w-sm">
                        {activeStream.tournament} — {activeStream.match_name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-950 text-[#22c55e] border border-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                        LIVE CRICKET
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        1080p 60FPS
                      </span>
                    </div>
                  </div>

                  {/* 🏷️ THE SPORTS ROOM OFFICIAL WATERMARK LOGO OVERLAY (Positioned by Admin with High-Stature Big Size) */}
                  <div
                    className={`absolute z-30 pointer-events-none select-none transition-all duration-300 ${
                      activeStream.logo_position === 'top-left'
                        ? 'top-12 left-3 sm:top-14 sm:left-4'
                        : activeStream.logo_position === 'bottom-left'
                        ? 'bottom-12 left-3 sm:bottom-14 sm:left-4'
                        : activeStream.logo_position === 'bottom-right'
                        ? 'bottom-12 right-3 sm:bottom-14 sm:right-4'
                        : 'top-12 right-3 sm:top-14 sm:right-4'
                    }`}
                  >
                    <div className={`bg-slate-950/95 backdrop-blur-md flex items-center shadow-2xl transition-all duration-200 ${
                      activeStream.logo_size === 'small'
                        ? 'border border-emerald-500/40 px-3 py-1.5 rounded-xl space-x-2'
                        : activeStream.logo_size === 'medium'
                        ? 'border border-emerald-500/50 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl space-x-2.5 shadow-emerald-950/40'
                        : 'border-2 border-emerald-500/70 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl space-x-3 shadow-[0_10px_35px_rgba(0,0,0,0.9)] ring-2 ring-[#22c55e]/25'
                    }`}>
                      {/* Live Green Pulsing Beacon */}
                      <div className="relative flex items-center justify-center shrink-0">
                        <span className={`${activeStream.logo_size === 'small' ? 'w-2.5 h-2.5' : activeStream.logo_size === 'medium' ? 'w-3 h-3' : 'w-3.5 h-3.5'} rounded-full bg-[#22c55e] animate-ping absolute opacity-75`}></span>
                        <span className={`${activeStream.logo_size === 'small' ? 'w-2 h-2' : activeStream.logo_size === 'medium' ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-[#22c55e] relative`}></span>
                      </div>

                      {activeStream.logo_type === 'custom' && activeStream.custom_logo_url ? (
                        <img
                          src={activeStream.custom_logo_url}
                          alt="The Sports Room"
                          className={`${activeStream.logo_size === 'small' ? 'h-5 max-w-[130px]' : activeStream.logo_size === 'medium' ? 'h-7 sm:h-8 max-w-[180px]' : 'h-8 sm:h-11 max-w-[220px]'} object-contain drop-shadow`}
                        />
                      ) : activeStream.logo_type === 'emblem' ? (
                        <div className="flex items-center space-x-2">
                          <Shield className={`${activeStream.logo_size === 'small' ? 'h-4 w-4' : activeStream.logo_size === 'medium' ? 'h-5 w-5' : 'h-6 w-6 sm:h-7 sm:w-7'} text-[#22c55e] fill-emerald-500/20`} />
                          <span className={`font-display font-black uppercase tracking-wider text-white ${
                            activeStream.logo_size === 'small' ? 'text-xs' : activeStream.logo_size === 'medium' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'
                          }`}>
                            THE SPORTS ROOM
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2.5">
                          <span className={`font-display font-black uppercase tracking-wider text-white ${
                            activeStream.logo_size === 'small' ? 'text-xs' : activeStream.logo_size === 'medium' ? 'text-xs sm:text-sm md:text-base' : 'text-sm sm:text-base md:text-lg'
                          }`}>
                            THE SPORTS ROOM
                          </span>
                          <span className={`bg-[#22c55e] text-slate-950 font-mono font-black rounded shadow-md uppercase tracking-wider ${
                            activeStream.logo_size === 'small' ? 'text-[10px] px-1.5 py-0.5' : activeStream.logo_size === 'medium' ? 'text-xs px-2 py-0.5' : 'text-xs sm:text-sm px-2.5 py-1'
                          }`}>
                            LIVE HD
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 📺 EMBEDDED IFRAME WITH CLEAN OVERSCAN CROP (Crops top external title/channel and bottom external links) */}
                  <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
                    <iframe
                      key={`${activeStream.id}-${playerKey}`}
                      src={activeStream.embed_url}
                      title="The Sports Room Live Match Broadcast"
                      onLoad={() => setLoadingPlayer(false)}
                      className="absolute left-0 w-full h-[126%] -top-[13%] border-0 pointer-events-auto select-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* 🎮 BOTTOM CUSTOM SPORTS ROOM BROADCAST CONTROL BAR & SHIELD */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-25 pointer-events-auto px-3 sm:px-4 pb-1.5 flex items-center justify-between border-b border-emerald-500/20">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>LIVE</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[150px] sm:max-w-xs">
                        {activeStream.team_one} vs {activeStream.team_two}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleReloadPlayer}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
                        title="Re-sync Broadcast"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-[#22c55e]" />
                      </button>
                      <button
                        onClick={handleToggleFullscreen}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
                        title="Toggle Fullscreen"
                      >
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-[#22c55e]" /> : <Maximize2 className="h-3.5 w-3.5 text-[#22c55e]" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stream Description & Match Info Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#22c55e]" />
                      <span>About This Match Stream</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#22c55e] bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                      Official HD Stream
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeStream.description}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Live Match Center • Free HD Access on The Sports Room</span>
                    </div>
                    <span className="text-slate-500">Auto-Refreshed Live Feed</span>
                  </div>
                </div>
              </div>

              {/* SIDE LIVE CHAT */}
              {showLiveChat && (
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex flex-col shadow-2xl">
                  <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-[#22c55e] animate-pulse" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live Match Chat</span>
                    </div>
                    <button
                      onClick={() => setShowLiveChat(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="flex-1 w-full bg-slate-950 flex flex-col justify-between p-4">
                    <div className="space-y-3 overflow-y-auto">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 font-mono">
                        <span className="text-[#22c55e] font-bold block mb-1">📢 Match Room Moderator:</span>
                        Welcome to The Sports Room live match stream! Share your predictions and reactions respectfully.
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono text-center pt-8">
                        Match conversation active with {activeStream.views ? Math.round(activeStream.views / 25) : '150+'} sports fans online.
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Type a reaction..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
                      />
                      <button className="bg-[#22c55e] text-slate-950 font-bold px-3 py-2 rounded-xl text-xs">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE PLACEHOLDER */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-[#22c55e]">
              <Tv className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight">No Active Stream Matches Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              There are currently no streams matching your selected filter. Clear your search or check our upcoming sports schedule below.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
              className="bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* AdSense Placement */}
        <AdSensePlaceholder slot="live-stream-mid" format="horizontal" />

        {/* MORE LIVE STREAMS GRID */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                <Tv className="h-6 w-6 text-[#22c55e]" />
                <span>More Live & Upcoming Sports Matches</span>
              </h3>
              <p className="text-xs text-slate-400">
                Select any match to switch the main live video stream immediately.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Showing {filteredStreams.length} of {streams.length} Matches
            </span>
          </div>

          {filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStreams.map((stream) => {
                const isCurrent = activeStream?.id === stream.id;
                return (
                  <motion.div
                    key={stream.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleSelectStream(stream)}
                    className={`bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition duration-200 group flex flex-col justify-between shadow-xl ${isCurrent ? 'border-[#22c55e] ring-2 ring-[#22c55e]/20 bg-slate-900/95' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div>
                      {/* Card Thumbnail Container */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden">
                        <img
                          src={stream.thumbnail || 'https://images.unsplash.com/photo-1540747737956-378724044282?w=800&auto=format&fit=crop&q=80'}
                          alt={`${stream.title} - The Sports Room Live Match Stream`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                        {/* Top Badges Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          {/* Quality Tag */}
                          <span className="bg-slate-950/90 text-white border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow">
                            HD Stream
                          </span>

                          {/* Status Badge */}
                          {stream.status === 'active' ? (
                            <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1 shadow">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                              <span>LIVE NOW</span>
                            </span>
                          ) : stream.status === 'upcoming' ? (
                            <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow">
                              UPCOMING
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                              ENDED
                            </span>
                          )}
                        </div>

                        {/* Play Icon Center Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-slate-950/40">
                          <div className="w-12 h-12 rounded-full bg-[#22c55e] text-slate-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition">
                            <Play className="h-6 w-6 fill-current ml-1" />
                          </div>
                        </div>

                        {/* Teams Banner at bottom of thumbnail */}
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white">
                          <span>{stream.team_one}</span>
                          <span className="text-[#22c55e]">VS</span>
                          <span>{stream.team_two}</span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-wider block">
                          {stream.tournament}
                        </span>
                        <h4 className="text-sm font-bold font-display text-slate-100 group-hover:text-[#22c55e] transition line-clamp-2 leading-tight">
                          {stream.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                          {stream.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Card Footer */}
                    <div className="p-4 pt-0 flex items-center justify-between text-xs font-mono border-t border-slate-800/60 mt-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(stream.stream_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <button
                        onClick={() => handleSelectStream(stream)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 transition ${isCurrent ? 'bg-[#22c55e] text-slate-950' : 'bg-slate-800 text-slate-200 group-hover:bg-[#22c55e] group-hover:text-slate-950'}`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{isCurrent ? 'Watching Now' : 'Watch Stream'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
              No additional matches match your criteria.
            </div>
          )}
        </div>

        {/* BOTTOM INFORMATIONAL BRANDING CARD */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black font-display text-white uppercase tracking-tight">
              Want to Broadcast a Match on The Sports Room?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Organizers and sports broadcasters can submit match live stream links directly to our editorial team for listing on the official match center.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/contact-us')}
            className="bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition shrink-0 shadow-lg"
          >
            Submit Stream Request
          </button>
        </div>
      </div>
    </div>
  );
}
