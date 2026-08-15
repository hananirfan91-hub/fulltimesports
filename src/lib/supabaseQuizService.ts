import { supabase, isSupabaseConfigured } from './supabase';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizSubmission {
  id?: string;
  full_name: string;
  email: string;
  score: number;
  total: number;
  created_at?: string;
}

export interface MonthlyLeaderboard {
  id?: string;
  month_year: string;
  is_finalized: boolean;
  winners: Array<{
    id: string;
    rank: number;
    full_name: string;
    email: string;
    points: number;
  }>;
}

// Fetch quiz questions from Supabase (or fallback)
export async function fetchQuizQuestionsFromSupabase(): Promise<QuizQuestion[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching quiz questions from Supabase:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((q: any) => ({
        id: q.id,
        question: q.question_text || q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
        correctAnswer: q.correct_answer ?? q.correctAnswer ?? 0,
        explanation: q.explanation || ''
      }));
    }
    return null;
  } catch (err) {
    console.error('Failed to query quiz_questions table:', err);
    return null;
  }
}

// Save/Update quiz questions in Supabase
export async function saveQuizQuestionsToSupabase(questions: QuizQuestion[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    // Delete existing questions and replace with new set
    await supabase.from('quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const formatted = questions.map((q) => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation
    }));

    const { error } = await supabase.from('quiz_questions').insert(formatted);

    if (error) {
      console.error('Error saving quiz questions to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save questions to Supabase:', err);
    return false;
  }
}

// Save user response/submission
export async function submitQuizResultToSupabase(submission: QuizSubmission): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('user_responses').insert([{
      full_name: submission.full_name,
      email: submission.email,
      score: submission.score,
      total: submission.total
    }]);

    if (error) {
      console.error('Error submitting quiz response to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to submit response to Supabase:', err);
    return false;
  }
}
