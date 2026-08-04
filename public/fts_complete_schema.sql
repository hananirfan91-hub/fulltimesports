-- ====================================================================
-- FULL TIME SPORTS (THE SPORTS ROOM) COMPLETE POSTGRESQL DATABASE SCHEMA
-- Target Environment: Supabase / PostgreSQL SQL Editor
-- Schema Type: TEXT[] for tags & geo_entities (Fully Egress Optimized)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. EDITORIAL POSTS TABLE (fts_posts)
CREATE TABLE IF NOT EXISTS public.fts_posts (
    id VARCHAR(128) PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'cricket',
    tags TEXT[] DEFAULT '{}',
    featured_image TEXT,
    image_alt TEXT,
    video_url TEXT,
    author TEXT NOT NULL DEFAULT 'Hanan Irfan',
    author_email TEXT DEFAULT 'hananirfan91@gmail.com',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    type VARCHAR(32) NOT NULL DEFAULT 'news',
    scheduled_for TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    views INT DEFAULT 0,
    is_draft BOOLEAN DEFAULT FALSE,
    heading_tag VARCHAR(16) DEFAULT 'h1',
    subheading TEXT DEFAULT '',
    meta_title TEXT DEFAULT '',
    focus_keyword TEXT DEFAULT '',
    canonical_url TEXT DEFAULT '',
    geo_summary TEXT DEFAULT '',
    geo_entities TEXT[] DEFAULT '{}',
    aeo_direct_answer TEXT DEFAULT '',
    aeo_faq JSONB DEFAULT '[]'::jsonb,
    schema_type VARCHAR(64) DEFAULT 'NewsArticle',
    meta_robots VARCHAR(64) DEFAULT 'index, follow'
);

-- Safely convert existing tags / geo_entities columns to TEXT[] if they were created as jsonb or other types
DO $$
BEGIN
    -- 1. Convert tags column to text[] if it exists and is not text[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'fts_posts' AND column_name = 'tags' AND udt_name != '_text'
    ) THEN
        BEGIN
            EXECUTE 'ALTER TABLE public.fts_posts ALTER COLUMN tags TYPE text[] USING (
                CASE 
                    WHEN tags IS NULL THEN ''{}''::text[]
                    WHEN pg_typeof(tags)::text = ''jsonb'' THEN (SELECT COALESCE(array_agg(x), ''{}''::text[]) FROM jsonb_array_elements_text(tags) t(x))
                    ELSE translate(tags::text, ''[]"'', ''{}'')::text[]
                END
            )';
        EXCEPTION WHEN OTHERS THEN
            EXECUTE 'ALTER TABLE public.fts_posts DROP COLUMN IF EXISTS tags';
            EXECUTE 'ALTER TABLE public.fts_posts ADD COLUMN tags TEXT[] DEFAULT ''{}''';
        END;
    END IF;

    -- 2. Convert geo_entities column to text[] if it exists and is not text[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'fts_posts' AND column_name = 'geo_entities' AND udt_name != '_text'
    ) THEN
        BEGIN
            EXECUTE 'ALTER TABLE public.fts_posts ALTER COLUMN geo_entities TYPE text[] USING (
                CASE 
                    WHEN geo_entities IS NULL THEN ''{}''::text[]
                    WHEN pg_typeof(geo_entities)::text = ''jsonb'' THEN (SELECT COALESCE(array_agg(x), ''{}''::text[]) FROM jsonb_array_elements_text(geo_entities) t(x))
                    ELSE translate(geo_entities::text, ''[]"'', ''{}'')::text[]
                END
            )';
        EXCEPTION WHEN OTHERS THEN
            EXECUTE 'ALTER TABLE public.fts_posts DROP COLUMN IF EXISTS geo_entities';
            EXECUTE 'ALTER TABLE public.fts_posts ADD COLUMN geo_entities TEXT[] DEFAULT ''{}''';
        END;
    END IF;
END $$;

-- Performance & Egress Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_fts_posts_slug ON public.fts_posts(slug);
CREATE INDEX IF NOT EXISTS idx_fts_posts_category ON public.fts_posts(category);
CREATE INDEX IF NOT EXISTS idx_fts_posts_created_at ON public.fts_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fts_posts_featured ON public.fts_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_fts_posts_trending ON public.fts_posts(is_trending);
CREATE INDEX IF NOT EXISTS idx_fts_posts_author ON public.fts_posts(author_email);

-- 3. SPORTS CATEGORIES TABLE (fts_categories)
CREATE TABLE IF NOT EXISTS public.fts_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description TEXT
);

-- 4. SPORTS RANKINGS TABLE (fts_rankings)
CREATE TABLE IF NOT EXISTS public.fts_rankings (
    id VARCHAR(128) PRIMARY KEY,
    sport VARCHAR(64) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    categoryname VARCHAR(255),
    rank INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(128),
    points TEXT NOT NULL,
    extra TEXT
);

CREATE INDEX IF NOT EXISTS idx_fts_rankings_sport ON public.fts_rankings(sport);

-- 5. MATCH FIXTURES TABLE (fts_fixtures)
CREATE TABLE IF NOT EXISTS public.fts_fixtures (
    id VARCHAR(128) PRIMARY KEY,
    sport VARCHAR(64) NOT NULL,
    team1 VARCHAR(255) NOT NULL,
    team1_logo TEXT,
    team2 VARCHAR(255) NOT NULL,
    team2_logo TEXT,
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64) NOT NULL,
    venue VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
    score VARCHAR(128),
    stage VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_fts_fixtures_sport ON public.fts_fixtures(sport);
CREATE INDEX IF NOT EXISTS idx_fts_fixtures_status ON public.fts_fixtures(status);

-- 6. MEDIA ASSETS LIBRARY (fts_media)
CREATE TABLE IF NOT EXISTS public.fts_media (
    id VARCHAR(128) PRIMARY KEY,
    file_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'image',
    title VARCHAR(255)
);

-- 7. SUBSCRIBERS TABLE (fts_subscribers)
CREATE TABLE IF NOT EXISTS public.fts_subscribers (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LIVE BROADCAST STREAMS TABLE (fts_live_streams)
CREATE TABLE IF NOT EXISTS public.fts_live_streams (
    id VARCHAR(128) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    platform VARCHAR(64) NOT NULL DEFAULT 'youtube',
    video_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    thumbnail TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    match_name VARCHAR(255),
    team_one VARCHAR(128),
    team_two VARCHAR(128),
    tournament VARCHAR(255),
    stream_start TIMESTAMPTZ,
    stream_end TIMESTAMPTZ,
    created_by VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    enable_chat BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0
);

-- 9. HERO CONTROL CONFIGURATION (fts_hero_config)
CREATE TABLE IF NOT EXISTS public.fts_hero_config (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'hero_main_config',
    enabled BOOLEAN DEFAULT TRUE,
    live_badge_text TEXT,
    heading TEXT,
    subtitle TEXT,
    background_video_url TEXT,
    background_image_url TEXT,
    overlay_opacity NUMERIC DEFAULT 0.65,
    overlay_blur NUMERIC DEFAULT 2,
    hero_height VARCHAR(32) DEFAULT 'medium',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WRITERS & USER APPROVAL TABLE (fts_users)
CREATE TABLE IF NOT EXISTS public.fts_users (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(128) NOT NULL DEFAULT 'Sports Writer',
    password TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_writer BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fts_users_email ON public.fts_users(email);

-- Ensure all required columns exist on fts_posts
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS heading_tag TEXT DEFAULT 'h1';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS subheading TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS geo_summary TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_direct_answer TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'NewsArticle';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index, follow';

ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS category_name VARCHAR(255) DEFAULT 'Rankings';
ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS categoryname VARCHAR(255) DEFAULT 'Rankings';

-- Enable Row Level Security (RLS)
ALTER TABLE public.fts_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_users ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for Public Access
DROP POLICY IF EXISTS "Public select posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public insert posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public update posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public delete posts" ON public.fts_posts;

CREATE POLICY "Public select posts" ON public.fts_posts FOR SELECT USING (true);
CREATE POLICY "Public insert posts" ON public.fts_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update posts" ON public.fts_posts FOR UPDATE USING (true);
CREATE POLICY "Public delete posts" ON public.fts_posts FOR DELETE USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Insert / Update Super Admin Account
INSERT INTO public.fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'hananirfan91@gmail.com', 'Super Admin', 'hanan@2007.', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_approved = TRUE, is_writer = TRUE, role = 'Super Admin';

-- Seed Initial Editorial Articles using TEXT[] for tags (Fixes 42804 Error)
INSERT INTO public.fts_posts (
    id, title, slug, content, category, tags, featured_image, video_url, author, author_email, created_at, is_featured, is_trending, type, meta_description, views
) VALUES 
(
    'post-cricket-1',
    'The Mechanical Evolution of Modern Wrist Spin: Revolutionizing T20 Middle Overs',
    'mechanical-evolution-wrist-spin-t20-cricket',
    '### The Scientific Paradigm Shift in Modern Spin Mechanics

In modern T20 cricket, middle overs (overs 7–15) were traditionally governed by tight finger-spin economy. However, with modern power-hitting bats and small boundary dimensions, finger spin became vulnerable to straight hitting.

Enter the mechanical evolution of the modern leg-spinner. Modern wrist spin utilizes aggressive seam angles, higher revolutions per minute (RPM), and disguised topspin deliveries to force mis-hits.',
    'cricket',
    ARRAY['cricket news', 'wrist spin tactics', 'T20 powerplay', 'ICC rankings'],
    'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    'jfKfPfyJRdk',
    'Hanan Irfan',
    'hananirfan91@gmail.com',
    '2026-06-04T08:30:00Z',
    TRUE,
    TRUE,
    'news',
    'An in-depth tactical analysis of how modern leg-spinners leverage revolutions per minute (RPM) and seam orientation to dominate T20 middle overs.',
    1240
),
(
    'post-football-1',
    'Tactical Masterclass: Inverted Fullbacks and Spatial Overloads in European Football',
    'tactical-masterclass-inverted-fullbacks-spatial-overloads',
    '### Deciphering the Positional Play Revolution

The traditional role of fullbacks pushing wide along the touchline has undergone a massive tactical paradigm shift. In elite European competitions, inverted fullbacks step inside into midfield during build-up phases.

This positional movement creates a numerical midfield overload, neutralizing opponent pressing traps and granting creative freedom to wingers.',
    'football',
    ARRAY['football tactics', 'Champions League', 'tactical breakdown', 'Premier League'],
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    '21X5lGlDOfg',
    'Hanan Irfan',
    'hananirfan91@gmail.com',
    '2026-06-03T14:15:00Z',
    TRUE,
    TRUE,
    'news',
    'Discover how tactical managers use inverted fullbacks to build central dominance and overload half-spaces against low-block defenses.',
    1580
)
ON CONFLICT (id) DO NOTHING;
