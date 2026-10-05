import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Trophy, 
  Filter, 
  Sparkles,
  RefreshCw,
  LayoutGrid,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { CricketMatch } from '../types';

interface CricketScoreTickerProps {
  onNavigate?: (path: string) => void;
  showAllViewToggle?: boolean;
}

export default function CricketScoreTicker({ onNavigate, showAllViewToggle = true }: CricketScoreTickerProps) {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Views
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'finished' | 'upcoming'>('all');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'ticker' | 'grid'>('ticker');

  // Carousel scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Helper to determine match state from SportScore API fields
  const isMatchLive = useCallback((m: CricketMatch): boolean => {
    const s = (m.status || '').toLowerCase();
    const st = (m.status_text || '').toLowerCase();
    return s === 'live' || 
      st.includes('live') || 
      st.includes('innings') || 
      st.includes('in progress') || 
      st.includes('stumps') || 
      st.includes('tea') || 
      st.includes('rain') ||
      st.includes('break');
  }, []);

  const isMatchFinished = useCallback((m: CricketMatch): boolean => {
    const s = (m.status || '').toLowerCase();
    const st = (m.status_text || '').toLowerCase();
    return s === 'finished' || 
      st.includes('finished') || 
      st.includes('won') || 
      st.includes('lost') || 
      st.includes('tied') || 
      st.includes('drawn') || 
      st.includes('result') || 
      st.includes('abandoned');
  }, []);

  // Format team cricket score, runs, wickets, overs, or live batting state
  const formatTeamScore = useCallback((
    rawScore: any, 
    isHome: boolean, 
    match: CricketMatch
  ): { text: string; isLiveBatting: boolean; hasNumericScore: boolean } => {
    const live = isMatchLive(match);
    const finished = isMatchFinished(match);
    const statusText = (match.status_text || '').toLowerCase();

    // Check if team is currently batting based on status_text
    const isHomeBatting = statusText.includes('home') || (statusText.includes('1st innings') && !statusText.includes('away'));
    const isAwayBatting = statusText.includes('away') || (statusText.includes('2nd innings') && !statusText.includes('home'));
    const isBattingTeam = live && (isHome ? isHomeBatting : isAwayBatting);

    // 1. Handle object structure (if SportScore returns nested score object)
    if (rawScore && typeof rawScore === 'object') {
      const runs = rawScore.runs ?? rawScore.score ?? rawScore.r;
      const wickets = rawScore.wickets ?? rawScore.w;
      const overs = rawScore.overs ?? rawScore.ov ?? rawScore.o;
      if (runs !== undefined && runs !== null) {
        let str = `${runs}`;
        if (wickets !== undefined && wickets !== null) str += `/${wickets}`;
        if (overs !== undefined && overs !== null) str += ` (${overs} ov)`;
        return { text: str, isLiveBatting: isBattingTeam, hasNumericScore: true };
      }
    }

    // 2. Handle string or number score
    if (rawScore !== null && rawScore !== undefined) {
      const strVal = String(rawScore).trim();
      // If score contains numeric digits e.g. "102/10" or "156/4 (18.2 ov)" or "165"
      if (strVal !== '-' && /\d/.test(strVal)) {
        if (strVal === '0/0' && live && !isBattingTeam && statusText.includes('1st innings')) {
          return {
            text: 'Yet to bat',
            isLiveBatting: false,
            hasNumericScore: false
          };
        }
        return { 
          text: strVal, 
          isLiveBatting: isBattingTeam, 
          hasNumericScore: true 
        };
      }
    }

    // 3. Score is null, undefined, or "-"
    if (live) {
      if (isBattingTeam) {
        return { 
          text: '🏏 Batting', 
          isLiveBatting: true, 
          hasNumericScore: false 
        };
      }
      if (statusText.includes('in progress')) {
        return { 
          text: isHome ? '🏏 1st Innings' : 'Yet to bat', 
          isLiveBatting: isHome, 
          hasNumericScore: false 
        };
      }
      return { 
        text: 'Yet to bat', 
        isLiveBatting: false, 
        hasNumericScore: false 
      };
    }

    if (finished) {
      return { 
        text: rawScore && rawScore !== '-' ? String(rawScore) : '-', 
        isLiveBatting: false, 
        hasNumericScore: false 
      };
    }

    // Upcoming matches
    return { 
      text: '—', 
      isLiveBatting: false, 
      hasNumericScore: false 
    };
  }, [isMatchLive, isMatchFinished]);

  // Real-time Fetch from /api/cricket/matches with fallback to direct SportScore endpoint
  const fetchMatches = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      let data: any = null;

      // 1. Try internal proxy API route first (/api/cricket/matches)
      try {
        const response = await fetch('/api/cricket/matches?limit=50', {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (proxyErr) {
        console.warn('[Cricket Match Center] Local proxy failed, attempting direct endpoint fallback:', proxyErr);
      }

      // 2. Direct browser fallback if proxy failed or returned error
      if (!data || !Array.isArray(data.matches)) {
        const directUrl = 'https://sportscore.com/api/widget/matches/?sport=cricket&limit=50';
        const directRes = await fetch(directUrl);
        if (directRes.ok) {
          data = await directRes.json();
        } else {
          throw new Error(`SportScore returned status ${directRes.status}`);
        }
      }

      if (data && Array.isArray(data.matches)) {
        // Debugging logs for live match score structure verification
        if (process.env.NODE_ENV !== 'production') {
          console.log("SportScore cricket matches:", data.matches);
          const liveMatches = data.matches.filter((m: CricketMatch) => isMatchLive(m));
          liveMatches.forEach((m: CricketMatch) => {
            console.log("Live cricket match:", m);
          });
        }

        setMatches(data.matches);
        setLastUpdated(data.updated || new Date().toISOString());
        setError(null);
      } else {
        throw new Error('Invalid match data structure received');
      }
    } catch (err: any) {
      console.error('[Cricket Match Center] Error fetching live cricket matches:', err);
      if (matches.length === 0) {
        setError('Cricket matches are temporarily unavailable.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [matches.length, isMatchLive]);

  // Initial load and 60-second automatic polling interval
  useEffect(() => {
    fetchMatches();

    const intervalId = setInterval(() => {
      fetchMatches();
    }, 60000); // 60 seconds interval

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMatches]);

  // Check scroll position to manage arrows & active index
  const checkScrollPosition = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 320;
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
  }, [checkScrollPosition, filterStatus, selectedCompetition, viewMode, matches.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollStep = Math.max(280, Math.min(340, container.clientWidth * 0.85));
      container.scrollBy({
        left: direction === 'left' ? -scrollStep : scrollStep,
        behavior: 'smooth'
      });
    }
  };

  // Competitions list
  const competitions = Array.from(new Set(matches.map(m => m.competition))).filter(Boolean);

  const filteredMatches = matches.filter(match => {
    const isLive = isMatchLive(match);
    const isFinished = isMatchFinished(match);
    const isUpcoming = !isLive && !isFinished;

    if (filterStatus === 'live' && !isLive) return false;
    if (filterStatus === 'finished' && !isFinished) return false;
    if (filterStatus === 'upcoming' && !isUpcoming) return false;

    if (selectedCompetition !== 'all' && match.competition !== selectedCompetition) {
      return false;
    }

    return true;
  });

  const liveCount = matches.filter(m => isMatchLive(m)).length;
  const finishedCount = matches.filter(m => isMatchFinished(m)).length;
  const upcomingCount = matches.filter(m => !isMatchLive(m) && !isMatchFinished(m)).length;

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
      className="w-full w-screen max-w-[100vw] bg-[#02231b] border-y border-[#22c55e]/25 text-white shadow-xl relative overflow-hidden" 
      id="cricket-live-ticker"
    >
      {/* Top Header with Section Title & Controls (Full 100vw Width) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 pt-4 pb-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
          
          {/* Section Title & Subtitle + SportScore Attribution */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">🏏</span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-mono font-black text-sm md:text-base uppercase tracking-wider text-[#22c55e]">
                    Cricket Match Center
                  </h2>
                  <span className="bg-[#22c55e] text-[#022c22] font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {matches.length} Matches
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Live & Recent Cricket Matches
                </p>
              </div>
            </div>

            {/* Quick Status Filter Pills */}
            {!isLoading && !error && matches.length > 0 && (
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
            )}
          </div>

          {/* Right Action Controls: Competition Filter, SportScore Button, Refresh & View Mode */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            
            {/* Tournament Selector */}
            {competitions.length > 0 && (
              <div className="relative flex-1 sm:flex-none min-w-[130px] max-w-[200px] sm:max-w-none">
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full sm:w-auto bg-[#01140f] border border-emerald-900 text-slate-200 text-[11px] sm:text-xs rounded-lg px-2 sm:px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#22c55e] appearance-none pr-6 sm:pr-7 cursor-pointer truncate"
                >
                  <option value="all">All Tournaments</option>
                  {competitions.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
                <Filter className="w-3 h-3 text-emerald-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            )}

            <div className="flex items-center space-x-1.5 shrink-0">
              {/* View Mode Toggle (Grid vs Ticker) */}
              {showAllViewToggle && !isLoading && !error && (
                <button
                  onClick={() => setViewMode(viewMode === 'ticker' ? 'grid' : 'ticker')}
                  className="bg-[#01140f] border border-emerald-900 hover:border-[#22c55e] text-slate-300 hover:text-white p-1.5 rounded-lg transition text-xs flex items-center space-x-1 cursor-pointer"
                  title={viewMode === 'ticker' ? "Switch to Grid View" : "Switch to Ticker View"}
                  aria-label="Toggle Grid / Ticker View"
                >
                  {viewMode === 'ticker' ? <LayoutGrid className="w-4 h-4 text-[#22c55e]" /> : <SlidersHorizontal className="w-4 h-4 text-[#22c55e]" />}
                </button>
              )}

              {/* SportScore Exact Attribution Button */}
              <a 
                href="https://sportscore.com/" 
                rel="dofollow" 
                title="Powered by SportScore" 
                aria-label="Powered by SportScore" 
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  background: '#0a1e3d',
                  color: '#fff',
                  borderRadius: '50%',
                  textDecoration: 'none',
                  font: '700 .78rem system-ui,sans-serif'
                }}
              >
                SS
              </a>

              {/* Manual Refresh Button */}
              <button
                onClick={() => fetchMatches(true)}
                disabled={isRefreshing}
                className={`bg-[#01140f] border border-emerald-900 hover:border-[#22c55e] text-slate-300 hover:text-white p-1.5 rounded-lg transition cursor-pointer ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`}
                title="Refresh Live Scores (Auto-updates every 60s)"
                aria-label="Refresh Scores"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Desktop Ticker Navigation Arrows */}
              {viewMode === 'ticker' && !isLoading && !error && (
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
      </div>

      {/* Main Content Area (Full 100vw Width) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 pb-3.5 relative">
        
        {/* 1. LOADING SKELETON STATE */}
        {isLoading && (
          <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-[84vw] xs:w-[295px] sm:w-[320px] max-w-[340px] shrink-0 bg-[#01140f] border border-emerald-950 rounded-2xl p-4 animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center border-b border-emerald-950 pb-2">
                  <div className="h-3 bg-emerald-900/50 rounded w-28"></div>
                  <div className="h-3 bg-emerald-900/50 rounded w-12"></div>
                </div>
                <div className="space-y-2 py-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-900/60"></div>
                      <div className="h-3.5 bg-emerald-900/50 rounded w-24"></div>
                    </div>
                    <div className="h-3.5 bg-emerald-900/50 rounded w-8"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-900/60"></div>
                      <div className="h-3.5 bg-emerald-900/50 rounded w-24"></div>
                    </div>
                    <div className="h-3.5 bg-emerald-900/50 rounded w-8"></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-950 flex justify-between">
                  <div className="h-2.5 bg-emerald-900/40 rounded w-20"></div>
                  <div className="h-2.5 bg-emerald-900/40 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. ERROR STATE WITH RETRY BUTTON */}
        {!isLoading && error && (
          <div className="py-8 px-4 text-center bg-[#01140f]/80 rounded-2xl border border-rose-900/50 my-2">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-slate-300 font-mono text-xs sm:text-sm">
                {error}
              </p>
              <button
                onClick={() => fetchMatches(true)}
                className="px-4 py-1.5 bg-[#22c55e] hover:bg-emerald-400 text-[#022c22] font-mono font-bold text-xs rounded-lg transition shadow-md cursor-pointer flex items-center space-x-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!isLoading && !error && matches.length === 0 && (
          <div className="py-8 text-center text-slate-400 font-mono text-xs bg-[#01140f]/60 rounded-2xl border border-emerald-950 my-2">
            No cricket matches available right now.
          </div>
        )}

        {/* 4. FILTERED EMPTY STATE */}
        {!isLoading && !error && matches.length > 0 && filteredMatches.length === 0 && (
          <div className="py-8 text-center text-slate-400 font-mono text-xs bg-[#01140f]/60 rounded-2xl border border-emerald-950 my-2">
            No cricket matches found matching the selected filter.
          </div>
        )}

        {/* 5. MATCHES DISPLAY (TICKER / CAROUSEL VIEW) */}
        {!isLoading && !error && filteredMatches.length > 0 && viewMode === 'ticker' && (
          <div className="relative group/carousel">
            
            {/* Left Overlay Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-1.5 sm:left-0 top-1/2 -translate-y-1/2 z-20 bg-[#01140f]/95 hover:bg-[#022c22] text-[#22c55e] border border-[#22c55e]/50 p-2 sm:p-2.5 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="Scroll left to previous matches"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Overlay Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-1.5 sm:right-0 top-1/2 -translate-y-1/2 z-20 bg-[#01140f]/95 hover:bg-[#022c22] text-[#22c55e] border border-[#22c55e]/50 p-2 sm:p-2.5 rounded-full shadow-2xl transition backdrop-blur-xs flex items-center justify-center cursor-pointer active:scale-95 animate-pulse"
                aria-label="Scroll right to next matches"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Horizontal Scrollable Matches Track */}
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
                const isLive = isMatchLive(match);
                const isFinished = isMatchFinished(match);
                const homeScoreInfo = formatTeamScore(match.home_score, true, match);
                const awayScoreInfo = formatTeamScore(match.away_score, false, match);

                return (
                  <div
                    key={`${match.home}-${match.away}-${idx}`}
                    className={`w-[84vw] xs:w-[295px] sm:w-[320px] max-w-[340px] shrink-0 bg-gradient-to-b from-[#011c15] to-[#01140f] border ${isLive ? 'border-red-500/40 shadow-red-950/30' : 'border-emerald-900/80'} hover:border-[#22c55e]/70 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between transition-all duration-200 snap-center sm:snap-start group relative`}
                  >
                    {/* Tournament & Status Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-950 pb-2 mb-2.5">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {match.competition_logo ? (
                          <img 
                            src={match.competition_logo} 
                            alt={match.competition || "Tournament"}
                            className="w-4 h-4 object-contain shrink-0 rounded-xs"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-mono text-[10px] font-bold text-slate-300 truncate uppercase tracking-tight" title={match.competition}>
                          {match.competition || "Cricket Match"}
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
                    <div className="space-y-2.5 py-1">
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
                              {match.home?.slice(0, 2).toUpperCase() || 'H'}
                            </div>
                          )}
                          <span className={`font-display font-bold text-xs sm:text-sm truncate ${homeScoreInfo.isLiveBatting ? 'text-[#22c55e]' : 'text-white'}`} title={match.home}>
                            {match.home}
                          </span>
                        </div>
                        <div className={`font-mono font-bold text-xs sm:text-sm text-right shrink-0 ${homeScoreInfo.isLiveBatting ? 'text-[#22c55e] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60' : homeScoreInfo.hasNumericScore ? 'text-[#22c55e]' : 'text-slate-400'}`}>
                          {homeScoreInfo.text}
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
                              {match.away?.slice(0, 2).toUpperCase() || 'A'}
                            </div>
                          )}
                          <span className={`font-display font-bold text-xs sm:text-sm truncate ${awayScoreInfo.isLiveBatting ? 'text-[#22c55e]' : 'text-white'}`} title={match.away}>
                            {match.away}
                          </span>
                        </div>
                        <div className={`font-mono font-bold text-xs sm:text-sm text-right shrink-0 ${awayScoreInfo.isLiveBatting ? 'text-[#22c55e] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60' : awayScoreInfo.hasNumericScore ? 'text-[#22c55e]' : 'text-slate-400'}`}>
                          {awayScoreInfo.text}
                        </div>
                      </div>
                    </div>

                    {/* Match Footer: Status Note or Time */}
                    <div className="mt-2.5 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className={`font-medium truncate max-w-[65%] ${isLive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`} title={match.status_text || ""}>
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
        )}

        {/* 6. MATCHES DISPLAY (FULL GRID VIEW) */}
        {!isLoading && !error && filteredMatches.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 pt-1 w-full">
            {filteredMatches.map((match, idx) => {
              const isLive = isMatchLive(match);
              const isFinished = isMatchFinished(match);
              const homeScoreInfo = formatTeamScore(match.home_score, true, match);
              const awayScoreInfo = formatTeamScore(match.away_score, false, match);

              return (
                <div
                  key={`${match.home}-${match.away}-${idx}`}
                  className={`bg-gradient-to-b from-[#011c15] to-[#01140f] border ${isLive ? 'border-red-500/40 shadow-red-950/30' : 'border-emerald-900/80'} hover:border-[#22c55e]/70 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition group`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-950 pb-2 mb-3">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {match.competition_logo ? (
                        <img 
                          src={match.competition_logo} 
                          alt={match.competition || "Tournament"}
                          className="w-4 h-4 object-contain shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-mono text-[10px] font-bold text-slate-300 truncate uppercase" title={match.competition}>
                        {match.competition || "Cricket Match"}
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
                            {match.home?.slice(0, 2).toUpperCase() || 'H'}
                          </div>
                        )}
                        <span className={`font-display font-bold text-xs sm:text-sm truncate ${homeScoreInfo.isLiveBatting ? 'text-[#22c55e]' : 'text-white'}`} title={match.home}>
                          {match.home}
                        </span>
                      </div>
                      <div className={`font-mono font-bold text-xs sm:text-sm text-right shrink-0 ${homeScoreInfo.isLiveBatting ? 'text-[#22c55e] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60' : homeScoreInfo.hasNumericScore ? 'text-[#22c55e]' : 'text-slate-400'}`}>
                        {homeScoreInfo.text}
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
                            {match.away?.slice(0, 2).toUpperCase() || 'A'}
                          </div>
                        )}
                        <span className={`font-display font-bold text-xs sm:text-sm truncate ${awayScoreInfo.isLiveBatting ? 'text-[#22c55e]' : 'text-white'}`} title={match.away}>
                          {match.away}
                        </span>
                      </div>
                      <div className={`font-mono font-bold text-xs sm:text-sm text-right shrink-0 ${awayScoreInfo.isLiveBatting ? 'text-[#22c55e] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60' : awayScoreInfo.hasNumericScore ? 'text-[#22c55e]' : 'text-slate-400'}`}>
                        {awayScoreInfo.text}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className={`font-medium truncate max-w-[65%] ${isLive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`} title={match.status_text || ""}>
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
