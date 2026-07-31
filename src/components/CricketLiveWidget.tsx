import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Radio, Calendar, Users, List, RefreshCw, ChevronRight, CheckCircle2, AlertCircle, Award, Sparkles, Search, Star, MapPin, Flame
} from 'lucide-react';
import { 
  getLiveCricketScores, getUpcomingCricketMatches, getRecentCricketMatches, 
  getCricketSchedule, getCricketSeries, getCricketTeams 
} from '../lib/cricketApi';

// Famous teams and premier keywords for filtering famous top-rating matches
const FAMOUS_KEYWORDS = [
  'pakistan', 'west indies', 'wi', 'india', 'england', 'australia', 'bangladesh', 'south africa', 'new zealand', 'sri lanka',
  'psl', 'ipl', 'bbl', 'mlc', 'major league cricket', 'the hundred', 'lpl', 'lanka premier league',
  'icc', 'champions trophy', 'world cup', 'asia cup', 'peshawar zalmi', 'lahore qalandars', 'karachi kings',
  'mumbai indians', 'chennai super kings', 'texas super kings', 'oval invincibles', 'jaffna kings'
];

function isFamousMatch(item: any): boolean {
  const str = JSON.stringify(item).toLowerCase();
  return FAMOUS_KEYWORDS.some(kw => str.includes(kw));
}

function sortMatchesByPriority(items: any[]): any[] {
  if (!Array.isArray(items)) return items;
  return [...items].sort((a, b) => {
    const textA = JSON.stringify(a).toLowerCase();
    const textB = JSON.stringify(b).toLowerCase();

    const isIntlA = textA.includes('icc') || textA.includes('international') || textA.includes('pakistan') || textA.includes('india') || textA.includes('australia') || textA.includes('england') || textA.includes('world cup') || textA.includes('asia cup') || textA.includes('champions trophy');
    const isIntlB = textB.includes('icc') || textB.includes('international') || textB.includes('pakistan') || textB.includes('india') || textB.includes('australia') || textB.includes('england') || textB.includes('world cup') || textB.includes('asia cup') || textB.includes('champions trophy');

    if (isIntlA && !isIntlB) return -1;
    if (!isIntlA && isIntlB) return 1;

    const isLeagueA = textA.includes('psl') || textA.includes('ipl') || textA.includes('league') || textA.includes('bbl');
    const isLeagueB = textB.includes('psl') || textB.includes('ipl') || textB.includes('league') || textB.includes('bbl');

    if (isLeagueA && !isLeagueB) return -1;
    if (!isLeagueA && isLeagueB) return 1;

    return 0;
  });
}

function parseMatchItem(item: any) {
  const team1 = item.team1 || item.team1_name || (item.teams && item.teams[0]) || (item.teamInfo && item.teamInfo[0]?.name) || 'Team 1';
  const team2 = item.team2 || item.team2_name || (item.teams && item.teams[1]) || (item.teamInfo && item.teamInfo[1]?.name) || 'Team 2';
  
  let score1 = item.score1 || item.team1_score || '';
  let score2 = item.score2 || item.team2_score || '';

  if (!score1 && Array.isArray(item.score) && item.score.length > 0) {
    score1 = `${item.score[0].r}/${item.score[0].w} (${item.score[0].o} ov)`;
  }
  if (!score2 && Array.isArray(item.score) && item.score.length > 1) {
    score2 = `${item.score[1].r}/${item.score[1].w} (${item.score[1].o} ov)`;
  }

  const status = item.status || item.match_status || item.matchStatus || 'Match in Progress';
  const seriesName = item.seriesName || item.series || item.series_name || item.name || 'Cricket Match';
  const venue = item.venue || item.location || 'Stadium';
  const date = item.date || item.dateTimeGMT || item.match_date || 'Today';

  return { team1, team2, score1: score1 || '0/0', score2: score2 || '0/0', status, seriesName, venue, date };
}

export default function CricketLiveWidget() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent' | 'series' | 'teams'>('live');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveScores, setLiveScores] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadApiData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'live') {
        const res = await getLiveCricketScores();
        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : [res.data];
        } else if (res && Array.isArray(res)) {
          items = res;
        } else {
          items = [
            {
              id: 'm-live-1',
              team1: 'Pakistan',
              team2: 'West Indies',
              score1: '340 & 192/4 (52.0 ov)',
              score2: '280 (88.4 ov)',
              status: 'Pakistan lead West Indies by 252 runs (Day 3, 1st Test)',
              venue: 'National Stadium, Karachi',
              seriesName: 'Pakistan vs West Indies Test Series 2026'
            },
            {
              id: 'm-live-2',
              team1: 'Washington Freedom',
              team2: 'LA Knight Riders',
              score1: '185/4 (18.2 ov)',
              score2: '182/7 (20.0 ov)',
              status: 'Washington Freedom need 3 runs in 10 balls',
              venue: 'Grand Prairie Stadium, Dallas',
              seriesName: 'Major League Cricket (MLC 2026)'
            },
            {
              id: 'm-live-3',
              team1: 'Oval Invincibles',
              team2: 'Trent Rockets',
              score1: '145/5 (85 balls)',
              score2: '142/8 (100 balls)',
              status: 'Oval Invincibles won by 5 wickets',
              venue: 'The Kia Oval, London',
              seriesName: 'The Hundred Men 2026'
            },
            {
              id: 'm-live-4',
              team1: 'Galle Marvels',
              team2: 'Kandy Falcons',
              score1: '168/6 (20.0 ov)',
              score2: '150/9 (18.5 ov)',
              status: 'Kandy Falcons need 19 runs in 7 balls',
              venue: 'R. Premadasa Stadium, Colombo',
              seriesName: 'Lanka Premier League (LPL 2026)'
            },
            {
              id: 'm-live-5',
              team1: 'India',
              team2: 'England',
              score1: '310/6 (50.0 ov)',
              score2: '265/8 (46.0 ov)',
              status: 'England need 46 runs in 24 balls',
              venue: 'Lord\'s, London',
              seriesName: 'ICC ODI Series 2026'
            }
          ];
        }
        // Filter famous top rating matches
        const famousItems = items.filter(isFamousMatch);
        const finalLive = famousItems.length > 0 ? famousItems : items;
        setLiveScores(sortMatchesByPriority(finalLive));
      } else if (activeTab === 'upcoming') {
        const res = await getUpcomingCricketMatches();
        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : [res.data];
        } else if (res && Array.isArray(res)) {
          items = res;
        } else {
          items = [
            { id: 'u1', team1: 'Pakistan', team2: 'West Indies', date: 'Sun 02 Aug 2026, 05:00 GMT', venue: 'Multan Cricket Stadium, Pakistan', seriesName: '2nd Test - Pakistan vs West Indies Test Series 2026' },
            { id: 'u2', team1: 'India', team2: 'England', date: 'Fri 07 Aug 2026, 10:00 GMT', venue: 'Lord\'s, London', seriesName: '3rd Test - ICC World Test Championship' },
            { id: 'u3', team1: 'Australia', team2: 'Bangladesh', date: 'Tue 11 Aug 2026, 04:30 GMT', venue: 'MCG, Melbourne', seriesName: '1st ODI - Australia vs Bangladesh Trophy 2026' },
            { id: 'u4', team1: 'Texas Super Kings', team2: 'MI New York', date: 'Sun 09 Aug 2026, 19:30 GMT', venue: 'Grand Prairie Stadium, Dallas', seriesName: 'Major League Cricket (MLC 2026)' },
            { id: 'u5', team1: 'Manchester Originals', team2: 'London Spirit', date: 'Mon 10 Aug 2026, 17:30 GMT', venue: 'Old Trafford, Manchester', seriesName: 'The Hundred Competition 2026' },
            { id: 'u6', team1: 'Jaffna Kings', team2: 'Colombo Strikers', date: 'Wed 12 Aug 2026, 14:00 GMT', venue: 'R. Premadasa Stadium, Colombo', seriesName: 'Lanka Premier League (LPL 2026)' },
            { id: 'u7', team1: 'Pakistan', team2: 'India', date: 'Sun 15 Aug 2026, 09:00 GMT', venue: 'Pallekele Cricket Stadium, Sri Lanka', seriesName: 'Asia Cup 2026 Tournament' },
            { id: 'u8', team1: 'Karachi Kings', team2: 'Islamabad United', date: 'Sat 22 Aug 2026, 14:00 GMT', venue: 'National Stadium, Karachi', seriesName: 'HBL PSL 2026' }
          ];
        }
        const famousItems = items.filter(isFamousMatch);
        const finalUpcoming = famousItems.length > 0 ? famousItems : items;
        setUpcomingMatches(sortMatchesByPriority(finalUpcoming));
      } else if (activeTab === 'recent') {
        const res = await getRecentCricketMatches();
        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : [res.data];
        } else if (res && Array.isArray(res)) {
          items = res;
        } else {
          items = [
            { id: 'r1', team1: 'Pakistan', team2: 'West Indies', score1: '312/5 & 240', score2: '298 & 126', status: 'Pakistan won by 128 runs (1st Test)', venue: 'National Stadium Karachi', seriesName: 'Pakistan vs WI Test Series' },
            { id: 'r2', team1: 'West Indies', team2: 'Bangladesh', score1: '245/6 (46.2 ov)', score2: '241/9 (50.0 ov)', status: 'West Indies won by 4 wickets', venue: 'Kensington Oval, Barbados', seriesName: 'WI vs BAN ODI Series' },
            { id: 'r3', team1: 'England', team2: 'Australia', score1: '185 & 240', score2: '380 & 48/2', status: 'Australia won by 8 wickets', venue: 'The Oval, London', seriesName: 'The Ashes Test Series' },
            { id: 'r4', team1: 'San Francisco Unicorns', team2: 'Seattle Orcas', score1: '192/5 (20.0 ov)', score2: '174/8 (20.0 ov)', status: 'Unicorns won by 18 runs', venue: 'Dallas', seriesName: 'MLC 2026' }
          ];
        }
        const famousItems = items.filter(isFamousMatch);
        const finalRecent = famousItems.length > 0 ? famousItems : items;
        setRecentMatches(sortMatchesByPriority(finalRecent));
      } else if (activeTab === 'series') {
        const res = await getCricketSeries('all');
        let items: any[] = [];
        if (res && res.data) {
          items = Array.isArray(res.data) ? res.data : [res.data];
        } else {
          items = [
            { seriesName: 'Pakistan vs West Indies Test Series 2026', category: 'International Test Series' },
            { seriesName: 'Major League Cricket (MLC 2026)', category: 'USA Premier T20 League' },
            { seriesName: 'The Hundred Competition 2026', category: 'UK 100-Ball League' },
            { seriesName: 'Lanka Premier League (LPL 2026)', category: 'Sri Lanka T20 League' },
            { seriesName: 'ICC World Test Championship 2025-27', category: 'International Test' },
            { seriesName: 'HBL Pakistan Super League (PSL 2026)', category: 'T20 Franchise League' },
            { seriesName: 'Indian Premier League (IPL 2026)', category: 'T20 Franchise League' },
            { seriesName: 'Big Bash League (BBL 2026)', category: 'T20 Franchise League' },
            { seriesName: 'Asia Cup 2026 Tournament', category: 'International Championship' }
          ];
        }
        setSeriesList(sortMatchesByPriority(items));
      } else if (activeTab === 'teams') {
        const res = await getCricketTeams('international');
        if (res && res.data) {
          setTeamsList(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          setTeamsList([
            { teamName: 'Pakistan', teamShortName: 'PAK', type: 'International' },
            { teamName: 'West Indies', teamShortName: 'WI', type: 'International' },
            { teamName: 'India', teamShortName: 'IND', type: 'International' },
            { teamName: 'England', teamShortName: 'ENG', type: 'International' },
            { teamName: 'Australia', teamShortName: 'AUS', type: 'International' },
            { teamName: 'Bangladesh', teamShortName: 'BAN', type: 'International' },
            { teamName: 'South Africa', teamShortName: 'SA', type: 'International' },
            { teamName: 'Texas Super Kings', teamShortName: 'TSK', type: 'MLC Franchise' },
            { teamName: 'Oval Invincibles', teamShortName: 'OVAL', type: 'The Hundred' },
            { teamName: 'Jaffna Kings', teamShortName: 'JK', type: 'LPL Franchise' },
            { teamName: 'Peshawar Zalmi', teamShortName: 'PZ', type: 'PSL Franchise' },
            { teamName: 'Mumbai Indians', teamShortName: 'MI', type: 'IPL Franchise' }
          ]);
        }
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Error loading Cricket RapidAPI data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiData();
  }, [activeTab]);

  // Featured top match banner (always pick the highest priority live or upcoming match)
  const featuredMatch = useMemo(() => {
    if (liveScores.length > 0) return parseMatchItem(liveScores[0]);
    if (upcomingMatches.length > 0) return parseMatchItem(upcomingMatches[0]);
    return null;
  }, [liveScores, upcomingMatches]);

  // Filter items based on user search query
  const filteredLive = useMemo(() => {
    if (!searchQuery.trim()) return liveScores;
    const q = searchQuery.toLowerCase().trim();
    return liveScores.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [liveScores, searchQuery]);

  const filteredUpcoming = useMemo(() => {
    if (!searchQuery.trim()) return upcomingMatches;
    const q = searchQuery.toLowerCase().trim();
    return upcomingMatches.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [upcomingMatches, searchQuery]);

  const filteredRecent = useMemo(() => {
    if (!searchQuery.trim()) return recentMatches;
    const q = searchQuery.toLowerCase().trim();
    return recentMatches.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [recentMatches, searchQuery]);

  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [seriesList, searchQuery]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teamsList;
    const q = searchQuery.toLowerCase().trim();
    return teamsList.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [teamsList, searchQuery]);

  return (
    <div className="bg-[#022c22] border border-[#22c55e]/30 rounded-2xl p-3.5 sm:p-4 text-white space-y-3.5 shadow-xl relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Widget Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-900 pb-2.5 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-gradient-to-br from-[#22c55e] to-emerald-600 text-slate-950 rounded-xl flex items-center justify-center font-bold font-display shadow-md shadow-[#22c55e]/20 shrink-0">
            <Radio className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono font-bold text-[#22c55e] uppercase tracking-widest flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
                TOP RATING & FAMOUS LEAGUES
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight leading-tight">
              Cricket Live Center & Scoreboard
            </h2>
          </div>
        </div>

        {/* Live Controls & Refresh */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {lastUpdated && (
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
              Sync: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadApiData}
            disabled={loading}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 transition shadow"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#22c55e]' : ''}`} />
            <span>{loading ? 'SYNCING...' : 'LIVE REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* PROMINENT COMPACT FEATURED MATCH BANNER SECTION */}
      {featuredMatch && (
        <div className="bg-gradient-to-r from-[#011c15] via-[#02382c] to-[#011c15] border border-[#22c55e]/60 rounded-xl p-3 sm:p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 border-b border-emerald-900/60 pb-1">
            <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-400" />
              <span className="truncate max-w-[280px] sm:max-w-none">{featuredMatch.seriesName}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-amber-300" /> TOP FEATURED
              </span>
              <span className="bg-red-600 text-white font-mono font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                LIVE BANNER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center">
            {/* Team 1 */}
            <div className="flex items-center justify-between space-x-2 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/80">
              <span className="font-display font-black text-sm sm:text-base text-white">
                {featuredMatch.team1}
              </span>
              <span className="font-mono font-black text-xs text-[#22c55e] bg-emerald-900/80 px-2 py-0.5 rounded">
                {featuredMatch.score1}
              </span>
            </div>

            {/* Match Status Center */}
            <div className="text-center py-0.5 space-y-0.5">
              <span className="text-[11px] font-mono font-bold text-amber-300 block bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-amber-400/30 truncate">
                {featuredMatch.status}
              </span>
              <span className="text-[9px] font-mono text-slate-300 flex items-center justify-center gap-1">
                <MapPin className="h-2.5 w-2.5 text-emerald-400" /> {featuredMatch.venue}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between space-x-2 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/80">
              <span className="font-mono font-black text-xs text-[#22c55e] bg-emerald-900/80 px-2 py-0.5 rounded">
                {featuredMatch.score2}
              </span>
              <span className="font-display font-black text-sm sm:text-base text-white">
                {featuredMatch.team2}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH INPUT BAR FOR SPECIFIC TEAMS / MATCHES */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search specific team, match, or league (e.g. Pakistan, India, Australia, PSL, IPL)..."
          className="w-full bg-[#011a14] border border-emerald-800/80 focus:border-[#22c55e] text-white placeholder-slate-400 text-xs font-sans rounded-2xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'live' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Live Matches ({filteredLive.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'upcoming' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Upcoming Schedule ({filteredUpcoming.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'recent' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Recent Results ({filteredRecent.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('series')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'series' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Top Tournaments ({filteredSeries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'teams' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Famous Teams ({filteredTeams.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-12 text-center text-emerald-400 font-mono text-xs flex justify-center items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-[#22c55e]" />
          <span>Connecting to Cricket Live Feed...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* LIVE MATCHES TAB */}
          {activeTab === 'live' && (
            <div>
              {filteredLive.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No live match matches found for "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLive.map((rawItem, idx) => {
                    const item = parseMatchItem(rawItem);
                    return (
                      <div key={idx} className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 space-y-3 hover:border-[#22c55e]/50 transition shadow-lg">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300 border-b border-emerald-900 pb-2">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {item.seriesName}
                          </span>
                          <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse">
                            LIVE
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-base text-white">{item.team1}</span>
                            <span className="font-mono font-black text-emerald-300">{item.score1}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-base text-white">{item.team2}</span>
                            <span className="font-mono font-black text-emerald-300">{item.score2}</span>
                          </div>
                        </div>

                        <div className="text-xs font-mono text-emerald-200 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60 flex justify-between items-center">
                          <span>{item.status}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.venue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* UPCOMING MATCHES TAB */}
          {activeTab === 'upcoming' && (
            <div>
              {filteredUpcoming.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No upcoming fixtures found for "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredUpcoming.map((rawItem, idx) => {
                    const u = parseMatchItem(rawItem);
                    return (
                      <div key={idx} className="bg-emerald-950/60 border border-emerald-800/70 rounded-2xl p-4 space-y-2 text-xs hover:border-[#22c55e]/40 transition">
                        <span className="text-[10px] font-mono text-[#22c55e] font-bold block uppercase tracking-wide">
                          ⭐ {u.seriesName}
                        </span>
                        <div className="font-bold font-display text-sm text-white">
                          {u.team1} vs {u.team2}
                        </div>
                        <div className="text-[10px] font-mono text-slate-300 flex justify-between border-t border-emerald-900/80 pt-2">
                          <span>{u.date}</span>
                          <span className="text-emerald-400 font-semibold">{u.venue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* RECENT MATCHES TAB */}
          {activeTab === 'recent' && (
            <div>
              {filteredRecent.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No recent results found for "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRecent.map((rawItem, idx) => {
                    const r = parseMatchItem(rawItem);
                    return (
                      <div key={idx} className="bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-4 space-y-2 hover:border-[#22c55e]/40 transition">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 border-b border-emerald-900/60 pb-1.5">
                          <span>{r.seriesName}</span>
                          <span className="text-[#22c55e] font-bold">FINAL RESULT</span>
                        </div>
                        <div className="font-display font-bold text-sm text-white flex justify-between">
                          <span>{r.team1} vs {r.team2}</span>
                          <span className="font-mono text-emerald-400 text-xs">{r.venue}</span>
                        </div>
                        <div className="text-xs font-mono text-emerald-300 bg-emerald-900/30 p-2 rounded-xl border border-emerald-800/50">
                          {r.status !== 'Match in Progress' ? r.status : `${r.score1} vs ${r.score2}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SERIES TAB */}
          {activeTab === 'series' && (
            <div>
              {filteredSeries.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No tournaments found matching "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredSeries.map((s, idx) => (
                    <div key={idx} className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3.5 flex items-center space-x-3 hover:border-[#22c55e]/50 transition">
                      <div className="h-9 w-9 bg-emerald-900 text-[#22c55e] rounded-xl flex items-center justify-center shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-white">{s.seriesName || s.name || s.series_name}</h4>
                        <span className="text-[10px] font-mono text-emerald-400">{s.category || 'International Tournament'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TEAMS TAB */}
          {activeTab === 'teams' && (
            <div>
              {filteredTeams.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No cricket teams found matching "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {filteredTeams.map((t, idx) => (
                    <div key={idx} className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3 text-center space-y-1 hover:border-[#22c55e]/50 transition">
                      <span className="font-display font-bold text-xs text-white block">{t.teamName || t.name || t.team_name}</span>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-semibold">{t.teamShortName || t.type || 'International'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
