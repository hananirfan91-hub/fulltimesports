import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, CheckCircle, Eye, EyeOff, 
  ExternalLink, Copy, Check, Sparkles, Trophy, Activity, Globe, Shield, 
  AlertTriangle, X, RefreshCw, Database, ListPlus, Table, FileText, 
  Layers, RotateCcw, CheckCircle2, AlertCircle, Info, Save, Loader2
} from 'lucide-react';
import { Player, PlayerAchievement, PlayerSocialLinks } from '../types';
import { DB } from '../lib/db';
import { normalizeSlug } from '../lib/slugUtils';

interface AdminPlayersProps {
  onNavigate: (path: string) => void;
}

export interface ParsedAchievementRow {
  id: string;
  year: string;
  title: string;
  competition: string;
  description?: string;
  isValid: boolean;
  isDuplicate: boolean;
  error?: string;
}

export interface ParsedStatRow {
  id: string;
  key: string;
  value: string;
  isValid: boolean;
  error?: string;
}

export const SUPABASE_PLAYERS_SQL = `-- Complete SQL Schema for Player Profiles in The Sports Room
-- Run this script directly in the Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    country TEXT,
    country_code VARCHAR(10),
    sport TEXT NOT NULL,
    playing_role TEXT,
    role TEXT,
    current_team TEXT,
    team TEXT,
    jersey_number VARCHAR(10),
    date_of_birth DATE,
    birthplace TEXT,
    nationality TEXT,
    biography TEXT,
    bio TEXT,
    career_highlights TEXT,
    statistics JSONB DEFAULT '{}'::jsonb NOT NULL,
    achievements JSONB DEFAULT '[]'::jsonb NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Note: achievements column stores structured honors & trophies in JSONB array format:
-- [
--   { "year": "2008", "title": "ICC U19 Cricket World Cup Winner", "competition": "ICC U19 World Cup" },
--   { "year": "2011", "title": "Cricket World Cup Winner", "competition": "ICC Cricket World Cup" }
-- ]

-- Indexes for lightning-fast queries and slug lookup
CREATE INDEX IF NOT EXISTS idx_players_slug ON public.players (slug);
CREATE INDEX IF NOT EXISTS idx_players_sport ON public.players (sport);
CREATE INDEX IF NOT EXISTS idx_players_is_published ON public.players (is_published);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON public.players (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published players
CREATE POLICY "Allow public read on published players"
    ON public.players
    FOR SELECT
    USING (true);

-- Allow full access for anon and authenticated API keys (admin management)
CREATE POLICY "Allow full access for service and anon keys"
    ON public.players
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_players_updated_at ON public.players;
CREATE TRIGGER trigger_players_updated_at
    BEFORE UPDATE ON public.players
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_player_updated_at();
`;

export default function AdminPlayers({ onNavigate }: AdminPlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
  const [formTab, setFormTab] = useState<'basic' | 'stats' | 'achievements' | 'socials' | 'seo'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // SQL Script Viewer Modal
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Dynamic Statistics temp state for form
  const [tempStatsList, setTempStatsList] = useState<Array<{ key: string; value: string }>>([]);
  const [statsSubView, setStatsSubView] = useState<'bulk' | 'list'>('bulk');
  const [bulkStatsText, setBulkStatsText] = useState('');
  const [parsedStatRows, setParsedStatRows] = useState<ParsedStatRow[]>([]);
  const [hasParsedStats, setHasParsedStats] = useState(false);
  const [bulkStatsFeedback, setBulkStatsFeedback] = useState<{
    totalDetected: number;
    validCount: number;
    invalidCount: number;
  } | null>(null);
  const [isBulkStatsSaving, setIsBulkStatsSaving] = useState(false);

  // Sample Cricket Career Statistics matching the user's exact record view
  const SAMPLE_STATS_DATA = `ODI 50's | 38
T20 50's | 39
Test 50's | 34
ODI Average | 53.43
T20 Average | 38.94
ODI Hundreds | 20
T20 Hundreds | 3
Test Average | 42.98
Test Hundreds | 9
Total Career Runs | 354
Test Runs 66 Matches | 4,771
ODI Runs 143 Matches | 6,626
T20 Runs 145 Matches | 4,596
Fifties Across All Formats | 111
Hundreds Across All Formats | 32`;

  // Achievements temp state for form
  const [tempAchievementsList, setTempAchievementsList] = useState<PlayerAchievement[]>([]);

  // Bulk Add Achievements State
  const [bulkAchievementsText, setBulkAchievementsText] = useState('');
  const [parsedAchievementRows, setParsedAchievementRows] = useState<ParsedAchievementRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{
    totalDetected: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  } | null>(null);
  const [achievementsSubView, setAchievementsSubView] = useState<'bulk' | 'list'>('bulk');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Helper sample achievements text for testing and instant user guidance
  const SAMPLE_ACHIEVEMENTS_DATA = `2022 | Sir Garfield Sobers Trophy (ICC Cricketer of the Year) | ICC Awards | Recognized as the premier male cricketer globally across all formats.
2021 & 2022 | ICC Men's ODI Cricketer of the Year | ICC Awards | Consecutive year honors for batting dominance in 50-over international cricket.
2023 | Fastest to 5,000 ODI Runs | International Cricket | Completed 5,000 runs in just 97 innings, surpassing Hashim Amla and Viv Richards.
2017 | ICC Champions Trophy winner with Pakistan | ICC
2019 | Scored 474 runs in the Cricket World Cup, a Pakistan record at the time | ICC Cricket World Cup
2021 | Reached No. 1 in the ICC ODI batting rankings | ICC Rankings
2022 | Became the fastest player to 17 ODI centuries | ICC
2022 | First batter to score three consecutive ODI centuries twice | ICC
2023 | Became the fastest player to 19 ODI centuries, in 102 innings | ICC
2023 | Scored 151 against Nepal in the Asia Cup | ACC / Asia Cup
2026 | Scored 588 runs in PSL 11, equalling the season-run record | Pakistan Super League
2022 | Fastest to 1,000 ODI runs as captain | ICC / International Cricket`;

  /**
   * Smart Multi-Format Parser for Player Achievements
   * Supports: Pipe-separated, Tab-separated, CSV comma-separated, Markdown tables
   * Automatically filters markdown dividers, headers, duplicate records, and trims whitespace
   */
  const parseAchievementsInput = (
    text: string,
    existingList: PlayerAchievement[]
  ): {
    rows: ParsedAchievementRow[];
    totalDetected: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  } => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows: ParsedAchievementRow[] = [];

    // Duplicate detection reference sets
    const existingSet = new Set(
      existingList.map(a => `${String(a.year || '').trim().toLowerCase()}:::${String(a.title || '').trim().toLowerCase()}`)
    );
    const localBatchSet = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];

      // 1. Ignore markdown table divider rows (e.g., |---|---|---| or |:---|:---:|)
      if (/^\|?[\s-:]+\|[\s-:]+(\|[\s-:]+)*\|?$/.test(rawLine)) continue;

      // 2. Ignore common table header rows (e.g., Year | Achievement | Competition)
      if (/^\|?\s*(year|date|season)\s*\|\s*(achievement|title|award|honor|milestone)\s*\|\s*(competition|tournament|body|event|league)/i.test(rawLine)) continue;
      if (/^(year|date|season)(\t|,|\|)(achievement|title|award)(\t|,|\|)(competition|tournament|body)/i.test(rawLine) && i === 0) continue;

      let line = rawLine;
      // Strip leading and trailing markdown pipes if present
      if (line.startsWith('|') && line.endsWith('|')) {
        line = line.slice(1, -1).trim();
      }

      // 3. Determine Delimiter (Pipe, Tab, CSV Comma, or Space-with-Year)
      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|').map(p => p.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes(',')) {
        // Safe CSV splitter respecting quotes
        parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, ''));
      } else {
        // Space-separated line starting with 4-digit year (e.g., "2008 ICC U19 World Cup Winner")
        const match = line.match(/^(\d{4}(?:-\d{2,4})?)\s+(.+)$/);
        if (match) {
          parts = [match[1], match[2]];
        } else {
          parts = [line];
        }
      }

      // Filter out empty cell strings
      parts = parts.filter(p => p.length > 0);
      if (parts.length === 0) continue;

      let year = '';
      let title = '';
      let competition = '';
      let description = '';

      const isYearString = (val: string) => /^('?\d{2,4}(?:-\d{2,4})?|\d{4}\/\d{2,4}|\d{4}\s*&\s*\d{4}|present|\d{4}\s*-\s*present)$/i.test(val.trim());

      // Smart column position mapping
      if (parts.length >= 4) {
        if (isYearString(parts[0])) {
          year = parts[0];
          title = parts[1];
          competition = parts[2];
          description = parts.slice(3).join(' | ');
        } else if (isYearString(parts[1])) {
          title = parts[0];
          year = parts[1];
          competition = parts[2];
          description = parts.slice(3).join(' | ');
        } else if (isYearString(parts[2])) {
          title = parts[0];
          competition = parts[1];
          year = parts[2];
          description = parts.slice(3).join(' | ');
        } else {
          year = parts[0];
          title = parts[1];
          competition = parts[2];
          description = parts.slice(3).join(' | ');
        }
      } else if (parts.length === 3) {
        if (isYearString(parts[0])) {
          year = parts[0];
          title = parts[1];
          competition = parts[2];
        } else if (isYearString(parts[1])) {
          title = parts[0];
          year = parts[1];
          competition = parts[2];
        } else if (isYearString(parts[2])) {
          title = parts[0];
          competition = parts[1];
          year = parts[2];
        } else {
          year = parts[0];
          title = parts[1];
          competition = parts[2];
        }
      } else if (parts.length === 2) {
        if (isYearString(parts[0])) {
          year = parts[0];
          title = parts[1];
        } else if (isYearString(parts[1])) {
          title = parts[0];
          year = parts[1];
        } else {
          title = parts[0];
          competition = parts[1];
        }
      } else if (parts.length === 1) {
        title = parts[0];
      }

      year = year.trim();
      title = title.trim();
      competition = competition.trim();
      description = description.trim();

      // Validation
      let isValid = true;
      let error = '';

      if (!title) {
        isValid = false;
        error = 'Achievement title is required';
      }

      const key = `${year.toLowerCase()}:::${title.toLowerCase()}`;
      const isDuplicate = existingSet.has(key) || localBatchSet.has(key);
      if (!isDuplicate && title) {
        localBatchSet.add(key);
      }

      rows.push({
        id: `ach-parsed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        year,
        title,
        competition,
        description: description || undefined,
        isValid,
        isDuplicate,
        error: !isValid ? error : (isDuplicate ? 'Duplicate achievement (will be skipped)' : undefined)
      });
    }

    const totalDetected = rows.length;
    const validCount = rows.filter(r => r.isValid && !r.isDuplicate).length;
    const invalidCount = rows.filter(r => !r.isValid).length;
    const duplicateCount = rows.filter(r => r.isDuplicate).length;

    return {
      rows,
      totalDetected,
      validCount,
      invalidCount,
      duplicateCount
    };
  };

  const handleParseBulkAchievements = () => {
    if (!bulkAchievementsText.trim()) {
      setErrorMessage("Please paste achievement records into the textarea first.");
      return;
    }
    const result = parseAchievementsInput(bulkAchievementsText, tempAchievementsList);
    if (result.totalDetected === 0) {
      setErrorMessage("No valid achievement rows could be detected in the pasted text.");
      return;
    }

    setParsedAchievementRows(result.rows);
    setBulkFeedback({
      totalDetected: result.totalDetected,
      validCount: result.validCount,
      invalidCount: result.invalidCount,
      duplicateCount: result.duplicateCount
    });
    setHasParsed(true);
    setErrorMessage('');
  };

  const handleLoadSampleAchievements = () => {
    setBulkAchievementsText(SAMPLE_ACHIEVEMENTS_DATA);
    setErrorMessage('');
  };

  const handleClearBulkText = () => {
    setBulkAchievementsText('');
    setParsedAchievementRows([]);
    setHasParsed(false);
    setBulkFeedback(null);
  };

  const handleUpdateParsedRow = (id: string, field: 'year' | 'title' | 'competition' | 'description', value: string) => {
    setParsedAchievementRows(prev => {
      const updated = prev.map(row => {
        if (row.id !== id) return row;
        const newRow = { ...row, [field]: value };
        const cleanTitle = newRow.title.trim();
        newRow.isValid = Boolean(cleanTitle);
        newRow.error = cleanTitle ? undefined : 'Achievement title is required';
        return newRow;
      });

      const validCount = updated.filter(r => r.isValid && !r.isDuplicate).length;
      const invalidCount = updated.filter(r => !r.isValid).length;
      const duplicateCount = updated.filter(r => r.isDuplicate).length;

      setBulkFeedback({
        totalDetected: updated.length,
        validCount,
        invalidCount,
        duplicateCount
      });

      return updated;
    });
  };

  const handleDeleteParsedRow = (id: string) => {
    setParsedAchievementRows(prev => {
      const updated = prev.filter(r => r.id !== id);
      const validCount = updated.filter(r => r.isValid && !r.isDuplicate).length;
      const invalidCount = updated.filter(r => !r.isValid).length;
      const duplicateCount = updated.filter(r => r.isDuplicate).length;

      setBulkFeedback({
        totalDetected: updated.length,
        validCount,
        invalidCount,
        duplicateCount
      });

      if (updated.length === 0) {
        setHasParsed(false);
      }

      return updated;
    });
  };

  const handleAddEmptyParsedRow = () => {
    const newRow: ParsedAchievementRow = {
      id: `ach-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      year: new Date().getFullYear().toString(),
      title: '',
      competition: '',
      description: '',
      isValid: false,
      isDuplicate: false,
      error: 'Achievement title is required'
    };
    setParsedAchievementRows(prev => [newRow, ...prev]);
    setHasParsed(true);
    setBulkFeedback(prev => ({
      totalDetected: (prev?.totalDetected || 0) + 1,
      validCount: prev?.validCount || 0,
      invalidCount: (prev?.invalidCount || 0) + 1,
      duplicateCount: prev?.duplicateCount || 0
    }));
  };

  const handleAppendParsedAchievements = () => {
    const validToAppend = parsedAchievementRows
      .filter(r => r.isValid && !r.isDuplicate)
      .map(r => ({
        year: r.year.trim(),
        title: r.title.trim(),
        competition: r.competition.trim(),
        description: r.description?.trim() || undefined
      }));

    if (validToAppend.length === 0) {
      setErrorMessage("No valid non-duplicate achievements available to add.");
      return;
    }

    setTempAchievementsList(prev => [...prev, ...validToAppend]);
    setSuccessMessage(`Successfully added ${validToAppend.length} achievement(s) to this player profile!`);
    setParsedAchievementRows([]);
    setHasParsed(false);
    setBulkAchievementsText('');
    setBulkFeedback(null);
    setAchievementsSubView('list');
  };

  const handleSaveAllAchievementsDirectly = async () => {
    const validToAppend = parsedAchievementRows
      .filter(r => r.isValid && !r.isDuplicate)
      .map(r => ({
        year: r.year.trim(),
        title: r.title.trim(),
        competition: r.competition.trim(),
        description: r.description?.trim() || undefined
      }));

    if (validToAppend.length === 0 && tempAchievementsList.length === 0) {
      setErrorMessage("No valid achievements found to save.");
      return;
    }

    const combinedAchievements = [...tempAchievementsList, ...validToAppend];
    setTempAchievementsList(combinedAchievements);

    if (editingPlayer && editingPlayer.name?.trim()) {
      try {
        setIsBulkSaving(true);
        setErrorMessage('');

        const formattedStats: Record<string, string | number> = {};
        tempStatsList.forEach(item => {
          const cleanKey = item.key.trim();
          const cleanVal = item.value.trim();
          if (cleanKey && cleanVal) {
            const numVal = Number(cleanVal);
            formattedStats[cleanKey] = isNaN(numVal) ? cleanVal : numVal;
          }
        });

        const generatedSlug = editingPlayer.slug?.trim() 
          ? normalizeSlug(editingPlayer.slug) 
          : normalizeSlug(editingPlayer.name);

        const payloadToSave: Partial<Player> = {
          ...editingPlayer,
          slug: generatedSlug,
          statistics: formattedStats,
          achievements: combinedAchievements,
          role: editingPlayer.playing_role || editingPlayer.role || '',
          playing_role: editingPlayer.playing_role || editingPlayer.role || '',
          team: editingPlayer.current_team || editingPlayer.team || '',
          current_team: editingPlayer.current_team || editingPlayer.team || '',
          bio: editingPlayer.biography || editingPlayer.bio || '',
          biography: editingPlayer.biography || editingPlayer.bio || '',
        };

        await DB.savePlayerAsync(payloadToSave);
        setSuccessMessage(`Successfully saved ${combinedAchievements.length} achievements for ${editingPlayer.name}!`);
        setParsedAchievementRows([]);
        setHasParsed(false);
        setBulkAchievementsText('');
        setBulkFeedback(null);
        setAchievementsSubView('list');
        await loadPlayers();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save player achievements.");
      } finally {
        setIsBulkSaving(false);
      }
    } else {
      setSuccessMessage(`Loaded ${validToAppend.length} achievements. Please enter the Player Name on Tab 1 to complete saving.`);
      setParsedAchievementRows([]);
      setHasParsed(false);
      setBulkAchievementsText('');
      setBulkFeedback(null);
      setAchievementsSubView('list');
    }
  };

  /**
   * Smart Multi-Format Parser for Career Statistics Key-Value Pairs
   * Supports: Pipe-separated, Tab-separated, CSV comma-separated, Colon/Dash separated, Markdown tables
   * Automatically extracts Metric Name & Metric Value, strips formatting and duplicates
   */
  const parseStatsInput = (
    text: string
  ): {
    rows: ParsedStatRow[];
    totalDetected: number;
    validCount: number;
    invalidCount: number;
  } => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows: ParsedStatRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];

      // 1. Ignore markdown table divider rows (e.g., |---|---| or |:---|:---:|)
      if (/^\|?[\s-:]+\|[\s-:]+(\|[\s-:]+)*\|?$/.test(rawLine)) continue;

      // 2. Ignore common header rows (e.g. Stat | Value, Metric | Record)
      if (/^\|?\s*(stat|statistic|metric|category|record|career\s+stat)\s*\|\s*(value|record|score|count|avg|average|total|runs)\s*\|?$/i.test(rawLine)) continue;
      if (/^(stat|statistic|metric|category)(\t|,|\|)(value|record|score|count)/i.test(rawLine) && i === 0) continue;

      let line = rawLine;
      // Strip leading and trailing markdown pipes if present
      if (line.startsWith('|') && line.endsWith('|')) {
        line = line.slice(1, -1).trim();
      }

      // Determine Delimiter (Pipe, Tab, CSV Comma, Colon, or Equals)
      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|').map(p => p.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes(',')) {
        parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, ''));
      } else if (line.includes(':')) {
        const colonIdx = line.indexOf(':');
        parts = [line.slice(0, colonIdx).trim(), line.slice(colonIdx + 1).trim()];
      } else if (line.includes('=')) {
        const eqIdx = line.indexOf('=');
        parts = [line.slice(0, eqIdx).trim(), line.slice(eqIdx + 1).trim()];
      } else {
        // Look for trailing number/stat value (e.g. "ODI Runs 143 Matches 6,626" or "Matches 143")
        const match = line.match(/^(.+?)\s+([\d,.]+(?:\/\d+)?|\d+(?:\.\d+)?%?)$/);
        if (match) {
          parts = [match[1].trim(), match[2].trim()];
        } else {
          parts = [line];
        }
      }

      let key = parts[0] || '';
      let value = parts.slice(1).join(' ').trim();

      key = key.trim();
      value = value.trim();

      const isValid = Boolean(key && value);
      const error = !key ? 'Metric name is required' : (!value ? 'Metric value is required' : undefined);

      rows.push({
        id: `stat-parsed-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
        key,
        value,
        isValid,
        error
      });
    }

    const totalDetected = rows.length;
    const validCount = rows.filter(r => r.isValid).length;
    const invalidCount = rows.filter(r => !r.isValid).length;

    return {
      rows,
      totalDetected,
      validCount,
      invalidCount
    };
  };

  const handleParseBulkStats = () => {
    if (!bulkStatsText.trim()) {
      setErrorMessage("Please paste career stats into the textarea first.");
      return;
    }
    const result = parseStatsInput(bulkStatsText);
    if (result.totalDetected === 0) {
      setErrorMessage("No valid statistics rows could be detected in the pasted text.");
      return;
    }

    setParsedStatRows(result.rows);
    setBulkStatsFeedback({
      totalDetected: result.totalDetected,
      validCount: result.validCount,
      invalidCount: result.invalidCount
    });
    setHasParsedStats(true);
    setErrorMessage('');
  };

  const handleLoadSampleStats = () => {
    setBulkStatsText(SAMPLE_STATS_DATA);
    setErrorMessage('');
  };

  const handleClearBulkStatsText = () => {
    setBulkStatsText('');
    setParsedStatRows([]);
    setHasParsedStats(false);
    setBulkStatsFeedback(null);
  };

  const handleUpdateParsedStatRow = (id: string, field: 'key' | 'value', val: string) => {
    setParsedStatRows(prev => {
      const updated = prev.map(row => {
        if (row.id !== id) return row;
        const newRow = { ...row, [field]: val };
        const cleanKey = newRow.key.trim();
        const cleanVal = newRow.value.trim();
        newRow.isValid = Boolean(cleanKey && cleanVal);
        newRow.error = !cleanKey ? 'Metric name is required' : (!cleanVal ? 'Metric value is required' : undefined);
        return newRow;
      });

      const validCount = updated.filter(r => r.isValid).length;
      const invalidCount = updated.filter(r => !r.isValid).length;

      setBulkStatsFeedback({
        totalDetected: updated.length,
        validCount,
        invalidCount
      });

      return updated;
    });
  };

  const handleDeleteParsedStatRow = (id: string) => {
    setParsedStatRows(prev => {
      const updated = prev.filter(r => r.id !== id);
      const validCount = updated.filter(r => r.isValid).length;
      const invalidCount = updated.filter(r => !r.isValid).length;

      setBulkStatsFeedback({
        totalDetected: updated.length,
        validCount,
        invalidCount
      });

      return updated;
    });
  };

  const handleAddManualParsedStatRow = () => {
    const newRow: ParsedStatRow = {
      id: `stat-parsed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      key: '',
      value: '',
      isValid: false,
      error: 'Metric name & value are required'
    };
    setParsedStatRows(prev => [newRow, ...prev]);
    setHasParsedStats(true);
    setBulkStatsFeedback(prev => ({
      totalDetected: (prev?.totalDetected || 0) + 1,
      validCount: prev?.validCount || 0,
      invalidCount: (prev?.invalidCount || 0) + 1
    }));
  };

  const handleAppendParsedStats = () => {
    const validToAppend = parsedStatRows
      .filter(r => r.isValid)
      .map(r => ({
        key: r.key.trim(),
        value: r.value.trim()
      }));

    if (validToAppend.length === 0) {
      setErrorMessage("No valid statistics available to add.");
      return;
    }

    setTempStatsList(prev => {
      const existing = prev.filter(p => p.key.trim() && p.value.trim());
      return [...existing, ...validToAppend];
    });

    setSuccessMessage(`Successfully added ${validToAppend.length} career statistic(s) to this player profile!`);
    setParsedStatRows([]);
    setHasParsedStats(false);
    setBulkStatsText('');
    setBulkStatsFeedback(null);
    setStatsSubView('list');
  };

  const handleSaveAllStatsDirectly = async () => {
    const validToAppend = parsedStatRows
      .filter(r => r.isValid)
      .map(r => ({
        key: r.key.trim(),
        value: r.value.trim()
      }));

    if (validToAppend.length === 0 && tempStatsList.length === 0) {
      setErrorMessage("No valid statistics found to save.");
      return;
    }

    const existingValid = tempStatsList.filter(p => p.key.trim() && p.value.trim());
    const combinedStats = [...existingValid, ...validToAppend];
    setTempStatsList(combinedStats);

    if (editingPlayer && editingPlayer.name?.trim()) {
      try {
        setIsBulkStatsSaving(true);
        setErrorMessage('');

        const formattedStats: Record<string, string | number> = {};
        combinedStats.forEach(item => {
          const cleanKey = item.key.trim();
          const cleanVal = item.value.trim();
          if (cleanKey && cleanVal) {
            const numVal = Number(cleanVal.replace(/,/g, ''));
            formattedStats[cleanKey] = isNaN(numVal) ? cleanVal : numVal;
          }
        });

        const validAchievements = tempAchievementsList.filter(a => a.title && a.title.trim().length > 0);
        const generatedSlug = editingPlayer.slug?.trim() 
          ? normalizeSlug(editingPlayer.slug) 
          : normalizeSlug(editingPlayer.name);

        const payloadToSave: Partial<Player> = {
          ...editingPlayer,
          slug: generatedSlug,
          statistics: formattedStats,
          achievements: validAchievements,
          role: editingPlayer.playing_role || editingPlayer.role || '',
          playing_role: editingPlayer.playing_role || editingPlayer.role || '',
          team: editingPlayer.current_team || editingPlayer.team || '',
          current_team: editingPlayer.current_team || editingPlayer.team || '',
          bio: editingPlayer.biography || editingPlayer.bio || '',
          biography: editingPlayer.biography || editingPlayer.bio || '',
        };

        await DB.savePlayerAsync(payloadToSave);
        setSuccessMessage(`Successfully saved ${combinedStats.length} statistics for ${editingPlayer.name}!`);
        setParsedStatRows([]);
        setHasParsedStats(false);
        setBulkStatsText('');
        setBulkStatsFeedback(null);
        setStatsSubView('list');
        await loadPlayers();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save player statistics.");
      } finally {
        setIsBulkStatsSaving(false);
      }
    } else {
      setSuccessMessage(`Loaded ${validToAppend.length} statistics. Please enter the Player Name on Tab 1 to complete saving.`);
      setParsedStatRows([]);
      setHasParsedStats(false);
      setBulkStatsText('');
      setBulkStatsFeedback(null);
      setStatsSubView('list');
    }
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await DB.getPlayersAsync();
      setPlayers(data);
    } catch (err) {
      console.error("Failed to load players in admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();

    const handleSync = () => {
      loadPlayers();
    };
    window.addEventListener('fts_db_sync', handleSync);
    return () => {
      window.removeEventListener('fts_db_sync', handleSync);
    };
  }, []);

  const handleOpenNewPlayer = () => {
    setEditingPlayer({
      name: '',
      slug: '',
      photo_url: '',
      country: '',
      country_code: '',
      sport: 'cricket',
      playing_role: '',
      current_team: '',
      jersey_number: '',
      date_of_birth: '',
      birthplace: '',
      nationality: '',
      biography: '',
      career_highlights: '',
      statistics: {},
      achievements: [],
      social_links: {},
      seo_title: '',
      seo_description: '',
      is_published: true
    });
    setTempStatsList([
      { key: 'Matches', value: '' },
      { key: 'Runs', value: '' },
      { key: 'Average', value: '' }
    ]);
    setStatsSubView('bulk');
    setBulkStatsText('');
    setParsedStatRows([]);
    setHasParsedStats(false);
    setBulkStatsFeedback(null);

    setTempAchievementsList([]);
    setBulkAchievementsText('');
    setParsedAchievementRows([]);
    setHasParsed(false);
    setBulkFeedback(null);
    setAchievementsSubView('bulk');
    setFormTab('basic');
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setEditingPlayer({ ...player });
    
    // Transform statistics JSON to key-value array
    const statsArray = Object.entries(player.statistics || {}).map(([k, v]) => ({
      key: k,
      value: String(v)
    }));
    setTempStatsList(statsArray.length > 0 ? statsArray : [{ key: '', value: '' }]);
    setStatsSubView('bulk');
    setBulkStatsText('');
    setParsedStatRows([]);
    setHasParsedStats(false);
    setBulkStatsFeedback(null);

    // Set achievements
    setTempAchievementsList(Array.isArray(player.achievements) ? [...player.achievements] : []);
    setBulkAchievementsText('');
    setParsedAchievementRows([]);
    setHasParsed(false);
    setBulkFeedback(null);
    setAchievementsSubView('bulk');

    setFormTab('basic');
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !editingPlayer.name?.trim()) {
      setErrorMessage("Player name is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');

      // Build stats object
      const formattedStats: Record<string, string | number> = {};
      tempStatsList.forEach(item => {
        const cleanKey = item.key.trim();
        const cleanVal = item.value.trim();
        if (cleanKey && cleanVal) {
          const numVal = Number(cleanVal);
          formattedStats[cleanKey] = isNaN(numVal) ? cleanVal : numVal;
        }
      });

      // Filter empty achievements
      const validAchievements = tempAchievementsList.filter(a => a.title && a.title.trim().length > 0);

      const generatedSlug = editingPlayer.slug?.trim() 
        ? normalizeSlug(editingPlayer.slug) 
        : normalizeSlug(editingPlayer.name);

      const payloadToSave: Partial<Player> = {
        ...editingPlayer,
        slug: generatedSlug,
        statistics: formattedStats,
        achievements: validAchievements,
        role: editingPlayer.playing_role || editingPlayer.role || '',
        playing_role: editingPlayer.playing_role || editingPlayer.role || '',
        team: editingPlayer.current_team || editingPlayer.team || '',
        current_team: editingPlayer.current_team || editingPlayer.team || '',
        bio: editingPlayer.biography || editingPlayer.bio || '',
        biography: editingPlayer.biography || editingPlayer.bio || '',
      };

      await DB.savePlayerAsync(payloadToSave);
      setSuccessMessage("Player profile successfully saved and synced!");
      setTimeout(() => {
        setIsFormModalOpen(false);
        loadPlayers();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save player.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    try {
      setIsDeleting(true);
      await DB.deletePlayerAsync(playerToDelete.id);
      setPlayerToDelete(null);
      await loadPlayers();
    } catch (err: any) {
      alert("Error deleting player: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (player: Player) => {
    try {
      const updatedStatus = !player.is_published;
      await DB.togglePublishPlayerAsync(player.id, updatedStatus);
      await loadPlayers();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.team && p.team.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.country && p.country.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSport = selectedSport === 'all' || p.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'published' && p.is_published) ||
      (selectedStatus === 'draft' && !p.is_published);

    return matchesSearch && matchesSport && matchesStatus;
  });

  return (
    <div className="space-y-6" id="admin-players-tab">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#022c22] border border-emerald-900/60 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#22c55e] block mb-1">
            Athlete Management CMS
          </span>
          <h2 className="text-2xl font-bold text-white font-display">Player Profiles</h2>
          <p className="text-xs text-slate-300 mt-1">
            Create, edit, publish, and manage athlete profiles, statistics, achievements, and SEO tags.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
            title="Open live dynamic XML sitemap with all player slugs"
          >
            <Globe className="w-4 h-4" />
            <span>Sitemap XML</span>
          </a>
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
          >
            <Database className="w-4 h-4" />
            <span>Supabase SQL</span>
          </button>
          <button
            onClick={handleOpenNewPlayer}
            className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#34d399] text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Player</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#022c22]/80 border border-emerald-900/40 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Search players by name, team, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#01140f] border border-emerald-900/60 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#22c55e]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sport Filter */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 bg-[#01140f] border border-emerald-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-[#22c55e]"
          >
            <option value="all">All Sports</option>
            <option value="cricket">Cricket</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="f1">Formula 1</option>
            <option value="tennis">Tennis</option>
            <option value="hockey">Hockey</option>
            <option value="volleyball">Volleyball</option>
            <option value="esports">Esports</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-[#01140f] border border-emerald-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-[#22c55e]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          <button
            onClick={loadPlayers}
            className="p-2 bg-[#01140f] hover:bg-emerald-950 border border-emerald-900/60 rounded-lg text-emerald-400 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Players Data Table */}
      <div className="bg-[#022c22] border border-emerald-900/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#01140f] text-emerald-400 font-mono uppercase tracking-wider text-[11px] border-b border-emerald-900/60">
              <tr>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Sport</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Role &amp; Team</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    Loading player registry...
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-sm">No player profiles found.</p>
                    <button
                      onClick={handleOpenNewPlayer}
                      className="text-emerald-400 font-mono hover:underline text-xs font-semibold"
                    >
                      + Create the first player profile
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => {
                  const roleStr = player.playing_role || player.role || '';
                  const teamStr = player.current_team || player.team || '';

                  return (
                    <tr key={player.id} className="hover:bg-emerald-950/40 transition">
                      {/* Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#01140f] border border-emerald-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {player.photo_url ? (
                              <img
                                src={player.photo_url}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-emerald-500/50" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{player.name}</span>
                            <span className="text-[10px] font-mono text-emerald-400">/player/{player.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Sport */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                          {player.sport}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {player.country || '—'} {player.country_code ? `(${player.country_code})` : ''}
                      </td>

                      {/* Role & Team */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {roleStr && <div className="text-slate-200 font-semibold">{roleStr}</div>}
                          {teamStr && <div className="text-[11px] text-emerald-300 font-mono">{teamStr}</div>}
                          {!roleStr && !teamStr && <span className="text-slate-500">—</span>}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(player)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition ${
                            player.is_published
                              ? 'bg-emerald-950 border border-emerald-600/50 text-[#22c55e] hover:bg-emerald-900'
                              : 'bg-amber-950 border border-amber-600/50 text-amber-400 hover:bg-amber-900'
                          }`}
                        >
                          {player.is_published ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/player/${player.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#01140f] hover:bg-emerald-950 border border-emerald-900/60 rounded-lg text-emerald-400 hover:text-white transition"
                            title="View Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEditPlayer(player)}
                            className="p-1.5 bg-[#01140f] hover:bg-emerald-950 border border-emerald-900/60 rounded-lg text-slate-300 hover:text-[#22c55e] transition"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPlayerToDelete(player)}
                            className="p-1.5 bg-[#01140f] hover:bg-red-950/60 border border-emerald-900/60 hover:border-red-800 rounded-lg text-slate-400 hover:text-red-400 transition"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PLAYER MODAL */}
      {isFormModalOpen && editingPlayer && (
        <div id="admin-player-form-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto admin-players-modal">
          <div className="bg-[#022c22] border border-emerald-800/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  {editingPlayer.id ? `Edit Player: ${editingPlayer.name}` : 'Add New Player Profile'}
                </h3>
                <p className="text-xs text-slate-300">
                  Fill in the profile details below. Only entered information will be displayed.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-[#01140f] border border-emerald-900/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-emerald-900/50 pb-2 overflow-x-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setFormTab('basic')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  formTab === 'basic'
                    ? 'bg-[#22c55e] text-slate-950 font-bold'
                    : 'bg-[#01140f] text-slate-300 hover:text-white'
                }`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setFormTab('stats')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  formTab === 'stats'
                    ? 'bg-[#22c55e] text-slate-950 font-bold'
                    : 'bg-[#01140f] text-slate-300 hover:text-white'
                }`}
              >
                2. Career Statistics
              </button>
              <button
                type="button"
                onClick={() => setFormTab('achievements')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  formTab === 'achievements'
                    ? 'bg-[#22c55e] text-slate-950 font-bold'
                    : 'bg-[#01140f] text-slate-300 hover:text-white'
                }`}
              >
                3. Achievements
              </button>
              <button
                type="button"
                onClick={() => setFormTab('socials')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  formTab === 'socials'
                    ? 'bg-[#22c55e] text-slate-950 font-bold'
                    : 'bg-[#01140f] text-slate-300 hover:text-white'
                }`}
              >
                4. Social Links
              </button>
              <button
                type="button"
                onClick={() => setFormTab('seo')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  formTab === 'seo'
                    ? 'bg-[#22c55e] text-slate-950 font-bold'
                    : 'bg-[#01140f] text-slate-300 hover:text-white'
                }`}
              >
                5. SEO Settings
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-6">
              {/* TAB 1: BASIC INFO */}
              {formTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Player Name */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Player Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Babar Azam"
                        value={editingPlayer.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            name: val,
                            slug: prev?.slug ? prev.slug : normalizeSlug(val)
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* URL Slug */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        URL Slug <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. babar-azam"
                        value={editingPlayer.slug || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, slug: normalizeSlug(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Canonical URL: /player/{editingPlayer.slug || 'player-slug'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sport */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Sport <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={editingPlayer.sport || 'cricket'}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, sport: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white focus:outline-none focus:border-[#22c55e]"
                      >
                        <option value="cricket">Cricket</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="f1">Formula 1</option>
                        <option value="tennis">Tennis</option>
                        <option value="hockey">Hockey</option>
                        <option value="volleyball">Volleyball</option>
                        <option value="esports">Esports</option>
                      </select>
                    </div>

                    {/* Playing Role */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Playing Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Top-order Batter / Forward"
                        value={editingPlayer.playing_role || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, playing_role: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* Current Team */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Current Team
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pakistan / Peshawar Zalmi"
                        value={editingPlayer.current_team || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, current_team: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-slate-300 font-mono mb-1">
                      Photo URL
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={editingPlayer.photo_url || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, photo_url: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                      {editingPlayer.photo_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-emerald-950 flex-shrink-0 border border-emerald-700">
                          <img
                            src={editingPlayer.photo_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Country */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pakistan"
                        value={editingPlayer.country || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* Country Code */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Country Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PK"
                        maxLength={5}
                        value={editingPlayer.country_code || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* Jersey Number */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Jersey Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 56"
                        value={editingPlayer.jersey_number || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, jersey_number: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editingPlayer.date_of_birth ? editingPlayer.date_of_birth.slice(0, 10) : ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Birthplace */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Birthplace
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lahore, Punjab, Pakistan"
                        value={editingPlayer.birthplace || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, birthplace: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pakistani"
                        value={editingPlayer.nationality || ''}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div>
                    <label className="block text-slate-300 font-mono mb-1">
                      Biography / Career Overview
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write an in-depth, human-authored athlete biography..."
                      value={editingPlayer.biography || ''}
                      onChange={(e) => setEditingPlayer(prev => ({ ...prev, biography: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e] leading-relaxed"
                    />
                  </div>

                  {/* Career Highlights */}
                  <div>
                    <label className="block text-slate-300 font-mono mb-1">
                      Career Highlights (One milestone per line or summary)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Fastest batter to reach 5,000 ODI runs (97 innings)..."
                      value={editingPlayer.career_highlights || ''}
                      onChange={(e) => setEditingPlayer(prev => ({ ...prev, career_highlights: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CAREER STATISTICS */}
              {formTab === 'stats' && (
                <div className="space-y-5 text-xs">
                  {/* Top Bar with Mode Switcher & Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">Career Statistics &amp; Metrics</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {tempStatsList.filter(s => s.key.trim() && s.value.trim()).length} Total
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Add career stats, averages, centuries, or match figures individually or bulk-paste an entire table at once.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#01140f] p-1 rounded-xl border border-emerald-900/60 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setStatsSubView('bulk')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                          statsSubView === 'bulk'
                            ? 'bg-[#22c55e] text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Bulk Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatsSubView('list')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                          statsSubView === 'list'
                            ? 'bg-[#22c55e] text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ListPlus className="w-3.5 h-3.5" /> Current List ({tempStatsList.filter(s => s.key.trim() && s.value.trim()).length})
                      </button>
                    </div>
                  </div>

                  {/* BULK ADD STATS WORKSPACE */}
                  {statsSubView === 'bulk' && (
                    <div className="space-y-4">
                      {/* Bulk Input Card */}
                      <div className="bg-[#01140f] border border-emerald-900/70 rounded-2xl p-4 md:p-5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <Table className="w-4 h-4 text-emerald-400" />
                            <span>Bulk Paste Career Statistics</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Pipe (|)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Tab (\t)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">CSV (,)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Colon (:)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Markdown Table</span>
                          </div>
                        </div>

                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Paste your career stats list or table below. The parser will automatically separate each row into <strong className="text-emerald-300">Metric Name</strong> and <strong className="text-emerald-300">Metric Value</strong> (e.g. <span className="font-mono text-emerald-400">ODI 50&apos;s | 38</span>, <span className="font-mono text-emerald-400">ODI Average | 53.43</span>, <span className="font-mono text-emerald-400">Test Runs 66 Matches | 4,771</span>).
                        </p>

                        <div className="relative">
                          <textarea
                            rows={7}
                            value={bulkStatsText}
                            onChange={(e) => setBulkStatsText(e.target.value)}
                            placeholder={`Paste career stats table here...\n\nExample:\nODI 50's | 38\nT20 50's | 39\nTest 50's | 34\nODI Average | 53.43\nTest Runs 66 Matches | 4,771\nHundreds Across All Formats | 32`}
                            className="w-full font-mono text-xs px-3.5 py-3 bg-[#022c22]/50 border border-emerald-900/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleParseBulkStats}
                              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold px-4 py-2 rounded-xl shadow-md transition"
                            >
                              <Sparkles className="w-4 h-4" /> Parse &amp; Preview Stats Table
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadSampleStats}
                              className="inline-flex items-center gap-1.5 bg-[#01140f] hover:bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-2 rounded-xl font-mono text-[11px] transition"
                            >
                              Load Sample Stats
                            </button>
                          </div>

                          {bulkStatsText && (
                            <button
                              type="button"
                              onClick={handleClearBulkStatsText}
                              className="text-slate-400 hover:text-red-400 text-[11px] font-mono underline underline-offset-2"
                            >
                              Clear Text
                            </button>
                          )}
                        </div>
                      </div>

                      {/* STATS PARSED PREVIEW TABLE */}
                      {hasParsedStats && (
                        <div className="space-y-3 pt-2">
                          {/* Summary Banner */}
                          {bulkStatsFeedback && (
                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#01140f] border border-emerald-900/60">
                              <div className="flex items-center gap-3">
                                <span className="text-white font-semibold">
                                  Detected: <strong className="text-emerald-400 font-mono">{bulkStatsFeedback.totalDetected}</strong>
                                </span>
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> {bulkStatsFeedback.validCount} Valid
                                </span>
                                {bulkStatsFeedback.invalidCount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-red-400 font-mono">
                                    <AlertCircle className="w-3.5 h-3.5" /> {bulkStatsFeedback.invalidCount} Incomplete
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={handleAddManualParsedStatRow}
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-[11px]"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Row
                              </button>
                            </div>
                          )}

                          {/* Editable Parsed Data Table */}
                          <div className="border border-emerald-900/60 rounded-xl overflow-hidden bg-[#01140f]">
                            <div className="overflow-x-auto max-h-80">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-[#022c22] border-b border-emerald-900/60 text-slate-300 font-mono text-[11px]">
                                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                                    <th className="py-2.5 px-3 w-1/2">Metric Name / Column Label</th>
                                    <th className="py-2.5 px-3 w-1/2">Metric Value / Record</th>
                                    <th className="py-2.5 px-3 w-20 text-center">Status</th>
                                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-900/40">
                                  {parsedStatRows.map((row, idx) => (
                                    <tr 
                                      key={row.id}
                                      className={`hover:bg-emerald-950/30 transition ${!row.isValid ? 'bg-red-950/10' : ''}`}
                                    >
                                      <td className="py-2 px-3 text-center text-slate-500 font-mono text-[10px]">
                                        {idx + 1}
                                      </td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          value={row.key}
                                          onChange={(e) => handleUpdateParsedStatRow(row.id, 'key', e.target.value)}
                                          placeholder="Metric Name (e.g. ODI Average)"
                                          className="w-full bg-[#022c22]/50 border border-emerald-900/60 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#22c55e]"
                                        />
                                      </td>
                                      <td className="py-2 px-3">
                                        <input
                                          type="text"
                                          value={row.value}
                                          onChange={(e) => handleUpdateParsedStatRow(row.id, 'value', e.target.value)}
                                          placeholder="Value (e.g. 53.43 or 4,771)"
                                          className="w-full bg-[#022c22]/50 border border-emerald-900/60 rounded-lg px-2.5 py-1.5 text-emerald-300 font-mono text-xs focus:outline-none focus:border-[#22c55e]"
                                        />
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {row.isValid ? (
                                          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-red-400 font-mono text-[10px]" title={row.error}>
                                            <AlertCircle className="w-3.5 h-3.5" /> Missing
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteParsedStatRow(row.id)}
                                          className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                                          title="Remove row"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Stats Target Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleAppendParsedStats}
                              className="inline-flex items-center justify-center gap-2 bg-[#022c22] hover:bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-4 py-2.5 rounded-xl font-mono font-bold transition shadow-sm"
                            >
                              <ListPlus className="w-4 h-4 text-emerald-400" />
                              Append to Form List ({parsedStatRows.filter(r => r.isValid).length})
                            </button>

                            <button
                              type="button"
                              disabled={isBulkStatsSaving}
                              onClick={handleSaveAllStatsDirectly}
                              className="inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
                            >
                              {isBulkStatsSaving ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Player Stats...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" /> Save Career Stats
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CURRENT LIST VIEW (MANUAL EDITING) */}
                  {statsSubView === 'list' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {tempStatsList.filter(s => s.key.trim() && s.value.trim()).length} total active metrics
                        </span>
                        <button
                          type="button"
                          onClick={() => setTempStatsList(prev => [...prev, { key: '', value: '' }])}
                          className="inline-flex items-center gap-1.5 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg font-mono font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Metric Row
                        </button>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {tempStatsList.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-[#01140f] p-2 rounded-xl border border-emerald-900/50">
                            <span className="text-slate-500 font-mono text-[10px] w-6 text-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Metric Name (e.g. ODI Average / Test Runs)"
                              value={item.key}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempStatsList(prev => {
                                  const copy = [...prev];
                                  copy[idx].key = val;
                                  return copy;
                                });
                              }}
                              className="w-1/2 px-3 py-2 bg-[#022c22]/50 border border-emerald-900/60 rounded-lg text-white font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g. 53.43 or 4,771)"
                              value={item.value}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempStatsList(prev => {
                                  const copy = [...prev];
                                  copy[idx].value = val;
                                  return copy;
                                });
                              }}
                              className="w-1/2 px-3 py-2 bg-[#022c22]/50 border border-emerald-900/60 rounded-lg text-emerald-300 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setTempStatsList(prev => prev.filter((_, i) => i !== idx))}
                              className="p-2 text-slate-400 hover:text-red-400 rounded-lg bg-[#01140f] border border-emerald-900/40"
                              title="Delete metric"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {tempStatsList.length === 0 && (
                          <div className="text-center py-8 text-slate-500 font-mono">
                            No metrics configured. Click &quot;Add Metric Row&quot; or switch to &quot;Bulk Add&quot; to paste table.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACHIEVEMENTS */}
              {formTab === 'achievements' && (
                <div className="space-y-5 text-xs">
                  {/* Top Bar with Mode Switcher & Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">Major Honors &amp; Achievements</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {tempAchievementsList.length} Total
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Add titles, trophies, and annual recognitions individually or bulk-paste an entire list at once.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#01140f] p-1 rounded-xl border border-emerald-900/60 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setAchievementsSubView('bulk')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                          achievementsSubView === 'bulk'
                            ? 'bg-[#22c55e] text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Bulk Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAchievementsSubView('list')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                          achievementsSubView === 'list'
                            ? 'bg-[#22c55e] text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ListPlus className="w-3.5 h-3.5" /> Current List ({tempAchievementsList.length})
                      </button>
                    </div>
                  </div>

                  {/* BULK ADD WORKSPACE */}
                  {achievementsSubView === 'bulk' && (
                    <div className="space-y-4">
                      {/* Bulk Input Card */}
                      <div className="bg-[#01140f] border border-emerald-900/70 rounded-2xl p-4 md:p-5 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <Table className="w-4 h-4 text-emerald-400" />
                            <span>Bulk Paste Achievements</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Pipe (|)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Tab (\t)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">CSV (,)</span>
                            <span className="px-2 py-0.5 bg-[#022c22] rounded border border-emerald-900/50">Markdown Table</span>
                          </div>
                        </div>

                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Paste your achievements list below. The smart parser automatically extracts the <strong className="text-emerald-300">Year</strong>, <strong className="text-emerald-300">Achievement Title</strong>, and <strong className="text-emerald-300">Competition / Body</strong>.
                        </p>

                        <div className="relative">
                          <textarea
                            rows={6}
                            value={bulkAchievementsText}
                            onChange={(e) => setBulkAchievementsText(e.target.value)}
                            placeholder={`Paste achievements here...\n2008 | ICC U19 Cricket World Cup Winner | ICC U19 World Cup\n2011 | Cricket World Cup Winner | ICC Cricket World Cup\n2013 | Champions Trophy Winner | ICC Champions Trophy\n2018 | ICC Men's Cricketer of the Year | ICC Awards\n2023 | 50th ODI Century | ICC Cricket World Cup\n2024 | T20 World Cup Winner | ICC Men's T20 World Cup`}
                            className="w-full px-4 py-3 bg-[#022c22]/80 border border-emerald-900/80 rounded-xl text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition"
                          />
                        </div>

                        {/* Bulk Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleParseBulkAchievements}
                              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition shadow-md"
                            >
                              <Sparkles className="w-4 h-4" /> Parse Achievements
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadSampleAchievements}
                              className="inline-flex items-center gap-1.5 bg-[#022c22] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-3 py-2 rounded-xl font-mono text-[11px] transition"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Load Sample Format
                            </button>
                          </div>

                          {bulkAchievementsText && (
                            <button
                              type="button"
                              onClick={handleClearBulkText}
                              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-300 bg-[#022c22]/50 hover:bg-[#022c22] border border-emerald-900/40 px-3 py-2 rounded-xl text-[11px] font-mono transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Validation & Feedback Banner */}
                      {hasParsed && bulkFeedback && (
                        <div className="space-y-2 animate-fadeIn">
                          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                            bulkFeedback.invalidCount === 0
                              ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
                              : 'bg-amber-950/80 border-amber-700/80 text-amber-200'
                          }`}>
                            {bulkFeedback.invalidCount === 0 ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="text-xs space-y-0.5">
                              <p className="font-bold">
                                {bulkFeedback.totalDetected} achievement{bulkFeedback.totalDetected === 1 ? '' : 's'} detected &bull; {bulkFeedback.validCount} valid {bulkFeedback.invalidCount > 0 ? `(${bulkFeedback.invalidCount} need review)` : 'and ready to save'}
                              </p>
                              <p className="text-[11px] opacity-90">
                                {bulkFeedback.invalidCount === 0
                                  ? 'Review the table below. You can edit any field, delete rows, append to profile, or save directly.'
                                  : 'Rows missing an achievement title are flagged below. Please edit or delete them before saving.'}
                              </p>
                            </div>
                          </div>

                          {bulkFeedback.duplicateCount > 0 && (
                            <div className="p-3 bg-blue-950/60 border border-blue-800/60 rounded-xl text-blue-200 flex items-center gap-2 text-[11px]">
                              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span>{bulkFeedback.duplicateCount} duplicate achievement(s) already exist in this profile and will be skipped.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Parsed Preview Table */}
                      {parsedAchievementRows.length > 0 && (
                        <div className="bg-[#01140f] border border-emerald-900/80 rounded-2xl p-4 md:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/50 pb-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-xs">
                                Parsed Achievements Preview ({parsedAchievementRows.length})
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono">
                                (All fields editable)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleAddEmptyParsedRow}
                                className="inline-flex items-center gap-1 bg-[#022c22] hover:bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setParsedAchievementRows([]);
                                  setHasParsed(false);
                                  setBulkFeedback(null);
                                }}
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-red-300 px-2 py-1.5 rounded-lg text-[11px] font-mono"
                              >
                                Clear Preview
                              </button>
                            </div>
                          </div>

                          <div className="overflow-x-auto max-h-96 overflow-y-auto pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-emerald-900/70 text-slate-400 font-mono text-[11px]">
                                  <th className="py-2 px-2.5 w-24">Year</th>
                                  <th className="py-2 px-2.5">Achievement Title</th>
                                  <th className="py-2 px-2.5">Competition / Body</th>
                                  <th className="py-2 px-2.5">Description (Optional)</th>
                                  <th className="py-2 px-2.5 w-24 text-center">Status</th>
                                  <th className="py-2 px-2 w-10 text-right"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-emerald-900/30">
                                {parsedAchievementRows.map((row) => (
                                  <tr key={row.id} className="hover:bg-[#022c22]/40 transition group">
                                    <td className="py-2 px-2.5 align-middle">
                                      <input
                                        type="text"
                                        placeholder="e.g. 2023"
                                        value={row.year}
                                        onChange={(e) => handleUpdateParsedRow(row.id, 'year', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-[#022c22] border border-emerald-900/60 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#22c55e]"
                                      />
                                    </td>
                                    <td className="py-2 px-2.5 align-middle">
                                      <input
                                        type="text"
                                        placeholder="e.g. Sir Garfield Sobers Trophy"
                                        value={row.title}
                                        onChange={(e) => handleUpdateParsedRow(row.id, 'title', e.target.value)}
                                        className={`w-full px-2.5 py-1.5 bg-[#022c22] rounded-lg text-white text-xs focus:outline-none transition ${
                                          !row.isValid
                                            ? 'border border-red-500/80 focus:border-red-400'
                                            : 'border border-emerald-900/60 focus:border-[#22c55e]'
                                        }`}
                                      />
                                      {!row.isValid && row.error && (
                                        <p className="text-[10px] text-red-400 font-mono mt-0.5">{row.error}</p>
                                      )}
                                    </td>
                                    <td className="py-2 px-2.5 align-middle">
                                      <input
                                        type="text"
                                        placeholder="e.g. ICC Awards"
                                        value={row.competition}
                                        onChange={(e) => handleUpdateParsedRow(row.id, 'competition', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-[#022c22] border border-emerald-900/60 rounded-lg text-white text-xs focus:outline-none focus:border-[#22c55e]"
                                      />
                                    </td>
                                    <td className="py-2 px-2.5 align-middle">
                                      <input
                                        type="text"
                                        placeholder="e.g. Premier male cricketer honor..."
                                        value={row.description || ''}
                                        onChange={(e) => handleUpdateParsedRow(row.id, 'description', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-[#022c22] border border-emerald-900/60 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-[#22c55e]"
                                      />
                                    </td>
                                    <td className="py-2 px-2.5 align-middle text-center">
                                      {row.isDuplicate ? (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                                          Duplicate
                                        </span>
                                      ) : row.isValid ? (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                          Valid
                                        </span>
                                      ) : (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-950 text-red-300 border border-red-800">
                                          Needs Title
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-2 align-middle text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteParsedRow(row.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition"
                                        title="Remove Row"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Save & Append Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-900/60">
                            <div className="text-[11px] text-slate-400 font-mono">
                              {parsedAchievementRows.filter(r => r.isValid && !r.isDuplicate).length} ready to merge
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={handleAppendParsedAchievements}
                                className="inline-flex items-center gap-1.5 bg-[#022c22] hover:bg-emerald-950 text-emerald-300 border border-emerald-700 px-4 py-2 rounded-xl font-mono font-bold transition"
                              >
                                <ListPlus className="w-4 h-4" /> Append to Profile List
                              </button>

                              <button
                                type="button"
                                disabled={isBulkSaving}
                                onClick={handleSaveAllAchievementsDirectly}
                                className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-lg transition disabled:opacity-50"
                              >
                                {isBulkSaving ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Save All Achievements
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CURRENT ACHIEVEMENTS LIST VIEW */}
                  {achievementsSubView === 'list' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                          {tempAchievementsList.length === 0 ? (
                            <span>No achievements on this profile yet.</span>
                          ) : (
                            <span>{tempAchievementsList.length} saved achievement(s) on profile.</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setTempAchievementsList(prev => [...prev, { title: '', year: '', competition: '', description: '' }])}
                          className="inline-flex items-center gap-1.5 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg font-mono font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Single Achievement
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {tempAchievementsList.length === 0 ? (
                          <div className="text-center py-10 bg-[#01140f] border border-dashed border-emerald-900/60 rounded-2xl space-y-3">
                            <Trophy className="w-8 h-8 text-emerald-500/60 mx-auto" />
                            <p className="text-slate-400 font-mono text-xs">
                              No achievements added yet.
                            </p>
                            <button
                              type="button"
                              onClick={() => setAchievementsSubView('bulk')}
                              className="inline-flex items-center gap-1.5 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl font-mono text-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Use Bulk Add
                            </button>
                          </div>
                        ) : (
                          tempAchievementsList.map((ach, idx) => (
                            <div key={idx} className="bg-[#01140f] border border-emerald-900/60 p-4 rounded-xl space-y-3 relative group">
                              <button
                                type="button"
                                onClick={() => setTempAchievementsList(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-400 p-1 rounded-lg"
                                title="Delete Achievement"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                                <div className="sm:col-span-2">
                                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Achievement Title</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Sir Garfield Sobers Trophy"
                                    value={ach.title || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempAchievementsList(prev => {
                                        const copy = [...prev];
                                        copy[idx].title = val;
                                        return copy;
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 bg-[#022c22] border border-emerald-900/50 rounded-lg text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Year</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 2022"
                                    value={ach.year || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempAchievementsList(prev => {
                                        const copy = [...prev];
                                        copy[idx].year = val;
                                        return copy;
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 bg-[#022c22] border border-emerald-900/50 rounded-lg text-white font-mono"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Competition / Body</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. ICC Awards"
                                    value={ach.competition || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempAchievementsList(prev => {
                                        const copy = [...prev];
                                        copy[idx].competition = val;
                                        return copy;
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 bg-[#022c22] border border-emerald-900/50 rounded-lg text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 font-mono text-[10px] mb-1">Description (Optional)</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Recognized as the premier male cricketer globally..."
                                    value={ach.description || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempAchievementsList(prev => {
                                        const copy = [...prev];
                                        copy[idx].description = val;
                                        return copy;
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 bg-[#022c22] border border-emerald-900/50 rounded-lg text-slate-200"
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SOCIAL LINKS */}
              {formTab === 'socials' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm border-b border-emerald-900/50 pb-2">
                    Official Social Profiles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">Twitter / X URL</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/..."
                        value={editingPlayer.social_links?.twitter || editingPlayer.social_links?.x || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            social_links: { ...(prev?.social_links || {}), twitter: val, x: val }
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">Instagram URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={editingPlayer.social_links?.instagram || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            social_links: { ...(prev?.social_links || {}), instagram: val }
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">Facebook URL</label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={editingPlayer.social_links?.facebook || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            social_links: { ...(prev?.social_links || {}), facebook: val }
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-mono mb-1">YouTube Channel URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@..."
                        value={editingPlayer.social_links?.youtube || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            social_links: { ...(prev?.social_links || {}), youtube: val }
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 font-mono mb-1">Official Website</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={editingPlayer.social_links?.website || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPlayer(prev => ({
                            ...prev,
                            social_links: { ...(prev?.social_links || {}), website: val }
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO SETTINGS */}
              {formTab === 'seo' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm border-b border-emerald-900/50 pb-2">
                    Search Engine Optimization (SEO) Metadata
                  </h4>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-mono">Custom SEO Title</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(editingPlayer.seo_title || '').length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={`${editingPlayer.name || 'Player Name'} Profile, Stats, Career & News | The Sports Room`}
                      value={editingPlayer.seo_title || ''}
                      onChange={(e) => setEditingPlayer(prev => ({ ...prev, seo_title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-mono">Custom SEO Meta Description</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(editingPlayer.seo_description || '').length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder={`${editingPlayer.name || 'Player'} player profile covering career statistics, team (${editingPlayer.current_team || 'National'}), achievements, biography, and latest news on The Sports Room.`}
                      value={editingPlayer.seo_description || ''}
                      onChange={(e) => setEditingPlayer(prev => ({ ...prev, seo_description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#01140f] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  {/* Publishing Status Toggle */}
                  <div className="pt-3 border-t border-emerald-900/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Publishing Status</span>
                      <span className="text-[11px] text-slate-400">
                        When published, this profile will be publicly indexable and visible on /players and /player/{editingPlayer.slug || 'slug'}.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPlayer.is_published !== false}
                        onChange={(e) => setEditingPlayer(prev => ({ ...prev, is_published: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between border-t border-emerald-900/60 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-[#01140f] hover:bg-slate-900 text-slate-300 border border-slate-700 rounded-xl font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#34d399] disabled:opacity-50 text-slate-950 px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingPlayer.id ? 'Save & Update Profile' : 'Create Player Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#022c22] border border-red-900/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white font-display">Delete Player Profile?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete the player profile for <strong className="text-white">{playerToDelete.name}</strong>? This action will remove the record from Supabase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="px-4 py-2 bg-[#01140f] text-slate-300 border border-slate-700 rounded-lg text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPABASE SQL SCRIPT VIEWER MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#022c22] border border-emerald-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <Database className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white font-display">Supabase SQL Editor Code</h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#01140f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copy and run this SQL query directly in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to initialize or upgrade the <code className="text-[#22c55e]">players</code> table with row-level security and auto-updating triggers:
            </p>

            <div className="relative">
              <pre className="bg-[#01140f] border border-emerald-900/60 p-4 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {SUPABASE_PLAYERS_SQL}
              </pre>
              <button
                onClick={() => {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(SUPABASE_PLAYERS_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }
                }}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-[#022c22] hover:bg-emerald-900 text-emerald-400 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-5 py-2 bg-[#22c55e] text-slate-950 font-mono font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#34d399]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
