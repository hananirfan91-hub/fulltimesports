import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, CheckCircle, Eye, EyeOff, 
  ExternalLink, Copy, Check, Sparkles, Trophy, Activity, Globe, Shield, 
  AlertTriangle, X, RefreshCw, Database
} from 'lucide-react';
import { Player, PlayerAchievement, PlayerSocialLinks } from '../types';
import { DB } from '../lib/db';
import { normalizeSlug } from '../lib/slugUtils';

interface AdminPlayersProps {
  onNavigate: (path: string) => void;
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

  // Achievements temp state for form
  const [tempAchievementsList, setTempAchievementsList] = useState<PlayerAchievement[]>([]);

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
    setTempAchievementsList([]);
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

    // Set achievements
    setTempAchievementsList(Array.isArray(player.achievements) ? [...player.achievements] : []);

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
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">Dynamic Statistics Key-Value Pairs</h4>
                      <p className="text-slate-400 text-[11px]">
                        Add sport-specific metrics (e.g. Matches, Runs, Wickets, Goals, Wins, Podiums).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempStatsList(prev => [...prev, { key: '', value: '' }])}
                      className="inline-flex items-center gap-1.5 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg font-mono font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Metric
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {tempStatsList.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Metric Name (e.g. Matches / Strike Rate)"
                          value={item.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempStatsList(prev => {
                              const copy = [...prev];
                              copy[idx].key = val;
                              return copy;
                            });
                          }}
                          className="w-1/2 px-3 py-2 bg-[#01140f] border border-emerald-900/60 rounded-lg text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 290 or 49.2)"
                          value={item.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempStatsList(prev => {
                              const copy = [...prev];
                              copy[idx].value = val;
                              return copy;
                            });
                          }}
                          className="w-1/2 px-3 py-2 bg-[#01140f] border border-emerald-900/60 rounded-lg text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setTempStatsList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-lg bg-[#01140f] border border-emerald-900/40"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ACHIEVEMENTS */}
              {formTab === 'achievements' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">Major Honors &amp; Awards</h4>
                      <p className="text-slate-400 text-[11px]">
                        Add titles, trophies, and annual recognitions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempAchievementsList(prev => [...prev, { title: '', year: '', competition: '', description: '' }])}
                      className="inline-flex items-center gap-1.5 bg-[#01140f] hover:bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg font-mono font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Achievement
                    </button>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {tempAchievementsList.length === 0 ? (
                      <p className="text-center py-6 text-slate-500 font-mono">
                        No achievements added yet. Click &quot;Add Achievement&quot; above.
                      </p>
                    ) : (
                      tempAchievementsList.map((ach, idx) => (
                        <div key={idx} className="bg-[#01140f] border border-emerald-900/60 p-4 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => setTempAchievementsList(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-slate-400 font-mono text-[10px] mb-1">Title</label>
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
                        </div>
                      ))
                    )}
                  </div>
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
