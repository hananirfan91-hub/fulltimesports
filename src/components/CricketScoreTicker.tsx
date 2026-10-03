import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Trophy, 
  ExternalLink, 
  Filter, 
  Sparkles,
  RefreshCw,
  LayoutGrid,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { CricketMatch } from '../types';
import { DB } from '../lib/db';

interface CricketScoreTickerProps {
  onNavigate?: (path: string) => void;
  showAllViewToggle?: boolean;
}

export default function CricketScoreTicker({ onNavigate, showAllViewToggle = true }: CricketScoreTickerProps) {
  const [matches, setMatches] = useState<CricketMatch[]>(() => DB.getCricketMatches());
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'finished' | 'upcoming'>('all');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'ticker' | 'grid'>('ticker');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Carousel scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync listener
  useEffect(() => {
    const handleSync = () => {
      setMatches(DB.getCricketMatches());
    };
    window.addEventListener('fts_db_sync', handleSync);
    return () => window.removeEventListener('fts_db_sync', handleSync);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setMatches(DB.getCricketMatches());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Check scroll position to enable/disable buttons & calculate current visible card
  const checkScrollPosition = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate index
    const cardWidth = 320; // approximate card width + gap
    const idx = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.max(0, Math.min(idx, matches.length - 1)));
  }, [matches.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition, { passive: true });

    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition, filterStatus, selectedCompetition, viewMode]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Scroll by one card viewport step (minimum 280px or 80% of container width)
      const scrollStep = Math.max(280, Math.min(340, container.clientWidth * 0.85));
      container.scrollBy({
        left: direction === 'left' ? -scrollStep : scrollStep,
        behavior: 'smooth'
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  // Competitions list
  const competitions = Array.from(new Set(matches.map(m => m.competition))).filter(Boolean);

  const filteredMatches = matches.filter(match => {
    // Status filter
    const isLive = match.status === 'live' || match.status_text?.toLowerCase().includes('live') || match.status_text?.toLowerCase().includes('innings');
    const isFinished = match.status === 'finished' || match.status_text?.toLowerCase().includes('finished') || match.status_text?.toLowerCase().includes('won');
    const isUpcoming = match.status === 'upcoming' || (!isLive && !isFinished);

    if (filterStatus === 'live' && !isLive) return false;
    if (filterStatus === 'finished' && !isFinished) return false;
    if (filterStatus === 'upcoming' && !isUpcoming) return false;

    // Competition filter
    if (selectedCompetition !== 'all' && match.competition !== selectedCompetition) {
      return false;
    }

    return true;
  });

  const liveCount = matches.filter(m => m.status === 'live' || m.status_text?.toLowerCase().includes('live') || m.status_text?.toLowerCase().includes('innings')).length;
  const finishedCount = matches.filter(m => m.status === 'finished').length;
  const upcomingCount = matches.filter(m => m.status === 'upcoming' || (!m.status && m.status !== 'finished' && m.status !== 'live')).length;

  const formatMatchTime = (isoTime: string) => {
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'TBD';
    }
  };

  const formatMatchDate = (isoTime: string) => {
    try {
      const date = new Date(isoTime);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <section 
      className="w-full bg-[#02231b] border-y border-[#22c55e]/25 text-white shadow-xl relative overflow-hidden" 
      id="cricket-live-ticker"
    >
      {/* Top Header & Mobile Responsive Filters */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3.5 pb-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
          
          {/* Left Title & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
            {/* Title Badge */}
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center space-x-2 bg-[#01140f] border border-[#22c55e]/40 px-3 py-1.5 rounded-full shadow-inner">
                <span className="text-base animate-bounce">🏏</span>
                <span className="font-mono font-black text-xs uppercase tracking-wider text-[#22c55e]">
                  CRICKET MATCH CENTER
                </span>
                <span className="bg-[#22c55e] text-[#022c22] font-mono font-bold text-[10px] px-2 py-0.2 rounded-full">
                  {matches.length} Matches
                </span>
              </div>

              {/* Mobile Refresh + View Switcher (Quick Access) */}
              <div className="flex items-center space-x-1.5 sm:hidden">
                {showAllViewToggle && (
                  <button
                    onClick={() => setViewMode(viewMode === 'ticker' ? 'grid' : 'ticker')}
                    className="bg-[#01140f] border border-emerald-900 active:border-[#22c55e] text-slate-300 p-1.5 rounded-lg text-xs flex items-center"
                    aria-label="Toggle Grid / Ticker View"
                  >
                    {viewMode === 'ticker' ? <LayoutGrid className="w-3.5 h-3.5 text-[#22c55e]" /> : <SlidersHorizontal className="w-3.5 h-3.5 text-[#22c55e]" />}
                  </button>
                )}
                
                {/* SportScore Attribution Link */}
                <a
                  href="https://sportscore.com/"
                  rel="dofollow"
                  title="Powered by SportScore"
                  aria-label="Powered by SportScore"
                  target="_blank"
                  className="bg-[#01140f] border border-emerald-900 active:border-[#22c55e] text-[#22c55e] hover:text-emerald-300 rounded-lg w-7 h-7 inline-flex items-center justify-center text-[11px] font-bold font-mono transition no-underline shadow-xs"
                >
                  SS
                </a>

                <button
                  onClick={handleRefresh}
                  className={`bg-[#01140f] border border-emerald-900 active:border-[#22c55e] text-slate-300 p-1.5 rounded-lg ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`}
                  aria-label="Refresh Scores"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Status Filter Tabs - Scrollable on very small screens */}
            <div className="flex items-center overflow-x-auto no-scrollbar space-x-1 bg-[#01140f]/90 p-0.5 rounded-lg border border-emerald-950 font-mono text-[11px] w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md transition font-bold uppercase whitespace-nowrap cursor-pointer ${filterStatus === 'all' ? 'bg-[#22c55e] text-[#022c22] shadow' : 'text-slate-300 hover:text-white'}`}
              >
                All ({matches.length})
              </button>
              <button
                onClick={() => setFilterStatus('live')}
                className={`px-2.5 py-1 rounded-md transition font-bold uppercase whitespace-nowrap flex items-center space-x-1 cursor-pointer ${filterStatus === 'live' ? 'bg-red-600 text-white shadow' : 'text-rose-400 hover:text-white'}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>Live ({liveCount})</span>
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-2.5 py-1 rounded-md transition font-bold uppercase whitespace-nowrap cursor-pointer ${filterStatus === 'upcoming' ? 'bg-[#22c55e] text-[#022c22] shadow' : 'text-amber-400 hover:text-white'}`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                onClick={() => setFilterStatus('finished')}
                className={`px-2.5 py-1 rounded-md transition font-bold uppercase whitespace-nowrap cursor-pointer ${filterStatus === 'finished' ? 'bg-[#22c55e] text-[#022c22] shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Results ({finishedCount})
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Right Controls */}
          <div className="flex items-center justify-between sm:justify-end space-x-2">
            {/* Tournament Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                className="w-full sm:w-auto bg-[#01140f] border border-emerald-900 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#22c55e] appearance-none pr-7 cursor-pointer"
              >
                <option value="all">All Tournaments</option>
                {competitions.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-emerald-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Desktop View Mode Toggle */}
            {showAllViewToggle && (
              <button
                onClick={() => setViewMode(viewMode === 'ticker' ? 'grid' : 'ticker')}
                className="hidden sm:flex bg-[#01140f] border border-emerald-900 hover:border-[#22c55e] text-slate-300 hover:text-white p-1.5 rounded-lg transition text-xs items-center space-x-1 cursor-pointer"
                title={viewMode === 'ticker' ? "Switch to Grid View" : "Switch to Ticker View"}
              >
                {viewMode === 'ticker' ? <LayoutGrid className="w-4 h-4 text-[#22c55e]" /> : <SlidersHorizontal className="w-4 h-4 text-[#22c55e]" />}
              </button>
            )}

            {/* SportScore Attribution Link */}
            <a
              href="https://sportscore.com/"
              rel="dofollow"
              title="Powered by SportScore"
              aria-label="Powered by SportScore"
              target="_blank"
              className="hidden sm:inline-flex bg-[#01140f] border border-emerald-900 hover:border-[#22c55e] hover:bg-[#022c22] text-[#22c55e] hover:text-emerald-300 w-7 h-7 rounded-lg items-center justify-center text-[11px] font-mono font-bold transition shadow-xs no-underline"
            >
              SS
            </a>

            {/* Desktop Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`hidden sm:flex bg-[#01140f] border border-emerald-900 hover:border-[#22c55e] text-slate-300 hover:text-white p-1.5 rounded-lg transition cursor-pointer ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`}
              title="Refresh Live Scores"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Desktop Ticker Prev/Next Arrows */}
            {viewMode === 'ticker' && (
              <div className="hidden sm:flex items-center space-x-1 pl-1">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`bg-[#01140f] border border-emerald-900 p-1.5 rounded-lg transition ${canScrollLeft ? 'hover:border-[#22c55e] hover:bg-emerald-950 text-slate-200 cursor-pointer' : 'text-slate-600 opacity-40 cursor-not-allowed'}`}
                  aria-label="Previous Matches"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`bg-[#01140f] border border-emerald-900 p-1.5 rounded-lg transition ${canScrollRight ? 'hover:border-[#22c55e] hover:bg-emerald-950 text-slate-200 cursor-pointer' : 'text-slate-600 opacity-40 cursor-not-allowed'}`}
                  aria-label="Next Matches"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matches Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-3 relative">
        {filteredMatches.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-mono text-xs">
            No cricket matches match the selected filter.
          </div>
        ) : viewMode === 'ticker' ? (
          /* Responsive Carousel Track with Native Mobile Swipe & Desktop Drag Controls */
          <div className="relative group/carousel">
            
            {/* Left Overlay Scroll Button (visible when scrollable left) */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-1.5 sm:left-0 top-1/2 -translate-y-1/2 z-20 bg-[#01140f]/95 hover:bg-[#022c22] text-[#22c55e] border border-[#22c55e]/50 p-2 sm:p-2.5 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="Scroll left to previous matches"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Overlay Scroll Button (visible when scrollable right) */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-1.5 sm:right-0 top-1/2 -translate-y-1/2 z-20 bg-[#01140f]/95 hover:bg-[#022c22] text-[#22c55e] border border-[#22c55e]/50 p-2 sm:p-2.5 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer active:scale-95 animate-pulse"
                aria-label="Scroll right to next matches"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Horizontal Scroll Track */}
            <div 
              ref={scrollContainerRef}
              className="flex space-x-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory touch-pan-x select-none"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {filteredMatches.map((match, idx) => {
                const isLive = match.status === 'live' || match.status_text?.toLowerCase().includes('live') || match.status_text?.toLowerCase().includes('innings');
                const isFinished = match.status === 'finished' || match.status_text?.toLowerCase().includes('finished');

                return (
                  <div
                    key={`${match.home}-${match.away}-${idx}`}
                    className="w-[84vw] xs:w-[295px] sm:w-[320px] max-w-[340px] shrink-0 bg-gradient-to-b from-[#011c15] to-[#01140f] border border-emerald-900/80 hover:border-[#22c55e]/70 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between transition-all duration-200 snap-center sm:snap-start group relative"
                  >
                    {/* Tournament & Status Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-950 pb-2 mb-2.5">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {match.competition_logo ? (
                          <img 
                            src={match.competition_logo} 
                            alt={match.competition}
                            className="w-4 h-4 object-contain shrink-0 rounded-xs"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-mono text-[10px] font-bold text-slate-300 truncate uppercase tracking-tight">
                          {match.competition}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 bg-red-950/90 border border-red-500/50 text-red-400 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            <span>LIVE</span>
                          </span>
                        ) : isFinished ? (
                          <span className="bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                            Final
                          </span>
                        ) : (
                          <span className="bg-amber-950/70 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                            {formatMatchTime(match.time)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teams & Scores */}
                    <div className="space-y-2 py-1">
                      {/* Home Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          {match.home_logo ? (
                            <img 
                              src={match.home_logo} 
                              alt={match.home} 
                              className="w-6 h-6 object-contain rounded-full bg-slate-900/60 p-0.5 border border-emerald-900 shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold text-[#22c55e] shrink-0">
                              {match.home.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-display font-bold text-xs sm:text-sm text-white truncate">
                            {match.home}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-[#22c55e] text-right shrink-0">
                          {match.home_score || (isFinished ? '-' : '—')}
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          {match.away_logo ? (
                            <img 
                              src={match.away_logo} 
                              alt={match.away} 
                              className="w-6 h-6 object-contain rounded-full bg-slate-900/60 p-0.5 border border-emerald-900 shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold text-[#22c55e] shrink-0">
                              {match.away.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-display font-bold text-xs sm:text-sm text-white truncate">
                            {match.away}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-[#22c55e] text-right shrink-0">
                          {match.away_score || (isFinished ? '-' : '—')}
                        </div>
                      </div>
                    </div>

                    {/* Match Footer: Status Note or Time */}
                    <div className="mt-2.5 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-emerald-400/90 font-medium truncate max-w-[65%]">
                        {match.status_text || (isFinished ? "Match Finished" : "Scheduled")}
                      </span>
                      <span className="shrink-0 text-slate-400">
                        {formatMatchDate(match.time)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Bottom Navigation & Swipe Cue */}
            <div className="flex sm:hidden items-center justify-between pt-1 text-slate-400 font-mono text-[11px] px-1">
              <div className="flex items-center space-x-2">
                <span className="text-[#22c55e] font-bold">
                  {Math.min(currentIndex + 1, filteredMatches.length)} / {filteredMatches.length}
                </span>
                <span className="text-slate-500 text-[10px]">
                  • Swipe cards or tap arrows
                </span>
              </div>

              {/* Mobile Prev / Next Direct Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${canScrollLeft ? 'bg-[#01140f] border-[#22c55e]/50 text-[#22c55e] active:bg-[#022c22]' : 'bg-black/30 border-gray-800 text-gray-600 opacity-40'}`}
                  aria-label="Previous Match"
                >
                  ‹ Prev
                </button>
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${canScrollRight ? 'bg-[#01140f] border-[#22c55e]/50 text-[#22c55e] active:bg-[#022c22]' : 'bg-black/30 border-gray-800 text-gray-600 opacity-40'}`}
                  aria-label="Next Match"
                >
                  Next ›
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Grid View (Responsive 1-col on mobile, 2-col on tablet, 4-col on desktop) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
            {filteredMatches.map((match, idx) => {
              const isLive = match.status === 'live' || match.status_text?.toLowerCase().includes('live') || match.status_text?.toLowerCase().includes('innings');
              const isFinished = match.status === 'finished' || match.status_text?.toLowerCase().includes('finished');

              return (
                <div
                  key={`${match.home}-${match.away}-${idx}`}
                  className="bg-gradient-to-b from-[#011c15] to-[#01140f] border border-emerald-900/80 hover:border-[#22c55e]/70 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition group"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-950 pb-2 mb-3">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {match.competition_logo ? (
                        <img 
                          src={match.competition_logo} 
                          alt={match.competition}
                          className="w-4 h-4 object-contain shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-mono text-[10px] font-bold text-slate-300 truncate uppercase">
                        {match.competition}
                      </span>
                    </div>

                    <div>
                      {isLive ? (
                        <span className="bg-red-950/90 border border-red-500/50 text-red-400 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                          LIVE
                        </span>
                      ) : isFinished ? (
                        <span className="bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Final
                        </span>
                      ) : (
                        <span className="bg-amber-950/70 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {formatMatchTime(match.time)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {match.home_logo ? (
                          <img 
                            src={match.home_logo} 
                            alt={match.home} 
                            className="w-6 h-6 object-contain rounded-full bg-slate-900/60 p-0.5 border border-emerald-900 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold text-[#22c55e] shrink-0">
                            {match.home.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-display font-bold text-xs text-white truncate">
                          {match.home}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-xs text-[#22c55e] text-right shrink-0">
                        {match.home_score || (isFinished ? '-' : '—')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {match.away_logo ? (
                          <img 
                            src={match.away_logo} 
                            alt={match.away} 
                            className="w-6 h-6 object-contain rounded-full bg-slate-900/60 p-0.5 border border-emerald-900 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold text-[#22c55e] shrink-0">
                            {match.away.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-display font-bold text-xs text-white truncate">
                          {match.away}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-xs text-[#22c55e] text-right shrink-0">
                        {match.away_score || (isFinished ? '-' : '—')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400/90 font-medium truncate">
                      {match.status_text || (isFinished ? "Match Finished" : "Upcoming")}
                    </span>
                    <span className="shrink-0 text-slate-400">
                      {formatMatchDate(match.time)} {formatMatchTime(match.time)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
