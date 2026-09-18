import React, { useState, useEffect } from 'react';
import { Search, Filter, Trophy, ArrowRight, User, Shield, MapPin, Globe, Award, Activity } from 'lucide-react';
import { Player } from '../types';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const data = await DB.getPublishedPlayersAsync();
        if (isMounted) {
          setPlayers(data);
        }
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlayers();

    const handleSync = () => {
      loadPlayers();
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

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8" id="players-list-page">
      <div className="max-w-7xl mx-auto space-y-8">
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

        {/* Page Header */}
        <div className="border-b border-emerald-900/40 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#22c55e] bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded inline-block mb-3">
                Official Athlete Directory
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
                Players
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                Explore player profiles, career information, achievements and statistics from the world of sports.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-[#022c22] border border-emerald-900/60 px-4 py-2 rounded-lg self-start md:self-end">
              Showing <span className="text-[#22c55e] font-bold">{filteredPlayers.length}</span> Published Athlete{filteredPlayers.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-[#022c22]/90 border border-emerald-900/50 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search players by name, team, or franchise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white"
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
                className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-sport-filter"
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
                className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-sm text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                id="player-country-filter"
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

          {/* Quick Sport Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-emerald-400" /> Filter:
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
        </div>

        {/* Player Cards Grid */}
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
              We couldn't find any athlete profiles matching your current search criteria. Try resetting your filters.
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
                          // Fallback to placeholder if image link fails
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
                      <h2 className="text-xl font-bold text-white group-hover:text-[#22c55e] transition font-display leading-snug">
                        {player.name}
                      </h2>

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
      </div>
    </div>
  );
}
