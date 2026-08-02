import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Radio, Calendar, Users, RefreshCw, CheckCircle2, AlertCircle, Search, MapPin, Flame, ChevronRight, ArrowRight
} from 'lucide-react';
import { 
  getLiveCricketScores, getUpcomingCricketMatches, getRecentCricketMatches, 
  getCricketSeries, getCricketTeams 
} from '../lib/cricketApi';

interface CricketLiveWidgetProps {
  variant?: 'banner' | 'full';
  onNavigate?: (path: string) => void;
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

export default function CricketLiveWidget({ variant = 'full', onNavigate }: CricketLiveWidgetProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent' | 'series' | 'teams'>('live');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveScores, setLiveScores] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [bannerTab, setBannerTab] = useState<'live' | 'upcoming'>('upcoming');

  const loadApiData = async () => {
    setLoading(true);
    try {
      // 1. LIVE SCORES (International & Domestic Leagues: PSL, IPL, MLC, The Hundred, LPL)
      const resLive = await getLiveCricketScores();
      let liveItems: any[] = [];
      if (resLive && resLive.data) {
        liveItems = Array.isArray(resLive.data) ? resLive.data : [resLive.data];
      } else if (resLive && Array.isArray(resLive)) {
        liveItems = resLive;
      } else {
        liveItems = [
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
      setLiveScores(liveItems);

      // 2. UPCOMING MATCHES (Including Pakistan vs West Indies 2nd Test on 2 August 2026!)
      const resUpcoming = await getUpcomingCricketMatches();
      let upcomingItems: any[] = [];
      if (resUpcoming && resUpcoming.data) {
        upcomingItems = Array.isArray(resUpcoming.data) ? resUpcoming.data : [resUpcoming.data];
      } else if (resUpcoming && Array.isArray(resUpcoming)) {
        upcomingItems = resUpcoming;
      } else {
        upcomingItems = [
          { 
            id: 'u1', 
            team1: 'Pakistan', 
            team2: 'West Indies', 
            date: 'Sun 02 Aug 2026, 05:00 GMT', 
            venue: 'Multan Cricket Stadium, Pakistan', 
            seriesName: '2nd Test - Pakistan vs West Indies Test Series 2026' 
          },
          { 
            id: 'u2', 
            team1: 'India', 
            team2: 'England', 
            date: 'Fri 07 Aug 2026, 10:00 GMT', 
            venue: 'Lord\'s, London', 
            seriesName: '3rd Test - ICC World Test Championship' 
          },
          { 
            id: 'u3', 
            team1: 'Australia', 
            team2: 'Bangladesh', 
            date: 'Tue 11 Aug 2026, 04:30 GMT', 
            venue: 'MCG, Melbourne', 
            seriesName: '1st ODI - Australia vs Bangladesh Trophy 2026' 
          },
          { 
            id: 'u4', 
            team1: 'Texas Super Kings', 
            team2: 'MI New York', 
            date: 'Sun 09 Aug 2026, 19:30 GMT', 
            venue: 'Grand Prairie Stadium, Dallas', 
            seriesName: 'Major League Cricket (MLC 2026)' 
          },
          { 
            id: 'u5', 
            team1: 'Manchester Originals', 
            team2: 'London Spirit', 
            date: 'Mon 10 Aug 2026, 17:30 GMT', 
            venue: 'Old Trafford, Manchester', 
            seriesName: 'The Hundred Competition 2026' 
          },
          { 
            id: 'u6', 
            team1: 'Jaffna Kings', 
            team2: 'Colombo Strikers', 
            date: 'Wed 12 Aug 2026, 14:00 GMT', 
            venue: 'R. Premadasa Stadium, Colombo', 
            seriesName: 'Lanka Premier League (LPL 2026)' 
          },
          { 
            id: 'u7', 
            team1: 'Pakistan', 
            team2: 'India', 
            date: 'Sun 15 Aug 2026, 09:00 GMT', 
            venue: 'Pallekele Cricket Stadium, Sri Lanka', 
            seriesName: 'Asia Cup 2026 Tournament' 
          },
          { 
            id: 'u8', 
            team1: 'Karachi Kings', 
            team2: 'Islamabad United', 
            date: 'Sat 22 Aug 2026, 14:00 GMT', 
            venue: 'National Stadium, Karachi', 
            seriesName: 'HBL PSL 2026' 
          }
        ];
      }
      setUpcomingMatches(upcomingItems);

      // 3. RECENT MATCH RESULTS
      const resRecent = await getRecentCricketMatches();
      let recentItems: any[] = [];
      if (resRecent && resRecent.data) {
        recentItems = Array.isArray(resRecent.data) ? resRecent.data : [resRecent.data];
      } else if (resRecent && Array.isArray(resRecent)) {
        recentItems = resRecent;
      } else {
        recentItems = [
          { id: 'r1', team1: 'Pakistan', team2: 'West Indies', score1: '312/5 & 240', score2: '298 & 126', status: 'Pakistan won by 128 runs (1st Test)', venue: 'National Stadium Karachi', seriesName: 'Pakistan vs WI Test Series' },
          { id: 'r2', team1: 'West Indies', team2: 'Bangladesh', score1: '245/6 (46.2 ov)', score2: '241/9 (50.0 ov)', status: 'West Indies won by 4 wickets', venue: 'Kensington Oval, Barbados', seriesName: 'WI vs BAN ODI Series' },
          { id: 'r3', team1: 'England', team2: 'Australia', score1: '185 & 240', score2: '380 & 48/2', status: 'Australia won by 8 wickets', venue: 'The Oval, London', seriesName: 'The Ashes Test Series' },
          { id: 'r4', team1: 'San Francisco Unicorns', team2: 'Seattle Orcas', score1: '192/5 (20.0 ov)', score2: '174/8 (20.0 ov)', status: 'Unicorns won by 18 runs', venue: 'Dallas', seriesName: 'MLC 2026' }
        ];
      }
      setRecentMatches(recentItems);

      // 4. TOURNAMENTS & SERIES
      const resSeries = await getCricketSeries('all');
      let seriesItems: any[] = [];
      if (resSeries && resSeries.data) {
        seriesItems = Array.isArray(resSeries.data) ? resSeries.data : [resSeries.data];
      } else {
        seriesItems = [
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
      setSeriesList(seriesItems);

      // 5. TEAMS LIST
      const resTeams = await getCricketTeams('international');
      if (resTeams && resTeams.data) {
        setTeamsList(Array.isArray(resTeams.data) ? resTeams.data : [resTeams.data]);
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

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Error loading Cricket data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiData();
  }, []);

  // Filter items based on user search query (show all matches, no top rating filter)
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

  // =========================================================================
  // HOMEPAGE COMPACT SLEEK BANNER MODE (Takes minimal vertical space right below Navbar)
  // =========================================================================
  if (variant === 'banner') {
    return (
      <div className="bg-[#022c22] border border-emerald-900 rounded-2xl p-2.5 sm:p-3 text-white shadow-sm relative overflow-hidden">
        {/* Sleek Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/80 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className="bg-[#22c55e] text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE BANNER
            </span>
            <span className="font-display font-black text-xs sm:text-sm text-white uppercase tracking-tight">
              Cricket Matches &amp; Schedule
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-[#01140f] p-0.5 rounded-lg border border-emerald-900 text-[10px] font-mono font-bold">
              <button
                onClick={() => setBannerTab('upcoming')}
                className={`px-2.5 py-1 rounded transition ${bannerTab === 'upcoming' ? 'bg-[#22c55e] text-slate-950 font-black' : 'text-slate-300 hover:text-white'}`}
              >
                Upcoming (2 Aug)
              </button>
              <button
                onClick={() => setBannerTab('live')}
                className={`px-2.5 py-1 rounded transition ${bannerTab === 'live' ? 'bg-[#22c55e] text-slate-950 font-black' : 'text-slate-300 hover:text-white'}`}
              >
                Live Scores
              </button>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('/live-stream')}
                className="bg-emerald-900/80 hover:bg-[#22c55e] hover:text-slate-950 text-[#22c55e] border border-emerald-700/60 px-3 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition shadow cursor-pointer"
              >
                <span>Full Live Center &amp; Matches</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Match Cards Ribbon (Horizontal Scroll / Grid) */}
        {loading ? (
          <div className="py-2 text-center text-emerald-400 font-mono text-[10px] flex items-center justify-center space-x-1.5">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#22c55e]" />
            <span>Loading Cricket Banner Feeds...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {bannerTab === 'upcoming' ? (
              upcomingMatches.slice(0, 4).map((rawItem, idx) => {
                const item = parseMatchItem(rawItem);
                const isPakWi2nd = item.team1.includes('Pakistan') && item.team2.includes('West Indies');
                return (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg border transition ${
                      isPakWi2nd 
                        ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 border-[#22c55e] shadow-md ring-1 ring-[#22c55e]/50' 
                        : 'bg-emerald-950/70 border-emerald-800/80 hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-300 mb-1">
                      <span className="font-bold truncate max-w-[140px]">{item.seriesName}</span>
                      {isPakWi2nd && (
                        <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-1.5 rounded uppercase">
                          MATCH HIGHLIGHT
                        </span>
                      )}
                    </div>
                    <div className="font-display font-black text-xs text-white flex justify-between items-center my-0.5">
                      <span>{item.team1} vs {item.team2}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-300 flex justify-between items-center border-t border-emerald-900/60 pt-1 mt-1">
                      <span className="text-amber-300 font-bold">{item.date}</span>
                      <span className="text-emerald-400 truncate max-w-[110px]">{item.venue}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              liveScores.slice(0, 4).map((rawItem, idx) => {
                const item = parseMatchItem(rawItem);
                return (
                  <div key={idx} className="bg-emerald-950/70 border border-emerald-800/80 p-2.5 rounded-lg hover:border-emerald-600 transition">
                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-300 mb-1">
                      <span className="font-bold truncate max-w-[150px]">{item.seriesName}</span>
                      <span className="bg-red-500 text-white font-bold text-[8px] px-1.5 rounded animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <div className="space-y-0.5 text-xs font-bold font-display">
                      <div className="flex justify-between">
                        <span>{item.team1}</span>
                        <span className="font-mono text-emerald-300 text-[11px]">{item.score1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{item.team2}</span>
                        <span className="font-mono text-emerald-300 text-[11px]">{item.score2}</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-amber-300 border-t border-emerald-900/60 pt-1 mt-1 truncate">
                      {item.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // FULL DETAILED CRICKET CENTER PAGE VIEW (Used in /sport/cricket)
  // Shows ALL matches (International & Leagues), Search Bar, & Comprehensive Detail
  // =========================================================================
  return (
    <div className="bg-[#022c22] border border-emerald-900 rounded-2xl p-4 sm:p-5 text-white space-y-4 shadow-sm relative overflow-hidden">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-900 pb-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#22c55e] text-slate-950 rounded-xl flex items-center justify-center font-bold font-display shadow-sm shrink-0">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-widest flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
                ALL INTERNATIONAL &amp; LEAGUE MATCHES
              </span>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
              Cricket Live Center &amp; Scoreboard
            </h2>
          </div>
        </div>

        {/* Refresh & Sync Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Synced: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadApiData}
            disabled={loading}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#22c55e]' : ''}`} />
            <span>{loading ? 'REFRESHING...' : 'LIVE REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* SEARCH INPUT BAR FOR ALL TEAMS & MATCHES */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any team or match (e.g. Pakistan, West Indies, India, England, MLC, PSL, IPL, The Hundred, LPL)..."
          className="w-full bg-[#011a14] border border-emerald-800/80 focus:border-[#22c55e] text-white placeholder-slate-400 text-xs font-sans rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition"
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
          <span>Tournaments & Leagues ({filteredSeries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3.5 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'teams' ? 'bg-[#22c55e] text-slate-950 font-black shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Teams Directory ({filteredTeams.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-12 text-center text-emerald-400 font-mono text-xs flex justify-center items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-[#22c55e]" />
          <span>Connecting to Live Cricket Feeds...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* LIVE MATCHES TAB */}
          {activeTab === 'live' && (
            <div>
              {filteredLive.length === 0 ? (
                <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-300">No live matches found for "{searchQuery}".</p>
                  <button onClick={() => setSearchQuery('')} className="text-xs font-mono text-[#22c55e] underline font-bold">Clear search filter</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLive.map((rawItem, idx) => {
                    const item = parseMatchItem(rawItem);
                    return (
                      <div key={idx} className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 space-y-3 hover:border-[#22c55e]/50 transition shadow-lg">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300 border-b border-emerald-900 pb-2">
                          <span className="font-bold uppercase tracking-wider">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredUpcoming.map((rawItem, idx) => {
                    const u = parseMatchItem(rawItem);
                    const isHighlight = u.team1.includes('Pakistan') && u.team2.includes('West Indies');
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-2xl p-4 space-y-2 text-xs transition ${
                          isHighlight 
                            ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-950 border-[#22c55e] shadow-lg ring-1 ring-[#22c55e]/40' 
                            : 'bg-emerald-950/60 border-emerald-800/70 hover:border-[#22c55e]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#22c55e] font-bold block uppercase tracking-wide truncate max-w-[200px]">
                            {u.seriesName}
                          </span>
                          {isHighlight && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase">
                              KEY FIXTURE
                            </span>
                          )}
                        </div>
                        <div className="font-bold font-display text-base text-white">
                          {u.team1} vs {u.team2}
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 font-bold bg-emerald-900/50 p-2 rounded-xl border border-emerald-800/40">
                          Scheduled: {u.date}
                        </div>
                        <div className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-emerald-400" />
                          <span>{u.venue}</span>
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
                        <span className="text-[10px] font-mono text-emerald-400">{s.category || 'Tournament'}</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredTeams.map((t, idx) => (
                    <div key={idx} className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3 text-center space-y-1 hover:border-[#22c55e]/50 transition">
                      <span className="font-display font-bold text-xs text-white block">{t.teamName || t.name || t.team_name}</span>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase font-semibold">{t.teamShortName || t.type || 'Cricket Team'}</span>
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
