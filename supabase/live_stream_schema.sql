-- ==============================================================================
-- THE SPORTS ROOM (TSR) — OFFICIAL SUPABASE SQL SCHEMA UPDATE
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO SYNC ALL LIVE STREAMS & SETTINGS
-- ==============================================================================

-- 1. Create or update the fts_live_streams table
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
    stream_start TIMESTAMPTZ DEFAULT NOW(),
    stream_end TIMESTAMPTZ,
    created_by VARCHAR(128) DEFAULT 'The Sports Room Editorial',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    enable_chat BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    autoplay BOOLEAN DEFAULT TRUE,
    logo_position VARCHAR(32) DEFAULT 'top-right',
    logo_type VARCHAR(32) DEFAULT 'badge',
    logo_size VARCHAR(32) DEFAULT 'large',
    custom_logo_url TEXT DEFAULT '',
    enable_custom_controls BOOLEAN DEFAULT TRUE,
    default_volume INT DEFAULT 80
);

-- Ensure all modern live stream columns exist
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS autoplay BOOLEAN DEFAULT TRUE;
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS logo_position VARCHAR(32) DEFAULT 'top-right';
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS logo_type VARCHAR(32) DEFAULT 'badge';
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS logo_size VARCHAR(32) DEFAULT 'large';
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS custom_logo_url TEXT DEFAULT '';
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS enable_custom_controls BOOLEAN DEFAULT TRUE;
ALTER TABLE public.fts_live_streams ADD COLUMN IF NOT EXISTS default_volume INT DEFAULT 80;

-- 2. Create or update site branding / hero configuration table
CREATE TABLE IF NOT EXISTS public.fts_hero_config (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'hero_main_config',
    enabled BOOLEAN DEFAULT TRUE,
    live_badge_text TEXT DEFAULT 'LIVE SPORTS ROOM HD',
    heading TEXT DEFAULT 'THE SPORTS ROOM MATCH CENTER',
    subtitle TEXT DEFAULT 'Live coverage, tactical ball-by-ball analysis and sports updates',
    background_video_url TEXT,
    background_image_url TEXT,
    overlay_opacity NUMERIC DEFAULT 0.65,
    overlay_blur NUMERIC DEFAULT 2,
    hero_height VARCHAR(32) DEFAULT 'medium',
    logo_size VARCHAR(32) DEFAULT 'large',
    logo_height_px INT DEFAULT 64,
    custom_logo_url TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fts_hero_config ADD COLUMN IF NOT EXISTS logo_size VARCHAR(32) DEFAULT 'large';
ALTER TABLE public.fts_hero_config ADD COLUMN IF NOT EXISTS logo_height_px INT DEFAULT 64;
ALTER TABLE public.fts_hero_config ADD COLUMN IF NOT EXISTS custom_logo_url TEXT DEFAULT '';

-- 3. Row Level Security & Public Access Permissions
ALTER TABLE public.fts_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_hero_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select live streams" ON public.fts_live_streams;
DROP POLICY IF EXISTS "Public insert live streams" ON public.fts_live_streams;
DROP POLICY IF EXISTS "Public update live streams" ON public.fts_live_streams;
DROP POLICY IF EXISTS "Public delete live streams" ON public.fts_live_streams;

CREATE POLICY "Public select live streams" ON public.fts_live_streams FOR SELECT USING (true);
CREATE POLICY "Public insert live streams" ON public.fts_live_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update live streams" ON public.fts_live_streams FOR UPDATE USING (true);
CREATE POLICY "Public delete live streams" ON public.fts_live_streams FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public select hero config" ON public.fts_hero_config;
DROP POLICY IF EXISTS "Public insert hero config" ON public.fts_hero_config;
DROP POLICY IF EXISTS "Public update hero config" ON public.fts_hero_config;

CREATE POLICY "Public select hero config" ON public.fts_hero_config FOR SELECT USING (true);
CREATE POLICY "Public insert hero config" ON public.fts_hero_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update hero config" ON public.fts_hero_config FOR UPDATE USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. High-Performance Indexes for 100% Core Web Vitals and instant queries
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.fts_live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON public.fts_live_streams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_featured ON public.fts_live_streams(is_featured);
