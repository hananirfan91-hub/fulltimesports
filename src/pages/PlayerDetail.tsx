import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Calendar, Shield, Trophy, Award, Activity, Share2, 
  ArrowLeft, ExternalLink, Globe, Twitter, Instagram, Facebook, Youtube, 
  CheckCircle2, Sparkles, ChevronRight, HelpCircle, Newspaper
} from 'lucide-react';
import { Player, Post } from '../types';
import { DB } from '../lib/db';

interface PlayerDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function PlayerDetail({ slug, onNavigate }: PlayerDetailProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPlayers, setRelatedPlayers] = useState<Player[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const data = await DB.getPlayerBySlugAsync(slug);
        if (isMounted) {
          setPlayer(data);

          if (data) {
            // Fetch related players in same sport
            const allPlayers = await DB.getPublishedPlayersAsync();
            const filteredRelated = allPlayers
              .filter(p => p.slug !== data.slug && (p.sport.toLowerCase() === data.sport.toLowerCase() || p.country === data.country))
              .slice(0, 4);
            setRelatedPlayers(filteredRelated);

            // Fetch related news posts mentioning player
            const allPosts = DB.getPosts().filter(p => p.scheduled_for !== 'draft');
            const playerNameLower = data.name.toLowerCase();
            const slugWords = data.slug.split('-');
            
            const matchedPosts = allPosts.filter(post => {
              const titleLower = (post.title || '').toLowerCase();
              const tagsLower = (post.tags || []).map(t => t.toLowerCase()).join(' ');
              const contentLower = (post.content || '').toLowerCase().slice(0, 500);

              return titleLower.includes(playerNameLower) ||
                tagsLower.includes(playerNameLower) ||
                slugWords.some(w => w.length > 3 && titleLower.includes(w)) ||
                contentLower.includes(playerNameLower);
            }).slice(0, 3);

            setRelatedPosts(matchedPosts);
          }
        }
      } catch (err) {
        console.error("Error fetching player profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlayerData();

    const handleSync = () => {
      fetchPlayerData();
    };
    window.addEventListener('fts_db_sync', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('fts_db_sync', handleSync);
    };
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Helper to calculate age from Date of Birth
  const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Helper to format stat keys into readable labels
  const formatStatKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01140f] py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 bg-emerald-950/60 rounded w-48"></div>
        <div className="h-80 bg-emerald-950/50 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-emerald-950/40 rounded-2xl"></div>
          <div className="h-64 bg-emerald-950/40 rounded-2xl md:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#01140f] py-20 px-4 text-center">
        <div className="max-w-lg mx-auto bg-[#022c22] border border-emerald-900/50 rounded-2xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400">
            <User className="w-8 h-8 opacity-60" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Player Profile Not Found</h1>
          <p className="text-sm text-slate-300">
            The player profile you are looking for does not exist or has not been published yet.
          </p>
          <button
            onClick={() => onNavigate('/players')}
            className="inline-flex items-center gap-2 bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider hover:bg-[#34d399] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Players Directory
          </button>
        </div>
      </div>
    );
  }

  const roleDisplay = player.playing_role || player.role || '';
  const teamDisplay = player.current_team || player.team || '';
  const bioText = player.biography || player.bio || '';
  const age = calculateAge(player.date_of_birth);
  const statsEntries = Object.entries(player.statistics || {}).filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '');
  const hasAchievements = Array.isArray(player.achievements) && player.achievements.length > 0;
  const socials = player.social_links || {};
  const hasSocials = Boolean(socials.instagram || socials.twitter || socials.x || socials.facebook || socials.youtube || socials.website);

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-8 px-4 sm:px-6 lg:px-8" id={`player-profile-${player.slug}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center flex-wrap gap-2 text-xs font-mono text-emerald-400" aria-label="Breadcrumb">
          <button 
            onClick={() => onNavigate('/')} 
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            Home
          </button>
          <span className="text-slate-600">/</span>
          <button 
            onClick={() => onNavigate('/players')} 
            className="text-slate-400 hover:text-emerald-400 transition"
          >
            Players
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 capitalize">{player.sport}</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-300 font-bold">{player.name}</span>
        </nav>

        {/* HERO CARD */}
        <div className="bg-[#022c22] border border-emerald-900/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Player Photo Column */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-64 sm:w-72 aspect-[4/5] rounded-2xl overflow-hidden bg-[#01140f] border-2 border-emerald-500/30 shadow-2xl group">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.photo-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}

                {/* Fallback avatar */}
                <div className={`photo-fallback ${player.photo_url ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-[#01140f] text-emerald-500/50`}>
                  <User className="w-24 h-24 mb-2" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400/80">
                    {player.sport} Athlete
                  </span>
                </div>

                {/* Jersey Badge */}
                {player.jersey_number && (
                  <div className="absolute top-3 left-3 bg-[#01140f]/90 backdrop-blur-md border border-emerald-700 px-3 py-1.5 rounded-lg text-sm font-mono font-black text-[#22c55e] shadow-lg">
                    #{player.jersey_number}
                  </div>
                )}
              </div>
            </div>

            {/* Player Info Summary Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Sport Badge */}
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-emerald-950 border border-emerald-700/50 text-[#22c55e]">
                    {player.sport}
                  </span>

                  {/* Role Badge */}
                  {roleDisplay && (
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-md bg-emerald-900/40 border border-emerald-800/40 text-emerald-300">
                      {roleDisplay}
                    </span>
                  )}

                  {/* Country Badge */}
                  {player.country && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{player.country}</span>
                      {player.country_code && <span className="text-emerald-400 font-bold">({player.country_code.toUpperCase()})</span>}
                    </span>
                  )}

                  {/* Verified Badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> Official Profile
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight" id="player-heading">
                  {player.name}
                </h1>

                {teamDisplay && (
                  <p className="text-base sm:text-lg text-emerald-300 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Current Team: <strong className="text-white">{teamDisplay}</strong></span>
                  </p>
                )}
              </div>

              {/* Quick Spec Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {player.date_of_birth && (
                  <div className="bg-[#01140f]/80 border border-emerald-900/40 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Born</span>
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {new Date(player.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {age !== null && (
                  <div className="bg-[#01140f]/80 border border-emerald-900/40 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Age</span>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
                      {age} Years
                    </span>
                  </div>
                )}
                {player.nationality && (
                  <div className="bg-[#01140f]/80 border border-emerald-900/40 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Nationality</span>
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {player.nationality}
                    </span>
                  </div>
                )}
                {player.jersey_number && (
                  <div className="bg-[#01140f]/80 border border-emerald-900/40 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Jersey</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#22c55e] font-mono">
                      #{player.jersey_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Share & Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-emerald-900/50">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:border-emerald-500 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Link Copied!' : 'Share Profile'}</span>
                </button>

                {/* Social Links */}
                {hasSocials && (
                  <div className="flex items-center gap-2 ml-auto">
                    {socials.x || socials.twitter ? (
                      <a
                        href={socials.x || socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#01140f] border border-emerald-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                        title="Twitter / X Profile"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    ) : null}
                    {socials.instagram ? (
                      <a
                        href={socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#01140f] border border-emerald-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                        title="Instagram Profile"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    ) : null}
                    {socials.facebook ? (
                      <a
                        href={socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#01140f] border border-emerald-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                        title="Facebook Profile"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    ) : null}
                    {socials.youtube ? (
                      <a
                        href={socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#01140f] border border-emerald-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                        title="YouTube Channel"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    ) : null}
                    {socials.website ? (
                      <a
                        href={socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[#01140f] border border-emerald-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                        title="Official Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bio, Highlights, Stats, Achievements, FAQ */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. BIOGRAPHY SECTION */}
            {bioText && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4" id="player-biography-section">
                <div className="flex items-center gap-2.5 text-[#22c55e] border-b border-emerald-900/50 pb-3">
                  <User className="w-5 h-5" />
                  <h2 className="text-xl font-bold text-white font-display">
                    About &amp; Biography
                  </h2>
                </div>
                <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line">
                  {bioText}
                </div>
              </div>
            )}

            {/* 2. CAREER HIGHLIGHTS SECTION */}
            {player.career_highlights && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4" id="player-highlights-section">
                <div className="flex items-center gap-2.5 text-[#22c55e] border-b border-emerald-900/50 pb-3">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-xl font-bold text-white font-display">
                    Career Highlights &amp; Milestones
                  </h2>
                </div>
                <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-2 whitespace-pre-line">
                  {player.career_highlights}
                </div>
              </div>
            )}

            {/* 3. CAREER STATISTICS SECTION */}
            {statsEntries.length > 0 && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4" id="player-stats-section">
                <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
                  <div className="flex items-center gap-2.5 text-[#22c55e]">
                    <Activity className="w-5 h-5" />
                    <h2 className="text-xl font-bold text-white font-display">
                      Career Statistics
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400/80 uppercase">
                    {player.sport} Record
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                  {statsEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-[#01140f] border border-emerald-900/60 rounded-xl p-4 text-center hover:border-emerald-500/50 transition"
                    >
                      <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        {formatStatKey(key)}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-display">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. MAJOR ACHIEVEMENTS SECTION */}
            {hasAchievements && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4" id="player-achievements-section">
                <div className="flex items-center gap-2.5 text-[#22c55e] border-b border-emerald-900/50 pb-3">
                  <Trophy className="w-5 h-5" />
                  <h2 className="text-xl font-bold text-white font-display">
                    Major Honors &amp; Achievements
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {player.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="bg-[#01140f] border border-emerald-900/60 rounded-xl p-4 space-y-2 hover:border-emerald-500/50 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {ach.title}
                        </h3>
                        {ach.year && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded whitespace-nowrap">
                            {ach.year}
                          </span>
                        )}
                      </div>
                      {ach.competition && (
                        <span className="text-xs font-mono text-emerald-400 block">
                          {ach.competition}
                        </span>
                      )}
                      {ach.description && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ach.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. DYNAMIC FREQUENTLY ASKED QUESTIONS (FAQ) */}
            <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4" id="player-faqs-section">
              <div className="flex items-center gap-2.5 text-[#22c55e] border-b border-emerald-900/50 pb-3">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-xl font-bold text-white font-display">
                  Frequently Asked Questions about {player.name}
                </h2>
              </div>
              <div className="space-y-4 pt-2">
                <div className="bg-[#01140f] border border-emerald-900/60 rounded-xl p-4 space-y-1.5">
                  <h3 className="text-sm font-bold text-white">
                    Which sport and position does {player.name} play?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {player.name} is a professional {player.sport} athlete{roleDisplay ? ` who plays as a ${roleDisplay}` : ''}{teamDisplay ? ` for ${teamDisplay}` : ''}.
                  </p>
                </div>

                {player.date_of_birth && (
                  <div className="bg-[#01140f] border border-emerald-900/60 rounded-xl p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-white">
                      When was {player.name} born and how old is {player.name.split(' ')[0]}?
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {player.name} was born on {new Date(player.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{player.birthplace ? ` in ${player.birthplace}` : ''}. {age ? `Currently, ${player.name.split(' ')[0]} is ${age} years old.` : ''}
                    </p>
                  </div>
                )}

                {hasAchievements && (
                  <div className="bg-[#01140f] border border-emerald-900/60 rounded-xl p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-white">
                      What are {player.name}'s key career achievements?
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Major honors include {player.achievements.map(a => `${a.title}${a.year ? ` (${a.year})` : ''}`).slice(0, 3).join(', ')}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Profile Details & Latest News */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Profile Overview Card */}
            <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white font-display border-b border-emerald-900/50 pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Player Quick Facts
              </h2>
              <dl className="space-y-3 text-xs divide-y divide-emerald-950">
                <div className="pt-2 flex justify-between gap-2">
                  <dt className="text-slate-400 font-mono">Full Name</dt>
                  <dd className="text-right font-semibold text-white">{player.name}</dd>
                </div>
                <div className="pt-2 flex justify-between gap-2">
                  <dt className="text-slate-400 font-mono">Sport</dt>
                  <dd className="text-right font-semibold text-emerald-400 uppercase">{player.sport}</dd>
                </div>
                {roleDisplay && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Role</dt>
                    <dd className="text-right font-semibold text-white">{roleDisplay}</dd>
                  </div>
                )}
                {teamDisplay && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Current Team</dt>
                    <dd className="text-right font-semibold text-emerald-300">{teamDisplay}</dd>
                  </div>
                )}
                {player.country && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Country</dt>
                    <dd className="text-right font-semibold text-white">{player.country}</dd>
                  </div>
                )}
                {player.birthplace && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Birthplace</dt>
                    <dd className="text-right font-semibold text-slate-300">{player.birthplace}</dd>
                  </div>
                )}
                {player.date_of_birth && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Born</dt>
                    <dd className="text-right font-semibold text-slate-300">
                      {new Date(player.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </dd>
                  </div>
                )}
                {player.jersey_number && (
                  <div className="pt-2 flex justify-between gap-2">
                    <dt className="text-slate-400 font-mono">Jersey Number</dt>
                    <dd className="text-right font-bold text-[#22c55e]">#{player.jersey_number}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Related News About Player */}
            {relatedPosts.length > 0 && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
                  <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-400" />
                    Latest News &amp; Analysis
                  </h2>
                </div>
                <div className="space-y-4">
                  {relatedPosts.map(post => (
                    <a
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/blog/${post.slug}`);
                      }}
                      className="group/news block bg-[#01140f] border border-emerald-900/40 hover:border-emerald-500 rounded-xl p-3 transition space-y-2"
                    >
                      {post.featured_image && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-emerald-950">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover/news:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h3 className="text-xs font-bold text-white group-hover/news:text-[#22c55e] transition line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="text-emerald-400 group-hover/news:underline">Read &rarr;</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Players Card */}
            {relatedPlayers.length > 0 && (
              <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white font-display border-b border-emerald-900/50 pb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Related {player.sport.toUpperCase()} Players
                </h2>
                <div className="space-y-3">
                  {relatedPlayers.map(rel => (
                    <a
                      key={rel.id}
                      href={`/player/${rel.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/player/${rel.slug}`);
                      }}
                      className="group/rel flex items-center gap-3 bg-[#01140f] border border-emerald-900/40 hover:border-emerald-500 rounded-xl p-2.5 transition"
                    >
                      <div className="w-12 h-12 rounded-lg bg-emerald-950 overflow-hidden flex-shrink-0">
                        {rel.photo_url ? (
                          <img
                            src={rel.photo_url}
                            alt={rel.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-500/60">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h3 className="text-xs font-bold text-white group-hover/rel:text-[#22c55e] transition truncate">
                          {rel.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {rel.playing_role || rel.role || rel.sport} • {rel.country || ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover/rel:text-emerald-400 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
