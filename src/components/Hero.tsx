import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, Tv, Newspaper, BarChart3, Radio, Play, ArrowRight } from 'lucide-react';
import { Post, HeroConfig, FanPoll } from '../types';
import { DB } from '../lib/db';
import { supabase } from '../lib/supabase';
import { getYouTubeId } from '../lib/videoUtils';

interface HeroProps {
  onNavigate: (path: string) => void;
}

// Generate browser fingerprint / user key for single-vote tracking
function getVoterKey(): string {
  if (typeof window === 'undefined') return 'anon-voter';
  let key = localStorage.getItem('fts_voter_key');
  if (!key) {
    key = `voter_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    localStorage.setItem('fts_voter_key', key);
  }
  return key;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => DB.getHeroConfig());
  const [allPosts, setAllPosts] = useState<Post[]>(() => DB.getPosts());
  const [activePoll, setActivePoll] = useState<FanPoll>(() => DB.getActivePoll());
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<'teamA' | 'draw' | 'teamB' | null>(null);
  const [voteSubmittedMsg, setVoteSubmittedMsg] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = () => {
      setHeroConfig(DB.getHeroConfig());
      setAllPosts(DB.getPosts());
      const poll = DB.getActivePoll();
      setActivePoll(poll);

      const voterKey = getVoterKey();
      if (poll && Array.isArray(poll.votedUserIds) && poll.votedUserIds.includes(voterKey)) {
        setHasVoted(true);
      }
    };

    handleSync();
    window.addEventListener('fts_db_sync', handleSync);

    // Subscribe to Supabase Realtime for instant fan poll updates across all active sessions
    const pollSubscription = supabase
      .channel('fts_fan_polls_hero_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fts_fan_polls' },
        (payload) => {
          if (payload.new) {
            const updatedPoll = DB.parseRemotePoll(payload.new);
            const localPolls = DB.getFanPolls();
            const idx = localPolls.findIndex(p => p.id === updatedPoll.id);
            if (idx >= 0) {
              localPolls[idx] = updatedPoll;
            } else {
              localPolls.unshift(updatedPoll);
            }
            localStorage.setItem('fts_fan_polls', JSON.stringify(localPolls));

            if (updatedPoll.status === 'active') {
              setActivePoll(updatedPoll);
            }
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('fts_db_sync', handleSync);
      supabase.removeChannel(pollSubscription);
    };
  }, []);

  useEffect(() => {
    const voterKey = getVoterKey();
    if (activePoll && Array.isArray(activePoll.votedUserIds) && activePoll.votedUserIds.includes(voterKey)) {
      setHasVoted(true);
    } else {
      setHasVoted(false);
    }
  }, [activePoll]);

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

  // Vote Handler
  const handleVote = async (option: 'teamA' | 'draw' | 'teamB') => {
    if (hasVoted || !activePoll) return;
    const voterKey = getVoterKey();
    setSelectedOption(option);
    const updated = await DB.voteFanPoll(activePoll.id, option, voterKey);
    setActivePoll(updated);
    setHasVoted(true);
    setVoteSubmittedMsg(true);
  };

  // Percentages Calculation
  const totalVotes = activePoll?.totalVotes || 0;
  const teamAPercent = totalVotes > 0 ? Math.round((activePoll.teamAVotes / totalVotes) * 100) : 0;
  const teamBPercent = totalVotes > 0 ? Math.round((activePoll.teamBVotes / totalVotes) * 100) : 0;
  const drawPercent = (activePoll?.enableDraw && totalVotes > 0) 
    ? Math.max(0, 100 - teamAPercent - teamBPercent) 
    : 0;

  // JSON-LD Structured Data Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        "name": "The Sports Room",
        "url": "https://thesportsroom.org",
        "logo": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=200&q=80",
        "description": "High-precision live match streams, sports news, and tactical telemetry across Football, Cricket, F1, and Basketball."
      },
      {
        "@type": "SportsEvent",
        "name": activePoll?.matchName || "Live Match Day Broadcast",
        "startDate": new Date().toISOString(),
        "competitor": [
          { "@type": "SportsTeam", "name": activePoll?.teamA || "Team A" },
          { "@type": "SportsTeam", "name": activePoll?.teamB || "Team B" }
        ]
      },
      {
        "@type": "BroadcastEvent",
        "name": "The Sports Room Live Match Telemetry Stream",
        "isLiveBroadcast": true,
        "video": videoUrl || "https://thesportsroom.org/live-stream"
      }
    ]
  };

  return (
    <header className="relative w-full overflow-hidden select-none bg-[#01140f]" id="hero-main-header">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ================= HERO BACKGROUND MEDIA ================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none transform-gpu">
        {youtubeId ? (
          <div className="absolute inset-0 w-full h-full scale-125 md:scale-110">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&modestbranding=1&enablejsapi=1&rel=0`}
              title="Hero Background Stream"
              className="w-full h-full object-cover pointer-events-none opacity-80"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : isDirectMp4 ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transform-gpu pointer-events-none"
          />
        ) : (
          <img
            src={imageUrl}
            alt={featuredArticle?.title || "Hero Background"}
            className="absolute inset-0 w-full h-full object-cover transform-gpu pointer-events-none"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Dark Overlay for Text Readability & Slight Blur */}
        <div
          className="absolute inset-0 bg-[#01140f] transition-opacity duration-300 transform-gpu"
          style={{
            opacity: heroConfig.overlayOpacity ?? 0.65,
            backdropFilter: `blur(${heroConfig.overlayBlur ?? 2}px)`,
            WebkitBackdropFilter: `blur(${heroConfig.overlayBlur ?? 2}px)`
          }}
        />

        {/* Gradient vignette for seamless visual integration with website canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#01140f] via-transparent to-[#01140f]/60 pointer-events-none" />
      </div>

      {/* ================= HERO CONTENT CONTAINER ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch min-h-[480px]">
          
          {/* ================= LEFT SIDE (65% width on desktop) ================= */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              
              {/* TOP BADGE WITH ANIMATED PULSE */}
              <div className="inline-flex items-center space-x-2 bg-[#022c22]/90 border border-[#22c55e]/40 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md shadow-md max-w-full">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
                </span>
                <span className="font-mono text-[9px] sm:text-xs font-black tracking-wider sm:tracking-widest text-emerald-300 uppercase truncate">
                  {heroConfig.liveBadgeText || '🔴 LIVE STREAMS • DAILY NEWS • TACTICAL METRICS'}
                </span>
              </div>

              {/* MAIN HEADING H1 */}
              <h1 className="font-display font-extrabold text-lg sm:text-2xl lg:text-3xl text-white tracking-tight leading-snug sm:leading-tight uppercase drop-shadow-md">
                {heroConfig.heading || 'The Sports Room | Live Match Streams, Sports News Today & Tactical Analysis'}
              </h1>

              {/* SUBTITLE H2 */}
              <h2 className="font-sans text-xs sm:text-sm md:text-base text-slate-200 leading-normal sm:leading-relaxed max-w-[700px] drop-shadow">
                {heroConfig.subtitle || 'Watch every live match stream, read breaking sports news today, and dive deep into real-time telemetry and tactical breakdowns. The Sports Room brings you complete, high-precision coverage across Football, Cricket, Formula 1, and the NBA.'}
              </h2>

              {/* 2 CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('/live-stream')}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-[#22c55e] hover:bg-emerald-400 text-[#01140f] font-mono font-extrabold text-xs uppercase rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-300 flex items-center justify-center space-x-2 transition cursor-pointer min-h-[44px]"
                >
                  <Play className="h-4 w-4 fill-current shrink-0" />
                  <span>Watch Live Streams</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('/sport/cricket')}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-[#022c22]/90 hover:bg-[#022c22] text-white hover:text-[#22c55e] font-mono font-bold text-xs uppercase rounded-xl border border-[#22c55e]/40 hover:border-[#22c55e] shadow-lg backdrop-blur-md flex items-center justify-center space-x-2 transition cursor-pointer min-h-[44px]"
                >
                  <span>Explore Sports News</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </motion.button>
              </div>
            </div>

            {/* ================= THREE INTERACTIVE SERVICE CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
              
              {/* CARD 1: LIVE MATCH STREAMS */}
              <motion.div
                onClick={() => onNavigate('/live-stream')}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-[#022c22]/90 hover:bg-[#022c22] border border-[#22c55e]/30 hover:border-[#22c55e] rounded-2xl p-3 sm:p-4 cursor-pointer shadow-xl transition-colors duration-200 backdrop-blur-md group"
              >
                <div className="flex items-center space-x-2.5 mb-1 sm:mb-1.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] group-hover:scale-110 transition duration-200 shrink-0">
                    <Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    📺 Live Match Streams
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  High-definition, real-time broadcasts and action feeds.
                </p>
              </motion.div>

              {/* CARD 2: SPORTS NEWS TODAY */}
              <motion.div
                onClick={() => onNavigate('/sport/cricket')}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-[#022c22]/90 hover:bg-[#022c22] border border-[#22c55e]/30 hover:border-[#22c55e] rounded-2xl p-3 sm:p-4 cursor-pointer shadow-xl transition-colors duration-200 backdrop-blur-md group"
              >
                <div className="flex items-center space-x-2.5 mb-1 sm:mb-1.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] group-hover:scale-110 transition duration-200 shrink-0">
                    <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    📰 Sports News Today
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Rapid updates, transfer news, and daily headlines.
                </p>
              </motion.div>

              {/* CARD 3: TACTICAL BREAKDOWNS */}
              <motion.div
                onClick={() => onNavigate('/sport/f1')}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-[#022c22]/90 hover:bg-[#022c22] border border-[#22c55e]/30 hover:border-[#22c55e] rounded-2xl p-3 sm:p-4 cursor-pointer shadow-xl transition-colors duration-200 backdrop-blur-md group"
              >
                <div className="flex items-center space-x-2.5 mb-1 sm:mb-1.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] group-hover:scale-110 transition duration-200 shrink-0">
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <h3 className="font-mono font-bold text-xs text-white uppercase group-hover:text-[#22c55e] transition">
                    📊 Tactical Breakdowns
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Biomechanics, pitch heatmaps, player analytics, and F1 telemetry.
                </p>
              </motion.div>

            </div>
          </div>

          {/* ================= RIGHT SIDE: FAN POLL CARD ================= */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#022c22]/95 border border-[#22c55e]/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-white space-y-3.5"
              id="hero-fan-poll-card"
            >
              {/* Poll Header */}
              <div className="flex items-center justify-between border-b border-[#22c55e]/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#22c55e] animate-pulse" />
                  <span className="font-mono font-black text-xs uppercase tracking-widest text-[#22c55e]">
                    🏆 Match Prediction
                  </span>
                </div>
                <span className="bg-emerald-950/80 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-800">
                  LIVE POLL
                </span>
              </div>

              {/* Match Title & Question */}
              <div>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1 truncate">
                  {activePoll?.matchName || "ICC Champions Trophy 2026 • Live Feature"}
                </p>
                <h3 className="font-display font-extrabold text-base text-white leading-snug">
                  {activePoll?.question || "Which team is going to win today's match?"}
                </h3>
              </div>

              {/* Thank You Banner upon Voting */}
              <AnimatePresence>
                {voteSubmittedMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#22c55e] px-3.5 py-2 rounded-xl flex items-center space-x-2 font-mono text-xs font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    <span>Thanks for voting! Predictions updated live.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Poll Options / Live Progress Bars */}
              <div className="space-y-3 pt-1">
                {/* Team A Option */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="flex items-center space-x-2 text-white">
                      {activePoll?.teamALogo ? (
                        <img
                          src={activePoll.teamALogo}
                          alt={activePoll.teamA}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                          {activePoll?.teamA?.[0] || 'A'}
                        </span>
                      )}
                      <span>{activePoll?.teamA || 'Team A'}</span>
                    </span>
                    <span className="text-[#22c55e]">{teamAPercent}%</span>
                  </div>

                  {!hasVoted ? (
                    <button
                      onClick={() => handleVote('teamA')}
                      className="w-full py-2 px-3 bg-[#01140f] hover:bg-[#22c55e]/20 border border-[#22c55e]/40 hover:border-[#22c55e] text-slate-200 hover:text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Vote {activePoll?.teamA}</span>
                      <Radio className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  ) : (
                    <div className="w-full bg-[#01140f] rounded-full h-3.5 overflow-hidden border border-emerald-950 p-0.5">
                      <motion.div
                        className="bg-[#22c55e] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${teamAPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>

                {/* Draw Option (if enabled) */}
                {activePoll?.enableDraw && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-slate-300">Draw / Tie</span>
                      <span className="text-amber-400">{drawPercent}%</span>
                    </div>

                    {!hasVoted ? (
                      <button
                        onClick={() => handleVote('draw')}
                        className="w-full py-2 px-3 bg-[#01140f] hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Vote Draw</span>
                        <Radio className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    ) : (
                      <div className="w-full bg-[#01140f] rounded-full h-3.5 overflow-hidden border border-emerald-950 p-0.5">
                        <motion.div
                          className="bg-amber-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${drawPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Team B Option */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="flex items-center space-x-2 text-white">
                      {activePoll?.teamBLogo ? (
                        <img
                          src={activePoll.teamBLogo}
                          alt={activePoll.teamB}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">
                          {activePoll?.teamB?.[0] || 'B'}
                        </span>
                      )}
                      <span>{activePoll?.teamB || 'Team B'}</span>
                    </span>
                    <span className="text-emerald-400">{teamBPercent}%</span>
                  </div>

                  {!hasVoted ? (
                    <button
                      onClick={() => handleVote('teamB')}
                      className="w-full py-2 px-3 bg-[#01140f] hover:bg-[#22c55e]/20 border border-[#22c55e]/40 hover:border-[#22c55e] text-slate-200 hover:text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Vote {activePoll?.teamB}</span>
                      <Radio className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  ) : (
                    <div className="w-full bg-[#01140f] rounded-full h-3.5 overflow-hidden border border-emerald-950 p-0.5">
                      <motion.div
                        className="bg-emerald-400 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${teamBPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total Votes Footer */}
              <div className="pt-2 border-t border-[#22c55e]/20 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>Total Votes: {totalVotes.toLocaleString()}</span>
                {hasVoted && <span className="text-[#22c55e] font-bold">✓ Voted</span>}
              </div>

            </motion.div>
          </div>

        </div>
      </section>
    </header>
  );
}
