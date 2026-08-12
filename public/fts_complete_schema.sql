-- ====================================================================
-- THE SPORTS ROOM (COMPLETE SUPABASE / POSTGRESQL DATABASE SCHEMA)
-- Target Environment: Supabase SQL Editor
-- Schema Description: Complete schema for tables, RLS policies, indexes,
-- hero config, admin users, categories, and initial seed posts with spotlight support.
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
    author_email TEXT DEFAULT 'thesportsroom01@gmail.com',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_spotlight BOOLEAN DEFAULT FALSE,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fts_posts_slug ON public.fts_posts(slug);
CREATE INDEX IF NOT EXISTS idx_fts_posts_category ON public.fts_posts(category);
CREATE INDEX IF NOT EXISTS idx_fts_posts_created_at ON public.fts_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fts_posts_featured ON public.fts_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_fts_posts_trending ON public.fts_posts(is_trending);
CREATE INDEX IF NOT EXISTS idx_fts_posts_spotlight ON public.fts_posts(is_spotlight);
CREATE INDEX IF NOT EXISTS idx_fts_posts_author ON public.fts_posts(author_email);

-- 3. SPORTS CATEGORIES TABLE (fts_categories)
CREATE TABLE IF NOT EXISTS public.fts_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
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

-- 4. SPORTS RANKINGS TABLE (fts_rankings)
CREATE TABLE IF NOT EXISTS public.fts_rankings (
    id VARCHAR(128) PRIMARY KEY,
    sport VARCHAR(64) NOT NULL,
    category_name VARCHAR(255) NOT NULL DEFAULT 'Rankings',
    categoryname VARCHAR(255) DEFAULT 'Rankings',
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

-- Insert Default Hero Configuration
INSERT INTO public.fts_hero_config (
    id, enabled, live_badge_text, heading, subtitle, background_video_url, background_image_url, overlay_opacity, overlay_blur, hero_height
) VALUES (
    'hero_main_config', TRUE, 'LIVE EDITORIAL DESK', 'THE SPORTS ROOM', 'Independent Sports Journalism, Real-Time Ball-by-Ball Analytics & Deep Tactical Manuals', '', 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1600&auto=format&fit=crop&q=80', 0.65, 2, 'medium'
) ON CONFLICT (id) DO NOTHING;

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

-- Ensure required columns exist on fts_posts
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT FALSE;
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

-- Setup Universal RLS Access Policies for Supabase
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'fts_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public select %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public insert %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public update %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public delete %I" ON public.%I', tbl, tbl);

        EXECUTE format('CREATE POLICY "Public select %I" ON public.%I FOR SELECT USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public insert %I" ON public.%I FOR INSERT WITH CHECK (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public update %I" ON public.%I FOR UPDATE USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public delete %I" ON public.%I FOR DELETE USING (true)', tbl, tbl);
    END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Insert / Update Super Admin Account
INSERT INTO public.fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'thesportsroom01@gmail.com', 'Super Admin', 'hanan@2007.', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_approved = TRUE, is_writer = TRUE, role = 'Super Admin';

-- Seed Complete Editorial Articles
INSERT INTO public.fts_posts (
    id, title, slug, content, category, tags, featured_image, video_url, author, author_email, created_at, is_featured, is_trending, is_spotlight, type, meta_description, views
) VALUES 
(
    'post-cwc-2027',
    'ICC Cricket World Cup 2027: Venues, Qualification Roadmaps, and Tactical Ground Previews',
    'icc-cricket-world-cup-2027-preview-venues-qualification',
    '### The 14-Team Mega Spectacle Returns to Southern Africa

The 2027 ICC Cricket World Cup marks the triumphant return of cricket''s flagship 50-over tournament to Southern Africa for the first time since 2003. Jointly hosted by **South Africa**, **Zimbabwe**, and **Namibia**, the tournament will feature an expanded 14-team format across 54 matches.

#### Venue Mechanics & Pitch Conditions
1. **High Altitude Pace & Bounce (Gauteng High-Veldt)**: At Centurion and Johannesburg, thin air combined with hard clay surfaces yields extra seam movement and high ball speed.
2. **Coastal Swing & Drift (Cape Town & Durban)**: Coastal humidity and sea breezes provide lateral swing with the new white ball.
3. **Spin Assistance in Harare & Windhoek**: Dry afternoon surfaces in Harare and Windhoek offer slower grip and turn.

#### Qualification Pathways and Team Projections
The qualification route guarantees direct entries for co-hosts **South Africa** and **Zimbabwe**, alongside the top 8 teams in the official ICC ODI Team Rankings.',
    'cricket',
    ARRAY['cricket world cup 2027', 'cwc 2027', 'icc cricket world cup', 'cricket news', 'south africa 2027'],
    'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    '6p8bV_G7u20',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-08-01T10:00:00Z',
    FALSE,
    TRUE,
    TRUE,
    'news',
    'Detailed tactical preview, host venues breakdown, and qualification roadmap for the 14-team ICC Cricket World Cup 2027 in South Africa, Zimbabwe, and Namibia.',
    2890
),
(
    'post-cricket-1',
    'The Great Spin Renaissance: How Wrist Spinners Are Rewriting T20 Tactical Manuals',
    'spin-renaissance-t20-cricket-analysis',
    '### The Redefined Art of Leg-Break Bowling in the Powerplay

In contemporary short-form cricket, the traditional script designated spinners as middle-over containment specialists. Today, that orthodoxy lies in ruins. Analytical dashboards representing millions of data points have exposed a fundamental truth: taking wickets in the powerplay is the single greatest predictor of T20 match success.

#### The Physics of Dynamic Drift and Revolutions
The core weapon of the modern wrist-spinner is not merely the deviation off the pitch, but the aerodynamic forces acting on the ball during flight. Highly skilled leg-spin bowlers apply upwards of 2,400 revolutions per minute (RPM).',
    'cricket',
    ARRAY['cricket news', 'wrist spin tactics', 'T20 powerplay', 'ICC rankings'],
    'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    'H9T9e03d_jE',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03T09:12:00Z',
    TRUE,
    TRUE,
    FALSE,
    'news',
    'Discover how modern wrist spinners are dismantling traditional batting setups in the Powerplay. Complete tactical breakdown and aerodynamic physics analysis.',
    1450
),
(
    'post-football-1',
    'Tactical Breakdown: The Extinction of Classical Fullbacks and the Rise of the Inverted Pivot',
    'tactical-extinction-classical-fullbacks-inverted-pivot',
    '### The Micro-Tactical Overhaul of Modern Build-up Play

For decades, the standard fullback had a simple job: sprint down the touchline, provide overlapping width, and swing diagonal crosses into the penalty box. In Europe''s elite tactical systems, however, this classical archetype is rapidly going extinct.

#### Transitioning from Out-of-Possession Rest Defense
By shifting a technically gifted fullback into a dual-pivot midfield system during possession, the manager ensures central suffocation and numerical superiority.',
    'football',
    ARRAY['football news', 'tactical breakdown', 'inverted fullback', 'Premier league tactics'],
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    '6p8bV_G7u20',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03T08:30:00Z',
    FALSE,
    TRUE,
    FALSE,
    'blog',
    'An in-depth analysis of how elite football managers are abandoning classic fullbacks for inverted central pivots to control transition play and dominate counters.',
    1210
),
(
    'post-basketball-1',
    'The Analytical Obsession with Half-Court Efficiency: NBA Mid-Range Death Sentence',
    'analytical-obsession-nba-midrange-efficiency',
    '### The Scientific Decimation of the 15-Foot Jumper

The modern analytics revolution has turned the mid-range area into a statistical graveyard. The math dictating modern shot selections is elementary yet devastating to mid-range ball handlers: expected points per shot favor dunks (1.28) and three-pointers (1.16) over 15-foot jumpers (0.80).',
    'basketball',
    ARRAY['NBA news', 'basketball analytics', 'three point revolution', 'mid range jumper'],
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    'q7Myr7Gsk-g',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03T07:45:00Z',
    FALSE,
    TRUE,
    FALSE,
    'news',
    'Analyze the mathematical models that have practically eliminated the mid-range jumper from modern NBA offensive systems in favor of corners and paint play.',
    980
),
(
    'post-f1-1',
    'Aerodynamics Mastery: Inside the Extreme Ground-Effect Upgrades Defining 2026 Grid Battles',
    'aerodynamics-f1-ground-effect-engineering-upgrades',
    '### The High-Engineering Battle Beneath the Carbon-Fiber Floor

The modern regulatory era resurrected Ground-Effect Aerodynamics—a strategic redirection of high-speed air using venturi tunnels molded into the undertray to generate immense downforce without drag.',
    'f1',
    ARRAY['F1 news', 'Formula 1 aerodynamics', 'ground effect Venturi', 'Grand prix engineering'],
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    'YBzE8S5S9_U',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-02T16:20:00Z',
    FALSE,
    TRUE,
    FALSE,
    'news',
    'An elite technical deep dive into ground-effect aerodynamics in modern F1. Venturi tunnel dynamics, flexible floors, and mechanical ride-height seals explained.',
    1150
)
ON CONFLICT (id) DO NOTHING;
