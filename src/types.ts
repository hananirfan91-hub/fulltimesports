export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string; // 'cricket' | 'football' | 'basketball' | 'f1' | 'esports' | 'tennis' | 'hockey' | 'volleyball'
  tags: string[]; // SEO Keywords
  featured_image: string;
  image_alt?: string; // Custom alt text for article featured image
  video_url?: string; // YouTube embed only (e.g. YouTube ID or share link)
  author: string;
  author_email?: string; // Track who wrote the article
  created_at: string;
  updated_at?: string;
  is_featured: boolean;
  is_trending: boolean;
  type: 'news' | 'blog'; // To distinguish for Hero or styling
  scheduled_for?: string; // ISO String or 'draft'
  meta_description?: string;
  views: number;
  is_draft?: boolean;

  // Advanced Customization for SEO, GEO (Generative Engine Optimization), AEO (Answer Engine Optimization) & Headings
  heading_tag?: 'h1' | 'h2' | 'h3'; // Heading tag override for title (default 'h1')
  subheading?: string; // Optional custom H2 subtitle/heading
  meta_title?: string; // Custom Page Title / Meta Title tag for Search Engines
  focus_keyword?: string; // Primary target keyphrase
  canonical_url?: string; // Custom canonical link override
  geo_summary?: string; // AI Summary snippet optimized for LLM answer engines (Gemini, Perplexity, ChatGPT)
  geo_entities?: string[]; // Key entity tags for Knowledge Graph indexing
  aeo_direct_answer?: string; // Direct 40-60 word Answer Box for position-zero ranking & voice assistants
  aeo_faq?: Array<{ question: string; answer: string }>; // FAQ pairs for automatic FAQPage JSON-LD Schema
  schema_type?: 'NewsArticle' | 'BlogPosting' | 'TechArticle' | 'AnalysisNewsArticle' | 'FAQPage';
  meta_robots?: string; // e.g. 'index, follow' or 'noindex, follow'

  seo_payload?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string; // To allow password-based login and signups
}

export interface MediaItem {
  id: string;
  file_url: string;
  type: 'image' | 'video';
  title?: string;
}

export interface RankingItem {
  id: string;
  sport: string; // e.g. 'cricket', 'football', 'basketball', 'f1'
  categoryName: string; // e.g. 'ICC Men Test Team Rankings', 'FIFA Men World Rankings'
  rank: number;
  name: string; // Team or Player Name
  country?: string;
  points: string | number;
  extra?: string; // e.g. "Mercedes" for F1 drivers, or recent form
}

export interface FixtureItem {
  id: string;
  sport: string;
  team1: string;
  team1_logo?: string;
  team2: string;
  team2_logo?: string;
  date: string; // e.g., '2026-06-05'
  time: string; // e.g., '14:30 GMT'
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  score?: string; // e.g. '2 - 1' or '245/4 & 180 vs 312'
  stage?: string; // e.g. 'Group Stage', 'Grand Finale', 'British GP'
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface LiveStreamItem {
  id: string;
  title: string;
  description: string;
  platform: 'facebook' | 'youtube' | 'streamyard' | 'tamasha';
  video_url: string;
  embed_url: string;
  thumbnail?: string;
  status: 'active' | 'inactive' | 'upcoming' | 'ended';
  is_featured: boolean;
  match_name: string;
  team_one: string;
  team_two: string;
  tournament: string;
  stream_start: string;
  stream_end?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  enable_chat?: boolean;
  views?: number;
}

export interface SearchFilter {
  query: string;
  category: string;
  type: string;
}

export interface HeroConfig {
  enabled: boolean;
  liveBadgeText: string;
  heading: string;
  subtitle: string;
  featuredArticleId?: string;
  backgroundVideoUrl?: string;
  backgroundImageUrl?: string;
  overlayOpacity: number;
  overlayBlur: number;
  heroHeight: 'auto' | 'compact' | 'medium' | 'tall';
  updated_at?: string;
}

export interface FanPoll {
  id: string;
  matchName: string;
  question: string;
  teamA: string;
  teamALogo?: string;
  teamAVotes: number;
  teamB: string;
  teamBLogo?: string;
  teamBVotes: number;
  enableDraw: boolean;
  drawVotes: number;
  status: 'active' | 'scheduled' | 'ended';
  scheduledFor?: string;
  totalVotes: number;
  votedUserIds?: string[];
  created_at: string;
  updated_at?: string;
}
