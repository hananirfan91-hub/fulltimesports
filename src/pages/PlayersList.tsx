import React, { useState, useEffect } from 'react';
import { Search, Filter, Trophy, ArrowRight, User, Shield, MapPin, Globe, Award, Activity, Newspaper, Sparkles, ChevronRight, BarChart2, Flame } from 'lucide-react';
import { Player, Post } from '../types';
import { DB } from '../lib/db';

interface PlayersListProps {
  onNavigate: (path: string) => void;
}

const SPORT_OPTIONS = [
  { label: 'All Sports', value: 'all' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Formula 1', value: 'f1' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Hockey', value: 'hockey' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Esports', value: 'esports' }
];

export default function PlayersList({ onNavigate }: PlayersListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [playersData, postsData] = await Promise.all([
          DB.getPublishedPlayersAsync(),
          Promise.resolve(DB.getPosts().filter(p => p.scheduled_for !== 'draft').slice(0, 4))
        ]);
        if (isMounted) {
          setPlayers(playersData);
          setLatestPosts(postsData);
        }
      } catch (err) {
        console.error('Failed to load players or posts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    const handleSync = () => {
      loadData();
    };
    window.addEventListener('fts_db_sync', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('fts_db_sync', handleSync);
    };
  }, []);

  // Compute unique countries from players for filter
  const countries = Array.from(
    new Set(
      players
        .map(p => p.country)
        .filter((c): c is string => Boolean(c && c.trim().length > 0))
    )
  ).sort();

  // Filter players by search query, sport, and country
  const filteredPlayers = players.filter(player => {
    const matchesSearch = searchQuery.trim() === '' || 
      player.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (player.team && player.team.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (player.current_team && player.current_team.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const matchesSport = selectedSport === 'all' || 
      player.sport.toLowerCase() === selectedSport.toLowerCase();

    const matchesCountry = selectedCountry === 'all' || 
      (player.country && player.country.toLowerCase() === selectedCountry.toLowerCase());

    return matchesSearch && matchesSport && matchesCountry;
  });

  const getSportBadgeColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'cricket':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'football':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/30';
      case 'basketball':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'f1':
        return 'bg-red-950/80 text-red-400 border-red-500/30';
      case 'tennis':
        return 'bg-lime-950/80 text-lime-400 border-lime-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const scrollToSearch = () => {
    const el = document.getElementById('player-search-input');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-8 px-4 sm:px-6 lg:px-8" id="players-list-page">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-mono text-emerald-400" aria-label="Breadcrumb">
          <button 
            onClick={() => onNavigate('/')} 
            className="hover:underline transition text-slate-400 hover:text-emerald-400"
          >
            Home
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-300 font-semibold">Players</span>
        </nav>

        {/* Page Header (Single H1 + Requested Intro) */}
        <header className="border-b border-emerald-900/40 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#22c55e] bg-emerald-950/80 border border-emerald-800/60 px-3.5 py-1.5 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Athlete Database &amp; Career Archive</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display">
                Player Profiles, Statistics &amp; Career Records
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
                Explore detailed player profiles, sports statistics, career records and achievements from cricket, football, basketball, tennis, Formula 1 and other major sports. The Sports Room brings player information together in one place, making it easier to follow your favorite athletes, their teams, performances and career journeys.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-300 bg-[#022c22] border border-emerald-800/60 px-4 py-3 rounded-xl self-start lg:self-end flex items-center gap-2 shrink-0 shadow-lg">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span>
                Showing <strong className="text-[#22c55e]">{filteredPlayers.length}</strong> Published Athlete{filteredPlayers.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </header>

        {/* Search and Filters Bar */}
        <section aria-label="Player Directory Search and Filters" className="bg-[#022c22]/90 border border-emerald-900/60 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search athletes by name, team, franchise, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 bg-[#01140f] border border-emerald-900/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white bg-emerald-950 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sport Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-sport-filter"
                aria-label="Filter by sport"
              >
                {SPORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-country-filter"
                aria-label="Filter by country"
              >
                <option value="all">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Sport Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-emerald-400" /> Sport:
            </span>
            {SPORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedSport(opt.value)}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap border ${
                  selectedSport === opt.value
                    ? 'bg-[#22c55e] text-slate-950 border-[#22c55e] font-bold shadow-sm'
                    : 'bg-[#01140f] text-slate-300 border-emerald-900/40 hover:border-emerald-700 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Player Cards Grid (Primary Visual Focus) */}
        <section aria-label="Player Directory Grid">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse" id="players-loading-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-[#022c22]/50 border border-emerald-900/30 rounded-2xl p-5 space-y-4">
                  <div className="w-full h-48 bg-emerald-950/60 rounded-xl"></div>
                  <div className="h-5 bg-emerald-900/40 rounded w-3/4"></div>
                  <div className="h-4 bg-emerald-900/30 rounded w-1/2"></div>
                  <div className="h-8 bg-emerald-900/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="bg-[#022c22]/60 border border-emerald-900/40 rounded-2xl p-12 text-center space-y-4 my-8" id="players-empty-state">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                <User className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">No Players Found</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                We couldn't find any athlete profiles matching your current search criteria. Try adjusting your query or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSport('all');
                  setSelectedCountry('all');
                }}
                className="bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider hover:bg-[#34d399] transition shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="players-grid">
              {filteredPlayers.map(player => {
                const roleDisplay = player.playing_role || player.role || '';
                const teamDisplay = player.current_team || player.team || '';

                return (
                  <div
                    key={player.id}
                    className="group bg-[#022c22]/80 hover:bg-[#022c22] border border-emerald-900/40 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-emerald-950/50"
                    id={`player-card-${player.slug}`}
                  >
                    {/* Card Header with Image */}
                    <div className="relative aspect-[4/3] bg-emerald-950/90 overflow-hidden">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
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

                      {/* Fallback avatar icon */}
                      <div className={`photo-fallback ${player.photo_url ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-[#01140f] text-emerald-500/60`}>
                        <User className="w-16 h-16 mb-2" />
                        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400/80">
                          {player.sport} Athlete
                        </span>
                      </div>

                      {/* Jersey Number Badge */}
                      {player.jersey_number && (
                        <div className="absolute top-3 left-3 bg-[#01140f]/90 backdrop-blur-sm border border-emerald-700/50 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-[#22c55e]">
                          #{player.jersey_number}
                        </div>
                      )}

                      {/* Sport Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getSportBadgeColor(player.sport)}`}>
                          {player.sport}
                        </span>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        {/* Country & Nationality */}
                        {player.country && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mb-1.5">
                            <MapPin className="w-3 h-3" />
                            <span>{player.country}</span>
                            {player.country_code && (
                              <span className="text-[10px] bg-emerald-950 border border-emerald-800/40 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                                {player.country_code.toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Player Name */}
                        <h3 className="text-xl font-bold text-white group-hover:text-[#22c55e] transition font-display leading-snug">
                          {player.name}
                        </h3>

                        {/* Role & Team */}
                        <div className="mt-2 space-y-1 text-xs text-slate-300">
                          {roleDisplay && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span className="text-slate-400 font-mono">Role:</span>
                              <span className="font-semibold text-slate-200">{roleDisplay}</span>
                            </div>
                          )}
                          {teamDisplay && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span className="text-slate-400 font-mono">Team:</span>
                              <span className="text-emerald-300 font-medium truncate">{teamDisplay}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: View Profile Button */}
                      <div className="pt-3 border-t border-emerald-900/40">
                        <a
                          href={`/player/${player.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/player/${player.slug}`);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-950 hover:bg-[#22c55e] text-emerald-400 hover:text-slate-950 border border-emerald-800/50 hover:border-[#22c55e] py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition duration-200 group/btn"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Structured SEO Content Sections with Clear H2 Hierarchy */}
        <section aria-label="Player Directory Overview and Sports Coverage" className="border-t border-emerald-900/40 pt-12 space-y-10">
          {/* Main Feature Highlight */}
          <div className="bg-[#022c22]/60 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded">
              <Trophy className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Athlete Insights &amp; Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Explore Sports Player Profiles
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
              Find sports player profiles featuring important career information, playing roles, teams, countries, statistics and major achievements. Whether you follow international cricket, football leagues, basketball, tennis or motorsport, our player profiles help you quickly learn more about the athletes making an impact in their sport.
            </p>
          </div>

          {/* Sport Specific Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cricket Section */}
            <div className="bg-[#022c22]/40 border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between hover:border-emerald-700/50 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Flame className="w-5 h-5 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-bold font-display text-white">
                  Cricket Player Profiles &amp; Statistics
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Follow cricket player profiles with career statistics, teams, playing roles, major performances and achievements. Explore information about international cricketers and players from major cricket competitions, including their career records and latest related news.
                </p>
              </div>
              <div className="pt-3 border-t border-emerald-950">
                <button
                  onClick={() => onNavigate('/sport/cricket')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#22c55e] hover:text-emerald-300 font-bold"
                >
                  <span>Browse Cricket Hub</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Football Section */}
            <div className="bg-[#022c22]/40 border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between hover:border-emerald-700/50 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white">
                  Football Player Profiles &amp; Career Stats
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Discover football player profiles covering clubs, national teams, positions, appearances, goals, assists and career highlights. Follow established stars and emerging players while keeping up with the latest football news connected to their careers.
                </p>
              </div>
              <div className="pt-3 border-t border-emerald-950">
                <button
                  onClick={() => onNavigate('/sport/football')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#22c55e] hover:text-emerald-300 font-bold"
                >
                  <span>Browse Football Hub</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Basketball, Tennis & F1 Section */}
            <div className="bg-[#022c22]/40 border border-emerald-900/40 rounded-2xl p-6 space-y-3 flex flex-col justify-between hover:border-emerald-700/50 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-white">
                  Basketball, Tennis &amp; F1 Players
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Explore player information from basketball, tennis, Formula 1 and other popular sports. Each profile focuses on useful information such as career achievements, teams, statistics and notable performances, giving sports fans a quick way to learn more about their favorite athletes.
                </p>
              </div>
              <div className="pt-3 border-t border-emerald-950 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('/sport/basketball')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:underline"
                >
                  Basketball
                </button>
                <button
                  onClick={() => onNavigate('/sport/f1')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 hover:underline"
                >
                  Formula 1
                </button>
                <button
                  onClick={() => onNavigate('/sport/tennis')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-lime-400 hover:underline"
                >
                  Tennis
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dives: Stats & News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Stats & Records */}
            <div className="bg-[#022c22]/50 border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <BarChart2 className="w-4 h-4 text-[#22c55e]" />
                <span className="uppercase tracking-wider">Metrics &amp; Milestones</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                Player Statistics &amp; Career Records
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Looking for a player's career statistics or major records? Our profiles bring important numbers and career milestones together where reliable information is available. Statistics may include matches, appearances, runs, goals, points, wins, podiums and other sport-specific records.
              </p>
            </div>

            {/* Latest News & Real-Time Connection */}
            <div className="bg-[#022c22]/50 border border-emerald-900/40 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Newspaper className="w-4 h-4 text-[#22c55e]" />
                <span className="uppercase tracking-wider">Editorial Integration</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                Latest News About Your Favorite Players
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Player careers are constantly changing. Follow the latest sports news, match performances, transfers, milestones and major updates connected to the players featured on The Sports Room. Related articles are linked from player profiles so you can move from a player's career information directly to the latest coverage.
              </p>
            </div>
          </div>

          {/* Discovery & About The Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-[#001712] border border-emerald-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#22c55e] uppercase tracking-wider">
                <Search className="w-4 h-4" />
                <span>Search &amp; Filter</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Find Your Favorite Player
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Use the player directory to search for athletes by name, sport or country. From international cricket players to football stars, basketball athletes, tennis players and Formula 1 drivers, The Sports Room is building a growing collection of sports player profiles for fans around the world.
              </p>
              <button
                onClick={scrollToSearch}
                className="inline-flex items-center gap-2 bg-[#22c55e] text-slate-950 font-mono font-bold text-xs px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-[#34d399] transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Use Player Search</span>
              </button>
            </div>

            <div className="lg:col-span-6 bg-[#001712] border border-emerald-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#22c55e] uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Directory Architecture</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                About The Sports Room Player Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Sports Room is building a simple and useful sports player database covering different sports, teams and competitions. Our goal is to make player information easy to find while connecting profiles with relevant news, match coverage and sports analysis.
              </p>
              <p className="text-xs sm:text-sm text-emerald-400 font-medium italic border-l-2 border-[#22c55e] pl-3 py-1">
                Explore the profiles below and discover more about the players shaping the world of sport.
              </p>
            </div>
          </div>
        </section>

        {/* Latest Editorial News Section */}
        {latestPosts.length > 0 && (
          <section aria-label="Latest Sports News from The Sports Room" className="border-t border-emerald-900/40 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#22c55e]">
                  Live Sports Coverage
                </span>
                <h2 className="text-2xl font-bold font-display text-white">
                  Latest Sports News &amp; Player Updates
                </h2>
              </div>
              <button
                onClick={() => onNavigate('/')}
                className="text-xs font-mono text-emerald-400 hover:text-[#22c55e] font-bold flex items-center gap-1"
              >
                <span>All Articles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestPosts.map(post => (
                <article
                  key={post.id}
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="group bg-[#022c22]/50 hover:bg-[#022c22] border border-emerald-900/40 hover:border-emerald-600/50 rounded-xl p-4 transition cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#22c55e] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                      {post.category || 'Sports'}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#22c55e] transition line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-emerald-950 flex items-center justify-between">
                    <span>{post.read_time_minutes ? `${post.read_time_minutes} min read` : 'Read Article'}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

