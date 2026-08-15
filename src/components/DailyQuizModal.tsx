import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, Award, Sparkles, X, ChevronRight, User, Mail, Clock, Send } from 'lucide-react';
import { DB } from '../lib/db';
import { DailyQuiz } from '../types';

interface DailyQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateLeaderboard?: () => void;
  quizIdOverride?: string;
}

export default function DailyQuizModal({ isOpen, onClose, onNavigateLeaderboard, quizIdOverride }: DailyQuizModalProps) {
  const [activeQuiz, setActiveQuiz] = useState<DailyQuiz | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    totalPossible: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill email if stored in local storage
      try {
        const savedEmail = localStorage.getItem('tsr_subscriber_email');
        if (savedEmail) setEmail(savedEmail);
      } catch (e) {}

      const loadQuiz = async () => {
        await DB.syncQuizDataFromSupabase();
        if (quizIdOverride) {
          const q = DB.getQuizById(quizIdOverride);
          setActiveQuiz(q);
        } else {
          const today = DB.getTodayQuiz();
          setActiveQuiz(today);
        }
      };

      loadQuiz();

      setErrorMessage('');
      setSubmittedResult(null);
      setUserAnswers({});
    }
  }, [isOpen, quizIdOverride]);

  if (!isOpen) return null;

  const handleOptionSelect = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!activeQuiz) return;

    if (!fullName.trim()) {
      setErrorMessage('Full Name is required before submitting.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid email address is required before submitting.');
      return;
    }

    // Ensure all questions have been answered
    const unanswered = activeQuiz.questions.filter(q => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      setErrorMessage(`Please answer all ${activeQuiz.questions.length} questions before submitting. (${unanswered.length} remaining)`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await DB.submitQuizPayload(activeQuiz.id, fullName, email, userAnswers);
      setSubmittedResult({
        score: res.score,
        totalPossible: res.totalPossible,
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while submitting your quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#022c22] border border-[#22c55e]/30 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8" id="daily-quiz-dialog">
        {/* Header Bar */}
        <div className="bg-[#01140f] px-6 py-4 border-b border-emerald-950 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl text-[#22c55e]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-wider block">
                The Sports Room • Daily Challenge
              </span>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-tight">
                {activeQuiz ? activeQuiz.title : "Daily Sports Quiz"}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-emerald-950 transition"
            aria-label="Close Quiz Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!activeQuiz ? (
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Published Quiz Found</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                There is currently no published daily sports quiz for today. Check back soon or visit the monthly leaderboard!
              </p>
              <button 
                onClick={onClose}
                className="bg-[#22c55e] text-slate-950 font-mono font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider hover:bg-[#34d399] transition"
              >
                Close Window
              </button>
            </div>
          ) : submittedResult ? (
            /* Result Screen */
            <div className="text-center py-8 space-y-6 animate-fade-in" id="quiz-result-view">
              <div className="inline-flex p-4 bg-[#22c55e]/10 border border-[#22c55e]/40 rounded-full text-[#22c55e]">
                <Award className="w-12 h-12 animate-bounce" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#22c55e] uppercase tracking-widest bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20">
                  Quiz Completed! 🎉
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                  Your Official Result
                </h3>
                <p className="text-xs text-slate-300">
                  Your points have been calculated and added to the official monthly points pool!
                </p>
              </div>

              {/* Score Display Card */}
              <div className="grid grid-cols-2 gap-4 bg-[#01140f] p-6 rounded-2xl border border-emerald-900 max-w-md mx-auto">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Your Score</span>
                  <div className="text-3xl font-black font-display text-[#22c55e]">
                    {submittedResult.score} <span className="text-xs text-slate-400 font-normal">/ {submittedResult.totalPossible}</span>
                  </div>
                </div>
                <div className="text-center space-y-1 border-l border-emerald-950">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Correct Answers</span>
                  <div className="text-3xl font-black font-display text-white">
                    {submittedResult.correctCount} <span className="text-xs text-slate-400 font-normal">/ {submittedResult.totalQuestions}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                {onNavigateLeaderboard && (
                  <button 
                    onClick={() => {
                      onClose();
                      onNavigateLeaderboard();
                    }}
                    className="w-full sm:w-auto bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider hover:bg-[#34d399] transition flex items-center justify-center gap-2"
                  >
                    <TrophyIcon className="w-4 h-4" />
                    <span>View Monthly Leaderboard</span>
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs py-3 px-6 rounded-xl uppercase tracking-wider hover:bg-slate-800 transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Questions Form */
            <form onSubmit={handleSubmit} className="space-y-6" id="quiz-submission-form">
              {/* User Metadata Required Section */}
              <div className="bg-[#01140f] p-4 rounded-xl border border-emerald-950 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Step 1: Required Participant Information
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ahmed Hassan"
                        className="w-full bg-[#022c22] border border-emerald-900 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-400 font-medium quiz-input focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ahmed@example.com"
                        className="w-full bg-[#022c22] border border-emerald-900 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-400 font-medium quiz-input focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Info */}
              <div className="text-slate-300 text-xs leading-relaxed border-l-2 border-[#22c55e] pl-3 py-1">
                {activeQuiz.description || "Answer all questions below accurately. Correct answers earn points towards the monthly Top 5 fan leaderboard!"}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeQuiz.questions.map((q, idx) => {
                  const selected = userAnswers[q.id];
                  return (
                    <div key={q.id} className="bg-[#01140f] border border-emerald-950 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-bold text-xs sm:text-sm text-white">
                          <span className="text-[#22c55e] font-mono mr-1.5">Q{idx + 1}.</span> {q.question_text}
                        </h4>
                        <span className="bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {q.points} PTS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                          const optText = optKey === 'A' ? q.option_a : optKey === 'B' ? q.option_b : optKey === 'C' ? q.option_c : q.option_d;
                          const isSelected = selected === optKey;
                          return (
                            <button
                              type="button"
                              key={optKey}
                              onClick={() => handleOptionSelect(q.id, optKey)}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                                isSelected
                                  ? 'bg-[#22c55e]/15 border-[#22c55e] text-white font-medium shadow-sm'
                                  : 'bg-[#022c22] border-emerald-900 text-slate-300 hover:border-emerald-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                                  isSelected ? 'bg-[#22c55e] text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {optKey}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-2.5 px-6 rounded-xl uppercase tracking-wider hover:bg-[#34d399] transition flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Answers...' : 'Submit Answers & Claim Score'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4m-5-8a7 7 0 0114 0c0 3-2 5-3 6.5A11 11 0 0112 19a11 11 0 01-5-1.5C6 16 4 14 4 11a7 7 0 0114 0z"></path>
    </svg>
  );
}
