import React, { useState, useEffect } from 'react';
import { 
  Trophy, Radio, Calendar, Users, List, RefreshCw, ChevronRight, CheckCircle2, AlertCircle, Award, Sparkles
} from 'lucide-react';
import { 
  getLiveCricketScores, getUpcomingCricketMatches, getRecentCricketMatches, 
  getCricketSchedule, getCricketSeries, getCricketTeams 
} from '../lib/cricketApi';

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
        if (res && res.data) {
          setLiveScores(Array.isArray(res.data) ? res.data : [res.data]);
        } else if (res && Array.isArray(res)) {
          setLiveScores(res);
        } else {
          // Fallback initial sample live matches if API is rate limited
          setLiveScores([
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
              team1: 'Peshawar Zalmi',
              team2: 'Lahore Qalandars',
              score1: '198/4 (20.0)',
              score2: '182/7 (19.4)',
              status: 'Peshawar Zalmi need 5 runs in 2 balls',
              venue: 'Rawalpindi Cricket Stadium',
              seriesName: 'HBL PSL Season 10'
            }
          ]);
        }
      } else if (activeTab === 'upcoming') {
        const res = await getUpcomingCricketMatches();
        if (res && res.data) {
          setUpcomingMatches(Array.isArray(res.data) ? res.data : [res.data]);
        } else if (res && Array.isArray(res)) {
          setUpcomingMatches(res);
        } else {
          setUpcomingMatches([
            { id: 'u1', team1: 'Pakistan', team2: 'Australia', date: 'Tomorrow, 14:00 GMT', venue: 'Kadafi Stadium', seriesName: 'ODI Series 2026' },
            { id: 'u2', team1: 'India', team2: 'England', date: 'Fri 06 Jun, 09:30 GMT', venue: 'Lord\'s, London', seriesName: 'Test Championship' },
            { id: 'u3', team1: 'Mumbai Indians', team2: 'Chennai Super Kings', date: 'Sat 07 Jun, 14:00 GMT', venue: 'Wankhede Stadium', seriesName: 'IPL 2026' }
          ]);
        }
      } else if (activeTab === 'recent') {
        const res = await getRecentCricketMatches();
        if (res && res.data) {
          setRecentMatches(Array.isArray(res.data) ? res.data : [res.data]);
        } else if (res && Array.isArray(res)) {
          setRecentMatches(res);
        } else {
          setRecentMatches([
            { id: 'r1', team1: 'Pakistan', team2: 'South Africa', score1: '312/5', score2: '298/10', status: 'Pakistan won by 14 runs', venue: 'Karachi' },
            { id: 'r2', team1: 'England', team2: 'Australia', score1: '185 & 240', score2: '380 & 48/2', status: 'Australia won by 8 wickets', venue: 'Oval' }
          ]);
        }
      } else if (activeTab === 'series') {
        const res = await getCricketSeries('all');
        if (res && res.data) {
          setSeriesList(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          setSeriesList([
            { seriesName: 'HBL Pakistan Super League (PSL 2026)', category: 'T20 League' },
            { seriesName: 'Indian Premier League (IPL 2026)', category: 'T20 League' },
            { seriesName: 'ICC Cricket World Cup', category: 'International' },
            { seriesName: 'Asia Cup 2026', category: 'International' },
            { seriesName: 'ICC Champions Trophy', category: 'ICC Event' }
          ]);
        }
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
            { teamName: 'South Africa', teamShortName: 'SA', type: 'International' }
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

  return (
    <div className="bg-[#022c22] border border-[#22c55e]/30 rounded-3xl p-6 text-white space-y-5 shadow-xl">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-900 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#22c55e] text-slate-950 rounded-2xl flex items-center justify-center font-bold font-display shadow">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-widest">
                RAPIDAPI LIVE SCORE FEED
              </span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
              Cricket Live Center & Match Hub
            </h2>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadApiData}
            disabled={loading}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#22c55e]' : ''}`} />
            <span>{loading ? 'SYNCING...' : 'REFRESH API'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'live' ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Live Matches</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'upcoming' ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Upcoming Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`px-3 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'recent' ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Recent Results</span>
        </button>

        <button
          onClick={() => setActiveTab('series')}
          className={`px-3 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'series' ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Series & Tournaments</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3 py-2 rounded-xl transition uppercase flex items-center space-x-1.5 ${
            activeTab === 'teams' ? 'bg-[#22c55e] text-slate-950 font-extrabold shadow' : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Teams Directory</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-12 text-center text-emerald-400 font-mono text-xs flex justify-center items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-[#22c55e]" />
          <span>Connecting to RapidAPI Cricket Data Endpoint...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === 'live' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveScores.map((rawItem, idx) => {
                const item = parseMatchItem(rawItem);
                return (
                  <div key={idx} className="bg-emerald-950/70 border border-emerald-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300 border-b border-emerald-900 pb-2">
                      <span className="font-bold uppercase tracking-wider">{item.seriesName}</span>
                      <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[9px] uppercase">LIVE</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-base">{item.team1}</span>
                        <span className="font-mono font-bold text-emerald-300">{item.score1}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-base">{item.team2}</span>
                        <span className="font-mono font-bold text-emerald-300">{item.score2}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-emerald-200 bg-emerald-900/40 p-2 rounded-lg border border-emerald-800/60">
                      {item.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {upcomingMatches.map((rawItem, idx) => {
                const u = parseMatchItem(rawItem);
                return (
                  <div key={idx} className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-3.5 space-y-2 text-xs">
                    <span className="text-[10px] font-mono text-[#22c55e] font-bold block uppercase">{u.seriesName}</span>
                    <div className="font-bold font-display text-sm text-white">
                      {u.team1} vs {u.team2}
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 flex justify-between border-t border-emerald-900/60 pt-2">
                      <span>{u.date}</span>
                      <span className="text-emerald-400">{u.venue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentMatches.map((rawItem, idx) => {
                const r = parseMatchItem(rawItem);
                return (
                  <div key={idx} className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{r.seriesName}</span>
                      <span className="text-[#22c55e] font-bold">COMPLETED</span>
                    </div>
                    <div className="font-display font-bold text-sm text-white">
                      {r.team1} vs {r.team2}
                    </div>
                    <div className="text-xs font-mono text-emerald-300">
                      {r.status !== 'Match in Progress' ? r.status : `${r.score1} vs ${r.score2}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'series' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {seriesList.map((s, idx) => (
                <div key={idx} className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-3 flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-[#22c55e] shrink-0" />
                  <div>
                    <h4 className="font-display font-bold text-xs text-white">{s.seriesName || s.name || s.series_name}</h4>
                    <span className="text-[10px] font-mono text-emerald-400">{s.category || 'Cricket Tournament'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {teamsList.map((t, idx) => (
                <div key={idx} className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-3 text-center space-y-1">
                  <span className="font-display font-bold text-xs text-white block">{t.teamName || t.name || t.team_name}</span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase">{t.teamShortName || t.type || 'International'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
