export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string; // 'cricket' | 'football' | 'basketball' | 'f1' | 'esports' | 'tennis' | 'hockey' | 'volleyball'
  tags: string[]; // SEO Keywords
  featured_image: string;
  video_url?: string; // YouTube embed only (e.g. YouTube ID or share link)
  author: string;
  author_email?: string; // Track who wrote the article
  created_at: string;
  is_featured: boolean;
  is_trending: boolean;
  type: 'news' | 'blog'; // To distinguish for Hero or styling
  scheduled_for?: string; // ISO String
  meta_description?: string;
  views: number;
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

export interface SearchFilter {
  query: string;
  category: string;
  type: string;
}
