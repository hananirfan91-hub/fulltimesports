import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Compass, ArrowRight, Clock, Star, MapPin, HelpCircle } from 'lucide-react';
import { FixtureItem, RankingItem } from '../types';
import { DB } from '../lib/db';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface RankingsFixturesProps {
  initialTab?: 'rankings' | 'fixtures';
  onNavigate: (path: string) => void;
}

export default function RankingsFixtures({ initialTab = 'rankings', onNavigate }: RankingsFixturesProps) {
  const [activeTab, setActiveTab] = useState<'rankings' | 'fixtures'>(initialTab);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [activeSportFilter, setActiveSportFilter] = useState('all');

  useEffect(() => {
    setFixtures(DB.getFixtures());
    setRankings(DB.getRankings());
  }, []);

  const sportsList = DB.getCategories();

  // Perform filtration queries
  const filteredFixtures = fixtures.filter(f => 
    activeSportFilter === 'all' || f.sport === activeSportFilter
  );

  const filteredRankings = rankings.filter(r => 
    activeSportFilter === 'all' || r.sport === activeSportFilter
  );

  // Group Rankings by categoryName to render nice tables
  const groupedRankings = filteredRankings.reduce((groups: { [key: string]: RankingItem[] }, item) => {
    const key = item.categoryName;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8 bg-white" id="standings-fixtures-page">
      
      {/* Editorial Header - STYLED IN DARK SPORT GREEN */}
      <div className="bg-[#022c22] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] text-white p-8 md:p-12 rounded-3xl border-b-4 border-[#22c55e] text-center max-w-5xl mx-auto relative overflow-hidden shadow-md">
        <span className="font-mono text-[10px] text-[#22c55e] font-bold uppercase tracking-widest block mb-1">
          FTS MATCH STATS NODE • MANUAL COMPLIANCE
        </span>
        <h1 className="font-display font-black text-3.5xl md:text-5xl uppercase tracking-tighter leading-none text-white">
          GLOBAL STANDINGS & COLUMN SCHEDULES
        </h1>
        <p className="text-xs text-slate-350 mt-2 max-w-xl mx-auto leading-relaxed">
          Access high-fidelity ICC test listings, Premier League transfer standings, and Formula 1 Grand Prix schedules, updated directly by editors inside our virtual database.
        </p>
      </div>

      {/* AdSense Top Ad */}
      <AdSensePlaceholder slot="rankings-header-leaderboard" format="horizontal" />

      {/* ANSWER BOX FULFILLING DIRECTIVES "EACH PAGE TELLS AN ANSWER" */}
      <div className="bg-[#f0fdf4] border-2 border-[#22c55e]/25 rounded-2xl p-6 text-slate-905 max-w-5xl mx-auto shadow-xs" id="fixtures-stats-answer-desk">
        <div className="flex items-center space-x-2.5 mb-3">
          <span className="p-0.5 px-2 bg-[#022c22] text-[#22c55e] font-mono text-[9px] font-black uppercase rounded tracking-wider">
            Resolution Desk
          </span>
          <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider font-mono">
            Platform Clarity & Precision Assurance
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest leading-none">The Central Query:</p>
            <h3 className="font-display font-black text-sm uppercase text-[#022c22] mt-1">
              Why are standings and match schedules maintained manually instead of using automatic live score scrapers?
            </h3>
          </div>
          <div className="border-t border-[#22c55e]/15 pt-2">
            <p className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest leading-none">The Answer:</p>
            <p className="text-[#052e16] text-xs md:text-sm mt-1 leading-relaxed font-sans font-medium">
              Live score scrapers frequently fail, display wrong data during API rate limits, and introduce non-human automated metadata that penalizes AdSense compliance. FTS publishes original sports news. Our sports desks manually enter rankings and fixture results straight into the virtual server after verification—guaranteeing 100% accurate data and premium, penalty-free sport media standards.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selectors & Sport Quick Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-5xl mx-auto shadow-xs">
        
        {/* Main Tab */}
        <div className="flex bg-[#022c22]/10 p-1 rounded font-mono text-xs font-bold leading-none">
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded transition uppercase ${activeTab === 'rankings' ? 'bg-[#022c22] text-white shadow-xs' : 'text-[#052e16] hover:text-[#022c22]'}`}
          >
            🏆 Editorial Standings
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2 rounded transition uppercase ${activeTab === 'fixtures' ? 'bg-[#022c22] text-white shadow-xs' : 'text-[#052e16] hover:text-[#022c22]'}`}
          >
            📅 Match Calendars
          </button>
        </div>

        {/* Dynamic Sport Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-705">Filter Sport:</span>
          <select
            value={activeSportFilter}
            onChange={(e) => setActiveSportFilter(e.target.value)}
            className="bg-white border rounded px-3 py-1.5 focus:outline-none focus:border-[#22c55e] font-bold text-slate-850"
          >
            <option value="all">FTS Multi-Sport (All)</option>
            {sportsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>


      {/* MAIN RENDER BOX */}
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. STANDINGS RENDER */}
        {activeTab === 'rankings' && (
          <div className="space-y-8" id="standings-pane">

            {Object.keys(groupedRankings).length === 0 ? (
              <div className="border border-slate-200 rounded-2xl p-12 text-center bg-slate-50/50 text-slate-500">
                <Trophy className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm">No Active Standings Found</p>
                <p className="text-xs text-slate-400">Select another sport or clear filters to view active categories.</p>
              </div>
            ) : (
              Object.keys(groupedRankings).map((catName) => {
                const rows = groupedRankings[catName].sort((a,b) => a.rank - b.rank);
                return (
                  <div key={catName} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id={`table-${catName.replace(/\s+/g, '-')}`}>
                    <div className="bg-[#022c22] text-white p-4 font-display font-medium text-xs tracking-wider uppercase flex justify-between items-center border-b border-emerald-950">
                      <span>{catName}</span>
                      <span className="bg-[#22c55e] text-slate-950 text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase">
                        Current
                      </span>
                    </div>

                    <table className="w-full text-xs md:text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                          <th className="py-3 px-4">Position</th>
                          <th className="py-3 px-4">Team / Player</th>
                          <th className="py-3 px-4">Points</th>
                          <th className="py-3 px-4">Conference / Form Extra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {rows.map((row) => (
                          <tr key={row.id} className="hover:bg-[#f0fdf4]/35 transition font-sans">
                            <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">#{row.rank}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">{row.name}</td>
                            <td className="py-3.5 px-4 font-mono font-extrabold text-[#22c55e]">{row.points}</td>
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400">{row.extra || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}

          </div>
        )}

        {/* 2. FIXTURES DIRECT RENDER */}
        {activeTab === 'fixtures' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="fixtures-grid">
            
            {filteredFixtures.length === 0 ? (
              <div className="col-span-2 border border-slate-200 rounded-2xl p-12 text-center bg-slate-50/55 text-slate-500">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm">No Match Calendars Found</p>
                <p className="text-xs text-slate-400">Select another sport filter or check back later for active schedules.</p>
              </div>
            ) : (
              filteredFixtures.map((fix) => (
                <div 
                  key={fix.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#22c55e] hover:shadow-md transition duration-150 relative overflow-hidden"
                >
                  {/* Category Stamp */}
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">
                    <span>{fix.sport} • {fix.stage}</span>
                    {fix.status === 'live' && (
                      <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">● LIVE UPDATE</span>
                    )}
                    {fix.status === 'completed' && (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">FT Match</span>
                    )}
                    {fix.status === 'upcoming' && (
                      <span className="text-[#22c55e] bg-emerald-50 px-2 py-0.5 rounded font-extrabold">Scheduled</span>
                    )}
                  </div>

                  {/* Core Contenders */}
                  <div className="flex justify-between items-center py-2.5">
                    <span className="font-display font-black text-sm md:text-base text-slate-900 max-w-[140px] uppercase truncate">
                      {fix.team1}
                    </span>
                    
                    <span className="bg-[#022c22] border border-emerald-950 font-mono font-black text-[#22c55e] px-3 py-1 rounded text-xs">
                      {fix.score || 'VS'}
                    </span>

                    <span className="font-display font-black text-sm md:text-base text-slate-900 max-w-[140px] uppercase truncate text-right">
                      {fix.team2}
                    </span>
                  </div>

                  {/* Date, Time, Venue */}
                  <div className="pt-3 border-t border-slate-100/60 flex flex-col space-y-1 text-[11px] text-slate-450 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                      <span>{fix.date} @ <strong className="text-slate-700">{fix.time}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5 italic">
                      <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                      <span>{fix.venue}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        )}

      </div>

      <div className="max-w-5xl mx-auto pt-6">
        <AdSensePlaceholder slot="rankings-bottom-banner" format="horizontal" />
      </div>

    </div>
  );
}
