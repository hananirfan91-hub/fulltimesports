-- ========================================================================
-- FULL TIME SPORTS (FTS) SUPABASE INITIAL TABLE SCHEMA
-- Paste this script into your Supabase SQL Editor and run it.
-- This script contains drop-and-recreate capabilities to prevent any 
-- "policy already exists" or "table already exists" errors when rerun.
-- ========================================================================

-- 1. Create fts_categories table
CREATE TABLE IF NOT EXISTS fts_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT
);

-- 2. Create fts_posts table
CREATE TABLE IF NOT EXISTS fts_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  featured_image TEXT NOT NULL,
  video_url TEXT,
  author TEXT NOT NULL,
  author_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL,
  scheduled_for TEXT,
  meta_description TEXT,
  views INTEGER DEFAULT 0
);

-- 3. Create fts_rankings table
CREATE TABLE IF NOT EXISTS fts_rankings (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL,
  "categoryName" TEXT NOT NULL,
  rank INTEGER NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  points TEXT,
  extra TEXT
);

-- 4. Create fts_fixtures table
CREATE TABLE IF NOT EXISTS fts_fixtures (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL,
  team1 TEXT NOT NULL,
  team1_logo TEXT,
  team2 TEXT NOT NULL,
  team2_logo TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL,
  score TEXT,
  stage TEXT
);

-- 5. Create fts_media table
CREATE TABLE IF NOT EXISTS fts_media (
  id TEXT PRIMARY KEY,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT
);

-- 6. Create fts_profiles table for writers/contributors and superadmin metadata
CREATE TABLE IF NOT EXISTS fts_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables (always safe to run multiple times)
ALTER TABLE fts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fts_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fts_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fts_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE fts_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- DROP EXISTING POLICIES TO PREVENT "POLICY ALREADY EXISTS" ERRORS ON RERUN
-- ========================================================================

DROP POLICY IF EXISTS "Allow read access to fts_categories" ON fts_categories;
DROP POLICY IF EXISTS "Allow read access to fts_posts" ON fts_posts;
DROP POLICY IF EXISTS "Allow read access to fts_rankings" ON fts_rankings;
DROP POLICY IF EXISTS "Allow read access to fts_fixtures" ON fts_fixtures;
DROP POLICY IF EXISTS "Allow read access to fts_media" ON fts_media;
DROP POLICY IF EXISTS "Allow read access to fts_profiles" ON fts_profiles;

DROP POLICY IF EXISTS "Allow write access to fts_categories" ON fts_categories;
DROP POLICY IF EXISTS "Allow write access to fts_posts" ON fts_posts;
DROP POLICY IF EXISTS "Allow write access to fts_rankings" ON fts_rankings;
DROP POLICY IF EXISTS "Allow write access to fts_fixtures" ON fts_fixtures;
DROP POLICY IF EXISTS "Allow write access to fts_media" ON fts_media;
DROP POLICY IF EXISTS "Allow write access to fts_profiles" ON fts_profiles;

-- ========================================================================
-- CREATE ALL-PERMISSIVE POLICIES FOR SECURE CLIENT-SIDE READ/WRITE ACCESS
-- ========================================================================

CREATE POLICY "Allow read access to fts_categories" ON fts_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access to fts_posts" ON fts_posts FOR SELECT USING (true);
CREATE POLICY "Allow read access to fts_rankings" ON fts_rankings FOR SELECT USING (true);
CREATE POLICY "Allow read access to fts_fixtures" ON fts_fixtures FOR SELECT USING (true);
CREATE POLICY "Allow read access to fts_media" ON fts_media FOR SELECT USING (true);
CREATE POLICY "Allow read access to fts_profiles" ON fts_profiles FOR SELECT USING (true);

CREATE POLICY "Allow write access to fts_categories" ON fts_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to fts_posts" ON fts_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to fts_rankings" ON fts_rankings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to fts_fixtures" ON fts_fixtures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to fts_media" ON fts_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to fts_profiles" ON fts_profiles FOR ALL USING (true) WITH CHECK (true);

-- ========================================================================
-- AUTOMATIC SYNC: TRIGGER TO LINK SUPABASE AUTH SIGNUPS TO FTS_PROFILES
-- ========================================================================
-- This function automatically creates a public profile whenever a user 
-- is created/signs up via the Supabase Auth system.

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

-- Bind the trigger function to Supabase Auth tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- WORKSPACE NOTE ON SUPABASE AUTHENTICATION TAB:
-- Users might not immediately appear or they might fail log in if "Email Confirmation"
-- is turned on inside your Supabase Console.
-- To allow instant signup and login without requiring email activation:
-- 1. Go to your Supabase Dashboard -> Authentication -> Providers -> Email
-- 2. Toggle "Confirm email" to OFF.
-- 3. Click Save. 
-- ========================================================================
