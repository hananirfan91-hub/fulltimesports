-- ====================================================================================================
-- THE SPORTS ROOM (TSR / FTS) — COMPLETE PRODUCTION-READY MYSQL DATABASE MIGRATION SCRIPT
-- Destination File: code/database.sql
-- Target Database: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, Amazon RDS/Aurora MySQL, Google Cloud SQL
-- Character Set: utf8mb4 (Full Unicode, Emoji, Special Sporting Characters Support)
-- Collation: utf8mb4_unicode_ci
-- Storage Engine: InnoDB (ACID compliant with Row-Level Locking & Referential Integrity)
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- SECTION 0: PRE-MIGRATION ENVIRONMENT SETUP & FOREIGN KEY CHECK SUSPENSION
-- ----------------------------------------------------------------------------------------------------
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- Database Creation (Idempotent)
CREATE DATABASE IF NOT EXISTS sports_room 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE sports_room;

-- ====================================================================================================
-- SECTION 1: ARCHITECTURAL & COMPATIBILITY DOCUMENTATION (SUPABASE / POSTGRESQL TO MYSQL)
-- ====================================================================================================
/*
  ====================================================================================================
  MIGRATION ARCHITECTURE & SUPABASE LIMITATIONS ASSESSMENT
  ====================================================================================================
  
  1. ROW-LEVEL SECURITY (RLS):
     - PostgreSQL/Supabase implements native Row-Level Security policies (CREATE POLICY ... ON ...).
     - Standard MySQL does NOT have a native declarative RLS engine.
     - Migration Resolution: In MySQL, multi-tenant isolation and role-based access control (RBAC)
       must be enforced at the application data access layer, through parameterized backend queries,
       or via secure SQL Views created with SQL SECURITY DEFINER.
       All application-level role restrictions are documented within the schema comments.

  2. DATA TYPE TRANSLATIONS:
     - PostgreSQL TIMESTAMPTZ -> MySQL DATETIME (or TIMESTAMP) stored in UTC (+00:00).
     - PostgreSQL UUID (gen_random_uuid()) -> MySQL VARCHAR(36) or VARCHAR(128) with application UUID generation.
     - PostgreSQL TEXT[] & JSONB -> MySQL native JSON datatype with JSON_EXTRACT / JSON_SEARCH functions.
     - PostgreSQL BOOLEAN -> MySQL TINYINT(1) (0 = false, 1 = true).
     - PostgreSQL NUMERIC -> MySQL DECIMAL(10,2) or DECIMAL(3,2) for exact precision floating calculations.
     - PostgreSQL SERIAL / BIGSERIAL -> MySQL INT AUTO_INCREMENT / BIGINT AUTO_INCREMENT.

  3. IDEMPOTENT INSERTS & ON CONFLICT:
     - PostgreSQL 'ON CONFLICT (col) DO UPDATE' -> MySQL 'ON DUPLICATE KEY UPDATE' syntax.
     - PostgreSQL 'ON CONFLICT (col) DO NOTHING' -> MySQL 'INSERT IGNORE' or 'ON DUPLICATE KEY UPDATE id=id'.

  4. SUPABASE AUTH & STORAGE SUBSYSTEMS:
     - Supabase Auth manages user credentials in an internal 'auth.users' PostgreSQL schema and triggers.
       In this MySQL migration, authentication records and permissions are consolidated into 'fts_users'
       and 'fts_profiles'. Password hashes should use standard bcrypt/Argon2 algorithms.
     - Supabase Storage stores uploaded binaries in S3-compatible buckets with public URLs.
       The MySQL schema stores these canonical resource references in 'fts_media.file_url',
       'fts_posts.featured_image', and related URL columns.

  5. SUPABASE REALTIME & LISTENERS:
     - Supabase Realtime relies on PostgreSQL write-ahead log (WAL) logical replication publication.
     - In MySQL, realtime notification functionality requires WebSocket layers (Socket.io),
       Redis Pub/Sub, or Change Data Capture (CDC via Debezium/Canal) attached to the MySQL binlog.
  ====================================================================================================
*/

-- ====================================================================================================
-- SECTION 2: CORE LOOKUP & REFERENCE TABLES
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 1: fts_categories (Sports Categories Taxonomy)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_categories (
    id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    description TEXT,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fts_categories_slug (slug),
    INDEX idx_fts_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Taxonomy categories for sports journalism, articles, and rankings';

-- ----------------------------------------------------------------------------------------------------
-- Table 2: fts_users (Staff Writers, Contributors, and Super Administrators)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_users (
    id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL DEFAULT 'Sports Writer',
    password VARCHAR(255) DEFAULT NULL COMMENT 'Hashed password credential (bcrypt/argon2) for administrative login',
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    is_writer TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fts_users_email (email),
    INDEX idx_fts_users_approved (is_approved),
    INDEX idx_fts_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Editorial team users, writers, and administrator credentials';

-- ----------------------------------------------------------------------------------------------------
-- Table 3: fts_profiles (User Identity Profiles & Metadata Sync)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_profiles (
    id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL DEFAULT 'Contributor',
    password VARCHAR(255) DEFAULT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fts_profiles_email (email),
    INDEX idx_fts_profiles_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Public contributor profiles and user meta';

-- ----------------------------------------------------------------------------------------------------
-- Table 4: fts_media (Digital Media Asset Library)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_media (
    id VARCHAR(128) NOT NULL,
    file_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'image',
    title VARCHAR(255) DEFAULT NULL,
    file_size_kb INT UNSIGNED DEFAULT NULL,
    mime_type VARCHAR(64) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_media_type (type),
    INDEX idx_fts_media_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asset management library for images, banners, and video embeds';

-- ====================================================================================================
-- SECTION 3: EDITORIAL ARTICLES, SEO, AND ENGAGEMENT TABLES
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 5: fts_posts (Articles, Deep Tactical Breakdowns & News Manuals)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_posts (
    id VARCHAR(128) NOT NULL,
    title VARCHAR(512) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'cricket',
    tags JSON DEFAULT NULL COMMENT 'Array of search keywords and topic tags stored as JSON',
    featured_image TEXT,
    image_alt TEXT COMMENT 'Descriptive accessibility and image SEO alt text',
    video_url TEXT COMMENT 'Associated YouTube or video stream identifier',
    author VARCHAR(128) NOT NULL DEFAULT 'Hanan Irfan',
    author_email VARCHAR(128) DEFAULT 'thesportsroom01@gmail.com',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_trending TINYINT(1) NOT NULL DEFAULT 0,
    is_spotlight TINYINT(1) NOT NULL DEFAULT 0,
    type VARCHAR(32) NOT NULL DEFAULT 'news' COMMENT 'Content classification: news, blog, analysis, manual',
    scheduled_for VARCHAR(64) DEFAULT '',
    meta_description TEXT,
    views INT UNSIGNED NOT NULL DEFAULT 0,
    is_draft TINYINT(1) NOT NULL DEFAULT 0,
    
    -- Advanced Search Engine Optimization (SEO), Generative Engine (GEO) & Answer Engine (AEO)
    heading_tag VARCHAR(16) DEFAULT 'h1',
    subheading TEXT,
    meta_title VARCHAR(255) DEFAULT NULL,
    focus_keyword VARCHAR(255) DEFAULT NULL,
    canonical_url VARCHAR(512) DEFAULT NULL,
    geo_summary TEXT COMMENT 'Targeted LLM summary for AI Answer Engines (ChatGPT, Perplexity, Gemini)',
    geo_entities JSON DEFAULT NULL COMMENT 'Named knowledge graph entity tags stored as JSON array',
    aeo_direct_answer TEXT COMMENT '40-60 word Answer Box snippet for position zero voice results',
    aeo_faq JSON DEFAULT NULL COMMENT 'Frequently Asked Questions structured array for FAQPage JSON-LD',
    schema_type VARCHAR(64) DEFAULT 'NewsArticle',
    meta_robots VARCHAR(64) DEFAULT 'index, follow',
    seo_payload JSON DEFAULT NULL COMMENT 'Extended schema attributes and structured graph meta',

    PRIMARY KEY (id),
    UNIQUE KEY uq_fts_posts_slug (slug),
    INDEX idx_fts_posts_category (category),
    INDEX idx_fts_posts_created_at (created_at DESC),
    INDEX idx_fts_posts_featured (is_featured),
    INDEX idx_fts_posts_trending (is_trending),
    INDEX idx_fts_posts_spotlight (is_spotlight),
    INDEX idx_fts_posts_draft (is_draft),
    INDEX idx_fts_posts_author (author_email),
    INDEX idx_fts_posts_views (views DESC),
    CONSTRAINT fk_fts_posts_category FOREIGN KEY (category) 
        REFERENCES fts_categories (slug) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master editorial posts, breaking journalism, and analytical sports guides';

-- ----------------------------------------------------------------------------------------------------
-- Table 6: fts_comments (Article Reader Feedback & Discussion Thread)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_comments (
    id VARCHAR(128) NOT NULL,
    post_id VARCHAR(128) NOT NULL,
    author VARCHAR(128) NOT NULL,
    author_email VARCHAR(128) DEFAULT NULL,
    content TEXT NOT NULL,
    is_approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_comments_post (post_id),
    INDEX idx_fts_comments_created (created_at DESC),
    CONSTRAINT fk_fts_comments_post FOREIGN KEY (post_id) 
        REFERENCES fts_posts (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reader community comments and match discussions';

-- ====================================================================================================
-- SECTION 4: LIVE FIXTURES, RANKINGS & TELEMETRY TABLES
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 7: fts_rankings (Global Sport Standings & Team / Player Rankings)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_rankings (
    id VARCHAR(128) NOT NULL,
    sport VARCHAR(64) NOT NULL,
    category_name VARCHAR(255) NOT NULL DEFAULT 'Rankings',
    categoryname VARCHAR(255) DEFAULT 'Rankings',
    `rank` INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(128) DEFAULT NULL,
    points VARCHAR(64) NOT NULL,
    extra TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_rankings_sport (sport),
    INDEX idx_fts_rankings_rank (`rank`),
    INDEX idx_fts_rankings_category (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Official sports standings and leaderboard rankings';

-- ----------------------------------------------------------------------------------------------------
-- Table 8: fts_fixtures (Match Calendars, Venues, and Scorecards)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_fixtures (
    id VARCHAR(128) NOT NULL,
    sport VARCHAR(64) NOT NULL,
    team1 VARCHAR(255) NOT NULL,
    team1_logo TEXT,
    team2 VARCHAR(255) NOT NULL,
    team2_logo TEXT,
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64) NOT NULL,
    venue VARCHAR(255) DEFAULT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'upcoming' COMMENT 'Match state: upcoming, live, completed, postponed',
    score VARCHAR(128) DEFAULT NULL,
    stage VARCHAR(128) DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_fixtures_sport (sport),
    INDEX idx_fts_fixtures_status (status),
    INDEX idx_fts_fixtures_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Match fixtures, tournament stages, and live match state';

-- ----------------------------------------------------------------------------------------------------
-- Table 9: fts_cricket_matches (Live Cricket Feed & Scoreboard Telemetry)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_cricket_matches (
    id VARCHAR(128) NOT NULL,
    home VARCHAR(255) NOT NULL,
    away VARCHAR(255) NOT NULL,
    home_logo TEXT,
    away_logo TEXT,
    competition VARCHAR(255) NOT NULL,
    competition_logo TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
    status_text TEXT,
    time VARCHAR(64) NOT NULL,
    home_score VARCHAR(128) DEFAULT NULL,
    away_score VARCHAR(128) DEFAULT NULL,
    url TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_cricket_matches_status (status),
    INDEX idx_fts_cricket_matches_competition (competition)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ball-by-ball cricket match score telemetry and schedule tracking';

-- ====================================================================================================
-- SECTION 5: LIVE VIDEO STREAMING & BROADCAST WATERMARK CONTROLS
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 10: fts_live_streams (Live Broadcasts, Video Players & Watermark Branding)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_live_streams (
    id VARCHAR(128) NOT NULL,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    platform VARCHAR(64) NOT NULL DEFAULT 'youtube' COMMENT 'Broadcast source: youtube, facebook, streamyard, tamasha, twitch, custom',
    video_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    thumbnail TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'Stream status: active, inactive, upcoming, ended',
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    match_name VARCHAR(255) DEFAULT NULL,
    team_one VARCHAR(128) DEFAULT NULL,
    team_two VARCHAR(128) DEFAULT NULL,
    tournament VARCHAR(255) DEFAULT NULL,
    stream_start DATETIME DEFAULT NULL,
    stream_end DATETIME DEFAULT NULL,
    created_by VARCHAR(128) DEFAULT 'The Sports Room Editorial',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    enable_chat TINYINT(1) NOT NULL DEFAULT 1,
    views INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Post-Match Highlights & Replays
    highlight_url TEXT,
    highlight_embed_url TEXT,

    -- Custom Player Controls & TSR Watermark Branding
    autoplay TINYINT(1) NOT NULL DEFAULT 1,
    logo_position VARCHAR(32) NOT NULL DEFAULT 'top-right' COMMENT 'Watermark corner: top-left, top-right, bottom-left, bottom-right',
    logo_type VARCHAR(32) NOT NULL DEFAULT 'badge' COMMENT 'Watermark style: badge, emblem, custom',
    logo_size VARCHAR(32) NOT NULL DEFAULT 'large' COMMENT 'Watermark scale: small, medium, large, xlarge, giant',
    custom_logo_url TEXT,
    enable_custom_controls TINYINT(1) NOT NULL DEFAULT 1,
    default_volume INT NOT NULL DEFAULT 80,

    PRIMARY KEY (id),
    INDEX idx_live_streams_status (status),
    INDEX idx_live_streams_created_at (created_at DESC),
    INDEX idx_live_streams_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Video streaming hubs, match live feeds, and watermark controls';

-- ----------------------------------------------------------------------------------------------------
-- Table 11: fts_hero_config (Hero Section Layout & Site Branding Configuration)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_hero_config (
    id VARCHAR(64) NOT NULL DEFAULT 'hero_main_config',
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    live_badge_text VARCHAR(255) DEFAULT 'LIVE EDITORIAL DESK',
    heading VARCHAR(512) DEFAULT 'THE SPORTS ROOM',
    subtitle TEXT,
    featured_article_id VARCHAR(128) DEFAULT NULL,
    background_video_url TEXT,
    background_image_url TEXT,
    overlay_opacity DECIMAL(3,2) NOT NULL DEFAULT 0.65,
    overlay_blur DECIMAL(3,1) NOT NULL DEFAULT 2.0,
    hero_height VARCHAR(32) NOT NULL DEFAULT 'medium' COMMENT 'auto, compact, medium, tall',
    logo_size VARCHAR(32) NOT NULL DEFAULT 'large',
    logo_height_px INT NOT NULL DEFAULT 64,
    custom_logo_url TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Homepage hero visual presentation, banner backgrounds, and branding';

-- ====================================================================================================
-- SECTION 6: FAN INTERACTION, AUDIENCE TICKETS & SUBSCRIBERS
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 12: fts_fan_polls (Interactive Match Polls & Vote Counters)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_fan_polls (
    id VARCHAR(128) NOT NULL,
    match_name VARCHAR(255) DEFAULT NULL,
    question TEXT NOT NULL,
    team_a VARCHAR(128) NOT NULL,
    team_a_logo TEXT,
    team_a_votes INT UNSIGNED NOT NULL DEFAULT 0,
    team_b VARCHAR(128) NOT NULL,
    team_b_logo TEXT,
    team_b_votes INT UNSIGNED NOT NULL DEFAULT 0,
    enable_draw TINYINT(1) NOT NULL DEFAULT 1,
    draw_votes INT UNSIGNED NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'active, scheduled, ended',
    scheduled_for VARCHAR(64) DEFAULT NULL,
    total_votes INT UNSIGNED NOT NULL DEFAULT 0,
    voted_user_ids JSON DEFAULT NULL COMMENT 'JSON array of unique visitor cookies / client identifiers',
    category VARCHAR(64) NOT NULL DEFAULT 'cricket',
    options JSON DEFAULT NULL COMMENT 'Optional dynamic choice list for generalized polls',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_fan_polls_status (status),
    INDEX idx_fts_fan_polls_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Community fan voting polls and real-time match outcome sentiment';

-- ----------------------------------------------------------------------------------------------------
-- Table 13: fts_subscribers (Newsletter Dispatch & User Inboxes)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_subscribers (
    id VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    inbox JSON DEFAULT NULL COMMENT 'JSON array of delivered messages, notices, and match bulletins',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_fts_subscribers_email (email),
    INDEX idx_fts_subscribers_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Newsletter subscribers and member communication inboxes';

-- ----------------------------------------------------------------------------------------------------
-- Table 14: fts_tickets (Contact Desk Support & Inquiries)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fts_tickets (
    id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(512) NOT NULL,
    message LONGTEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open' COMMENT 'open, in_progress, resolved, closed',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fts_tickets_email (email),
    INDEX idx_fts_tickets_created_at (created_at DESC),
    INDEX idx_fts_tickets_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Help desk communication tickets and reader inquiries';

-- ====================================================================================================
-- SECTION 7: DAILY SPORTS QUIZZES, SUBMISSIONS & MONTHLY LEADERBOARDS
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 15: daily_quizzes (Calendar-Based Daily Sports Trivia Challenges)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_quizzes (
    id VARCHAR(128) NOT NULL,
    quiz_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_daily_quizzes_date (quiz_date),
    INDEX idx_daily_quizzes_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily sports challenges organized strictly by calendar date';

-- ----------------------------------------------------------------------------------------------------
-- Table 16: quiz_questions (Trivia Questions & Multiple-Choice Options)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(128) NOT NULL,
    quiz_id VARCHAR(128) DEFAULT NULL,
    question_text TEXT NOT NULL,
    options JSON DEFAULT NULL COMMENT 'JSON array of string choices [A, B, C, D]',
    option_a VARCHAR(512) DEFAULT NULL,
    option_b VARCHAR(512) DEFAULT NULL,
    option_c VARCHAR(512) DEFAULT NULL,
    option_d VARCHAR(512) DEFAULT NULL,
    correct_option VARCHAR(8) NOT NULL DEFAULT 'A' COMMENT 'Letter indicator: A, B, C, D',
    correct_answer INT NOT NULL DEFAULT 0 COMMENT 'Zero-based index: 0, 1, 2, 3',
    points INT NOT NULL DEFAULT 20,
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_quiz_questions_quiz_id (quiz_id),
    INDEX idx_quiz_questions_order (order_index),
    CONSTRAINT fk_quiz_questions_quiz FOREIGN KEY (quiz_id) 
        REFERENCES daily_quizzes (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily trivia question bank with choices, explanations, and point metrics';

-- ----------------------------------------------------------------------------------------------------
-- Table 17: quiz_submissions (Detailed User Submission Logs with Question Responses)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id VARCHAR(128) NOT NULL,
    quiz_id VARCHAR(128) DEFAULT NULL,
    full_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 100,
    total_possible_score INT NOT NULL DEFAULT 100,
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 5,
    answers JSON DEFAULT NULL COMMENT 'JSON array of selected option choices and accuracy',
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_quiz_submissions_quiz_id (quiz_id),
    INDEX idx_quiz_submissions_email (email),
    INDEX idx_quiz_submissions_submitted (submitted_at DESC),
    CONSTRAINT fk_quiz_submissions_quiz FOREIGN KEY (quiz_id) 
        REFERENCES daily_quizzes (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quiz results submitted by fans for leaderboard accumulation';

-- ----------------------------------------------------------------------------------------------------
-- Table 18: user_responses (User Scoring Log & Verification Stream)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_responses (
    id VARCHAR(128) NOT NULL,
    full_name VARCHAR(255) DEFAULT NULL,
    name VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 100,
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 5,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_responses_email (email),
    INDEX idx_user_responses_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log of fan responses and points scored';

-- ----------------------------------------------------------------------------------------------------
-- Table 19: monthly_leaderboards (Official Monthly Fan Leaderboards & Top 5 Winners)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_leaderboards (
    id VARCHAR(128) NOT NULL,
    month_year VARCHAR(16) NOT NULL COMMENT 'Period indicator in YYYY-MM format (e.g. 2026-08)',
    title VARCHAR(255) DEFAULT NULL,
    is_finalized TINYINT(1) NOT NULL DEFAULT 0,
    finalized_at DATETIME DEFAULT NULL,
    winners JSON DEFAULT NULL COMMENT 'JSON array of Top 5 ranked winners with points and accuracy',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_monthly_leaderboards_month (month_year),
    INDEX idx_monthly_leaderboards_finalized (is_finalized)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Monthly sports fan leaderboards and awarded winners';

-- ====================================================================================================
-- SECTION 8: SPORTS ATLAS & ATHLETE PROFILES
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- Table 20: players (The Sports Room Player Atlas & Athlete Directory)
-- ----------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    photo_url TEXT,
    country VARCHAR(128) DEFAULT NULL,
    country_code VARCHAR(16) DEFAULT NULL,
    sport VARCHAR(64) NOT NULL DEFAULT 'cricket',
    playing_role VARCHAR(128) DEFAULT NULL,
    role VARCHAR(128) DEFAULT NULL,
    current_team VARCHAR(255) DEFAULT NULL,
    team VARCHAR(255) DEFAULT NULL,
    jersey_number VARCHAR(32) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    birthplace VARCHAR(255) DEFAULT NULL,
    nationality VARCHAR(128) DEFAULT NULL,
    biography LONGTEXT,
    bio LONGTEXT,
    career_highlights TEXT,
    statistics JSON DEFAULT NULL COMMENT 'Key-value map of career statistics stored as JSON',
    achievements JSON DEFAULT NULL COMMENT 'Array of major titles, trophies, and tournament awards',
    social_links JSON DEFAULT NULL COMMENT 'Social media profile links map (Twitter, Instagram, etc.)',
    seo_title VARCHAR(512) DEFAULT NULL,
    seo_description TEXT,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_players_slug (slug),
    INDEX idx_players_sport (sport),
    INDEX idx_players_published (is_published),
    INDEX idx_players_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Official athlete biographies, telemetry records, and career statistics';

-- ====================================================================================================
-- SECTION 9: BACKWARD-COMPATIBILITY VIEWS
-- ====================================================================================================
-- These views guarantee seamless compatibility with all legacy code queries and alias naming conventions.

CREATE OR REPLACE VIEW monthly_leaderboard AS 
SELECT * FROM monthly_leaderboards;

CREATE OR REPLACE VIEW fts_quizzes AS 
SELECT * FROM daily_quizzes;

CREATE OR REPLACE VIEW fts_quiz_submissions AS 
SELECT * FROM quiz_submissions;

CREATE OR REPLACE VIEW fts_monthly_leaderboards AS 
SELECT * FROM monthly_leaderboards;

CREATE OR REPLACE VIEW fts_players AS 
SELECT * FROM players;

-- ====================================================================================================
-- SECTION 10: PROCEDURES AND TRIGGERS
-- ====================================================================================================

DELIMITER $$

-- Procedure to safely increment article view counter atomically
DROP PROCEDURE IF EXISTS increment_post_views$$
CREATE PROCEDURE increment_post_views(IN p_post_id VARCHAR(128))
BEGIN
    UPDATE fts_posts 
    SET views = views + 1 
    WHERE id = p_post_id OR slug = p_post_id;
END$$

-- Trigger to automatically mirror new staff users into profiles (replicates Supabase handle_new_user)
DROP TRIGGER IF EXISTS trg_sync_fts_user_to_profile$$
CREATE TRIGGER trg_sync_fts_user_to_profile
AFTER INSERT ON fts_users
FOR EACH ROW
BEGIN
    INSERT INTO fts_profiles (id, name, email, role, created_at, updated_at)
    VALUES (NEW.id, NEW.name, NEW.email, NEW.role, NEW.created_at, NEW.updated_at)
    ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        role = VALUES(role),
        updated_at = NOW();
END$$

DELIMITER ;

-- ====================================================================================================
-- SECTION 11: INITIAL SEED DATA (PRODUCTION SOURCE OF TRUTH)
-- ====================================================================================================

-- ----------------------------------------------------------------------------------------------------
-- 1. Seed Sports Categories
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_categories (id, name, slug, description) VALUES
('cricket', 'Cricket', 'cricket', 'Comprehensive coverage of international cricket, ICC tournaments, Test series, IPL, and T20 leagues.'),
('football', 'Football', 'football', 'Global soccer updates: Premier League, UEFA Champions League, La Liga, international transfers, and tactical analysis.'),
('basketball', 'Basketball', 'basketball', 'Deep dives into NBA, FIBA championships, player statistics, drafts, and tactical boards.'),
('f1', 'Formula 1', 'f1', 'High-speed analysis of Grand Prix races, driver standings, engineering updates, and team strategies.'),
('esports', 'Esports', 'esports', 'Coverage of global tournaments, League of Legends, Valorant Champions, CS2, Dota 2, and gaming insights.'),
('tennis', 'Tennis', 'tennis', 'Grand Slam updates, ATP/WTA rankings, legendary matches, and court performance breakdowns.'),
('hockey', 'Hockey', 'hockey', 'Field hockey championships, Olympian reviews, penalty corner tactics, and national leagues.'),
('volleyball', 'Volleyball', 'volleyball', 'FIVB world tours, indoor power spikes, defensive sets, and beach volleyball championships.')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description);

-- ----------------------------------------------------------------------------------------------------
-- 2. Seed Super Administrators & Editorial Desk Users
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_users (id, name, email, role, password, is_approved, is_writer) VALUES
('admin-super-1', 'Hanan Irfan', 'thesportsroom01@gmail.com', 'Super Admin', 'hanan@2007.', 1, 1),
('admin-super-2', 'Urwah Farooq', 'urwahfarooq303@gmail.com', 'Super Admin', 'urwah@2006', 1, 1)
ON DUPLICATE KEY UPDATE 
    role = VALUES(role),
    is_approved = 1,
    is_writer = 1;

INSERT INTO fts_profiles (id, name, email, role) VALUES
('admin-super-1', 'Hanan Irfan', 'thesportsroom01@gmail.com', 'Super Admin'),
('admin-super-2', 'Urwah Farooq', 'urwahfarooq303@gmail.com', 'Super Admin')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- ----------------------------------------------------------------------------------------------------
-- 3. Seed Homepage Hero Section Configuration
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_hero_config (
    id, enabled, live_badge_text, heading, subtitle, 
    background_video_url, background_image_url, overlay_opacity, overlay_blur, 
    hero_height, logo_size, logo_height_px, custom_logo_url
) VALUES (
    'hero_main_config', 1, 'LIVE SPORTS ROOM HD', 'THE SPORTS ROOM MATCH CENTER', 
    'Independent Sports Journalism, Real-Time Ball-by-Ball Analytics & Deep Tactical Manuals', 
    '', 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1600&auto=format&fit=crop&q=80', 
    0.65, 2.0, 'medium', 'large', 64, ''
) ON DUPLICATE KEY UPDATE 
    heading = VALUES(heading),
    subtitle = VALUES(subtitle);

-- ----------------------------------------------------------------------------------------------------
-- 4. Seed Media Asset Library
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_media (id, file_url, type, title) VALUES
('img-1', 'https://images.unsplash.com/photo-1540747737956-378724044282?w=800&auto=format&fit=crop&q=80', 'image', 'Stadium Light Flood'),
('img-2', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80', 'image', 'Soccer Goal Net'),
('img-3', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80', 'image', 'Cricket Boundary Shot'),
('img-4', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80', 'image', 'Basketball Hoop Slam'),
('img-5', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80', 'image', 'F1 Cockpit View')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ----------------------------------------------------------------------------------------------------
-- 5. Seed Core Editorial Articles & Tactical Guides
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_posts (
    id, title, slug, content, category, tags, featured_image, video_url, 
    author, author_email, created_at, is_featured, is_trending, is_spotlight, 
    type, meta_description, views
) VALUES
(
    'post-cricket-cwc-2027',
    'ICC Cricket World Cup 2027: 14-Team Expanded Format, African Host Venues & Qualification Roadmaps',
    'cricket-world-cup-2027-expanded-format-venues-qualification',
    '### The Grand Return of the 14-Team ODI World Cup in Southern Africa\n\nThe 14th edition of the flagship Men\'s ICC Cricket World Cup is scheduled to take place in October and November 2027, co-hosted across three African nations: **South Africa, Zimbabwe, and Namibia**. Jointly awarded by the ICC, this tournament represents the premier 50-over event returning to the African continent for the first time since the memorable 2003 edition.\n\n#### Tournament Architecture & Progression Mechanics\nThe 2027 showcase departs from the 10-team round-robin structure seen in 2019 and 2023, expanding to an intense 14-team competition featuring **54 matches**.\n\n- **Group Stage**: Two pools of 7 teams each.\n- **Super Six Stage**: Top 3 teams from each pool advance, carrying forward points scored against fellow qualifiers.\n- **Knockout Bracket**: The top four Super Six teams qualify for semi-finals and the grand final.',
    'cricket',
    JSON_ARRAY('cricket world cup 2027', 'cwc 2027', 'icc cricket world cup', 'cricket news', 'south africa 2027', 'cricket venues', 'qualification pathways'),
    'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    '6p8bV_G7u20',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-08-01 10:00:00',
    0, 1, 1, 'news',
    'Detailed tactical preview, host venues breakdown, and qualification roadmap for the 14-team ICC Cricket World Cup 2027 in South Africa, Zimbabwe, and Namibia.',
    2890
),
(
    'post-cricket-1',
    'The Great Spin Renaissance: How Wrist Spinners Are Rewriting T20 Tactical Manuals',
    'spin-renaissance-t20-cricket-analysis',
    '### The Redefined Art of Leg-Break Bowling in the Powerplay\n\nIn contemporary short-form cricket, the traditional script designated spinners as middle-over containment specialists. Today, that orthodoxy lies in ruins. Analytical dashboards representing millions of data points have exposed a fundamental truth: taking wickets in the powerplay is the single greatest predictor of T20 match success.\n\n#### The Physics of Dynamic Drift and Revolutions\nThe core weapon of the modern wrist-spinner is not merely the deviation off the pitch, but the aerodynamic forces acting on the ball during flight. Highly skilled leg-spin bowlers apply upwards of 2,400 revolutions per minute (RPM).',
    'cricket',
    JSON_ARRAY('cricket news', 'wrist spin tactics', 'T20 powerplay', 'ICC rankings', 'bowling aerodynamics'),
    'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    'H9T9e03d_jE',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03 09:12:00',
    1, 1, 0, 'news',
    'Discover how modern wrist spinners are dismantling traditional batting setups in the Powerplay. Complete tactical breakdown and aerodynamic physics analysis.',
    1450
),
(
    'post-football-1',
    'Tactical Breakdown: The Extinction of Classical Fullbacks and the Rise of the Inverted Pivot',
    'tactical-extinction-classical-fullbacks-inverted-pivot',
    '### The Micro-Tactical Overhaul of Modern Build-up Play\n\nFor decades, the standard fullback had a simple job: sprint down the touchline, provide overlapping width, and swing diagonal crosses into the penalty box. In Europe\'s elite tactical systems, however, this classical archetype is rapidly going extinct.\n\n#### Transitioning from Out-of-Possession Rest Defense\nBy shifting a technically gifted fullback into a dual-pivot midfield system during possession, the manager ensures central suffocation and numerical superiority against counter-attacks.',
    'football',
    JSON_ARRAY('football news', 'tactical breakdown', 'inverted fullback', 'Premier league tactics'),
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    '6p8bV_G7u20',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03 08:30:00',
    0, 1, 0, 'blog',
    'An in-depth analysis of how elite football managers are abandoning classic fullbacks for inverted central pivots to control transition play and dominate counters.',
    1210
),
(
    'post-basketball-1',
    'The Analytical Obsession with Half-Court Efficiency: NBA Mid-Range Death Sentence',
    'analytical-obsession-nba-midrange-efficiency',
    '### The Scientific Decimation of the 15-Foot Jumper\n\nThe modern analytics revolution has turned the mid-range area into a statistical graveyard. The math dictating modern shot selections is elementary yet devastating to mid-range ball handlers: expected points per shot favor dunks (1.28) and three-pointers (1.16) over 15-foot jumpers (0.80).\n\n#### The Gravitational Pull of 5-Out Offenses\nTeams now spread all five active players beyond the arc, creating immense space and driving lanes.',
    'basketball',
    JSON_ARRAY('NBA news', 'basketball analytics', 'three point revolution', 'mid range jumper'),
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    'q7Myr7Gsk-g',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-03 07:45:00',
    0, 1, 0, 'news',
    'Analyze the mathematical models that have practically eliminated the mid-range jumper from modern NBA offensive systems in favor of corners and paint play.',
    980
),
(
    'post-f1-1',
    'Aerodynamics Mastery: Inside the Extreme Ground-Effect Upgrades Defining 2026 Grid Battles',
    'aerodynamics-f1-ground-effect-engineering-upgrades',
    '### The High-Engineering Battle Beneath the Carbon-Fiber Floor\n\nThe modern regulatory era resurrected Ground-Effect Aerodynamics—a strategic redirection of high-speed air using venturi tunnels molded into the undertray to generate immense downforce without drag.',
    'f1',
    JSON_ARRAY('F1 news', 'Formula 1 aerodynamics', 'ground effect Venturi', 'Grand prix engineering'),
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    'YBzE8S5S9_U',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-02 16:20:00',
    0, 1, 0, 'news',
    'An elite technical deep dive into ground-effect aerodynamics in modern F1. Venturi tunnel dynamics, flexible floors, and mechanical ride-height seals explained.',
    1150
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    content = VALUES(content);

-- ----------------------------------------------------------------------------------------------------
-- 6. Seed Global Sports Rankings
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_rankings (id, sport, category_name, categoryname, `rank`, name, country, points, extra) VALUES
('crk-r-1', 'cricket', 'ICC Men Test Team Rankings', 'ICC Men Test Team Rankings', 1, 'India', 'India', '122', 'Form: W-W-L-W'),
('crk-r-2', 'cricket', 'ICC Men Test Team Rankings', 'ICC Men Test Team Rankings', 2, 'Australia', 'Australia', '117', 'Form: W-L-W-W'),
('crk-r-3', 'cricket', 'ICC Men Test Team Rankings', 'ICC Men Test Team Rankings', 3, 'England', 'England', '111', 'Form: L-L-W-W'),
('crk-r-4', 'cricket', 'ICC Men Test Team Rankings', 'ICC Men Test Team Rankings', 4, 'New Zealand', 'New Zealand', '104', 'Form: L-W-L-L'),
('fb-r-1', 'football', 'FIFA Men World Rankings', 'FIFA Men World Rankings', 1, 'Argentina', 'Argentina', '1858', 'CONMEBOL'),
('fb-r-2', 'football', 'FIFA Men World Rankings', 'FIFA Men World Rankings', 2, 'France', 'France', '1840', 'UEFA'),
('fb-r-3', 'football', 'FIFA Men World Rankings', 'FIFA Men World Rankings', 3, 'Belgium', 'Belgium', '1795', 'UEFA'),
('fb-r-4', 'football', 'FIFA Men World Rankings', 'FIFA Men World Rankings', 4, 'England', 'England', '1794', 'UEFA'),
('bb-r-1', 'basketball', 'NBA Standings (Eastern Conference)', 'NBA Standings (Eastern Conference)', 1, 'Boston Celtics', 'USA', '64 - 18', 'PCT: .780'),
('bb-r-2', 'basketball', 'NBA Standings (Eastern Conference)', 'NBA Standings (Eastern Conference)', 2, 'New York Knicks', 'USA', '50 - 32', 'PCT: .610'),
('bb-r-3', 'basketball', 'NBA Standings (Western Conference)', 'NBA Standings (Western Conference)', 1, 'Oklahoma City Thunder', 'USA', '57 - 25', 'PCT: .695'),
('bb-r-4', 'basketball', 'NBA Standings (Western Conference)', 'NBA Standings (Western Conference)', 2, 'Denver Nuggets', 'USA', '57 - 25', 'PCT: .695'),
('f1-r-1', 'f1', 'F1 Drivers Championship Standings', 'F1 Drivers Championship Standings', 1, 'Max Verstappen', 'Netherlands', '258', 'Red Bull Racing'),
('f1-r-2', 'f1', 'F1 Drivers Championship Standings', 'F1 Drivers Championship Standings', 2, 'Lando Norris', 'United Kingdom', '211', 'McLaren'),
('f1-r-3', 'f1', 'F1 Drivers Championship Standings', 'F1 Drivers Championship Standings', 3, 'Charles Leclerc', 'Monaco', '177', 'Ferrari'),
('f1-r-4', 'f1', 'F1 Drivers Championship Standings', 'F1 Drivers Championship Standings', 4, 'Lewis Hamilton', 'United Kingdom', '154', 'Mercedes'),
('esp-r-1', 'esports', 'HLTV CS2 World Team Rankings', 'HLTV CS2 World Team Rankings', 1, 'FaZe Clan', 'Europe', '980', 'Europe'),
('esp-r-2', 'esports', 'HLTV CS2 World Team Rankings', 'HLTV CS2 World Team Rankings', 2, 'Natus Vincere', 'Ukraine', '945', 'Ukraine'),
('esp-r-3', 'esports', 'HLTV CS2 World Team Rankings', 'HLTV CS2 World Team Rankings', 3, 'Team Vitality', 'France', '890', 'France'),
('ten-r-1', 'tennis', 'ATP Singles World Rankings', 'ATP Singles World Rankings', 1, 'Jannik Sinner', 'Italy', '9525', 'Italy'),
('ten-r-2', 'tennis', 'ATP Singles World Rankings', 'ATP Singles World Rankings', 2, 'Carlos Alcaraz', 'Spain', '8580', 'Spain'),
('ten-r-3', 'tennis', 'ATP Singles World Rankings', 'ATP Singles World Rankings', 3, 'Novak Djokovic', 'Serbia', '8360', 'Serbia')
ON DUPLICATE KEY UPDATE 
    points = VALUES(points),
    extra = VALUES(extra);

-- ----------------------------------------------------------------------------------------------------
-- 7. Seed Match Fixtures
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_fixtures (id, sport, team1, team2, date, time, venue, status, score, stage) VALUES
('fix-1', 'cricket', 'India', 'Australia', '2026-06-05', '09:00 GMT', 'MCG, Melbourne', 'upcoming', NULL, 'Border-Gavaskar Trophy'),
('fix-2', 'football', 'Arsenal', 'Manchester City', '2026-06-04', '18:45 GMT', 'Emirates Stadium, London', 'live', '1 - 1', 'Premier League Matchday 36'),
('fix-3', 'basketball', 'Boston Celtics', 'Dallas Mavericks', '2026-06-03', '23:30 GMT', 'TD Garden, Boston', 'upcoming', NULL, 'NBA Finals Game 1'),
('fix-4', 'f1', 'Red Bull Racing', 'McLaren F1', '2026-06-07', '13:00 GMT', 'Circuit de Monaco', 'upcoming', NULL, 'Monaco Grand Prix'),
('fix-5', 'esports', 'T1', 'Gen.G', '2026-06-03', '11:00 GMT', 'LoL Park, Seoul', 'live', '2 - 1', 'LCK Summer Split'),
('fix-6', 'tennis', 'Carlos Alcaraz', 'Jannik Sinner', '2026-06-02', '14:00 GMT', 'Court Philippe-Chatrier, Paris', 'completed', '3-2 (6-4, 5-7, 7-6, 4-6, 6-3)', 'French Open Semifinals'),
('fix-7', 'hockey', 'India', 'Germany', '2026-06-06', '16:00 GMT', 'National Hockey Stadium, Delhi', 'upcoming', NULL, 'FIH Pro League'),
('fix-8', 'volleyball', 'Poland', 'Brazil', '2026-06-04', '19:00 GMT', 'Spodek, Katowice', 'upcoming', NULL, 'Nations League')
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    score = VALUES(score);

-- ----------------------------------------------------------------------------------------------------
-- 8. Seed Live Match Broadcast Streams
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_live_streams (
    id, title, description, platform, video_url, embed_url, thumbnail, status, 
    is_featured, match_name, team_one, team_two, tournament, stream_start, stream_end, 
    created_by, enable_chat, views, autoplay, logo_position, logo_type, logo_size, 
    custom_logo_url, enable_custom_controls, default_volume
) VALUES (
    'stream-1',
    'Pakistan vs West Indies 2nd Test 2026 - Day 3 Live Coverage & Commentary',
    'Watch live ball-by-ball stream, tactical analysis, and commentary of Pakistan vs West Indies 2nd Test match live from National Stadium, Karachi.',
    'youtube',
    'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&enablejsapi=1&playsinline=1&rel=0',
    'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    'active', 1, '2nd Test Match - Day 3', 'Pakistan', 'West Indies', 
    'Pakistan vs West Indies Test Series 2026',
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR),
    'Hanan Irfan', 1, 14250, 1, 'top-right', 'badge', 'large', '', 1, 85
),
(
    'stream-2',
    'PSL 2026 Grand Final - Lahore Qalandars vs Multan Sultans Live Match',
    'Official live match stream of Pakistan Super League (PSL) 2026 Final featuring high-voltage T20 action and live scoreboard.',
    'youtube',
    'https://www.youtube.com/watch?v=21X5lGlDOfg',
    'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=0&enablejsapi=1&playsinline=1&rel=0',
    'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    'active', 0, 'PSL 2026 Championship Final', 'Lahore Qalandars', 'Multan Sultans', 
    'HBL PSL 2026',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 3 HOUR),
    'Hanan Irfan', 1, 28900, 1, 'top-right', 'badge', 'large', '', 1, 85
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    status = VALUES(status);

-- ----------------------------------------------------------------------------------------------------
-- 9. Seed Community Fan Poll
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_fan_polls (
    id, match_name, question, team_a, team_a_logo, team_a_votes, 
    team_b, team_b_logo, team_b_votes, enable_draw, draw_votes, status, total_votes, category
) VALUES (
    'poll-champions-trophy-1',
    'ICC Champions Trophy 2026 • India vs Australia',
    'Which team is going to win today''s match?',
    'India',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
    1840,
    'Australia',
    'https://images.unsplash.com/photo-1512719991214-e0055a98d2b9?auto=format&fit=crop&w=120&q=80',
    1120,
    1,
    140,
    'active',
    3100,
    'cricket'
) ON DUPLICATE KEY UPDATE 
    total_votes = VALUES(total_votes);

-- ----------------------------------------------------------------------------------------------------
-- 10. Seed Daily Sports Quizzes & Trivia Questions
-- ----------------------------------------------------------------------------------------------------
INSERT INTO daily_quizzes (id, quiz_date, title, description, is_published) VALUES
(
    'quiz-today-seed',
    CURRENT_DATE(),
    'Daily Sports Knowledge Challenge',
    'Test your expertise on international cricket, European football, Formula 1, and NBA analytics to earn points on the official monthly leaderboard!',
    1
) ON DUPLICATE KEY UPDATE 
    title = VALUES(title);

INSERT INTO quiz_questions (
    id, quiz_id, question_text, options, option_a, option_b, option_c, option_d, 
    correct_option, correct_answer, points, explanation, order_index
) VALUES
(
    'q1', 'quiz-today-seed',
    'Who holds the record for the highest individual score in Men\'s ODI Cricket history?',
    JSON_ARRAY('Babar Azam', 'Rohit Sharma (264)', 'Chris Gayle', 'Martin Guptill'),
    'Babar Azam', 'Rohit Sharma (264)', 'Chris Gayle', 'Martin Guptill',
    'B', 1, 20, 'Rohit Sharma scored a world-record 264 runs against Sri Lanka at Eden Gardens in 2014.', 0
),
(
    'q2', 'quiz-today-seed',
    'Which nation is co-hosting the ICC Cricket World Cup 2027 alongside South Africa and Zimbabwe?',
    JSON_ARRAY('Kenya', 'Namibia', 'Uganda', 'Nigeria'),
    'Kenya', 'Namibia', 'Uganda', 'Nigeria',
    'B', 1, 20, 'Namibia co-hosts the 2027 event with South Africa and Zimbabwe.', 1
),
(
    'q3', 'quiz-today-seed',
    'Which football club won the 2024 UEFA Champions League title at Wembley Stadium?',
    JSON_ARRAY('Real Madrid', 'Borussia Dortmund', 'Manchester City', 'Bayern Munich'),
    'Real Madrid', 'Borussia Dortmund', 'Manchester City', 'Bayern Munich',
    'A', 0, 20, 'Real Madrid captured their 15th European crown defeating Borussia Dortmund 2-0.', 2
),
(
    'q4', 'quiz-today-seed',
    'What is the average expected points per shot for a corner three-pointer in modern NBA analytics?',
    JSON_ARRAY('0.80 pts', '1.16 pts', '1.50 pts', '2.00 pts'),
    '0.80 pts', '1.16 pts', '1.50 pts', '2.00 pts',
    'B', 1, 20, 'Corner three-pointers generate approximately 1.16 points per possession.', 3
),
(
    'q5', 'quiz-today-seed',
    'Which Formula 1 driver set the record for most race wins in a single season with 19 victories in 2023?',
    JSON_ARRAY('Lewis Hamilton', 'Max Verstappen', 'Charles Leclerc', 'Lando Norris'),
    'Lewis Hamilton', 'Max Verstappen', 'Charles Leclerc', 'Lando Norris',
    'B', 1, 20, 'Max Verstappen dominated the 2023 championship winning 19 of 22 Grands Prix.', 4
)
ON DUPLICATE KEY UPDATE 
    question_text = VALUES(question_text);

-- ----------------------------------------------------------------------------------------------------
-- 11. Seed Monthly Leaderboards & Winners
-- ----------------------------------------------------------------------------------------------------
INSERT INTO monthly_leaderboards (id, month_year, title, is_finalized, winners) VALUES
(
    'leaderboard-current-seed',
    DATE_FORMAT(CURRENT_DATE(), '%Y-%m'),
    CONCAT('Official Monthly Sports Fan Leaderboard — ', DATE_FORMAT(CURRENT_DATE(), '%M %Y')),
    1,
    JSON_ARRAY(
        JSON_OBJECT('id', 'w1', 'rank', 1, 'full_name', 'Ahmed Hassan', 'email', 'ahmed@example.com', 'points', 950, 'quizzes_attempted', 10, 'correct_answers', 48),
        JSON_OBJECT('id', 'w2', 'rank', 2, 'full_name', 'Ali Raza', 'email', 'ali@example.com', 'points', 890, 'quizzes_attempted', 9, 'correct_answers', 45),
        JSON_OBJECT('id', 'w3', 'rank', 3, 'full_name', 'Usman Farooq', 'email', 'usman@example.com', 'points', 820, 'quizzes_attempted', 8, 'correct_answers', 41),
        JSON_OBJECT('id', 'w4', 'rank', 4, 'full_name', 'Hamza Malik', 'email', 'hamza@example.com', 'points', 780, 'quizzes_attempted', 8, 'correct_answers', 39),
        JSON_OBJECT('id', 'w5', 'rank', 5, 'full_name', 'Bilal Khan', 'email', 'bilal@example.com', 'points', 740, 'quizzes_attempted', 7, 'correct_answers', 37)
    )
) ON DUPLICATE KEY UPDATE 
    title = VALUES(title);

-- ----------------------------------------------------------------------------------------------------
-- 12. Seed Athletes into The Sports Room Player Atlas
-- ----------------------------------------------------------------------------------------------------
INSERT INTO players (
    id, name, slug, photo_url, country, country_code, sport, 
    playing_role, role, current_team, team, jersey_number, 
    date_of_birth, birthplace, nationality, biography, bio, 
    career_highlights, statistics, achievements, social_links, 
    seo_title, seo_description, is_published
) VALUES
(
    'player-babar-azam',
    'Babar Azam',
    'babar-azam',
    'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?w=800&auto=format&fit=crop&q=80',
    'Pakistan', 'PK', 'cricket',
    'Top-order Batter', 'Top-order Batter', 'Pakistan National Cricket Team', 'Pakistan National Cricket Team', '56',
    '1994-10-15', 'Lahore, Punjab, Pakistan', 'Pakistani',
    'Mohammad Babar Azam is a world-renowned Pakistani international cricketer and former captain of the Pakistan national cricket team in all formats. Widely regarded as one of the finest modern top-order batters across all three formats, Babar is renowned for his textbook cover drive, balance at the crease, and remarkable consistency.',
    'Mohammad Babar Azam is a world-renowned Pakistani international cricketer and former captain of the Pakistan national cricket team.',
    'Fastest player to reach 5,000 ODI runs (97 innings).\nICC Men\'s ODI Cricketer of the Year (2021, 2022).\nICC Men\'s Cricketer of the Year (Sir Garfield Sobers Trophy 2022).\nMultiple centuries across Tests, ODIs, and T20Is.',
    JSON_OBJECT('Test_Matches', 54, 'Test_Runs', 3898, 'Test_Average', 45.85, 'ODI_Matches', 117, 'ODI_Runs', 5729, 'ODI_Average', 56.72, 'T20I_Matches', 123, 'T20I_Runs', 4145, 'Total_Centuries', 31),
    JSON_ARRAY(
        JSON_OBJECT('title', 'ICC Men Cricketer of the Year (Sir Garfield Sobers Trophy)', 'year', '2022', 'competition', 'ICC Awards', 'description', 'Awarded highest individual honor in world cricket for stellar performance across formats.'),
        JSON_OBJECT('title', 'ICC Men ODI Cricketer of the Year', 'year', '2021, 2022', 'competition', 'ICC Awards', 'description', 'Back-to-back global recognition as top One Day International batter in world cricket.')
    ),
    JSON_OBJECT('twitter', 'https://twitter.com/babarazam258', 'instagram', 'https://instagram.com/babarazam'),
    'Babar Azam Profile, Stats, Career Records & Latest News | The Sports Room',
    'Babar Azam comprehensive player profile covering career statistics, centuries, ICC rankings, cover drive biomechanics, and Pakistan cricket team updates.',
    1
),
(
    'player-virat-kohli',
    'Virat Kohli',
    'virat-kohli',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    'India', 'IN', 'cricket',
    'Top-order Batter', 'Top-order Batter', 'India National Cricket Team / Royal Challengers Bengaluru', 'India National Cricket Team', '18',
    '1988-11-05', 'Delhi, India', 'Indian',
    'Virat Kohli is an Indian international cricketer and former captain of the Indian national team. Widely considered one of the greatest batsmen in cricket history, Kohli holds the all-time record for most centuries in Men\'s ODI cricket (50 centuries).',
    'Virat Kohli is an Indian international cricketer and former captain of the Indian national team.',
    'Most centuries in ODI cricket history (50).\nPlayer of the Tournament at ICC Cricket World Cup 2023 (765 runs).\nICC Men\'s Player of the Decade (2011-2020).\nOver 26,000 international runs across formats.',
    JSON_OBJECT('Test_Matches', 113, 'Test_Runs', 8848, 'Test_Average', 49.15, 'ODI_Matches', 292, 'ODI_Runs', 13848, 'ODI_Average', 58.67, 'T20I_Matches', 125, 'T20I_Runs', 4188, 'Total_Centuries', 80),
    JSON_ARRAY(
        JSON_OBJECT('title', 'ICC ODI World Cup 2023 Player of the Tournament', 'year', '2023', 'competition', 'ICC Cricket World Cup', 'description', 'Record 765 tournament runs in a single World Cup edition.'),
        JSON_OBJECT('title', 'ICC Men Cricketer of the Decade', 'year', '2020', 'competition', 'ICC Awards', 'description', 'Recognized as the defining cricketer of the 2011-2020 decade.')
    ),
    JSON_OBJECT('twitter', 'https://twitter.com/imVkohli', 'instagram', 'https://instagram.com/virat.kohli'),
    'Virat Kohli Profile, Stats, Centuries & Records | The Sports Room',
    'Complete Virat Kohli profile covering 80 international centuries, ODI records, Test match leadership legacy, and career statistics.',
    1
),
(
    'player-lionel-messi',
    'Lionel Messi',
    'lionel-messi',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    'Argentina', 'AR', 'football',
    'Forward / Attacking Midfielder', 'Forward', 'Inter Miami CF / Argentina National Team', 'Inter Miami CF', '10',
    '1987-06-24', 'Rosario, Santa Fe, Argentina', 'Argentine',
    'Lionel Andrés Messi is an Argentine professional footballer who captains both MLS club Inter Miami and the Argentina national team. Widely regarded as the greatest player in football history, Messi has won a record 8 Ballon d\'Or awards and the 2022 FIFA World Cup.',
    'Lionel Andrés Messi is an Argentine professional footballer and 2022 FIFA World Cup Champion.',
    '8x Ballon d\'Or winner (all-time record).\n2022 FIFA World Cup Champion and Golden Ball winner.\n2x Copa América Champion (2021, 2024).\nOver 830 career senior goals and 370 assists.',
    JSON_OBJECT('Senior_Appearances', 1075, 'Career_Goals', 838, 'Career_Assists', 374, 'Ballon_dOr_Titles', 8, 'World_Cup_Trophies', 1, 'Champions_League_Titles', 4),
    JSON_ARRAY(
        JSON_OBJECT('title', 'FIFA World Cup Champion', 'year', '2022', 'competition', 'FIFA World Cup Qatar', 'description', 'Captained Argentina to third World Cup title and earned tournament Golden Ball.'),
        JSON_OBJECT('title', 'Ballon d\'Or (Record 8 Titles)', 'year', '2009-2023', 'competition', 'France Football', 'description', 'Record 8 Ballon d\'Or trophies establishing undisputed football legacy.')
    ),
    JSON_OBJECT('instagram', 'https://instagram.com/leomessi', 'facebook', 'https://facebook.com/leomessi'),
    'Lionel Messi Profile, Stats, Goals, Career & News | The Sports Room',
    'Lionel Messi player profile covering career statistics, goals, assists, Ballon d\'Or records, World Cup triumph, and latest updates.',
    1
),
(
    'player-max-verstappen',
    'Max Verstappen',
    'max-verstappen',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    'Netherlands', 'NL', 'f1',
    'Formula 1 Racing Driver', 'Formula 1 Racing Driver', 'Red Bull Racing', 'Red Bull Racing', '1',
    '1997-09-30', 'Hasselt, Belgium', 'Dutch',
    'Max Emilian Verstappen is a Dutch racing driver and multiple Formula One World Drivers\' Champion competing for Red Bull Racing. Known for his aggressive racecraft and consistency, Verstappen set the all-time F1 record with 19 Grand Prix victories in a single season (2023).',
    'Max Emilian Verstappen is a Dutch racing driver and multiple Formula One World Drivers\' Champion competing for Red Bull Racing.',
    '4x FIA Formula One World Drivers\' Champion (2021, 2022, 2023, 2024).\nRecord 19 Grand Prix victories in a single season (2023).\nYoungest driver to start an F1 race and youngest race winner (Spanish GP 2016).',
    JSON_OBJECT('Races', 210, 'Wins', 63, 'Podiums', 112, 'Pole_Positions', 41, 'Career_Points', 3020.5),
    JSON_ARRAY(
        JSON_OBJECT('title', 'FIA F1 World Drivers\' Championship', 'year', '2021, 2022, 2023, 2024', 'competition', 'FIA Formula One', 'description', 'Four consecutive world championship titles with Red Bull Racing.'),
        JSON_OBJECT('title', 'Single Season Record 19 Wins', 'year', '2023', 'competition', 'FIA Formula One', 'description', 'Highest winning percentage in a single F1 season in history (86.4%).')
    ),
    JSON_OBJECT('twitter', 'https://twitter.com/Max33Verstappen', 'instagram', 'https://instagram.com/maxverstappen1'),
    'Max Verstappen Profile, F1 Stats, Wins & Career | The Sports Room',
    'Max Verstappen racing driver profile covering Formula 1 championship records, race wins, podiums, pole positions, and Red Bull news.',
    1
)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    biography = VALUES(biography);

-- ----------------------------------------------------------------------------------------------------
-- 13. Seed Live Cricket Matches Telemetry
-- ----------------------------------------------------------------------------------------------------
INSERT INTO fts_cricket_matches (
    id, home, away, home_logo, away_logo, competition, competition_logo, 
    status, status_text, time, home_score, away_score, url
) VALUES
(
    'cm-1', 'Bangladesh', 'Sri Lanka',
    'https://img.thesports.com/v2/team/dd3836188830cce533dcebfed09f2dd2.png',
    'https://img.thesports.com/v2/team/18a6eb357f4c2dce4e9835fce31caad4.png',
    'T20 Asian Games', 'https://img.thesports.com/v2/unique-tournament/c1b1b73637e12a70a7bca40d3811d184.png',
    'finished', 'Finished', '2026-10-03 00:00:00', '102/10', '165/9', '/cricket/match/bangladesh-vs-sri-lanka/'
),
(
    'cm-2', 'Pakistan', 'India',
    'https://img.thesports.com/v2/team/82c24532223cb943952a3eff09b2edce.png',
    'https://img.thesports.com/v2/team/c592dafcd99b4bcc61170fcd1c923a4a.png',
    'T20 Asian Games', 'https://img.thesports.com/v2/unique-tournament/c1b1b73637e12a70a7bca40d3811d184.png',
    'finished', 'Finished', '2026-10-03 04:30:00', '192/6', '211/6', '/cricket/match/india-vs-pakistan/'
)
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    status_text = VALUES(status_text);

-- ====================================================================================================
-- SECTION 12: POST-MIGRATION INTEGRITY CHECKS & SESSION RESTORATION
-- ====================================================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- Verification Queries (Optional Diagnostic Summary):
-- SELECT 'fts_categories' AS tbl, COUNT(*) AS count FROM fts_categories
-- UNION ALL SELECT 'fts_posts', COUNT(*) FROM fts_posts
-- UNION ALL SELECT 'fts_rankings', COUNT(*) FROM fts_rankings
-- UNION ALL SELECT 'fts_fixtures', COUNT(*) FROM fts_fixtures
-- UNION ALL SELECT 'fts_users', COUNT(*) FROM fts_users
-- UNION ALL SELECT 'fts_live_streams', COUNT(*) FROM fts_live_streams
-- UNION ALL SELECT 'daily_quizzes', COUNT(*) FROM daily_quizzes
-- UNION ALL SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
-- UNION ALL SELECT 'monthly_leaderboards', COUNT(*) FROM monthly_leaderboards
-- UNION ALL SELECT 'players', COUNT(*) FROM players;

-- ====================================================================================================
-- END OF DATABASE MIGRATION SCRIPT
-- ====================================================================================================
