import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://yvjubtmdttrmgxhttps://yvjubtmdttrmgxkykndr.supabase.cokykndr.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anVidG1kdHRybWd4a3lrbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTE5OTMsImV4cCI6MjEwMjEyNzk5M30.9M_3K5l8p4e2LfNHyFNRFR2jS4nzmYlPp24O49mGjfw';

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
