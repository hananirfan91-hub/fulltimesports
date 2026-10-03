-- ========================================================================
-- THE SPORTS ROOM (FTS) - COMPLETE SUPABASE / POSTGRESQL TABLE SCHEMA
-- Paste this script into your Supabase SQL Editor and click "Run".
-- This script contains IF NOT EXISTS statements, safe type checks, 
-- drop-and-recreate RLS policies, and triggers to guarantee 0 ERRORS on run/rerun.
-- ========================================================================

-- Enable Required UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Create fts_categories table
CREATE TABLE IF NOT EXISTS public.fts_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Insert Default Categories
INSERT INTO public.fts_categories (id, name, slug, description) VALUES
('cricket', 'Cricket', 'cricket', 'Live cricket coverage, ICC tournaments, PSL, IPL, and tactical breakdowns.'),
('football', 'Football', 'football', 'Premier League, Champions League, transfer news, and strategic analysis.'),
('f1', 'Formula 1', 'f1', 'Race telemetries, ground-effect aerodynamics, and Constructors Championship updates.'),
('basketball', 'Basketball', 'basketball', 'NBA games, shot analytics, playoffs, and trade rumors.'),
('tennis', 'Tennis', 'tennis', 'Grand Slams, ATP/WTA rankings, court biomechanics, and match analysis.'),
('esports', 'Esports', 'esports', 'Competitive gaming leagues, franchise economics, and tournament updates.')
ON CONFLICT (id) DO NOTHING;

-- 2. Create fts_posts table (Articles & Tactical Manuals)
CREATE TABLE IF NOT EXISTS public.fts_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cricket',
  tags JSONB DEFAULT '[]'::jsonb,
  featured_image TEXT NOT NULL,
  image_alt TEXT,
  video_url TEXT,
  author TEXT NOT NULL DEFAULT 'Hanan Irfan',
  author_email TEXT DEFAULT 'thesportsroom01@gmail.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_spotlight BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'news',
  scheduled_for TEXT,
  meta_description TEXT,
  views INTEGER DEFAULT 0,
  heading_tag TEXT DEFAULT 'h1',
  subheading TEXT,
  meta_title TEXT,
  focus_keyword TEXT,
  canonical_url TEXT,
  geo_summary TEXT,
  geo_entities JSONB DEFAULT '[]'::jsonb,
  aeo_direct_answer TEXT,
  aeo_faq JSONB DEFAULT '[]'::jsonb,
  schema_type TEXT DEFAULT 'NewsArticle',
  meta_robots TEXT DEFAULT 'index, follow'
);

-- 3. Create fts_rankings table
CREATE TABLE IF NOT EXISTS public.fts_rankings (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL,
  "categoryName" TEXT,
  category_name TEXT,
  rank INTEGER NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  points TEXT NOT NULL,
  extra TEXT
);

-- 4. Create fts_fixtures table
CREATE TABLE IF NOT EXISTS public.fts_fixtures (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL,
  team1 TEXT NOT NULL,
  team1_logo TEXT,
  team2 TEXT NOT NULL,
  team2_logo TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  score TEXT,
  stage TEXT
);

-- 5. Create fts_cricket_matches table (Live Cricket API & Scoreboard)
CREATE TABLE IF NOT EXISTS public.fts_cricket_matches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  home TEXT NOT NULL,
  away TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  competition TEXT NOT NULL,
  competition_logo TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  status_text TEXT,
  time TEXT NOT NULL,
  home_score TEXT,
  away_score TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create fts_media table
CREATE TABLE IF NOT EXISTS public.fts_media (
  id TEXT PRIMARY KEY,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  title TEXT
);

-- 7. Create fts_profiles / fts_users table
CREATE TABLE IF NOT EXISTS public.fts_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Contributor',
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fts_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Sports Writer',
  password TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_writer BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create fts_subscribers table
CREATE TABLE IF NOT EXISTS public.fts_subscribers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create fts_live_streams table
CREATE TABLE IF NOT EXISTS public.fts_live_streams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'youtube',
  video_url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  match_name TEXT,
  team_one TEXT,
  team_two TEXT,
  tournament TEXT,
  stream_start TIMESTAMPTZ,
  stream_end TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enable_chat BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0
);

-- 10. Create fts_hero_config table
CREATE TABLE IF NOT EXISTS public.fts_hero_config (
  id TEXT PRIMARY KEY DEFAULT 'hero_main_config',
  enabled BOOLEAN DEFAULT TRUE,
  live_badge_text TEXT,
  heading TEXT,
  subtitle TEXT,
  background_video_url TEXT,
  background_image_url TEXT,
  overlay_opacity NUMERIC DEFAULT 0.65,
  overlay_blur NUMERIC DEFAULT 2,
  hero_height TEXT DEFAULT 'medium',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Hero Config
INSERT INTO public.fts_hero_config (
  id, enabled, live_badge_text, heading, subtitle, background_image_url, overlay_opacity, overlay_blur, hero_height
) VALUES (
  'hero_main_config', TRUE, 'LIVE EDITORIAL DESK', 'THE SPORTS ROOM', 'Independent Sports Journalism, Real-Time Ball-by-Ball Analytics & Deep Tactical Manuals', 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1600&auto=format&fit=crop&q=80', 0.65, 2, 'medium'
) ON CONFLICT (id) DO NOTHING;

-- 11. Create fts_fan_polls table
CREATE TABLE IF NOT EXISTS public.fts_fan_polls (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'cricket',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create quiz_questions, quiz_submissions, and monthly_leaderboard tables
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INT NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.monthly_leaderboard (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  month_year TEXT NOT NULL,
  is_finalized BOOLEAN DEFAULT FALSE,
  winners JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ========================================================================
ALTER TABLE public.fts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_cricket_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_fan_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_leaderboard ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- SETUP PERMISSIVE POLICIES FOR SUPABASE WITH ZERO CONFLICTS
-- ========================================================================
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE 'fts_%' OR table_name IN ('quiz_questions', 'quiz_submissions', 'monthly_leaderboard'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow select on %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow insert on %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow update on %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow delete on %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all on %I" ON public.%I', tbl, tbl);

        EXECUTE format('CREATE POLICY "Allow all on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- Grant permissions to public anon & authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- ========================================================================
-- AUTOMATIC SYNC TRIGGER FOR SUPABASE AUTH USERS
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.fts_profiles (id, name, email, role, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'role', 'Contributor'),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET id = EXCLUDED.id,
      name = COALESCE(EXCLUDED.name, public.fts_profiles.name),
      role = COALESCE(EXCLUDED.role, public.fts_profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert / Ensure Super Admin Account in fts_users
INSERT INTO public.fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'thesportsroom01@gmail.com', 'Super Admin', 'hanan@2007.', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_approved = TRUE, is_writer = TRUE, role = 'Super Admin';
