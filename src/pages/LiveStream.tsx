import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Radio, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Play, 
  AlertCircle,
  TrendingUp,
  Sparkles
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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'youtube' | 'facebook' | 'streamyard'>('all');
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
    DB.incrementStreamViews(stream.id);
    window.scrollTo({ top: 120, behavior: 'smooth' });
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

  // Filter Streams
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = searchQuery === '' || 
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.tournament.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.match_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.team_one.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.team_two.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === 'all' || stream.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'all' || stream.status === selectedStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
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
                  <span>Official Stream Network</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeCount} Live Now • {upcomingCount} Scheduled
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tight flex items-center gap-3">
                <Radio className="h-8 w-8 text-[#22c55e] animate-pulse shrink-0" />
                <span>Live Sports Streaming</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                Watch official embedded Tamasha Live, StreamYard, YouTube Live, and Facebook Live sports broadcasts directly on <strong className="text-[#22c55e]">The Sports Room</strong>. High-definition match streams for Cricket, Football, Formula 1, Tennis, and Basketball.
              </p>
            </div>

            {/* Platform Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono font-bold text-slate-200">Tamasha Live</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs font-mono font-bold text-slate-200">YouTube</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs font-mono font-bold text-slate-200">Facebook</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                <span className="text-xs font-mono font-bold text-slate-200">StreamYard</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-xl">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search match, tournament, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e] transition"
              />
            </div>

            {/* Platform Filter */}
            <div className="md:col-span-4 flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedPlatform === 'all' ? 'bg-[#22c55e] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedPlatform('tamasha')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedPlatform === 'tamasha' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Tamasha
              </button>
              <button
                onClick={() => setSelectedPlatform('youtube')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedPlatform === 'youtube' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                YouTube
              </button>
              <button
                onClick={() => setSelectedPlatform('facebook')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedPlatform === 'facebook' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Facebook
              </button>
              <button
                onClick={() => setSelectedPlatform('streamyard')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${selectedPlatform === 'streamyard' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                StreamYard
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
                      <span>UPCOMING STREAM</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      <span>STREAM ENDED</span>
                    </span>
                  )}

                  {/* Tournament Tag */}
                  <span className="bg-emerald-950 text-[#22c55e] border border-emerald-850 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase">
                    {activeStream.tournament}
                  </span>

                  {/* Platform Tag */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-white ${activeStream.platform === 'youtube' ? 'bg-red-600' : activeStream.platform === 'tamasha' ? 'bg-emerald-600' : activeStream.platform === 'streamyard' ? 'bg-teal-600' : 'bg-blue-600'}`}>
                    {activeStream.platform === 'youtube' ? 'YouTube Live' : activeStream.platform === 'tamasha' ? 'Tamasha Live' : activeStream.platform === 'streamyard' ? 'StreamYard' : 'Facebook Live'}
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
                {activeStream.platform === 'youtube' && activeStream.enable_chat && (
                  <button
                    onClick={() => setShowLiveChat(!showLiveChat)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition border ${showLiveChat ? 'bg-[#22c55e] text-slate-950 border-[#22c55e]' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{showLiveChat ? 'Hide Live Chat' : 'Show Live Chat'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold transition"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-[#22c55e]" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Stream'}</span>
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
            <div className={`grid grid-cols-1 ${showLiveChat && activeStream.platform === 'youtube' ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-4`}>
              
              {/* VIDEO PLAYER WINDOW */}
              <div className={`${showLiveChat && activeStream.platform === 'youtube' ? 'lg:col-span-8' : 'w-full'} space-y-3`}>
                <div className="relative w-full aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                  
                  {/* Spinner Loader while loading */}
                  {loadingPlayer && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
                        Connecting to {activeStream.platform === 'youtube' ? 'YouTube Live Server' : activeStream.platform === 'tamasha' ? 'Tamasha Stream Server' : activeStream.platform === 'streamyard' ? 'StreamYard Studio' : 'Facebook Live Plugin'}...
                      </span>
                    </div>
                  )}

                  {/* EMBEDDED IFRAME */}
                  <iframe
                    key={activeStream.id}
                    src={activeStream.embed_url}
                    title={activeStream.title}
                    onLoad={() => setLoadingPlayer(false)}
                    className="w-full h-full border-0 rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Stream Description & Disclaimer Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#22c55e]" />
                      <span>About This Match Stream</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">Official Third-Party Embed</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeStream.description}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>Verified Stream Source • Free HD Access on The Sports Room</span>
                    </div>
                    <a
                      href={activeStream.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-300 hover:text-[#22c55e] transition underline"
                    >
                      <span>Open on {activeStream.platform === 'youtube' ? 'YouTube' : activeStream.platform === 'tamasha' ? 'Tamasha' : activeStream.platform === 'streamyard' ? 'StreamYard' : 'Facebook'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* SIDE LIVE CHAT (YouTube Only when enabled) */}
              {showLiveChat && activeStream.platform === 'youtube' && (
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex flex-col shadow-2xl">
                  <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">YouTube Live Chat</span>
                    </div>
                    <button
                      onClick={() => setShowLiveChat(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="flex-1 w-full bg-slate-950">
                    <iframe
                      src={`https://www.youtube.com/live_chat?v=${activeStream.embed_url.split('/embed/')[1] || ''}&embed_domain=${window.location.hostname}`}
                      title="YouTube Live Chat"
                      className="w-full h-full border-0"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE PLACEHOLDER WHEN NO STREAM MATCHES FILTERS */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-[#22c55e]">
              <Tv className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight">No Active Stream Matches Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              There are currently no streams matching your selected filter. Clear your search or check our upcoming sports schedule below.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedPlatform('all'); setSelectedStatus('all'); }}
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
                <span>More Live & Upcoming Sports Streams</span>
              </h3>
              <p className="text-xs text-slate-400">
                Select any match to switch the main live video stream immediately.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Showing {filteredStreams.length} of {streams.length} Streams
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
                          {/* Platform Badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white shadow ${stream.platform === 'youtube' ? 'bg-red-600' : stream.platform === 'tamasha' ? 'bg-emerald-600' : stream.platform === 'streamyard' ? 'bg-teal-600' : 'bg-blue-600'}`}>
                            {stream.platform === 'youtube' ? 'YouTube' : stream.platform === 'tamasha' ? 'Tamasha' : stream.platform === 'streamyard' ? 'StreamYard' : 'Facebook'}
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
              No additional streams match your criteria.
            </div>
          )}
        </div>

        {/* BOTTOM INFORMATIONAL BRANDING CARD */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black font-display text-white uppercase tracking-tight">
              Want to Broadcast a Match Stream on The Sports Room?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Organizers and sports broadcasters can submit official YouTube or Facebook Live stream links directly to our editorial team for live listing.
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
