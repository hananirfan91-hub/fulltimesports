import React, { useState, useEffect } from 'react';
import { Trophy, HelpCircle, Award, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { DB } from '../lib/db';
import { DailyQuiz, MonthlyLeaderboard } from '../types';

interface HomepageFanChallengeProps {
  onOpenQuiz: () => void;
  onOpenLeaderboard: () => void;
}

export default function HomepageFanChallenge({ onOpenQuiz, onOpenLeaderboard }: HomepageFanChallengeProps) {
  const [todayQuiz, setTodayQuiz] = useState<DailyQuiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<MonthlyLeaderboard | null>(null);

  useEffect(() => {
    const q = DB.getTodayQuiz();
    setTodayQuiz(q);

    const lb = DB.getPublishedLeaderboard();
    setLeaderboard(lb);

    const handleSync = () => {
      setTodayQuiz(DB.getTodayQuiz());
      setLeaderboard(DB.getPublishedLeaderboard());
    };

    window.addEventListener('fts_db_sync', handleSync);
    return () => window.removeEventListener('fts_db_sync', handleSync);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 my-10" id="homepage-quiz-leaderboard-banner">
      <div className="bg-gradient-to-r from-[#022c22] via-[#01140f] to-[#022c22] border-2 border-[#22c55e]/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing Background Accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Daily Quiz Call-To-Action */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#22c55e]/15 border border-[#22c55e]/40 px-3 py-1 rounded-full text-[#22c55e] text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Daily Sports Challenge • Earn Points</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
              {todayQuiz ? todayQuiz.title : "Daily Sports Knowledge Challenge & Fan Leaderboard"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Test your expertise on international cricket, UEFA Champions League football, Formula 1 telemetry, and NBA analytics. Earn verified points to secure your place on the official Monthly Sports Fan Leaderboard!
            </p>

            {/* 3-Step How It Works Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 pb-1">
              <div className="bg-[#01140f]/80 border border-emerald-900/60 p-2.5 rounded-xl">
                <div className="text-[10px] font-mono font-bold text-[#22c55e] uppercase">Step 1</div>
                <div className="text-xs font-bold text-white">Play Daily Quiz</div>
                <div className="text-[10px] text-slate-400">Answer 5 trivia questions on cricket, football &amp; racing.</div>
              </div>
              <div className="bg-[#01140f]/80 border border-emerald-900/60 p-2.5 rounded-xl">
                <div className="text-[10px] font-mono font-bold text-[#22c55e] uppercase">Step 2</div>
                <div className="text-xs font-bold text-white">Earn Points</div>
                <div className="text-[10px] text-slate-400">Receive 20 points per correct answer (1 attempt/day).</div>
              </div>
              <div className="bg-[#01140f]/80 border border-emerald-900/60 p-2.5 rounded-xl">
                <div className="text-[10px] font-mono font-bold text-[#22c55e] uppercase">Step 3</div>
                <div className="text-xs font-bold text-white">Rank &amp; Win</div>
                <div className="text-[10px] text-slate-400">Climb the verified monthly fan rankings top 10.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenQuiz}
                className="bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider hover:bg-[#34d399] transition flex items-center space-x-2 shadow-lg hover:scale-105 transform duration-200"
                id="homepage-quiz-cta-btn"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take Today's Quiz Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="bg-slate-900 border border-slate-700 hover:border-[#22c55e] text-slate-200 text-xs font-mono font-bold py-3 px-5 rounded-xl uppercase tracking-wider transition flex items-center space-x-2"
                id="homepage-leaderboard-cta-btn"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Monthly Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Right Column: Mini Leaderboard Showcase */}
          <div className="lg:col-span-5 bg-[#01140f] border border-emerald-950 rounded-2xl p-5 space-y-3 shadow-inner">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-950">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                  🏆 Top Monthly Fan Leaders
                </span>
              </div>
              <button
                onClick={onOpenLeaderboard}
                className="text-[11px] font-mono text-[#22c55e] hover:underline uppercase font-bold"
              >
                Full Standings →
              </button>
            </div>

            {!leaderboard || !leaderboard.winners || leaderboard.winners.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-mono">
                Monthly leaderboard currently being calculated. Submit today's quiz to enter the standings!
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.winners.slice(0, 3).map((w) => (
                  <div key={w.id || w.rank} className="flex items-center justify-between p-2.5 bg-[#022c22] rounded-xl border border-emerald-900 text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="font-mono font-black text-amber-400 w-5 text-center flex-shrink-0">
                        {w.rank === 1 ? '🥇' : w.rank === 2 ? '🥈' : '🥉'}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{w.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">{w.email}</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-[#22c55e] flex-shrink-0 pl-2">
                      {w.points} <span className="text-[9px] text-slate-400 font-normal">PTS</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
