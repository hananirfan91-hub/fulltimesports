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
  'pakistan', 'india', 'australia', 'england', 'south africa', 'new zealand', 'west indies', 'sri lanka',
  'psl', 'ipl', 'bbl', 'icc', 'champions trophy', 'world cup', 'asia cup', 'peshawar zalmi', 'lahore qalandars',
  'karachi kings', 'islamabad united', 'mumbai indians', 'chennai super kings', 'royal challengers'
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
              team2: 'India',
              score1: '286/6 (50.0)',
              score2: '242/8 (44.2)',
              status: 'Pakistan won by 44 runs (DLS Method)',
              venue: 'Gaddafi Stadium, Lahore',
              seriesName: 'ICC Champions Trophy 2025/26'
            },
            {
              id: 'm-live-2',
              team1: 'Australia',
              team2: 'England',
              score1: '310/4 (48.1)',
              score2: '308/9 (50.0)',
              status: 'Australia need 3 runs in 11 balls',
              venue: 'MCG, Melbourne',
              seriesName: 'ODI International Series 2026'
            },
            {
              id: 'm-live-3',
              team1: 'Peshawar Zalmi',
              team2: 'Lahore Qalandars',
              score1: '198/4 (20.0)',
              score2: '182/7 (19.4)',
              status: 'Peshawar Zalmi need 5 runs in 2 balls',
              venue: 'Rawalpindi Cricket Stadium',
              seriesName: 'HBL PSL Season 10'
            },
            {
              id: 'm-live-4',
              team1: 'Mumbai Indians',
              team2: 'Chennai Super Kings',
              score1: '175/5 (18.2)',
              score2: '174/8 (20.0)',
              status: 'Mumbai Indians won by 5 wickets',
              venue: 'Wankhede Stadium, Mumbai',
              seriesName: 'Indian Premier League (IPL 2026)'
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
            { id: 'u1', team1: 'Pakistan', team2: 'Australia', date: 'Tomorrow, 14:00 GMT', venue: 'Gaddafi Stadium, Lahore', seriesName: 'ICC ODI Series 2026' },
            { id: 'u2', team1: 'India', team2: 'England', date: 'Fri 06 Jun, 09:30 GMT', venue: 'Lord\'s, London', seriesName: 'ICC World Test Championship' },
            { id: 'u3', team1: 'Pakistan', team2: 'India', date: 'Sun 15 Jun, 09:00 GMT', venue: 'Colombo, Sri Lanka', seriesName: 'Asia Cup 2026' },
            { id: 'u4', team1: 'Karachi Kings', team2: 'Islamabad United', date: 'Sat 07 Jun, 14:00 GMT', venue: 'National Stadium, Karachi', seriesName: 'HBL PSL 2026' },
            { id: 'u5', team1: 'Royal Challengers Bengaluru', team2: 'Kolkata Knight Riders', date: 'Sun 08 Jun, 14:00 GMT', venue: 'Chinnaswamy Stadium', seriesName: 'IPL 2026' }
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
            { id: 'r1', team1: 'Pakistan', team2: 'South Africa', score1: '312/5', score2: '298/10', status: 'Pakistan won by 14 runs', venue: 'Karachi', seriesName: 'ICC ODI Series' },
            { id: 'r2', team1: 'England', team2: 'Australia', score1: '185 & 240', score2: '380 & 48/2', status: 'Australia won by 8 wickets', venue: 'The Oval', seriesName: 'The Ashes Test Series' },
            { id: 'r3', team1: 'Quetta Gladiators', team2: 'Multan Sultans', score1: '165/8', score2: '166/3', status: 'Multan Sultans won by 7 wickets', venue: 'Multan', seriesName: 'PSL Season 10' }
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
            { seriesName: 'ICC Cricket World Cup 2027', category: 'International ICC Event' },
            { seriesName: 'ICC Champions Trophy 2025/26', category: 'International ICC Event' },
            { seriesName: 'Asia Cup 2026 Tournament', category: 'International Championship' },
            { seriesName: 'ICC World Test Championship Final', category: 'International Test' },
            { seriesName: 'HBL Pakistan Super League (PSL 2026)', category: 'T20 Franchise League' },
            { seriesName: 'Indian Premier League (IPL 2026)', category: 'T20 Franchise League' },
            { seriesName: 'Big Bash League (BBL 2026)', category: 'T20 League' }
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
            { teamName: 'India', teamShortName: 'IND', type: 'International' },
            { teamName: 'Australia', teamShortName: 'AUS', type: 'International' },
            { teamName: 'England', teamShortName: 'ENG', type: 'International' },
            { teamName: 'South Africa', teamShortName: 'SA', type: 'International' },
            { teamName: 'New Zealand', teamShortName: 'NZ', type: 'International' },
            { teamName: 'Peshawar Zalmi', teamShortName: 'PZ', type: 'PSL Franchise' },
            { teamName: 'Lahore Qalandars', teamShortName: 'LQ', type: 'PSL Franchise' },
            { teamName: 'Mumbai Indians', teamShortName: 'MI', type: 'IPL Franchise' },
            { teamName: 'Chennai Super Kings', teamShortName: 'CSK', type: 'IPL Franchise' }
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
    <div className="bg-[#022c22] border border-[#22c55e]/30 rounded-3xl p-5 sm:p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Widget Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-900 pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 bg-gradient-to-br from-[#22c55e] to-emerald-600 text-slate-950 rounded-2xl flex items-center justify-center font-bold font-display shadow-lg shadow-[#22c55e]/20">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-widest flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
                TOP MATCHES & FAMOUS LEAGUES
              </span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
              Cricket Live Center
            </h2>
          </div>
        </div>

        {/* Live Controls & Refresh */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadApiData}
            disabled={loading}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#22c55e]' : ''}`} />
            <span>{loading ? 'REFRESHING...' : 'LIVE REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* PROMINENT FEATURED MATCH BANNER SECTION AT MAIN TOP */}
      {featuredMatch && (
        <div className="bg-gradient-to-r from-[#011c15] via-[#02382c] to-[#011c15] border-2 border-[#22c55e]/60 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-2 right-3 flex items-center space-x-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-300" /> FEATURED TOP RATING MATCH
            </span>
            <span className="bg-red-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
              LIVE BANNER
            </span>
          </div>

          <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>{featuredMatch.seriesName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Team 1 */}
            <div className="flex items-center justify-between md:justify-start space-x-3 bg-emerald-950/70 p-3 rounded-xl border border-emerald-800/80">
              <div>
                <span className="font-display font-black text-lg sm:text-xl text-white block">
                  {featuredMatch.team1}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Team A</span>
              </div>
              <span className="font-mono font-black text-lg text-[#22c55e] bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                {featuredMatch.score1}
              </span>
            </div>

            {/* Match Status Center */}
            <div className="text-center space-y-1 py-1">
              <span className="text-xs font-mono font-bold text-amber-300 block bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-amber-400/30">
                {featuredMatch.status}
              </span>
              <span className="text-[10px] font-mono text-slate-300 flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" /> {featuredMatch.venue}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between md:justify-end space-x-3 bg-emerald-950/70 p-3 rounded-xl border border-emerald-800/80">
              <span className="font-mono font-black text-lg text-[#22c55e] bg-emerald-900/60 px-2.5 py-1 rounded-lg order-2 md:order-1">
                {featuredMatch.score2}
              </span>
              <div className="text-right order-1 md:order-2">
                <span className="font-display font-black text-lg sm:text-xl text-white block">
                  {featuredMatch.team2}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Team B</span>
              </div>
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
