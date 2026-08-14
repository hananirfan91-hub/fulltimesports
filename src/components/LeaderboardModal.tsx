import React, { useState, useEffect } from 'react';
import { Trophy, Award, Calendar, ChevronRight, X, Sparkles, HelpCircle, Mail, User } from 'lucide-react';
import { DB } from '../lib/db';
import { MonthlyLeaderboard } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuiz?: () => void;
}

export default function LeaderboardModal({ isOpen, onClose, onOpenQuiz }: LeaderboardModalProps) {
  const [leaderboards, setLeaderboards] = useState<MonthlyLeaderboard[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
  const [currentLeaderboard, setCurrentLeaderboard] = useState<MonthlyLeaderboard | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allLb = DB.getMonthlyLeaderboards();
      setLeaderboards(allLb);

      const published = DB.getPublishedLeaderboard();
      if (published) {
        setSelectedMonthYear(published.month_year);
        setCurrentLeaderboard(published);
      } else if (allLb.length > 0) {
        setSelectedMonthYear(allLb[0].month_year);
        setCurrentLeaderboard(allLb[0]);
      }
    }
  }, [isOpen]);

  const handleMonthChange = (monthYear: string) => {
    setSelectedMonthYear(monthYear);
    const target = leaderboards.find(l => l.month_year === monthYear);
    setCurrentLeaderboard(target || null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#022c22] border border-[#22c55e]/30 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8" id="public-leaderboard-dialog">
        {/* Header Bar */}
        <div className="bg-[#01140f] px-6 py-5 border-b border-emerald-950 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-wider block">
                The Sports Room • Hall of Fame
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
                Monthly Sports Fan Leaderboard
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-emerald-950 transition"
            aria-label="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Month Selector & Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#01140f] p-4 rounded-xl border border-emerald-950">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs font-mono text-slate-300 font-bold uppercase">Select Month:</span>
              <select
                value={selectedMonthYear}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-[#022c22] border border-emerald-900 text-slate-100 font-mono text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#22c55e] leaderboard-date"
              >
                {leaderboards.map(lb => (
                  <option key={lb.id} value={lb.month_year} className="bg-[#01140f] text-slate-100 font-mono py-1">
                    {lb.month_year} {lb.is_finalized ? '(Finalized)' : '(Pending)'}
                  </option>
                ))}
              </select>
            </div>

            {onOpenQuiz && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuiz();
                }}
                className="w-full sm:w-auto bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-2 px-4 rounded-lg uppercase tracking-wider hover:bg-[#34d399] transition flex items-center justify-center space-x-1.5 shadow"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take Today's Quiz</span>
              </button>
            )}
          </div>

          {/* Current Leaderboard Display */}
          {!currentLeaderboard || !currentLeaderboard.winners || currentLeaderboard.winners.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#01140f] border border-emerald-950 rounded-2xl p-6">
              <Award className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase">No Finalized Winners Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The official leaderboard for this month is being calculated or awaiting final admin publishing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span className="font-bold text-[#22c55e]">{currentLeaderboard.title}</span>
                <span className="text-[10px] bg-emerald-950 border border-emerald-900 text-slate-300 px-2.5 py-1 rounded-full">
                  Official Top 5 Winners
                </span>
              </div>

              {/* Public Winners List - Displaying Rank, Name, Email, Points in a Responsive CSS Grid */}
              <div className="space-y-3" id="public-leaderboard-winners-list">
                {currentLeaderboard.winners.slice(0, 5).map((winner) => {
                  const rank = winner.rank;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;

                  const badgeBg = isGold 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                    : isSilver 
                    ? 'bg-slate-300/20 text-slate-200 border-slate-300/50' 
                    : isBronze 
                    ? 'bg-amber-700/20 text-amber-400 border-amber-700/50' 
                    : 'bg-emerald-950 text-slate-400 border-emerald-900';

                  const cardBg = isGold 
                    ? 'bg-gradient-to-r from-amber-950/40 via-[#01140f] to-[#01140f] border-amber-500/40' 
                    : 'bg-[#01140f] border-emerald-950';

                  return (
                    <div 
                      key={winner.id || winner.rank} 
                      className={`p-3.5 sm:p-4 rounded-xl border grid grid-cols-12 items-center gap-2 sm:gap-4 transition hover:border-[#22c55e]/50 ${cardBg}`}
                    >
                      {/* Rank Column - 3 cols on mobile, 2 cols on desktop */}
                      <div className="col-span-3 sm:col-span-2 flex items-center">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-display font-black text-xs sm:text-sm flex items-center justify-center border flex-shrink-0 shadow-sm ${badgeBg}`}>
                          {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
                        </div>
                      </div>

                      {/* User Info Column - 6 cols on mobile, 7 cols on desktop */}
                      <div className="col-span-6 sm:col-span-7 min-w-0 pr-1">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{winner.full_name}</span>
                          {isGold && (
                            <span className="hidden sm:inline-block bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                              Champion
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] sm:text-xs text-slate-300 font-mono truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{winner.email}</span>
                        </div>
                      </div>

                      {/* Points Column - 3 cols on mobile, 3 cols on desktop */}
                      <div className="col-span-3 sm:col-span-3 text-right flex items-center justify-end">
                        <div className="inline-flex flex-col items-end bg-emerald-950/80 border border-emerald-900/80 px-2.5 py-1 rounded-lg">
                          <span className="text-sm sm:text-base font-black font-display text-[#22c55e] leading-tight">
                            {winner.points}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">PTS</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rules & Privacy Notice */}
          <div className="p-3 bg-[#01140f] rounded-xl border border-emerald-950 text-[11px] text-slate-400 space-y-1">
            <p className="font-mono text-slate-300 font-semibold uppercase">🔒 Privacy & Fair Play Guarantee</p>
            <p>
              Points are accrued through daily quiz participation and validated by site admins at the end of every calendar month. Only Rank, Name, Email, and Points are publicly displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
