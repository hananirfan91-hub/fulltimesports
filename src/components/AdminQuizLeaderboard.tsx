import React, { useState, useEffect } from 'react';
import { HelpCircle, Trophy, Award, Plus, Trash2, Edit3, CheckCircle2, Eye, EyeOff, Save, Calendar, User, Mail, Search, RefreshCw, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { DB } from '../lib/db';
import { DailyQuiz, QuizQuestion, QuizSubmission, MonthlyLeaderboard, MonthlyLeaderboardWinner, MonthlyUserAggregation } from '../types';

export default function AdminQuizLeaderboard() {
  const [subTab, setSubTab] = useState<'quizzes' | 'submissions' | 'leaderboard'>('quizzes');

  // Quizzes state
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Partial<DailyQuiz> | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Submissions state
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>('ALL');

  // Leaderboard state
  const [leaderboards, setLeaderboards] = useState<MonthlyLeaderboard[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(new Date().toISOString().slice(0, 7));
  const [aggregations, setAggregations] = useState<MonthlyUserAggregation[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<MonthlyLeaderboardWinner[]>([]);
  const [lbTitle, setLbTitle] = useState('');
  const [isFinalized, setIsFinalized] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const refreshAllData = () => {
    const qList = DB.getQuizzes();
    setQuizzes(qList);

    const subList = DB.getSubmissions();
    setSubmissions(subList);

    const lbList = DB.getMonthlyLeaderboards();
    setLeaderboards(lbList);

    // Refresh aggregations for currently selected month
    const agg = DB.getMonthlyAggregations(selectedMonthYear);
    setAggregations(agg);

    // Check if there is an existing leaderboard record for selected month
    const existingLb = lbList.find(l => l.month_year === selectedMonthYear);
    if (existingLb) {
      setSelectedWinners(existingLb.winners || []);
      setLbTitle(existingLb.title);
      setIsFinalized(existingLb.is_finalized);
    } else {
      // Auto pre-populate top 5 candidates from aggregations if no record exists
      const topCandidates: MonthlyLeaderboardWinner[] = agg.slice(0, 5).map((u, idx) => ({
        id: `w-${selectedMonthYear}-${idx + 1}`,
        rank: idx + 1,
        full_name: u.full_name,
        email: u.email,
        points: u.total_points,
        quizzes_attempted: u.quizzes_attempted,
        correct_answers: u.correct_answers
      }));
      setSelectedWinners(topCandidates);
      setLbTitle(`Official Monthly Sports Fan Leaderboard — ${selectedMonthYear}`);
      setIsFinalized(false);
    }
  };

  useEffect(() => {
    refreshAllData();

    const handleSync = () => refreshAllData();
    window.addEventListener('fts_db_sync', handleSync);
    return () => window.removeEventListener('fts_db_sync', handleSync);
  }, []);

  useEffect(() => {
    const agg = DB.getMonthlyAggregations(selectedMonthYear);
    setAggregations(agg);

    const existingLb = leaderboards.find(l => l.month_year === selectedMonthYear);
    if (existingLb) {
      setSelectedWinners(existingLb.winners || []);
      setLbTitle(existingLb.title);
      setIsFinalized(existingLb.is_finalized);
    } else {
      const topCandidates: MonthlyLeaderboardWinner[] = agg.slice(0, 5).map((u, idx) => ({
        id: `w-${selectedMonthYear}-${idx + 1}`,
        rank: idx + 1,
        full_name: u.full_name,
        email: u.email,
        points: u.total_points,
        quizzes_attempted: u.quizzes_attempted,
        correct_answers: u.correct_answers
      }));
      setSelectedWinners(topCandidates);
      setLbTitle(`Official Monthly Sports Fan Leaderboard — ${selectedMonthYear}`);
      setIsFinalized(false);
    }
  }, [selectedMonthYear, leaderboards]);

  // ================= QUIZ HANDLERS =================
  const handleOpenNewQuiz = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setEditingQuiz({
      title: 'Daily Sports Knowledge Challenge',
      quiz_date: todayStr,
      description: 'Test your sports knowledge on cricket, football, F1, and basketball to earn points on the monthly leaderboard!',
      is_published: true,
    });
    setQuizQuestions([
      {
        id: `q-1-${Date.now()}`,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        points: 20,
        order_index: 0
      }
    ]);
    setIsQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (q: DailyQuiz) => {
    setEditingQuiz(q);
    setQuizQuestions(q.questions || []);
    setIsQuizModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuizQuestions(prev => [
      ...prev,
      {
        id: `q-${prev.length + 1}-${Date.now()}`,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        points: 20,
        order_index: prev.length
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof QuizQuestion, val: any) => {
    setQuizQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !editingQuiz.title) return;

    // Validate questions
    if (quizQuestions.length === 0) {
      alert("Please add at least 1 question to the quiz.");
      return;
    }

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        alert(`Question #${i + 1} and all 4 choices (A, B, C, D) must be filled out.`);
        return;
      }
    }

    try {
      await DB.saveQuiz({
        ...editingQuiz,
        title: editingQuiz.title,
        questions: quizQuestions
      });

      setIsQuizModalOpen(false);
      setEditingQuiz(null);
      await DB.syncQuizDataFromSupabase();
      refreshAllData();
    } catch (err: any) {
      alert(err?.message || "Failed to save quiz to Supabase.");
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Delete this quiz completely?")) {
      try {
        await DB.deleteQuiz(id);
        await DB.syncQuizDataFromSupabase();
        refreshAllData();
      } catch (err: any) {
        alert(err?.message || "Failed to delete quiz in Supabase.");
      }
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    await DB.togglePublishQuiz(id, !current);
    refreshAllData();
  };

  // ================= LEADERBOARD HANDLERS =================
  const handleSelectUserForWinner = (user: MonthlyUserAggregation) => {
    // Check if user is already in top 5
    const existingIdx = selectedWinners.findIndex(w => w.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      // Remove from top 5
      const updated = selectedWinners.filter((_, i) => i !== existingIdx).map((w, idx) => ({ ...w, rank: idx + 1 }));
      setSelectedWinners(updated);
    } else {
      if (selectedWinners.length >= 5) {
        alert("Maximum 5 top winners allowed. Please remove a winner before adding another user.");
        return;
      }
      const newWinner: MonthlyLeaderboardWinner = {
        id: `w-${selectedMonthYear}-${selectedWinners.length + 1}`,
        rank: selectedWinners.length + 1,
        full_name: user.full_name,
        email: user.email,
        points: user.total_points,
        quizzes_attempted: user.quizzes_attempted,
        correct_answers: user.correct_answers
      };
      setSelectedWinners([...selectedWinners, newWinner]);
    }
  };

  const handleUpdateWinnerField = (index: number, field: keyof MonthlyLeaderboardWinner, val: any) => {
    setSelectedWinners(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleMoveWinner = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === selectedWinners.length - 1)) return;
    const copy = [...selectedWinners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Recalculate ranks 1..5
    const reRanked = copy.map((w, idx) => ({ ...w, rank: idx + 1 }));
    setSelectedWinners(reRanked);
  };

  const handleRemoveWinner = (index: number) => {
    const copy = selectedWinners.filter((_, i) => i !== index).map((w, idx) => ({ ...w, rank: idx + 1 }));
    setSelectedWinners(copy);
  };

  const handleSaveLeaderboard = async (finalize: boolean) => {
    if (selectedWinners.length === 0) {
      alert("Please select at least 1 winner for the monthly leaderboard.");
      return;
    }

    setSaveSuccessMsg('');
    try {
      await DB.saveMonthlyLeaderboard(selectedMonthYear, lbTitle, selectedWinners, finalize);
      setIsFinalized(finalize);
      setSaveSuccessMsg(finalize ? "🎉 Monthly Leaderboard Finalized and Published to Supabase & Live Site!" : "Saved draft leaderboard to Supabase.");
      await DB.syncQuizDataFromSupabase();
      refreshAllData();

      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to save leaderboard to Supabase.");
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesQuiz = selectedQuizFilter === 'ALL' || s.quiz_id === selectedQuizFilter;
    const q = s.full_name.toLowerCase().includes(submissionSearch.toLowerCase()) || s.email.toLowerCase().includes(submissionSearch.toLowerCase());
    return matchesQuiz && q;
  });

  return (
    <div className="space-y-6" id="admin-quiz-leaderboard-module">
      {/* Module Header Bar */}
      <div className="bg-[#022c22] border border-emerald-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#22c55e] font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Fan Engagement & Sports Knowledge Hub</span>
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight">
            Daily Quiz & Monthly Leaderboard
          </h2>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Create daily quizzes, view user score submissions, and manually select & publish official monthly Top 5 fan leaderboards.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center bg-[#01140f] p-1.5 rounded-xl border border-emerald-950">
          <button
            onClick={() => setSubTab('quizzes')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              subTab === 'quizzes' ? 'bg-[#22c55e] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Daily Quizzes ({quizzes.length})</span>
          </button>

          <button
            onClick={() => setSubTab('submissions')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              subTab === 'submissions' ? 'bg-[#22c55e] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Submissions ({submissions.length})</span>
          </button>

          <button
            onClick={() => setSubTab('leaderboard')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              subTab === 'leaderboard' ? 'bg-[#22c55e] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Monthly Leaderboard</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: DAILY QUIZZES ================= */}
      {subTab === 'quizzes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">Daily Quiz Management</h3>
              <p className="text-xs text-slate-500 font-sans">Set up questions, options, point values, and publication dates</p>
            </div>
            <button
              onClick={handleOpenNewQuiz}
              className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white text-xs font-mono font-bold uppercase px-4 py-2.5 rounded-xl border border-emerald-950 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizzes.map((q) => (
              <div key={q.id} className="border border-slate-200 rounded-xl p-5 hover:border-emerald-500 transition bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-300">
                      📅 {q.quiz_date}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      q.is_published ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {q.is_published ? '● PUBLISHED' : '○ DRAFT'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {q.questions.length} Questions
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{q.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{q.description}</p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleTogglePublish(q.id, q.is_published)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center space-x-1 ${
                      q.is_published ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {q.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{q.is_published ? 'Unpublish' : 'Publish'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditQuiz(q)}
                    className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition"
                    title="Edit Quiz"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SUBMISSIONS LOG ================= */}
      {subTab === 'submissions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">Quiz Submissions Log</h3>
              <p className="text-xs text-slate-500 font-sans">Real-time record of all participants, email addresses, and scores</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <select
                value={selectedQuizFilter}
                onChange={(e) => setSelectedQuizFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#22c55e]"
              >
                <option value="ALL">All Quizzes</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.quiz_date})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono font-bold uppercase">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Score Earned</th>
                  <th className="p-3">Correct Answers</th>
                  <th className="p-3">Submission Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No submissions found matching your search parameters.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{sub.full_name}</td>
                      <td className="p-3 font-mono text-slate-600">{sub.email}</td>
                      <td className="p-3 font-mono font-bold text-[#22c55e]">
                        {sub.score} <span className="text-[10px] text-slate-400 font-normal">/ {sub.total_possible_score} pts</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {sub.correct_count} / {sub.total_questions}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MONTHLY LEADERBOARD FINALIZATION ================= */}
      {subTab === 'leaderboard' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 uppercase">
                Monthly Winner Selection & Finalization
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Admin manually selects and publishes the Top 5 fan winners at the end of every calendar month.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">Target Month:</span>
              <input
                type="month"
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          {/* Success Notification */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Leaderboard Display Title
            </label>
            <input
              type="text"
              value={lbTitle}
              onChange={(e) => setLbTitle(e.target.value)}
              placeholder="e.g. Official Monthly Sports Fan Leaderboard — August 2026"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {/* Selected Top 5 Winners Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Selected Top 5 Monthly Winners ({selectedWinners.length} / 5)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                Admin manually edits or re-orders before final publishing
              </span>
            </div>

            {selectedWinners.length === 0 ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-center space-y-1">
                <p className="font-bold">No Winners Selected</p>
                <p>Select candidates from the aggregated participant table below to add them to the official Top 5 list.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedWinners.map((winner, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-[#022c22] text-[#22c55e] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          value={winner.full_name}
                          onChange={(e) => handleUpdateWinnerField(idx, 'full_name', e.target.value)}
                          placeholder="User Full Name"
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold"
                        />
                        <input
                          type="email"
                          value={winner.email}
                          onChange={(e) => handleUpdateWinnerField(idx, 'email', e.target.value)}
                          placeholder="User Email"
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">PTS:</span>
                        <input
                          type="number"
                          value={winner.points}
                          onChange={(e) => handleUpdateWinnerField(idx, 'points', e.target.value)}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono font-bold"
                        />
                      </div>

                      <button
                        onClick={() => handleMoveWinner(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveWinner(idx, 'down')}
                        disabled={idx === selectedWinners.length - 1}
                        className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveWinner(idx)}
                        className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded transition"
                        title="Remove Winner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar for Leaderboard */}
            <div className="pt-3 flex flex-wrap justify-end items-center gap-3">
              <button
                onClick={() => handleSaveLeaderboard(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold uppercase px-4 py-2.5 rounded-xl transition"
              >
                Save Draft Leaderboard
              </button>
              <button
                onClick={() => handleSaveLeaderboard(true)}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>Finalize & Publish Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Aggregated Participant Table for Selected Month */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase">
                Aggregated Quiz Scores for {selectedMonthYear}
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Total Participants: {aggregations.length}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono font-bold uppercase">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">User Name</th>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Total Points</th>
                    <th className="p-3">Quizzes Attempted</th>
                    <th className="p-3">Correct Answers</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aggregations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No quiz submissions recorded for {selectedMonthYear} yet.
                      </td>
                    </tr>
                  ) : (
                    aggregations.map((usr, idx) => {
                      const isSelected = selectedWinners.some(w => w.email.toLowerCase() === usr.email.toLowerCase());
                      return (
                        <tr key={usr.email} className={isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}>
                          <td className="p-3 font-mono font-bold text-slate-500">#{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{usr.full_name}</td>
                          <td className="p-3 font-mono text-slate-600">{usr.email}</td>
                          <td className="p-3 font-mono font-black text-[#22c55e]">{usr.total_points} PTS</td>
                          <td className="p-3 font-mono text-slate-700">{usr.quizzes_attempted}</td>
                          <td className="p-3 font-mono text-slate-700">{usr.correct_answers}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleSelectUserForWinner(usr)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                                isSelected
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-[#022c22] text-[#22c55e] hover:bg-[#22c55e] hover:text-[#022c22]'
                              }`}
                            >
                              {isSelected ? 'Remove' : 'Select Top 5'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT / CREATE QUIZ MODAL ================= */}
      {isQuizModalOpen && editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-display font-black text-lg text-slate-900 uppercase">
                {editingQuiz.id ? 'Edit Daily Quiz' : 'Create Daily Quiz'}
              </h3>
              <button onClick={() => setIsQuizModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Quiz Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingQuiz.title || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Quiz Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editingQuiz.quiz_date || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, quiz_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Quiz Description
                </label>
                <textarea
                  rows={2}
                  value={editingQuiz.description || ''}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm uppercase">Questions ({quizQuestions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-300 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-[#022c22]">Question #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-mono"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Question Prompt / Text"
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Option A"
                        value={q.option_a}
                        onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Option B"
                        value={q.option_b}
                        onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Option C"
                        value={q.option_c}
                        onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Option D"
                        value={q.option_d}
                        onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>

                    <div className="flex items-center space-x-4 pt-1">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-mono font-bold text-slate-700">Correct Option:</label>
                        <select
                          value={q.correct_option}
                          onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                          className="bg-white border border-slate-300 rounded p-1 text-xs font-mono font-bold text-slate-900"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-mono font-bold text-slate-700">Points Value:</label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => handleQuestionChange(idx, 'points', e.target.value)}
                          className="w-16 bg-white border border-slate-300 rounded p-1 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#22c55e] text-slate-950 rounded-xl text-xs font-mono font-bold uppercase hover:bg-[#16a34a] transition"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
