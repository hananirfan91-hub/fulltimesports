-- ====================================================================
-- FULL TIME SPORTS (THE SPORTS ROOM) MYSQL & MARIADB DATABASE SCHEMA
-- Target Environment: MySQL 5.7+, MySQL 8.0+, MariaDB, phpMyAdmin, MySQL Workbench
-- ====================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sports_room DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sports_room;

-- 1. EDITORIAL POSTS TABLE (fts_posts)
CREATE TABLE IF NOT EXISTS fts_posts (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'cricket',
    tags JSON DEFAULT NULL,
    featured_image TEXT,
    image_alt TEXT,
    video_url TEXT,
    author VARCHAR(128) NOT NULL DEFAULT 'Hanan Irfan',
    author_email VARCHAR(128) DEFAULT 'thesportsroom01@gmail.com',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_featured TINYINT(1) DEFAULT 0,
    is_trending TINYINT(1) DEFAULT 0,
    type VARCHAR(32) NOT NULL DEFAULT 'news',
    scheduled_for VARCHAR(64) DEFAULT '',
    meta_description TEXT,
    views INT DEFAULT 0,
    is_draft TINYINT(1) DEFAULT 0,
    heading_tag VARCHAR(16) DEFAULT 'h1',
    subheading TEXT,
    meta_title VARCHAR(255),
    focus_keyword VARCHAR(255),
    canonical_url VARCHAR(512),
    geo_summary TEXT,
    geo_entities JSON DEFAULT NULL,
    aeo_direct_answer TEXT,
    aeo_faq JSON DEFAULT NULL,
    schema_type VARCHAR(64) DEFAULT 'NewsArticle',
    meta_robots VARCHAR(64) DEFAULT 'index, follow',
    INDEX idx_fts_posts_slug (slug),
    INDEX idx_fts_posts_category (category),
    INDEX idx_fts_posts_created_at (created_at),
    INDEX idx_fts_posts_featured (is_featured),
    INDEX idx_fts_posts_trending (is_trending),
    INDEX idx_fts_posts_author (author_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SPORTS CATEGORIES TABLE (fts_categories)
CREATE TABLE IF NOT EXISTS fts_categories (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SPORTS RANKINGS TABLE (fts_rankings)
CREATE TABLE IF NOT EXISTS fts_rankings (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    sport VARCHAR(64) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    categoryname VARCHAR(255) DEFAULT 'Rankings',
    `rank` INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(128),
    points TEXT NOT NULL,
    extra TEXT,
    INDEX idx_fts_rankings_sport (sport)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MATCH FIXTURES TABLE (fts_fixtures)
CREATE TABLE IF NOT EXISTS fts_fixtures (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
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
    stage VARCHAR(128),
    INDEX idx_fts_fixtures_sport (sport),
    INDEX idx_fts_fixtures_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MEDIA ASSETS LIBRARY (fts_media)
CREATE TABLE IF NOT EXISTS fts_media (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    file_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'image',
    title VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SUBSCRIBERS TABLE (fts_subscribers)
CREATE TABLE IF NOT EXISTS fts_subscribers (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. LIVE BROADCAST STREAMS TABLE (fts_live_streams)
CREATE TABLE IF NOT EXISTS fts_live_streams (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    platform VARCHAR(64) NOT NULL DEFAULT 'youtube',
    video_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    thumbnail TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    is_featured TINYINT(1) DEFAULT 0,
    match_name VARCHAR(255),
    team_one VARCHAR(128),
    team_two VARCHAR(128),
    tournament VARCHAR(255),
    stream_start DATETIME NULL,
    stream_end DATETIME NULL,
    created_by VARCHAR(128),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    enable_chat TINYINT(1) DEFAULT 1,
    views INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. HERO CONTROL CONFIGURATION (fts_hero_config)
CREATE TABLE IF NOT EXISTS fts_hero_config (
    id VARCHAR(64) NOT NULL PRIMARY KEY DEFAULT 'hero_main_config',
    enabled TINYINT(1) DEFAULT 1,
    live_badge_text TEXT,
    heading TEXT,
    subtitle TEXT,
    background_video_url TEXT,
    background_image_url TEXT,
    overlay_opacity DECIMAL(3,2) DEFAULT 0.65,
    overlay_blur DECIMAL(3,1) DEFAULT 2.0,
    hero_height VARCHAR(32) DEFAULT 'medium',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. WRITERS & USER APPROVAL TABLE (fts_users)
CREATE TABLE IF NOT EXISTS fts_users (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(128) NOT NULL DEFAULT 'Sports Writer',
    password TEXT,
    is_approved TINYINT(1) NOT NULL DEFAULT 0,
    is_writer TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fts_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert or Update Super Admin Account (MySQL ON DUPLICATE KEY Syntax)
INSERT INTO fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'thesportsroom01@gmail.com', 'Super Admin', 'hanan@2007.', 1, 1)
ON DUPLICATE KEY UPDATE is_approved = 1, is_writer = 1, role = 'Super Admin';

-- Seed Initial Categories
INSERT INTO fts_categories (id, name, slug, description)
VALUES 
  ('cat-cricket', 'Cricket', 'cricket', 'Ball-by-ball cricket journalism, ICC tournament updates, IPL, and test breakdowns.'),
  ('cat-football', 'Football', 'football', 'Global football reporting, Premier League, UEFA Champions League, and tactical breakdowns.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Initial Editorial Articles
INSERT INTO fts_posts (
    id, title, slug, content, category, tags, featured_image, video_url, author, author_email, created_at, is_featured, is_trending, type, views
) VALUES (
    'post-1',
    'Pakistan vs India T20 World Cup Preview: Tactical Breakdown & Pitch Telemetry',
    'pakistan-vs-india-t20-world-cup-preview-2026',
    'In-depth strategic analysis ahead of the premier rivalry in world cricket. Pitch conditions, key player matchups, and toss advantages analyzed by our senior cricket desk.',
    'cricket',
    '["Cricket", "T20 World Cup", "Pak vs Ind", "Tactical Analysis"]',
    'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    'jfKfPfyJRdk',
    'Hanan Irfan',
    'thesportsroom01@gmail.com',
    '2026-06-04 08:30:00',
    1,
    1,
    'news',
    1240
) ON DUPLICATE KEY UPDATE title=VALUES(title);
