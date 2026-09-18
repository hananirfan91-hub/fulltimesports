
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
  Shield,
  ExternalLink
} from 'lucide-react';
import { LiveStreamItem } from '../types';
import { DB } from '../lib/db';
import { getPlayableStreamEmbedUrl } from '../lib/streamEmbed';
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
  const [mediaMode, setMediaMode] = useState<'live' | 'highlights'>('live');

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

  useEffect(() => {
    if (activeStream?.status === 'ended' && (activeStream.highlight_embed_url || activeStream.highlight_url)) {
      setMediaMode('highlights');
    } else {
      setMediaMode('live');
    }
  }, [activeStream?.id, activeStream?.status, activeStream?.highlight_url]);

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
      setActiveStream(prev => {
        if (prev && list.some(s => s.id === prev.id)) {
          return list.find(s => s.id === prev.id) || null;
        }
        const featured = list.find(s => s.is_featured && s.status === 'active') || list.find(s => s.status === 'active') || list[0];
        return featured || null;
      });
    } else {
      setActiveStream(null);
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
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-[#22c55e] selection:text-slate-950">
      {/* Dynamic Structured JSON-LD Data for SEO Crawlers (WebPage, BreadcrumbList, FAQPage & VideoObject) */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://thesportsroom.online/live-stream#webpage",
            "name": "Live Sports Streaming | Cricket, Football & More",
            "description": "Watch live sports online with The Sports Room. Find cricket, football, basketball, tennis, F1 and more with live match updates.",
            "url": "https://thesportsroom.online/live-stream",
            "isPartOf": {
              "@id": "https://thesportsroom.online/#website"
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
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "@id": "https://thesportsroom.online/live-stream#breadcrumb",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://thesportsroom.online/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Live Streams",
                "item": "https://thesportsroom.online/live-stream"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": "https://thesportsroom.online/live-stream#faq",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How can I watch live sports on The Sports Room?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can watch live sports directly on this page by selecting any active match card from the list. The player will load the official live stream embed or broadcast link automatically."
                }
              },
              {
                "@type": "Question",
                "name": "What sports are available for live streaming?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Sports Room features live streams and match updates for cricket, football, Formula 1, tennis, basketball, and field hockey whenever official broadcasts or embed feeds are active."
                }
              },
              {
                "@type": "Question",
                "name": "Is live sports streaming free on The Sports Room?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, accessing the live match player, live scorecards, match analysis, and community chat on The Sports Room is completely free."
                }
              },
              {
                "@type": "Question",
                "name": "What should I do if a stream does not play?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "If a stream appears blank or shows a playback notice, click the \"Re-sync Broadcast\" button or use the \"Open Live Player\" button to view the broadcast directly on the provider's platform."
                }
              },
              {
                "@type": "Question",
                "name": "How often are live match streams updated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The live match list and streaming feeds are updated continuously before and during every scheduled match day."
                }
              }
            ]
          },
          ...(activeStream ? [{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": activeStream.title,
            "description": activeStream.description,
            "thumbnailUrl": activeStream.thumbnail || "https://thesportsroom.online/logo-preview.png",
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
          }] : [])
        ])}
      </script>

      {/* TOP HEADER & BREADCRUMB SECTION (REAL HTML H1 & VISIBLE BREADCRUMBS) */}
      <div className="max-w-7xl mx-auto pt-3 sm:pt-5 pb-2 px-4 md:px-6">
        <nav aria-label="Breadcrumb" className="mb-2 text-xs font-mono">
          <ol className="flex items-center space-x-2 text-slate-400">
            <li>
              <a 
                href="/" 
                onClick={(e) => { e.preventDefault(); onNavigate('/'); }} 
                className="hover:text-[#22c55e] transition"
              >
                Home
              </a>
            </li>
            <li><span className="text-slate-600">/</span></li>
            <li>
              <span className="text-[#22c55e] font-semibold" aria-current="page">
                Live Streams
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight uppercase">
              Live Sports Streaming
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1 font-sans">
              Watch live sports online with The Sports Room. Find cricket, football, basketball, tennis, F1 and more with live match updates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center space-x-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>{activeCount} Live Now</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-300">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{upcomingCount} Upcoming</span>
            </span>
          </div>
        </div>
      </div>

      {/* TOP BROADCAST SECTION (PLAYER DIRECTLY AT TOP WITH 95VW MOBILE COVERAGE) */}
      <div className="w-[95vw] sm:w-full max-w-7xl mx-auto pt-2 sm:pt-3 pb-3 px-1 sm:px-4 md:px-6">
        <div className="space-y-4">
          
          {/* MAIN EMBEDDED PLAYER CONTAINER */}
          {activeStream ? (
            <div className="space-y-3 sm:space-y-4">
              
              {/* TOP MATCH STATUS BAR ON MOBILE & DESKTOP */}
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {activeStream.status === 'active' ? (
                      <span className="inline-flex items-center space-x-1.5 bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>🔴 LIVE NOW</span>
                      </span>
                    ) : activeStream.status === 'upcoming' ? (
                      <span className="inline-flex items-center space-x-1.5 bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>UPCOMING MATCH</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider">
                        <span>MATCH ENDED</span>
                      </span>
                    )}

                    {/* Highlights Active Tag */}
                    {activeStream.highlight_url && (
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase flex items-center space-x-1">
                        <span>🎬 Highlights Ready</span>
                      </span>
                    )}

                    {/* Tournament Tag */}
                    <span className="bg-emerald-950 text-[#22c55e] border border-emerald-850 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase">
                      {activeStream.tournament}
                    </span>

                    {/* Stream Quality Tag */}
                    <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase hidden sm:inline">
                      1080p HD Broadcast
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-display text-white tracking-tight leading-tight pt-1">
                    {activeStream.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="text-slate-200 font-bold">🏆 {activeStream.match_name}</span>
                    <span>•</span>
                    <span className="text-[#22c55e] font-bold">⚔️ {activeStream.team_one} vs {activeStream.team_two}</span>
                    {activeStream.views !== undefined && (
                      <>
                        <span>•</span>
                        <span>👁️ {activeStream.views.toLocaleString()} Viewers</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons & Highlights Switch */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 md:pt-0">
                  {/* Highlights vs Stream Switch */}
                  {activeStream.highlight_url && (
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
                      <button
                        onClick={() => {
                          setMediaMode('highlights');
                          setLoadingPlayer(true);
                          setPlayerKey(Date.now());
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition cursor-pointer ${
                          mediaMode === 'highlights'
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🎬 Highlights</span>
                      </button>
                      <button
                        onClick={() => {
                          setMediaMode('live');
                          setLoadingPlayer(true);
                          setPlayerKey(Date.now());
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition cursor-pointer ${
                          mediaMode === 'live'
                            ? 'bg-[#22c55e] text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>📡 Full Stream</span>
                      </button>
                    </div>
                  )}

                  {activeStream.video_url && (
                    <a
                      href={mediaMode === 'highlights' && activeStream.highlight_url ? activeStream.highlight_url : activeStream.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border shadow-sm ${
                        mediaMode === 'highlights'
                          ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-400/40'
                          : activeStream.platform === 'facebook' || activeStream.video_url.includes('facebook') || activeStream.video_url.includes('fb.watch')
                          ? 'bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-blue-400/40'
                          : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-700/50'
                      }`}
                      title="Open Direct Match Stream"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{mediaMode === 'highlights' ? 'Watch Highlights on YT' : (activeStream.platform === 'facebook' || activeStream.video_url.includes('facebook') ? 'Watch on Facebook HD' : 'Open Source Stream')}</span>
                    </a>
                  )}

                  {activeStream.enable_chat && activeStream.status === 'active' && (
                    <button
                      onClick={() => setShowLiveChat(!showLiveChat)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${showLiveChat ? 'bg-[#22c55e] text-slate-950 border-[#22c55e]' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'}`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{showLiveChat ? 'Hide Chat' : 'Live Chat'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleReloadPlayer}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    title="Re-sync Stream"
                  >
                    <RotateCcw className="h-4 w-4 text-[#22c55e]" />
                    <span>Re-Sync</span>
                  </button>

                  <button
                    onClick={handleToggleFullscreen}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4 text-[#22c55e]" /> : <Maximize2 className="h-4 w-4 text-[#22c55e]" />}
                    <span>{isFullscreen ? 'Exit' : 'Full Screen'}</span>
                  </button>

                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    title="Copy Share Link"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-[#22c55e]" /> : <Share2 className="h-4 w-4 text-[#22c55e]" />}
                    <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                  </button>

                  <div className="flex items-center space-x-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button onClick={() => handleSocialShare('whatsapp')} title="Share on WhatsApp" className="p-1.5 hover:bg-emerald-950 rounded text-emerald-400 transition cursor-pointer">
                      📱
                    </button>
                    <button onClick={() => handleSocialShare('twitter')} title="Share on Twitter" className="p-1.5 hover:bg-slate-800 rounded text-sky-400 transition cursor-pointer">
                      🐦
                    </button>
                    <button onClick={() => handleSocialShare('facebook')} title="Share on Facebook" className="p-1.5 hover:bg-blue-950 rounded text-blue-400 transition cursor-pointer">
                      📘
                    </button>
                  </div>
                </div>
              </div>

              {/* POST-MATCH CONCLUDED HIGHLIGHTS BANNER */}
              {activeStream.status === 'ended' && (
                <div className="bg-amber-950/70 border border-amber-800/80 rounded-2xl p-3.5 sm:p-4 text-xs font-mono shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">🎬</span>
                    <div>
                      <div className="text-amber-300 font-bold uppercase flex items-center gap-2">
                        <span>Match Concluded</span>
                        {activeStream.highlight_url ? (
                          <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                            {mediaMode === 'highlights' ? 'PLAYING HIGHLIGHTS' : 'HIGHLIGHTS READY'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-normal">
                            Full Match Archive
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                        {activeStream.highlight_url
                          ? (mediaMode === 'highlights' ? "Now playing official post-match YouTube highlights." : "Full match recording loaded. Click 'Watch YT Highlights' to switch to post-match highlights.")
                          : "The live broadcast has ended. The match recording is available in the player below."}
                      </p>
                    </div>
                  </div>

                  {activeStream.highlight_url && (
                    <button
                      onClick={() => {
                        setMediaMode(mediaMode === 'highlights' ? 'live' : 'highlights');
                        setLoadingPlayer(true);
                        setPlayerKey(Date.now());
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono flex items-center space-x-1.5 transition shadow shrink-0 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{mediaMode === 'highlights' ? 'Watch Full Broadcast' : 'Watch YT Highlights'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* PLAYER + CHAT GRID */}
              <div className={`grid grid-cols-1 ${showLiveChat ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-4`}>
                
                {/* VIDEO PLAYER WINDOW (95VW ON MOBILE) */}
                <div className={`${showLiveChat ? 'lg:col-span-8' : 'w-full'} space-y-3`}>
                  
                  {/* PLAYER FRAME WRAPPER */}
                  <div 
                    ref={playerContainerRef}
                    className="relative w-full aspect-video bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl group select-none"
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

                    {/* 🏷️ THE SPORTS ROOM OFFICIAL WATERMARK LOGO OVERLAY (Positioned by Admin with Extra Big Sizes) */}
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
                          ? 'border border-emerald-500/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl space-x-2'
                          : activeStream.logo_size === 'medium'
                          ? 'border border-emerald-500/50 px-3.5 py-1.5 sm:px-4.5 sm:py-2.5 rounded-xl space-x-2.5 shadow-emerald-950/40'
                          : activeStream.logo_size === 'large'
                          ? 'border-2 border-emerald-500/70 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl space-x-3 shadow-[0_10px_35px_rgba(0,0,0,0.9)] ring-2 ring-[#22c55e]/25'
                          : activeStream.logo_size === 'giant'
                          ? 'border-3 border-[#22c55e] px-5 py-3 sm:px-7 sm:py-4 rounded-3xl space-x-4 shadow-[0_15px_45px_rgba(0,0,0,0.95)] ring-4 ring-[#22c55e]/30 scale-105 sm:scale-115'
                          : 'border-2 border-[#22c55e] px-4.5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl space-x-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] ring-2 ring-[#22c55e]/35'
                      }`}>
                        {/* Live Green Pulsing Beacon */}
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className={`${
                            activeStream.logo_size === 'small' 
                              ? 'w-2 h-2' 
                              : activeStream.logo_size === 'medium' 
                              ? 'w-2.5 h-2.5' 
                              : activeStream.logo_size === 'giant'
                              ? 'w-4 h-4'
                              : 'w-3.5 h-3.5'
                          } rounded-full bg-[#22c55e] animate-ping absolute opacity-75`}></span>
                          <span className={`${
                            activeStream.logo_size === 'small' 
                              ? 'w-1.5 h-1.5' 
                              : activeStream.logo_size === 'medium' 
                              ? 'w-2 h-2' 
                              : activeStream.logo_size === 'giant'
                              ? 'w-3.5 h-3.5'
                              : 'w-3 h-3'
                          } rounded-full bg-[#22c55e] relative`}></span>
                        </div>

                        {activeStream.logo_type === 'custom' && activeStream.custom_logo_url ? (
                          <img
                            src={activeStream.custom_logo_url}
                            alt="The Sports Room"
                            className={`${
                              activeStream.logo_size === 'small'
                                ? 'h-4 sm:h-5 max-w-[120px]'
                                : activeStream.logo_size === 'medium'
                                ? 'h-6 sm:h-8 max-w-[170px]'
                                : activeStream.logo_size === 'large'
                                ? 'h-8 sm:h-11 max-w-[220px]'
                                : activeStream.logo_size === 'giant'
                                ? 'h-11 sm:h-16 max-w-[300px]'
                                : 'h-9 sm:h-13 max-w-[250px]'
                            } object-contain drop-shadow`}
                          />
                        ) : activeStream.logo_type === 'emblem' ? (
                          <div className="flex items-center space-x-2">
                            <Shield className={`${
                              activeStream.logo_size === 'small'
                                ? 'h-3.5 w-3.5'
                                : activeStream.logo_size === 'medium'
                                ? 'h-5 w-5'
                                : activeStream.logo_size === 'large'
                                ? 'h-6 w-6 sm:h-7 sm:w-7'
                                : activeStream.logo_size === 'giant'
                                ? 'h-8 w-8 sm:h-10 sm:w-10'
                                : 'h-7 w-7 sm:h-8 sm:w-8'
                            } text-[#22c55e] fill-emerald-500/20`} />
                            <span className={`font-display font-black uppercase tracking-wider text-white ${
                              activeStream.logo_size === 'small'
                                ? 'text-[11px]'
                                : activeStream.logo_size === 'medium'
                                ? 'text-xs sm:text-sm'
                                : activeStream.logo_size === 'large'
                                ? 'text-sm sm:text-base md:text-lg'
                                : activeStream.logo_size === 'giant'
                                ? 'text-base sm:text-xl md:text-2xl font-extrabold tracking-widest'
                                : 'text-sm sm:text-lg md:text-xl font-extrabold'
                            }`}>
                              THE SPORTS ROOM
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className={`font-display font-black uppercase tracking-wider text-white ${
                              activeStream.logo_size === 'small'
                                ? 'text-[11px]'
                                : activeStream.logo_size === 'medium'
                                ? 'text-xs sm:text-sm'
                                : activeStream.logo_size === 'large'
                                ? 'text-sm sm:text-base md:text-lg'
                                : activeStream.logo_size === 'giant'
                                ? 'text-base sm:text-xl md:text-2xl font-extrabold tracking-widest'
                                : 'text-sm sm:text-lg md:text-xl font-extrabold'
                            }`}>
                              THE SPORTS ROOM
                            </span>
                            <span className={`bg-[#22c55e] text-slate-950 font-mono font-black rounded shadow-md uppercase tracking-wider ${
                              activeStream.logo_size === 'small'
                                ? 'text-[9px] px-1.5 py-0.5'
                                : activeStream.logo_size === 'medium'
                                ? 'text-[11px] px-2 py-0.5'
                                : activeStream.logo_size === 'large'
                                ? 'text-xs sm:text-sm px-2.5 py-1'
                                : activeStream.logo_size === 'giant'
                                ? 'text-xs sm:text-base px-3 py-1.5'
                                : 'text-xs sm:text-sm px-3 py-1'
                            }`}>
                              LIVE HD
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 📺 EMBEDDED IFRAME WITH OPTIMIZED VIEWING */}
                    <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
                      <iframe
                        key={`${activeStream.id}-${mediaMode}-${playerKey}`}
                        src={getPlayableStreamEmbedUrl(
                          mediaMode === 'highlights' && (activeStream.highlight_embed_url || activeStream.highlight_url)
                            ? (activeStream.highlight_embed_url || activeStream.highlight_url)
                            : (activeStream.embed_url || activeStream.video_url),
                          activeStream.platform,
                          activeStream.autoplay !== false
                        )}
                        title={mediaMode === 'highlights' ? "Post-Match Highlights Broadcast" : "The Sports Room Live Match Broadcast"}
                        onLoad={() => setLoadingPlayer(false)}
                        className="absolute inset-0 w-full h-full border-0 pointer-events-auto select-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      ></iframe>
                    </div>

                    {/* 🎮 BOTTOM CUSTOM SPORTS ROOM BROADCAST CONTROL BAR & SHIELD */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-25 pointer-events-auto px-3 sm:px-4 pb-1.5 flex items-center justify-between border-b border-emerald-500/20">
                      <div className="flex items-center space-x-2">
                        {mediaMode === 'highlights' ? (
                          <div className="flex items-center space-x-1.5 bg-amber-950/90 border border-amber-600/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>HIGHLIGHTS</span>
                          </div>
                        ) : activeStream.status === 'active' ? (
                          <div className="flex items-center space-x-1.5 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span>LIVE</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300">
                            <span>REPLAY</span>
                          </div>
                        )}
                        <span className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[140px] sm:max-w-xs">
                          {activeStream.team_one} vs {activeStream.team_two}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {(mediaMode === 'highlights' ? (activeStream.highlight_url || activeStream.video_url) : activeStream.video_url) && (
                          <a
                            href={mediaMode === 'highlights' ? (activeStream.highlight_url || activeStream.video_url) : activeStream.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-slate-900/90 border border-emerald-800/60 px-2 py-1 rounded-lg transition"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>{mediaMode === 'highlights' ? 'YouTube' : 'HD Popout'}</span>
                          </a>
                        )}
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

                  {/* Facebook / Third-Party Stream Playback Fallback Assistant */}
                  {(activeStream.platform === 'facebook' || activeStream.video_url.includes('facebook') || activeStream.video_url.includes('fb.watch')) && (
                    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-800/60 rounded-2xl p-3.5 sm:p-4 text-xs font-mono shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0"></span>
                          <span className="font-bold text-blue-300 uppercase">
                            Facebook Live Stream HD Broadcast
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">
                          If Facebook displays <span className="text-amber-300 font-semibold font-mono">"Video unavailable"</span> inside the iframe due to Facebook privacy/share permissions, click the button to launch the live stream directly.
                        </p>
                      </div>

                      <a
                        href={activeStream.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Facebook Live Player</span>
                      </a>
                    </div>
                  )}

                  {/* Stream Description & Match Info Card */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 md:p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-slate-200 flex items-center gap-2">
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

          {/* SEARCH & CRICKET CATEGORY FILTER SECTION (POSITIONED RIGHT BELOW THE PLAYER) */}
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

      {/* ALL CRICKET & SPORTS MATCHES CARDS GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                <Tv className="h-6 w-6 text-[#22c55e]" />
                <span>More Live &amp; Upcoming Sports Matches</span>
              </h2>
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
                          ) : stream.highlight_url ? (
                            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase shadow flex items-center space-x-1">
                              <span>🎬 HIGHLIGHTS</span>
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                              ENDED
                            </span>
                          )}
                        </div>

                        {/* Play Icon Center Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-slate-950/40">
                          <div className={`w-12 h-12 rounded-full ${stream.highlight_url && stream.status === 'ended' ? 'bg-amber-400 text-slate-950' : 'bg-[#22c55e] text-slate-950'} flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition`}>
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
                        <h3 className="text-sm font-bold font-display text-slate-100 group-hover:text-[#22c55e] transition line-clamp-2 leading-tight">
                          {stream.title}
                        </h3>
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
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 transition ${
                          isCurrent 
                            ? 'bg-[#22c55e] text-slate-950' 
                            : stream.highlight_url && stream.status === 'ended'
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-slate-800 text-slate-200 group-hover:bg-[#22c55e] group-hover:text-slate-950'
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{isCurrent ? 'Watching Now' : (stream.highlight_url && stream.status === 'ended' ? 'Highlights' : 'Watch Stream')}</span>
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

          {/* BOTTOM INFORMATIONAL BROADCAST SUBMISSION BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
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

          {/* ========================================================================= */}
          {/* SEO SECTION 1: WATCH LIVE SPORTS ONLINE */}
          {/* ========================================================================= */}
          <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Watch Live Sports Online
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Follow live sports coverage from around the world on The Sports Room. Watch cricket matches, football games, tennis tournaments, basketball showdowns, and motorsport events in real time. Whether you want to follow international series, major league rivalries, or championship finals, The Sports Room provides match streaming embeds, live scorecards, and real-time updates for passionate sports fans.
            </p>
          </section>

          {/* ========================================================================= */}
          {/* SEO SECTIONS 2 & 3: CRICKET & FOOTBALL STREAMING */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🏏</span>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Live Cricket Streaming
                  </h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Cricket fans can track major tournaments and bilateral series across all formats—Test cricket, One Day Internationals (ODIs), and T20 leagues. Follow live matches from the ICC Cricket World Cup, ICC Champions Trophy, Asia Cup, Pakistan Super League (PSL), Indian Premier League (IPL), Big Bash League (BBL), and bilateral international series. Stay updated with ball-by-ball developments, batting strike rates, bowling figures, and live commentary feeds.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>ICC • PSL • IPL • Tests • ODIs • T20Is</span>
              </div>
            </section>

            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚽</span>
                  <h2 className="text-xl font-bold font-display text-white tracking-tight">
                    Live Football Streaming
                  </h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Catch live football matches from top domestic leagues and continental competitions across Europe and worldwide. Follow the UEFA Champions League, English Premier League (EPL), La Liga, Serie A, Bundesliga, and international fixtures including the FIFA World Cup and UEFA European Championship. Track live scores, goal alerts, lineup formations, and tactical match moments.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>EPL • UCL • La Liga • Serie A • FIFA</span>
              </div>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* SEO SECTIONS 4 & 5: LIVE MATCHES & LIVE UPDATES */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-lg">
              <div>
                <h2 className="text-xl font-bold font-display text-white tracking-tight">
                  Live Matches and Sports Events
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  The Sports Room covers a comprehensive lineup of global sporting events:
                </p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Cricket:</strong> ICC World Cup, PSL, IPL, Test Matches, ODIs, and T20 Internationals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Football:</strong> Premier League, UEFA Champions League, La Liga, Serie A, and International Friendlies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Formula 1:</strong> Grand Prix race weekends, qualifying sessions, and telemetry analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Tennis:</strong> Grand Slams (Wimbledon, US Open, Australian Open, Roland-Garros) and ATP/WTA tours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Basketball:</strong> NBA regular season games, playoffs, and international FIBA tournaments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span><strong className="text-white">Field Hockey:</strong> FIH Pro League, World Cup, and Asian Champions Trophy</span>
                </li>
              </ul>
            </section>

            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-lg">
              <div>
                <h2 className="text-xl font-bold font-display text-white tracking-tight">
                  Live Match Updates
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Get instant access to real-time sports information alongside video and audio broadcasts:
                </p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span>Live scorecards with real-time ball-by-ball tracking and milestone alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span>Embedded official streaming players from Facebook Live, YouTube, and verified broadcast partners</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span>Up-to-the-minute match schedules and start times in your local time zone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span>Tactical team analysis, key player statistics, and post-match breakdowns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22c55e] font-bold font-mono shrink-0">✓</span>
                  <span>Interactive fan chat room and live reaction features with sports enthusiasts worldwide</span>
                </li>
              </ul>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* SEO SECTION 6 & 7: FIND TODAY'S SPORTS & WHY FOLLOW */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-lg">
              <h2 className="text-xl font-bold font-display text-white tracking-tight">
                Find Today's Live Sports
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Use the match selector above to browse currently active broadcasts, upcoming fixtures, and recent match highlights. Filter matches by sport, tournament, or status to jump directly into the live broadcast of your favorite team.
              </p>
            </section>

            <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-lg">
              <h2 className="text-xl font-bold font-display text-white tracking-tight">
                Why Follow Live Sports on The Sports Room?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                The Sports Room brings fans closer to the action through verified live embeds, real-time sports telemetry, tactical analysis, and community engagement. Unlike generic streaming directories, The Sports Room combines live match feeds with human-authored editorial journalism, comprehensive sports science breakdowns, and community discussion boards.
              </p>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* SEO SECTION 8: FREQUENTLY ASKED QUESTIONS */}
          {/* ========================================================================= */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Common questions about streaming live sports and match center features on The Sports Room.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#22c55e] font-display">
                  How can I watch live sports on The Sports Room?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  You can watch live sports directly on this page by selecting any active match card from the list above. The player will load the official live stream embed or broadcast link automatically.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#22c55e] font-display">
                  What sports are available for live streaming?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  The Sports Room features live streams and match updates for cricket, football, Formula 1, tennis, basketball, and field hockey whenever official broadcasts or embed feeds are active.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#22c55e] font-display">
                  Is live sports streaming free on The Sports Room?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Yes, accessing the live match player, live scorecards, match analysis, and community chat on The Sports Room is completely free.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#22c55e] font-display">
                  What should I do if a stream does not play?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  If a stream appears blank or shows a playback notice, click the "Re-sync Broadcast" button or use the "Open Live Player" button to view the broadcast directly on the provider's platform.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#22c55e] font-display">
                  How often are live match streams updated?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  The live match list and streaming feeds are updated continuously before and during every scheduled match day.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SEO SECTION 9: STAY CONNECTED WITH THE SPORTS ROOM (INTERNAL LINKS) */}
          {/* ========================================================================= */}
          <section className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-900/60 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="border-b border-emerald-900/50 pb-3">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Stay Connected With The Sports Room
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Explore more sports coverage, daily quizzes, tournament hubs, and exclusive content across our platform:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <a
                href="/sport/cricket"
                onClick={(e) => { e.preventDefault(); onNavigate('/sport/cricket'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    🏏 Cricket News &amp; Articles
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Read today's sports analysis
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>

              <a
                href="/topic/cricket-world-cup-2027"
                onClick={(e) => { e.preventDefault(); onNavigate('/topic/cricket-world-cup-2027'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    🌍 Cricket World Cup 2027
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Schedules, hosts &amp; teams
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>

              <a
                href="/quiz"
                onClick={(e) => { e.preventDefault(); onNavigate('/quiz'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    ⚡ Daily Sports Quiz
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Play daily &amp; earn points
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>

              <a
                href="/leaderboard"
                onClick={(e) => { e.preventDefault(); onNavigate('/leaderboard'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    🏆 Monthly Leaderboard
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    View fan rankings &amp; badges
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>

              <a
                href="/rc24-apk-download"
                onClick={(e) => { e.preventDefault(); onNavigate('/rc24-apk-download'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    🎮 Real Cricket 24 APK
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Download latest RC24 APK
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>

              <a
                href="/about-us"
                onClick={(e) => { e.preventDefault(); onNavigate('/about-us'); }}
                className="p-3.5 bg-slate-950/80 hover:bg-[#022c22] border border-emerald-900/60 hover:border-[#22c55e] rounded-xl transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="block font-bold text-xs text-white group-hover:text-[#22c55e] transition">
                    📰 About The Sports Room
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Editorial team &amp; mission
                  </span>
                </div>
                <span className="text-emerald-400 group-hover:translate-x-1 transition font-bold font-mono text-sm">→</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }
