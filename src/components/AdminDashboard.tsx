import React, { useState, useEffect } from 'react';
import { 
  Users, LayoutGrid, FileText, FolderPlus, Trophy, Calendar, Image as ImageIcon, 
  Trash2, Edit3, Plus, Key, LogOut, CheckCircle, AlertTriangle, ShieldCheck, 
  Tag, Upload, CalendarClock, Globe, PlusCircle, ArrowUpRight, MessageSquare, Mail,
  Radio, Tv, Video, Eye, Play, ExternalLink, RefreshCw
} from 'lucide-react';
import { Post, Category, RankingItem, FixtureItem, MediaItem, AdminUser, TicketMessage, Subscriber, LiveStreamItem, HeroConfig, FanPoll } from '../types';
import { DB } from '../lib/db';
import { supabase } from '../lib/supabase';
import { normalizeSlug } from '../lib/slugUtils';
import { detectEntitiesInText } from '../lib/entityRegistry';
import { validateAndConvertStreamUrl } from '../lib/streamEmbed';

const alert = (msg: string) => {
  try {
    window.alert(msg);
  } catch (e) {
    console.warn("Alert blocked by browser sandbox:", msg);
  }
};

const copyToClipboard = (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn("Clipboard write blocked by sandbox:", e);
  }
  return false;
};

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'rankings' | 'fixtures' | 'media' | 'homepage' | 'profile' | 'tickets' | 'subscribers' | 'live_streams' | 'fan_polls'>('posts');
  
  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [tickets, setTickets] = useState<TicketMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>([]);

  // Hero Config & Fan Poll states
  const [heroConfigState, setHeroConfigState] = useState<HeroConfig>(() => DB.getHeroConfig());
  const [fanPolls, setFanPolls] = useState<FanPoll[]>(() => DB.getFanPolls());
  const [editingPoll, setEditingPoll] = useState<Partial<FanPoll> | null>(null);
  const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
  const [heroSavedMsg, setHeroSavedMsg] = useState<boolean>(false);

  // Live Streams Form State
  const [editingStream, setEditingStream] = useState<Partial<LiveStreamItem> | null>(null);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamUrlError, setStreamUrlError] = useState('');

  // Editing Forms States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [tempTags, setTempTags] = useState('');
  const [tempEntities, setTempEntities] = useState('');
  const [faqList, setFaqList] = useState<Array<{ question: string; answer: string }>>([]);
  const [postComposerTab, setPostComposerTab] = useState<'content' | 'headings' | 'seo' | 'geo' | 'aeo'>('content');

  const handleAddFaqItem = () => {
    setFaqList(prev => [...prev, { question: '', answer: '' }]);
  };

  const handleRemoveFaqItem = (index: number) => {
    setFaqList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFaqItemChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingRanking, setEditingRanking] = useState<Partial<RankingItem> | null>(null);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  const [editingFixture, setEditingFixture] = useState<Partial<FixtureItem> | null>(null);
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);

  // Drag and Drop media state
  // Drag and Drop media state
  const [dragOver, setDragOver] = useState(false);

  // Login credentials state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup states
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Sports Analyst');
  const [signupPassword, setSignupPassword] = useState('');

  // Profile update state fields
  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');

  // Load database content on mount and attach sync listener
  useEffect(() => {
    setCurrentAdmin(DB.getCurrentAdmin());
    setAdmins(DB.getAdmins());
    refreshData();

    const handleDBSync = () => {
      refreshData();
    };

    window.addEventListener('fts_db_sync', handleDBSync);
    return () => {
      window.removeEventListener('fts_db_sync', handleDBSync);
    };
  }, []);

  useEffect(() => {
    if (currentAdmin) {
      setProfileName(currentAdmin.name);
      setProfileRole(currentAdmin.role);
    }
  }, [currentAdmin]);

  const refreshData = () => {
    const allPosts = DB.getAdminAllPosts();
    const current = DB.getCurrentAdmin();
    const isSuper = current?.email.toLowerCase() === 'hananirfan91@gmail.com';

    if (isSuper) {
      setPosts(allPosts);
    } else {
      // Contributors only see and manage their own articles
      setPosts(allPosts.filter(p => 
        p.author_email?.toLowerCase() === current?.email.toLowerCase() || 
        p.author.toLowerCase() === current?.name.toLowerCase()
      ));
    }
    setCategories(DB.getCategories());
    setRankings(DB.getRankings());
    setFixtures(DB.getFixtures());
    setMedia(DB.getMedia());
    setTickets(DB.getTickets());
    setSubscribers(DB.getSubscribers());
    setLiveStreams(DB.getLiveStreams());
    setHeroConfigState(DB.getHeroConfig());
    setFanPolls(DB.getFanPolls());
  };

  // HERO CONFIG HANDLERS
  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await DB.saveHeroConfig(heroConfigState);
    setHeroSavedMsg(true);
    setTimeout(() => setHeroSavedMsg(false), 3000);
    refreshData();
  };

  // FAN POLL HANDLERS
  const openNewPoll = () => {
    setEditingPoll({
      id: `poll-${Date.now()}`,
      matchName: 'ICC Champions Trophy 2026 • India vs Australia',
      question: "Which team is going to win today's match?",
      teamA: 'India',
      teamALogo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
      teamAVotes: 0,
      teamB: 'Australia',
      teamBLogo: 'https://images.unsplash.com/photo-1512719991214-e0055a98d2b9?auto=format&fit=crop&w=120&q=80',
      teamBVotes: 0,
      enableDraw: true,
      drawVotes: 0,
      status: 'active',
      totalVotes: 0,
      votedUserIds: [],
    });
    setIsPollModalOpen(true);
  };

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoll || !editingPoll.matchName || !editingPoll.question) return;
    await DB.saveFanPoll(editingPoll as FanPoll);
    setIsPollModalOpen(false);
    setEditingPoll(null);
    refreshData();
  };

  const handleResetPollVotes = async (pollId: string) => {
    if (confirm("Reset all vote tallies for this poll to zero?")) {
      await DB.resetFanPollVotes(pollId);
      refreshData();
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (confirm("Delete this fan poll completely?")) {
      await DB.deleteFanPoll(pollId);
      refreshData();
    }
  };

  // LIVE STREAMS CRUD HANDLERS
  const openNewStream = () => {
    setStreamUrlError('');
    setEditingStream({
      title: '',
      description: '',
      platform: 'youtube',
      video_url: '',
      embed_url: '',
      thumbnail: 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
      status: 'active',
      is_featured: false,
      match_name: '',
      team_one: '',
      team_two: '',
      tournament: '',
      stream_start: new Date().toISOString().slice(0, 16),
      stream_end: new Date(Date.now() + 14400000).toISOString().slice(0, 16),
      enable_chat: true,
      created_by: currentAdmin?.name || 'Hanan Irfan'
    });
    setIsStreamModalOpen(true);
  };

  const openEditStream = (item: LiveStreamItem) => {
    setStreamUrlError('');
    setEditingStream({
      ...item,
      stream_start: item.stream_start ? item.stream_start.slice(0, 16) : new Date().toISOString().slice(0, 16),
      stream_end: item.stream_end ? item.stream_end.slice(0, 16) : new Date(Date.now() + 14400000).toISOString().slice(0, 16),
    });
    setIsStreamModalOpen(true);
  };

  const handleSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStream || !editingStream.title || !editingStream.video_url) {
      setStreamUrlError('Stream title and video URL are required.');
      return;
    }

    // Auto-convert and validate stream URL
    const conversion = validateAndConvertStreamUrl(editingStream.video_url);
    if (!conversion.isValid || !conversion.embedUrl) {
      setStreamUrlError(conversion.error || 'Invalid video stream URL. Please provide a valid Facebook or YouTube video link.');
      return;
    }

    const streamDataToSave: Omit<LiveStreamItem, 'id'> & { id?: string } = {
      id: editingStream.id,
      title: editingStream.title.trim(),
      description: editingStream.description?.trim() || '',
      platform: conversion.platform,
      video_url: editingStream.video_url.trim(),
      embed_url: conversion.embedUrl,
      thumbnail: editingStream.thumbnail || 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
      status: editingStream.status || 'active',
      is_featured: !!editingStream.is_featured,
      match_name: editingStream.match_name?.trim() || 'Live Sports Broadcast',
      team_one: editingStream.team_one?.trim() || 'Team A',
      team_two: editingStream.team_two?.trim() || 'Team B',
      tournament: editingStream.tournament?.trim() || 'International Series 2026',
      stream_start: editingStream.stream_start ? new Date(editingStream.stream_start).toISOString() : new Date().toISOString(),
      stream_end: editingStream.stream_end ? new Date(editingStream.stream_end).toISOString() : new Date(Date.now() + 14400000).toISOString(),
      created_by: editingStream.created_by || currentAdmin?.name || 'Hanan Irfan',
      created_at: editingStream.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      enable_chat: editingStream.enable_chat !== undefined ? editingStream.enable_chat : true,
      views: editingStream.views || 0,
    };

    DB.saveLiveStream(streamDataToSave);
    setIsStreamModalOpen(false);
    setEditingStream(null);
    setStreamUrlError('');
    refreshData();
  };

  const handleDeleteStream = (id: string) => {
    if (confirm("Are you sure you want to delete this live stream item?")) {
      DB.deleteLiveStream(id);
      refreshData();
    }
  };

  const handleToggleStreamFeatured = (id: string) => {
    DB.toggleLiveStreamFeatured(id);
    refreshData();
  };

  const [isSigningIn, setIsSigningIn] = useState(false);

  // Auth Handling
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = loginEmail.trim().toLowerCase();
    
    if (!emailLower || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsSigningIn(true);
    setLoginError('');

    try {
      // 1. Force check for Hanan Irfan's default credentials
      if (emailLower === 'hananirfan91@gmail.com' && loginPassword === 'hanan@2007.') {
        const adminUser: AdminUser = {
          id: 'admin-3',
          name: 'Hanan Irfan',
          email: 'hananirfan91@gmail.com',
          role: 'Super Admin',
          is_approved: true,
          is_writer: true
        };

        // Dynamically register user into fts_users and local DB
        try {
          DB.registerAdmin(adminUser);
          await supabase.auth.signUp({
            email: emailLower,
            password: loginPassword,
            options: { data: { name: adminUser.name, role: adminUser.role } }
          });
        } catch (e) {
          console.warn("Background register error (non-blocking):", e);
        }

        DB.setCurrentAdmin(adminUser);
        setCurrentAdmin(adminUser);
        setLoginPassword('');
        setTimeout(() => refreshData(), 100);
        setIsSigningIn(false);
        return;
      }

      // 2. Real auth flow via Supabase Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: loginPassword
      });

      if (!authError && authData?.user) {
        const meta = authData.user.user_metadata || {};
        const adminUser: AdminUser = {
          id: authData.user.id,
          name: meta.name || authData.user.email?.split('@')[0] || 'Contributor',
          email: authData.user.email || emailLower,
          role: meta.role || 'Contributor',
          is_approved: emailLower === 'hananirfan91@gmail.com',
          is_writer: true
        };

        DB.setCurrentAdmin(adminUser);
        setCurrentAdmin(adminUser);
        setLoginPassword('');
        setTimeout(() => refreshData(), 100);
        setIsSigningIn(false);
        return;
      }

      // 3. Fallback: Lookup in fts_users table
      const { data: userList, error: userError } = await supabase
        .from('fts_users')
        .select('*')
        .eq('email', emailLower);

      if (!userError && userList && userList.length > 0) {
        const found = userList[0];
        if (!found.password || found.password === loginPassword) {
          const adminUser: AdminUser = {
            id: found.id || `user-${Date.now()}`,
            name: found.name,
            email: found.email,
            role: found.role,
            is_approved: emailLower === 'hananirfan91@gmail.com' ? true : Boolean(found.is_approved),
            is_writer: Boolean(found.is_writer ?? true)
          };

          DB.setCurrentAdmin(adminUser);
          setCurrentAdmin(adminUser);
          setLoginPassword('');
          setTimeout(() => refreshData(), 100);
          setIsSigningIn(false);
          return;
        }
      }

      setLoginError(authError?.message || 'Invalid email or password. Please try again.');
    } catch (err: any) {
      setLoginError(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = signupEmail.trim().toLowerCase();

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setLoginError('Please fill out all fields.');
      return;
    }

    setIsSigningIn(true);
    setLoginError('');

    try {
      if (emailLower === 'hananirfan91@gmail.com' && signupPassword !== 'hanan@2007.') {
        setLoginError('The administration email address is reserved. Security clearance required to register this account.');
        setIsSigningIn(false);
        return;
      }

      const roleSelected = emailLower === 'hananirfan91@gmail.com' ? 'Super Admin' : signupRole;
      const newUserId = `user-${Date.now()}`;
      const isApproved = emailLower === 'hananirfan91@gmail.com';

      const newlyRegisteredData: AdminUser = {
        id: newUserId,
        name: signupName.trim(),
        email: emailLower,
        role: roleSelected,
        password: signupPassword,
        is_approved: isApproved,
        is_writer: true
      };

      // 1. Write user to local storage AND sync to Supabase fts_users table
      DB.registerAdmin(newlyRegisteredData);

      // 2. Register on Supabase Auth (non-blocking)
      try {
        const { error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password: signupPassword,
          options: {
            data: {
              name: signupName.trim(),
              role: roleSelected
            }
          }
        });
        if (authError) console.warn("Supabase auth signUp warn:", authError);
      } catch (authErr) {
        console.warn("Non-blocking auth signup error:", authErr);
      }

      // 3. Set current logged in admin
      DB.setCurrentAdmin(newlyRegisteredData);
      setCurrentAdmin(newlyRegisteredData);

      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setIsRegisterMode(false);

      setTimeout(() => refreshData(), 100);
    } catch (err: any) {
      setLoginError(err?.message || 'Error occurred during registration.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    DB.setCurrentAdmin(null);
    setCurrentAdmin(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;
    if (!profileName.trim()) {
      setProfileUpdateError('Display name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    setProfileUpdateMsg('');
    setProfileUpdateError('');

    try {
      const updatedUser: AdminUser = {
        ...currentAdmin,
        name: profileName.trim(),
        role: profileRole
      };

      // 1. Sync locally
      DB.setCurrentAdmin(updatedUser);
      setCurrentAdmin(updatedUser);

      // 2. Sync to Supabase fts_users table
      const { error: syncError } = await supabase
        .from('fts_users')
        .upsert([
          { 
            id: currentAdmin.id, 
            name: profileName.trim(), 
            email: currentAdmin.email, 
            role: profileRole,
            is_approved: currentAdmin.is_approved,
            is_writer: true
          }
        ], { onConflict: 'email' });

      if (syncError) {
        console.warn("Supabase users sync warning:", syncError);
      }

      if (syncError) {
        console.warn("Supabase profiles sync warning:", syncError);
      }

      setProfileUpdateMsg('Your profile has been successfully updated and synced across our local and cloud database nodes.');
    } catch (err: any) {
      setProfileUpdateError(err?.message || 'An error occurred while updating your profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };


  // POST CRUD
  const openNewPost = () => {
    if (currentAdmin?.email.toLowerCase() !== 'hananirfan91@gmail.com' && !currentAdmin?.is_approved) {
      alert("⚠️ Writer Approval Pending: Your email (" + (currentAdmin?.email || '') + ") is awaiting approval by the Main Admin (hananirfan91@gmail.com). You cannot write or publish articles until approved.");
      return;
    }
    setEditingPost({
      title: '',
      heading_tag: 'h1',
      subheading: '',
      slug: '',
      content: '',
      category: 'football',
      tags: [],
      featured_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      video_url: '',
      author: currentAdmin?.name || 'Admin Editor',
      is_featured: false,
      is_trending: false,
      type: 'news',
      meta_title: '',
      meta_description: '',
      focus_keyword: '',
      canonical_url: '',
      geo_summary: '',
      geo_entities: [],
      aeo_direct_answer: '',
      aeo_faq: [],
      schema_type: 'NewsArticle',
      meta_robots: 'index, follow',
      scheduled_for: '',
    });
    setTempTags('');
    setTempEntities('');
    setFaqList([]);
    setPostComposerTab('content');
    setIsPostModalOpen(true);
  };

  const openEditPost = (post: Post) => {
    setEditingPost({
      ...post,
      heading_tag: post.heading_tag || 'h1',
      schema_type: post.schema_type || (post.type === 'blog' ? 'BlogPosting' : 'NewsArticle'),
      meta_robots: post.meta_robots || 'index, follow'
    });
    setTempTags(post.tags ? post.tags.join(', ') : '');
    setTempEntities(post.geo_entities ? post.geo_entities.join(', ') : '');
    setFaqList(post.aeo_faq ? [...post.aeo_faq] : []);
    setPostComposerTab('content');
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title) return;

    try {
      const tagsArray = tempTags.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const entitiesArray = tempEntities.split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const generatedSlug = normalizeSlug(editingPost.slug || editingPost.title);

      const finalPost = {
        ...editingPost,
        tags: tagsArray,
        geo_entities: entitiesArray,
        aeo_faq: faqList,
        heading_tag: editingPost.heading_tag || 'h1',
        schema_type: editingPost.schema_type || 'NewsArticle',
        slug: generatedSlug,
        author: editingPost.author || currentAdmin?.name || 'FTS Desk',
        author_email: editingPost.author_email || currentAdmin?.email || '',
      } as Omit<Post, 'id' | 'created_at' | 'views'> & { id?: string };

      if (finalPost.id) {
        await DB.updatePost(finalPost.id, finalPost);
      } else {
        await DB.insertPost(finalPost);
      }

      setIsPostModalOpen(false);
      setEditingPost(null);
      refreshData();
    } catch (err: any) {
      console.error("Failed to save article:", err);
      alert("Notice: Failed to save article to Supabase: " + (err?.message || "Please check connection."));
    }
  };

  const applyFormatToTextarea = (prefix: string, suffix: string = '', defaultSnippet: string = '') => {
    const txt = document.getElementById('editorial-textarea') as HTMLTextAreaElement | null;
    const currentContent = editingPost?.content || '';
    if (!txt) {
      setEditingPost(prev => prev ? { ...prev, content: currentContent + '\n' + prefix + defaultSnippet + suffix } : null);
      return;
    }
    const start = txt.selectionStart;
    const end = txt.selectionEnd;
    const selectedText = currentContent.substring(start, end) || defaultSnippet;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
    setEditingPost(prev => prev ? { ...prev, content: newContent } : null);
    
    setTimeout(() => {
      txt.focus();
      txt.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 30);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this editorial article?")) {
      await DB.deletePost(id);
      refreshData();
    }
  };

  // CATEGORY CRUD
  const openNewCategory = () => {
    setEditingCategory({ id: '', name: '', slug: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.id || !editingCategory.name) return;

    const exists = categories.some(c => c.id === editingCategory.id);
    if (exists) {
      DB.updateCategory(editingCategory.id, editingCategory.name, editingCategory.description || '');
    } else {
      DB.insertCategory(editingCategory as Category);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    refreshData();
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm(`Delete category "${id}"?`)) {
      DB.deleteCategory(id);
      refreshData();
    }
  };

  // RANKINGS CRUD
  const openNewRanking = () => {
    setEditingRanking({ sport: 'cricket', categoryName: 'ICC Men Test Team Rankings', rank: 1, name: '', points: '', extra: '' });
    setIsRankingModalOpen(true);
  };

  const openEditRanking = (item: RankingItem) => {
    setEditingRanking(item);
    setIsRankingModalOpen(true);
  };

  const handleSaveRanking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRanking || !editingRanking.name || !editingRanking.points) return;
    DB.saveRanking(editingRanking as RankingItem);
    setIsRankingModalOpen(false);
    setEditingRanking(null);
    refreshData();
  };

  const handleDeleteRanking = (id: string) => {
    if (confirm("Delete this ranking record?")) {
      DB.deleteRanking(id);
      refreshData();
    }
  };

  // FIXTURES CRUD
  const openNewFixture = () => {
    setEditingFixture({ sport: 'football', team1: '', team2: '', date: new Date().toISOString().split('T')[0], time: '18:00 GMT', venue: '', status: 'upcoming', score: '', stage: '' });
    setIsFixtureModalOpen(true);
  };

  const openEditFixture = (item: FixtureItem) => {
    setEditingFixture(item);
    setIsFixtureModalOpen(true);
  };

  const handleSaveFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture || !editingFixture.team1 || !editingFixture.team2) return;
    DB.saveFixture(editingFixture as FixtureItem);
    setIsFixtureModalOpen(false);
    setEditingFixture(null);
    refreshData();
  };

  const handleDeleteFixture = (id: string) => {
    if (confirm("Delete this fixture schedule?")) {
      DB.deleteFixture(id);
      refreshData();
    }
  };

  // MEDIA Drag and Drop / manual file selection
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    processLocalFiles(files);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) processLocalFiles(files);
  };

  const processLocalFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            DB.addMedia({
              file_url: event.target.result as string,
              type: 'image',
              title: file.name
            });
            refreshData();
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm("Remove this asset from media library?")) {
      DB.deleteMedia(id);
      refreshData();
    }
  };

  // Set Hero layout from lists
  const handleToggleHeroFeature = (id: string) => {
    posts.forEach(p => {
      const isThis = p.id === id;
      DB.updatePost(p.id, { is_featured: isThis });
    });
    refreshData();
  };

  const handleToggleTrendingFlag = (id: string, state: boolean) => {
    DB.updatePost(id, { is_trending: state });
    refreshData();
  };


  // LOGIN RENDER
  if (!currentAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50 relative rounded-3xl overflow-hidden mt-6" id="admin-login-sec">
        <div className="absolute inset-0 bg-cover bg-center opacity-5 filter grayscale contrast-125" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-slate-900/5 to-[#22c55e]/10"></div>
        
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 my-8">
          {/* Brand Left Column - Hidden on mobile */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-[#024030] to-[#01140f] text-white p-10 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <button 
                onClick={() => onNavigate('/')}
                className="inline-flex items-center space-x-1.5 text-xs text-[#22c55e] hover:text-[#4ade80] font-mono font-bold uppercase transition bg-[#01140f]/50 px-3 py-1.5 rounded-lg border border-emerald-950"
              >
                <span>← BACK TO WEBSITE</span>
              </button>
            </div>

            <div className="relative z-10 my-auto py-8">
              <div className="bg-[#01140f] border border-emerald-900 text-[#22c55e] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-950/50">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="font-display font-black text-3xl leading-none tracking-tight uppercase">
                FTS EDITORIAL <br />
                <span className="text-[#22c55e]">STUDIO</span>
              </h1>
              <p className="text-xs text-slate-300 mt-4 leading-relaxed font-sans">
                Access the primary publishing gateway for Full Time Sports. Register to start drafting live football coverage, cricket statistics, formulas, and real-time commentaries.
              </p>
            </div>

            <div className="relative z-10 border-t border-emerald-900/50 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>CMS GATEWAY SECURE v1.4</span>
              <span>© {new Date().getFullYear()} FTS</span>
            </div>
          </div>

          {/* Form Right Column */}
          <div className="col-span-12 md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-6">
              <h2 className="font-display font-black text-2xl text-[#022c22] uppercase tracking-tight">FTS CMS WORKSPACE</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-widest">Secure Entry Node</p>
              <button 
                onClick={() => onNavigate('/')}
                className="mt-3 inline-flex items-center space-x-1 text-[10px] text-[#022c22] bg-emerald-50 px-3 py-1 rounded font-mono font-bold"
              >
                <span>← GO HOME</span>
              </button>
            </div>

            {/* Segmented Controls for Mode switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 max-w-sm mx-auto mb-8 w-full">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setLoginError(''); }}
                className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase rounded-xl transition-all duration-200 ${
                  !isRegisterMode
                    ? 'bg-[#022c22] text-[#22c55e] shadow-md animate-none'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setLoginError(''); }}
                className={`flex-1 py-2.5 text-xs font-mono font-bold uppercase rounded-xl transition-all duration-200 ${
                  isRegisterMode
                    ? 'bg-[#022c22] text-[#22c55e] shadow-md animate-none'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold mb-6 flex items-start space-x-2.5 shadow-sm max-w-md mx-auto w-full">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="max-w-md mx-auto w-full">
              {isRegisterMode ? (
                /* ================= CONTRIBUTOR SIGNUP FORM ================= */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Author Full Name</label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                      placeholder="e.g. Liam Sterling"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Professional Email Address</label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                      placeholder="e.g. liam@sportsmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Analyst Classification Role</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition text-slate-700"
                    >
                      <option value="Football Columnist">Football Columnist</option>
                      <option value="Cricket Commentator">Cricket Commentator</option>
                      <option value="Formula 1 Strategist">Formula 1 Strategist</option>
                      <option value="Esports Chief Editor">Esports Chief Editor</option>
                      <option value="Senior Sports Analyst">Senior Sports Analyst</option>
                      <option value="Sports Writer">Sports Writer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Secret Password</label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs leading-relaxed text-slate-600 font-mono text-[10px]">
                    <span className="font-bold block text-[#022c22] uppercase tracking-wider mb-1 font-sans">REGISTRATION INFORMATION</span>
                    Once validated, you can immediately start writing, editing and adding blogs and articles on the sports workspace platform.
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full mt-2 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white text-xs font-mono font-bold tracking-wider uppercase py-3 rounded-xl border border-emerald-950 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isSigningIn ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </form>
              ) : (
                /* ================= AUTHOR / ADMIN LOGIN FORM ================= */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition font-sans"
                      placeholder="e.g. editor@thesportsroom.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">Account Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs leading-relaxed text-slate-550 mb-2 font-mono text-[10px]">
                    <span className="font-bold block text-slate-750 uppercase tracking-wider mb-1 font-sans">WORKSPACE AUTHENTICATION</span>
                    Welcome to the Full Time Sports gateway. Please use your authorized email and password credentials to gain verified access.
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white text-xs font-mono font-bold tracking-wider uppercase py-3 rounded-xl border border-emerald-950 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Key className="h-4 w-4 text-[#22c55e]" />
                    <span>{isSigningIn ? 'Authenticating...' : 'Authenticate Workspace Session'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6" id="admin-panel-container">
      {/* Admin Header bar */}
      <div className="bg-[#022c22] border border-emerald-950 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#22c55e] text-[#022c22] text-[9px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded">
              {currentAdmin.role}
            </span>
            <span className="text-slate-350 text-xs font-mono">ID: {currentAdmin.id}</span>
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight mt-1">
            WELCOME BACK, {currentAdmin.name.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-350 mt-1">
            Internal editorial nodes: <strong className="text-[#22c55e] font-mono">FTS HTML5 Local CMS Engine</strong>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate('/')} 
            className="bg-[#01140f] hover:bg-[#022c22] text-white font-semibold text-xs px-4 py-2 border border-emerald-950/80 rounded transition duration-150 flex items-center space-x-1"
          >
            <span>Live site</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#22c55e]" />
          </button>
          <button 
            onClick={handleLogout}
            className="bg-[#01140f] border border-[#22c55e]/30 hover:bg-[#22c55e] hover:text-[#022c22] text-white font-mono font-bold text-xs px-4 py-2 rounded transition flex items-center space-x-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 my-6 border-b border-slate-200 pb-3" id="admin-tab-row">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'posts' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          <FileText className="h-4 w-4" />
          <span>My Editorials ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('live_streams')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'live_streams' ? 'bg-[#022c22] text-[#22c55e] border border-emerald-800' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
          <span>Live Streams ({liveStreams.length})</span>
        </button>

        {currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'users' ? 'bg-[#022c22] text-[#22c55e] border border-emerald-800' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>Writers & Approvals ({admins.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'categories' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <FolderPlus className="h-4 w-4" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'media' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Media Library</span>
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'homepage' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Hero Control</span>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'subscribers' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Mail className="h-4 w-4" />
              <span>Subscribers ({subscribers.length})</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
        >
          <Users className="h-4 w-4" />
          <span>My Profile Portal</span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. POSTS COLUMN */}
      {activeTab === 'posts' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900">EDITORIAL ARTICLES PORTAL</h3>
              <p className="text-xs text-slate-500 font-sans">Manage articles, cloud database sync, and SEO publishing</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await DB.syncFromSupabase();
                    refreshData();
                    alert("✅ Successfully synced local storage and Supabase cloud database!");
                  } catch (err: any) {
                    alert("⚠️ Sync issue: " + (err?.message || "Check Supabase credentials."));
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold uppercase px-3.5 py-2 rounded-lg border border-slate-300 transition flex items-center space-x-1.5"
                title="Force refresh & sync articles from Supabase"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Cloud DB</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold uppercase px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5"
                title="View Supabase SQL Table Setup & Fix Script"
              >
                <span>⚡ Supabase Fix SQL</span>
              </button>
              <button 
                onClick={openNewPost}
                className="bg-[#022c22] border border-[#22c55e]/30 hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Compose Analysis</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-600 text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-550 border-b border-slate-200 font-mono text-[11px] uppercase text-left">
                  <th className="py-3 px-4">Banner</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Sport Category</th>
                  <th className="py-3 px-4">Status & Schedule</th>
                  <th className="py-3 px-4">SEO Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => {
                  const now = new Date().getTime();
                  const isScheduled = post.scheduled_for && new Date(post.scheduled_for).getTime() > now;
                  return (
                    <tr key={post.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 shrink-0">
                        <img referrerPolicy="no-referrer" src={post.featured_image || 'https://images.unsplash.com/photo-1540747737956-378724044282?w=100'} alt="" className="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-200" />
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="text-[10px] bg-slate-100 text-slate-705 font-semibold uppercase px-1.5 py-0.5 rounded text-neutral-600 block w-fit mb-1 font-mono">
                          {post.type.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{post.title}</h4>
                        <span className="text-[10px] text-slate-405 font-mono line-clamp-1">/{post.slug}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 uppercase text-xs">{post.category}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {post.is_draft ? (
                          <span className="text-slate-655 bg-slate-50 border border-slate-300 px-2 py-0.5 rounded flex items-center space-x-1.5 w-fit font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            <span>Draft Article</span>
                          </span>
                        ) : isScheduled ? (
                          <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center space-x-1 w-fit">
                            <CalendarClock className="h-3 w-3 shrink-0" />
                            <span>Schedule: {new Date(post.scheduled_for!).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-[#f0fdf4] border border-[#22c55e]/30 px-2 py-0.5 rounded flex items-center space-x-1 w-fit">
                            <CheckCircle className="h-3 w-3 shrink-0" />
                            <span>Live Published</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">{post.views} Views</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] bg-sky-50 border border-sky-100 text-sky-850 px-1 py-0.2 rounded font-mono">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-mono">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!post.is_draft && (
                            <>
                              <button
                                onClick={() => onNavigate(`/sport/${post.category}`)}
                                className="px-2 py-1 text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded transition flex items-center space-x-1"
                                title="View on Sports Category Page"
                              >
                                <span>Sport Page</span>
                              </button>
                              <button
                                onClick={() => onNavigate(`/blog/${post.slug}`)}
                                className="px-2 py-1 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-800 hover:text-white rounded transition flex items-center space-x-1"
                                title="View Published Article Detail"
                              >
                                <span>Read</span>
                              </button>
                            </>
                          )}
                          {post.is_draft && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to publish "${post.title}" live now?`)) {
                                  try {
                                    await DB.updatePost(post.id, { is_draft: false, scheduled_for: '' });
                                    refreshData();
                                  } catch (err) {
                                    console.error("Publish live error:", err);
                                  }
                                }
                              }}
                              className="px-2 py-1 text-[10px] font-mono font-bold bg-[#f0fdf4] border border-[#22c55e]/30 text-emerald-700 hover:bg-[#22c55e] hover:text-[#022c22] rounded transition"
                              title="Publish Live Now"
                            >
                              Publish Live
                            </button>
                          )}
                          <button 
                            onClick={() => openEditPost(post)}
                            className="p-1 px-2 border border-slate-200 hover:border-[#22c55e] rounded text-slate-600 hover:text-[#22c55e] transition bg-white" 
                            title="Edit Article"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 px-2 border border-slate-200 hover:border-red-655 rounded text-slate-600 hover:text-red-655 transition bg-white" 
                            title="Delete Article"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* 2. CATEGORIES COLUMN */}
      {activeTab === 'categories' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-extrabold text-lg text-slate-900">MANAGE SPORTS CATEGORIES</h3>
            <button 
              onClick={openNewCategory}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Node Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="border border-slate-200 rounded-xl p-4 shadow-inner relative group bg-slate-50">
                <span className="text-[10px] font-mono font-bold text-[#e11d48] uppercase tracking-widest">{cat.id}</span>
                <h4 className="font-display font-bold text-slate-900 text-base mt-1">{cat.name}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-normal">{cat.description}</p>
                
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-200/60 opacity-0 group-hover:opacity-100 transition duration-150">
                  <button 
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCategoryModalOpen(true);
                    }}
                    className="p-1 px-2 text-xs border border-slate-300 hover:border-slate-800 rounded bg-white text-slate-700"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 px-2 text-xs border border-red-200 hover:border-red-600 rounded bg-white text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RANKINGS PANEL */}
      {activeTab === 'rankings' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900">MANUAL GLOBAL STANDINGS & RANKINGS TABLE</h3>
              <p className="text-xs text-slate-400 mt-1">Saves immediately to active node. Strictly manual compliance—no scraped data.</p>
            </div>
            <button 
              onClick={openNewRanking}
              className="bg-[#e11d48] hover:bg-rose-700 text-white text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Row Record</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-600 text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-550 border-b border-slate-200 font-mono text-[10px] uppercase text-left">
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Rank category column</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team/Player</th>
                  <th className="py-3 px-4">Points/Record</th>
                  <th className="py-3 px-4">Focus Extra info</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-xs uppercase font-bold text-[#e11d48]">{item.sport}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.categoryName}</td>
                    <td className="py-3 px-4 font-mono text-sm">#{item.rank}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{item.points}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{item.extra || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEditRanking(item)} className="p-1 px-2 border border-slate-200 hover:border-slate-800 hover:text-slate-800 text-slate-500 rounded bg-white">Edit</button>
                        <button onClick={() => handleDeleteRanking(item.id)} className="p-1 px-2 border border-slate-200 hover:border-rose-600 hover:text-rose-600 text-slate-500 rounded bg-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FIXTURES PANEL */}
      {activeTab === 'fixtures' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900">MANUAL MATCH SCHEDULER & fixtures</h3>
              <p className="text-xs text-slate-400 mt-1">Control match calendars manually to guarantee authentic human-style score entries.</p>
            </div>
            <button 
              onClick={openNewFixture}
              className="bg-[#e11d48] hover:bg-rose-700 text-white text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Fixture</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-600 text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-550 border-b border-slate-200 font-mono text-[10px] uppercase text-left">
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Event Stage</th>
                  <th className="py-3 px-4">Contender 1</th>
                  <th className="py-3 px-4">Scoreline / vs</th>
                  <th className="py-3 px-4">Contender 2</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Venue Field</th>
                  <th className="py-3 px-4 animate-pulse">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fixtures.map((fix) => (
                  <tr key={fix.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-xs uppercase font-bold text-[#e11d48]">{fix.sport}</td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-500">{fix.stage || 'Regular Event'}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{fix.team1}</td>
                    <td className="py-3 px-4 font-mono text-center font-black text-rose-600 bg-rose-50/50 rounded max-w-[80px]">
                      {fix.score || 'VS'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{fix.team2}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div>{fix.date}</div>
                      <div className="text-slate-400 text-[10px]">{fix.time}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{fix.venue}</td>
                    <td className="py-3 px-4 text-xs font-mono">
                      {fix.status === 'live' && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase animate-pulse">● LIVE NOW</span>}
                      {fix.status === 'upcoming' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase font-semibold">Scheduled</span>}
                      {fix.status === 'completed' && <span className="bg-slate-100 text-slate-655 px-2 py-0.5 rounded uppercase">Full Time</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <button onClick={() => { setEditingFixture(fix); setIsFixtureModalOpen(true); }} className="p-1 px-2 border border-slate-200 hover:border-slate-800 hover:text-slate-800 text-slate-500 rounded bg-white text-xs">Edit</button>
                        <button onClick={() => handleDeleteFixture(fix.id)} className="p-1 px-2 border border-slate-200 hover:border-rose-600 hover:text-rose-600 text-slate-500 rounded bg-white text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MEDIA LIBRARY PANEL */}
      {activeTab === 'media' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-extrabold text-lg text-slate-900 mb-2">MEDIA DIGITAL STORAGE</h3>
          <p className="text-xs text-slate-500 mb-6">
            Drag-and-drop live images to parse them into persistent local base64 nodes instantly, avoiding external hosting fragility.
          </p>

          {/* Drag & Drop stage zone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer mx-auto max-w-2xl mb-8 flex flex-col justify-center items-center ${dragOver ? 'border-[#e11d48] bg-rose-50/20' : 'border-slate-300 hover:border-slate-500 bg-slate-50'}`}
          >
            <Upload className="h-10 w-10 text-slate-400 mb-3" />
            <p className="font-bold text-slate-755 text-sm uppercase">Drag Sports Photos here or select manually</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">PNG, JPG, SVG, GIF (Immediate base 64 storage conversion)</p>
            <input 
              type="file" 
              multiple 
              onChange={handleFilePick} 
              className="mt-4 text-xs font-mono bg-white border border-slate-300 rounded p-1 mb-2 max-w-xs" 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden relative group aspect-square hover:shadow-md transition">
                <img referrerPolicy="no-referrer" src={item.file_url} alt="" className="w-full h-full object-cover bg-slate-100" />
                <div className="absolute inset-0 bg-black/75 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100 transition duration-150">
                  <p className="text-[10px] text-white font-mono leading-none line-clamp-1">{item.title || 'Attached photo'}</p>
                  
                  <div className="flex justify-between items-center mt-3 border-t border-slate-700 pt-2">
                    <button 
                      onClick={() => {
                        copyToClipboard(item.file_url);
                        alert("Image Source URL copied into clipboard!");
                      }} 
                      className="text-[9px] text-[#e0a96d] font-mono hover:underline uppercase"
                    >
                      Copy Link
                    </button>
                    <button 
                      onClick={() => handleDeleteMedia(item.id)} 
                      className="text-rose-500 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. HERO SECTION MANAGER PANEL */}
      {activeTab === 'homepage' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <span className="bg-[#022c22] text-[#22c55e] font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                  Hero Manager
                </span>
                <h3 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mt-1">
                  Homepage Hero Section Controls
                </h3>
              </div>
              {heroSavedMsg && (
                <span className="bg-emerald-100 text-[#022c22] font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-300 animate-pulse">
                  ✓ Hero Settings Saved!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Customize the live hero background media, overlay opacity, badge text, headings, and select featured articles.
            </p>
          </div>

          {/* Hero Form */}
          <form onSubmit={handleSaveHeroSettings} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Hero Section Status
                </label>
                <select
                  value={heroConfigState.enabled ? 'true' : 'false'}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, enabled: e.target.value === 'true' })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="true">Enabled (Visible on Homepage)</option>
                  <option value="false">Disabled (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Live Top Badge Text
                </label>
                <input
                  type="text"
                  value={heroConfigState.liveBadgeText || ''}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, liveBadgeText: e.target.value })}
                  placeholder="🔴 LIVE STREAMS • DAILY NEWS • TACTICAL METRICS"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Main Hero Heading (H1)
              </label>
              <input
                type="text"
                value={heroConfigState.heading || ''}
                onChange={(e) => setHeroConfigState({ ...heroConfigState, heading: e.target.value })}
                placeholder="The Sports Room | Live Match Streams, Sports News Today & Tactical Analysis"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Hero Subtitle (H2)
              </label>
              <textarea
                rows={2}
                value={heroConfigState.subtitle || ''}
                onChange={(e) => setHeroConfigState({ ...heroConfigState, subtitle: e.target.value })}
                placeholder="Watch every live match stream, read breaking sports news today, and dive deep into real-time telemetry..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Background Video URL Override (Optional)
                </label>
                <input
                  type="text"
                  value={heroConfigState.backgroundVideoUrl || ''}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, backgroundVideoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or MP4/HLS link"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  If set, plays this video as Hero background. Leave empty to auto-play media from the Featured Article.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Background Image URL Override (Optional)
                </label>
                <input
                  type="text"
                  value={heroConfigState.backgroundImageUrl || ''}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, backgroundImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Dark Overlay Opacity: {heroConfigState.overlayOpacity ?? 0.65}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={heroConfigState.overlayOpacity ?? 0.65}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Overlay Blur: {heroConfigState.overlayBlur ?? 2}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={heroConfigState.overlayBlur ?? 2}
                  onChange={(e) => setHeroConfigState({ ...heroConfigState, overlayBlur: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#22c55e]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] font-mono font-bold text-xs uppercase rounded-xl border border-emerald-900 shadow-md transition cursor-pointer"
              >
                Save Hero Settings
              </button>
            </div>
          </form>

          {/* Featured Article Picker */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-slate-600 uppercase pb-1.5 border-b border-slate-200">
              Featured Breaking News Slot (Select Featured Article for Background Media)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center bg-slate-50 hover:bg-white transition">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img referrerPolicy="no-referrer" src={post.featured_image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-slate-800 text-xs line-clamp-1 uppercase">{post.title}</h5>
                      <span className="text-[9px] text-slate-450 uppercase">{post.category} • {post.video_url ? '🎥 Has Video' : '🖼️ Image'}</span>
                    </div>
                  </div>
                  <div>
                    {post.is_featured ? (
                      <span className="bg-rose-50 border border-rose-300 text-rose-700 font-mono text-[9px] font-bold px-2 py-1 rounded-md uppercase">
                        ★ ACTIVE FEATURED
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleToggleHeroFeature(post.id)}
                        className="bg-slate-900 text-white font-mono text-[9px] hover:bg-[#022c22] hover:text-[#22c55e] py-1 px-2.5 rounded-md transition cursor-pointer"
                      >
                        SET FEATURED
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-mono text-xs font-bold text-slate-600 uppercase pb-1.5 border-b border-slate-200 mt-8">
              Trending Articles Carousel State
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img referrerPolicy="no-referrer" src={post.featured_image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-slate-800 text-xs line-clamp-1 uppercase">{post.title}</h5>
                      <span className="text-[9px] text-slate-450 uppercase">{post.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={post.is_trending} 
                      onChange={(e) => handleToggleTrendingFlag(post.id, e.target.checked)}
                      className="cursor-pointer h-4 w-4 text-[#22c55e] border-slate-300 rounded focus:ring-[#22c55e]"
                      id={`trending-${post.id}`}
                    />
                    <label htmlFor={`trending-${post.id}`} className="text-xs text-slate-600 font-medium cursor-pointer">Trending</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. FAN POLL MANAGER PANEL */}
      {activeTab === 'fan_polls' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <span className="bg-[#022c22] text-[#22c55e] font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                Fan Poll Manager
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mt-1">
                Match Prediction Polls
              </h3>
            </div>
            <button
              onClick={openNewPoll}
              className="px-4 py-2.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] font-mono font-bold text-xs uppercase rounded-xl border border-emerald-950 transition flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Fan Poll</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <th className="pb-3 px-3">Match Event</th>
                  <th className="pb-3 px-3">Question</th>
                  <th className="pb-3 px-3">Team A</th>
                  <th className="pb-3 px-3">Team B</th>
                  <th className="pb-3 px-3">Draw</th>
                  <th className="pb-3 px-3 text-center">Total Votes</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {fanPolls.map((poll) => {
                  const total = poll.totalVotes || 0;
                  const pA = total > 0 ? Math.round((poll.teamAVotes / total) * 100) : 0;
                  const pB = total > 0 ? Math.round((poll.teamBVotes / total) * 100) : 0;
                  const pDraw = (poll.enableDraw && total > 0) ? Math.max(0, 100 - pA - pB) : 0;

                  return (
                    <tr key={poll.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-slate-800">{poll.matchName}</td>
                      <td className="py-3 px-3 text-slate-600 line-clamp-1 max-w-xs">{poll.question}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        {poll.teamA} ({poll.teamAVotes} - {pA}%)
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        {poll.teamB} ({poll.teamBVotes} - {pB}%)
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {poll.enableDraw ? `${poll.drawVotes || 0} (${pDraw}%)` : 'Disabled'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-slate-900">
                        {total.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {poll.status === 'active' ? (
                          <span className="bg-emerald-100 text-[#022c22] font-bold text-[10px] px-2 py-0.5 rounded uppercase border border-emerald-300">
                            ● Active
                          </span>
                        ) : poll.status === 'scheduled' ? (
                          <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                            Scheduled
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                            Ended
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => { setEditingPoll(poll); setIsPollModalOpen(true); }}
                          className="px-2 py-1 text-[11px] font-mono border border-slate-200 hover:border-slate-800 text-slate-700 rounded bg-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPollVotes(poll.id)}
                          className="px-2 py-1 text-[11px] font-mono border border-amber-200 text-amber-700 hover:bg-amber-50 rounded bg-white"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="px-2 py-1 text-[11px] font-mono border border-rose-200 text-rose-600 hover:bg-rose-50 rounded bg-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {activeTab === 'profile' && currentAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in" id="admin-profile-portal-pane">
          <div className="flex border-b pb-4 mb-6 justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">MY PROFILE GATEWAY</h3>
              <p className="text-xs text-slate-500">Manage and view your credentials and contributor stats</p>
            </div>
            <span className="bg-emerald-100 text-[#022c22] border border-emerald-200 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {currentAdmin.role}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Card Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-[#022c22] to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                  <div className="w-20 h-20 bg-[#22c55e] text-[#022c22] flex items-center justify-center rounded-2xl text-3xl font-black shadow-lg">
                    {currentAdmin.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xl tracking-tight uppercase">{currentAdmin.name}</h4>
                    <p className="text-xs text-slate-300 font-mono">{currentAdmin.role}</p>
                  </div>
                  <div className="bg-[#01140f] border border-emerald-800/40 w-full rounded-xl p-3 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono mb-1">TOTAL ARTICLES CONTRIBUTED</span>
                    <span className="text-2xl font-black font-display text-[#22c55e]">{posts.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-mono text-xs font-bold text-slate-700 uppercase">Verification Framework</h4>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200/55">
                    <span className="text-slate-500">DATABASE ENGINE</span>
                    <span className="text-slate-800 font-bold">Supabase DB</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200/55">
                    <span className="text-slate-500">AUTHENTICATOR</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 inline" /> ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500">INTERFACE NODES</span>
                    <span className="text-slate-800 font-bold">SSL Secured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editing / Metadata Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h4 className="font-display font-extrabold text-sm text-slate-900 uppercase mb-4 border-b pb-2">Profile Credentials & Attributes</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Display Name</span>
                      <div className="bg-white border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-semibold select-all border-slate-200">
                        {currentAdmin.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Registered Email</span>
                      <div className="bg-white border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-semibold select-all border-slate-200 font-sans">
                        {currentAdmin.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Analytical Role Badge</span>
                      <div className="bg-white border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-semibold border-slate-200">
                        {currentAdmin.role}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Global Node ID</span>
                      <div className="bg-white border rounded-xl px-4 py-2.5 text-slate-750 text-xs font-mono select-all truncate border-slate-200">
                        {currentAdmin.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Display Name Interactive Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-display font-extrabold text-sm text-slate-900 uppercase mb-4 border-b pb-2">Update Account Profile</h4>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1.5">Edit Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition font-sans"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1.5">Assigned Editorial Role</label>
                    <select
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#22c55e] focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition text-slate-850"
                    >
                      <option value="Sports Analyst">Sports Analyst</option>
                      <option value="Lead Columnist">Lead Columnist</option>
                      <option value="Senior Football Critic">Senior Football Critic</option>
                      <option value="Motorsport Telemetrist">Motorsport Telemetrist</option>
                      <option value="Contributor">Contributor</option>
                      {currentAdmin.role === 'Super Admin' && (
                        <option value="Super Admin">Super Admin</option>
                      )}
                    </select>
                  </div>

                  {profileUpdateMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-slate-705 leading-normal flex items-start space-x-2 font-medium">
                      <CheckCircle className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                      <span>{profileUpdateMsg}</span>
                    </div>
                  )}

                  {profileUpdateError && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-700 leading-normal flex items-start space-x-2 font-medium">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{profileUpdateError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white text-xs font-mono font-bold tracking-wider uppercase px-5 py-3 rounded-xl border border-emerald-950 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <span>{isUpdatingProfile ? 'Saving Details...' : 'Save Changes'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TICKETS PANEL */}
      {activeTab === 'tickets' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in" id="admin-tickets-panel">
          <div className="flex border-b pb-4 mb-6 justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">Inbound Contact Messages</h3>
              <p className="text-xs text-slate-500">View and manage messages sent from the Contact Us page form</p>
            </div>
            <span className="bg-emerald-100 text-[#022c22] border border-emerald-200 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Total Messages: {tickets.length}
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl">
              <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No inbound messages received yet.</p>
              <p className="text-xs text-slate-450 mt-1">When visitors submit the contact form, their queries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((tkt) => (
                <div key={tkt.id} className="border border-slate-200 hover:border-emerald-550 rounded-2xl p-5 bg-slate-50 hover:bg-white transition duration-200 shadow-xs relative group">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this message ticket?")) {
                        DB.deleteTicket(tkt.id);
                        refreshData();
                      }
                    }}
                    className="absolute top-4 right-4 p-1.5 border border-slate-255 hover:border-red-600 rounded-lg text-slate-450 hover:text-red-600 transition bg-white"
                    title="Delete Message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150/50 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded uppercase mr-2">
                        Ticket
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{tkt.name}</span>
                      <span className="text-xs text-slate-450 font-mono ml-2">({tkt.email})</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(tkt.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1 uppercase font-display tracking-tight">
                      Subject: {tkt.subject}
                    </h4>
                    <p className="text-xs text-slate-600 bg-white border border-slate-150/30 p-3 rounded-xl italic leading-relaxed whitespace-pre-wrap">
                      "{tkt.message}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. SUBSCRIBERS PANEL */}
      {activeTab === 'subscribers' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in" id="admin-subscribers-panel">
          <div className="flex border-b pb-4 mb-6 justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">Newsletter Subscribers</h3>
              <p className="text-xs text-slate-500">Manage emails registered from newsletter subscription widgets</p>
            </div>
            <span className="bg-emerald-100 text-[#022c22] border border-emerald-200 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Total Subscribers: {subscribers.length}
            </span>
          </div>

          {subscribers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl">
              <Mail className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No email subscribers registered yet.</p>
              <p className="text-xs text-slate-450 mt-1">When users type their email to subscribe, they will be registered here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-600 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-550 border-b border-slate-200 font-mono text-[11px] uppercase text-left">
                    <th className="py-3 px-4">Registration Email</th>
                    <th className="py-3 px-4">Subscription Date & Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 font-sans">{sub.email}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to remove this subscriber?")) {
                              DB.deleteSubscriber(sub.id);
                              refreshData();
                            }
                          }}
                          className="p-1 px-2.5 border border-slate-200 hover:border-red-655 rounded text-slate-600 hover:text-red-155 transition bg-white"
                          title="Delete Subscriber"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WRITERS & APPROVALS MODULE */}
      {activeTab === 'users' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#022c22] text-[#22c55e] border border-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase">
                  ADMIN CONTROL PANEL • TABLE: fts_users
                </span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-slate-900 mt-1 uppercase">
                WRITERS & USER APPROVAL MANAGEMENT
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review registered emails, grant writer publishing access, or manage roles across the website.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs px-3 py-1.5 rounded-xl uppercase">
                Approved Writers: {admins.filter(a => a.is_approved || a.email.toLowerCase() === 'hananirfan91@gmail.com').length} / {admins.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-600 text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-550 border-b border-slate-200 font-mono text-[11px] uppercase text-left">
                  <th className="py-3 px-4">Writer Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((user) => {
                  const isMainAdmin = user.email.toLowerCase() === 'hananirfan91@gmail.com';
                  const isApproved = isMainAdmin || user.is_approved === true;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full font-mono font-bold text-xs flex items-center justify-center ${isMainAdmin ? 'bg-[#022c22] text-[#22c55e]' : 'bg-slate-200 text-slate-700'}`}>
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              {user.name} {isMainAdmin && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono ml-1">MAIN ADMIN</span>}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                        {user.role || 'Sports Writer'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        {isApproved ? (
                          <span className="bg-[#f0fdf4] text-emerald-700 border border-[#22c55e]/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase inline-flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-[#22c55e]" />
                            <span>Approved Writer</span>
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase inline-flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {!isMainAdmin && (
                          <>
                            {!isApproved ? (
                              <button
                                onClick={() => {
                                  DB.approveWriter(user.email);
                                  refreshData();
                                  alert(`✅ Writer "${user.email}" approved successfully! They can now compose articles and blogs.`);
                                }}
                                className="px-3 py-1.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] border border-emerald-950 text-xs font-mono font-bold uppercase rounded-lg transition shadow-xs cursor-pointer"
                              >
                                Approve Writer
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  DB.revokeWriter(user.email);
                                  refreshData();
                                  alert(`⚠️ Access revoked for "${user.email}".`);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-bold uppercase rounded-lg transition cursor-pointer"
                              >
                                Revoke Approval
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove user "${user.email}"?`)) {
                                  DB.deleteUser(user.id, user.email);
                                  refreshData();
                                }
                              }}
                              className="p-1.5 border border-slate-200 hover:border-red-500 rounded text-slate-500 hover:text-red-600 transition bg-white cursor-pointer"
                              title="Delete Writer Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. LIVE STREAMS MODULE */}
      {activeTab === 'live_streams' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#22c55e] text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Database Table: fts_live_streams
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Auto Facebook & YouTube Embeds
                </span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-slate-900 mt-1 uppercase">
                LIVE STREAMS MANAGEMENT MODULE
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, or feature Facebook Live and YouTube Live match broadcasts visible on <span className="font-bold text-[#022c22]">/live-stream</span>.
              </p>
            </div>

            <button
              onClick={openNewStream}
              className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] font-mono font-bold text-xs uppercase px-5 py-2.5 rounded-xl border border-emerald-950 flex items-center space-x-2 transition shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Live Stream</span>
            </button>
          </div>

          {liveStreams.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl">
              <Radio className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No live streams registered in database.</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add New Live Stream" above to broadcast Facebook or YouTube live match streams.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-600 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-550 border-b border-slate-200 font-mono text-[11px] uppercase text-left">
                    <th className="py-3 px-4">Stream & Match Info</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Teams & Tournament</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveStreams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center space-x-3">
                          <img
                            src={stream.thumbnail || 'https://images.unsplash.com/photo-1540747737956-378724044282?w=200&auto=format&fit=crop&q=80'}
                            alt={`${stream.title} thumbnail`}
                            className="w-14 h-9 object-cover rounded border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-xs line-clamp-1 block hover:text-[#22c55e] cursor-pointer" onClick={() => openEditStream(stream)}>
                              {stream.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              By {stream.created_by} • {stream.views || 0} views
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${stream.platform === 'youtube' ? 'bg-red-600' : 'bg-blue-600'}`}>
                          {stream.platform === 'youtube' ? 'YouTube' : 'Facebook'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-sans text-xs">
                        <span className="font-bold text-slate-800 block">{stream.team_one} vs {stream.team_two}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{stream.tournament}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        {stream.status === 'active' ? (
                          <span className="bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                            <span>🔴 Live Now</span>
                          </span>
                        ) : stream.status === 'upcoming' ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            ⏳ Upcoming
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            🏁 Ended
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStreamFeatured(stream.id)}
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded transition border ${stream.is_featured ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                        >
                          {stream.is_featured ? '⭐ Featured' : 'Normal'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 font-mono text-xs">
                        <button
                          onClick={() => onNavigate(`/live-stream?id=${stream.id}`)}
                          className="p-1.5 border border-slate-200 hover:border-emerald-600 rounded text-slate-600 hover:text-emerald-600 transition bg-white"
                          title="Preview Stream"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditStream(stream)}
                          className="p-1.5 border border-slate-200 hover:border-blue-600 rounded text-slate-600 hover:text-blue-600 transition bg-white"
                          title="Edit Stream"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStream(stream.id)}
                          className="p-1.5 border border-slate-200 hover:border-red-600 rounded text-slate-600 hover:text-red-600 transition bg-white"
                          title="Delete Stream"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* ================= MODAL FORMS COMPILATION ================= */}

      {/* A. POST COMPOSER MODAL (FULL SEO, GEO, AEO & HEADING CUSTOMIZATION SUITE) */}
      {isPostModalOpen && editingPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header with Title & Optimization Score Gauge */}
            <div className="bg-slate-900 text-white p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1 px-2 bg-emerald-500 text-slate-950 font-mono text-[10px] font-black uppercase rounded tracking-wider">
                    TSR SEO / GEO / AEO Studio
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    thesportsroom.online
                  </span>
                </div>
                <h3 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-tight mt-1">
                  {editingPost.id ? 'EDIT ARTICLE WITH SEO & AI ENGINE OPTIMIZATION' : 'WRITE ARTICLE WITH SEO & AI ENGINE OPTIMIZATION'}
                </h3>
              </div>

              {/* Optimization Score */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block leading-none">SEO/GEO/AEO SCORE</span>
                  <span className="font-mono font-black text-emerald-400 text-lg leading-none">
                    {(() => {
                      let score = 10;
                      if (editingPost.title && editingPost.title.length > 10) score += 15;
                      if (editingPost.meta_title) score += 15;
                      if (editingPost.meta_description) score += 15;
                      if (editingPost.focus_keyword) score += 10;
                      if (tempTags) score += 10;
                      if (editingPost.geo_summary) score += 15;
                      if (editingPost.aeo_direct_answer) score += 10;
                      return Math.min(100, score);
                    })()}%
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/80 flex items-center justify-center bg-emerald-500/10 text-emerald-400 font-black font-mono text-xs">
                  OPT
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex overflow-x-auto gap-1 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setPostComposerTab('content')}
                className={`py-2.5 px-4 rounded-t-lg transition border-t border-x ${
                  postComposerTab === 'content'
                    ? 'bg-white border-slate-200 text-[#022c22] shadow-2xs font-extrabold'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 Content & Media
              </button>
              <button
                type="button"
                onClick={() => setPostComposerTab('headings')}
                className={`py-2.5 px-4 rounded-t-lg transition border-t border-x ${
                  postComposerTab === 'headings'
                    ? 'bg-white border-slate-200 text-[#022c22] shadow-2xs font-extrabold'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                🏷️ Heading Tags (H1/H2)
              </button>
              <button
                type="button"
                onClick={() => setPostComposerTab('seo')}
                className={`py-2.5 px-4 rounded-t-lg transition border-t border-x ${
                  postComposerTab === 'seo'
                    ? 'bg-white border-slate-200 text-[#022c22] shadow-2xs font-extrabold'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                🔍 SEO Meta & Canonical
              </button>
              <button
                type="button"
                onClick={() => setPostComposerTab('geo')}
                className={`py-2.5 px-4 rounded-t-lg transition border-t border-x ${
                  postComposerTab === 'geo'
                    ? 'bg-white border-slate-200 text-[#022c22] shadow-2xs font-extrabold'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 GEO (AI Search Engine)
              </button>
              <button
                type="button"
                onClick={() => setPostComposerTab('aeo')}
                className={`py-2.5 px-4 rounded-t-lg transition border-t border-x ${
                  postComposerTab === 'aeo'
                    ? 'bg-white border-slate-200 text-[#022c22] shadow-2xs font-extrabold'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ AEO (Answer Engine & FAQ)
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* TAB 1: CONTENT & MEDIA */}
              {postComposerTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Article Main Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPost.title || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="e.g. Masterclass: Mechanics of rotation jump serve in Volleyball"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Sport Category
                      </label>
                      <select
                        value={editingPost.category || 'football'}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22c55e] text-slate-900 font-medium"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        URL Slug (Auto-generated if empty)
                      </label>
                      <input
                        type="text"
                        value={editingPost.slug || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="custom-article-slug"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Structure Layout Type
                      </label>
                      <select
                        value={editingPost.type || 'news'}
                        onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value as 'news' | 'blog' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22c55e] text-slate-900 font-medium"
                      >
                        <option value="news">News Article (Standard Editorial)</option>
                        <option value="blog">Blog Column (In-Depth Opinion & Tactical Analysis)</option>
                      </select>
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Author Name Attribution
                      </label>
                      <input
                        type="text"
                        value={editingPost.author || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Featured Image URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPost.featured_image || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                        {media.slice(0, 4).map(m => (
                          <img 
                            key={m.id} 
                            src={m.file_url} 
                            onClick={() => setEditingPost({ ...editingPost, featured_image: m.file_url })}
                            alt="" 
                            className="w-8 h-8 rounded border border-slate-200 hover:border-[#22c55e] cursor-pointer object-cover" 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        YouTube Video ID (Optional Inline Embed)
                      </label>
                      <input
                        type="text"
                        value={editingPost.video_url || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, video_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="e.g. H9T9e03d_jE"
                      />
                    </div>
                  </div>

                  {/* Draft & Schedule Toggle Bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_draft_toggle"
                        checked={!!(editingPost.is_draft || editingPost.scheduled_for === 'draft')}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingPost({
                            ...editingPost,
                            is_draft: checked,
                            scheduled_for: checked ? 'draft' : ''
                          });
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <label htmlFor="is_draft_toggle" className="block text-xs font-mono font-bold text-slate-800 uppercase cursor-pointer select-none">
                          Save as Draft
                        </label>
                        <p className="text-[10px] text-slate-500">Drafts are saved safely but hidden from the public feed.</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-mono font-bold text-slate-600 uppercase shrink-0">
                        Schedule Release:
                      </label>
                      <input
                        type="datetime-local"
                        value={editingPost.scheduled_for && editingPost.scheduled_for !== 'draft' ? editingPost.scheduled_for : ''}
                        onChange={(e) => setEditingPost({ ...editingPost, scheduled_for: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  {/* Main Article Body Editor with Full Rich Formatting Bar */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="block text-xs font-mono font-bold text-slate-800 uppercase flex items-center space-x-1.5">
                        <span>Article Content Body</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                          Markdown & HTML Ready
                        </span>
                      </label>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => applyFormatToTextarea('[', '](/sports-atlas)', 'Sports Science Atlas')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-mono font-bold py-1 px-2 rounded border border-slate-300 transition"
                          title="Insert Internal Link"
                        >
                          🔗 Internal Atlas Link
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormatToTextarea('![Dynamic Sports Graphic](', ')', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-mono font-bold py-1 px-2 rounded border border-slate-300 transition"
                          title="Insert Sample Image"
                        >
                          🖼️ Unsplash Image
                        </button>
                      </div>
                    </div>

                    {/* RICH FORMATTING TOOLBAR */}
                    <div className="bg-slate-100 border border-slate-200 rounded-t-xl p-2 flex flex-wrap gap-1 items-center text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('**', '**', 'Bold Text')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-black px-2.5 py-1 rounded border border-slate-300 transition"
                        title="Bold (**text**)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('*', '*', 'Italic Text')}
                        className="bg-white hover:bg-slate-200 text-slate-900 italic font-serif px-2.5 py-1 rounded border border-slate-300 transition"
                        title="Italic (*text*)"
                      >
                        I
                      </button>

                      <div className="h-4 w-px bg-slate-300 mx-1" />

                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n## ', '', 'Heading 2 Title')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Heading 2 (## Title)"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n### ', '', 'Heading 3 Title')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Heading 3 (### Title)"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n#### ', '', 'Heading 4 Title')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Heading 4 (#### Title)"
                      >
                        H4
                      </button>

                      <div className="h-4 w-px bg-slate-300 mx-1" />

                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('[', '](https://thesportsroom.online)', 'Link Title')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Link ([Text](URL))"
                      >
                        🔗 Link
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('![', '](https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800)', 'Image Description')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Image (![Caption](URL))"
                      >
                        🖼️ Image
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n@[youtube](', ')', 'H9T9e03d_jE')}
                        className="bg-white hover:bg-slate-200 text-red-600 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert YouTube Video (@[youtube](VIDEO_ID))"
                      >
                        ▶️ Video
                      </button>

                      <div className="h-4 w-px bg-slate-300 mx-1" />

                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n- ', '', 'Bullet point detail')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Bullet List (- Item)"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n1. ', '', 'Numbered step detail')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Numbered List (1. Item)"
                      >
                        1. List
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n> "', '" — Editorial Takeaway', 'Key analytical quote')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Blockquote (> Quote)"
                      >
                        “ Quote
                      </button>

                      <div className="h-4 w-px bg-slate-300 mx-1" />

                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n\n| Metric | Specification | Impact |\n|---|---|---|\n| Speed | 145 km/h | Dynamic dip |\n| Spin | 2400 RPM | Lateral drift |\n\n')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Insert Data Table"
                      >
                        📊 Table
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('`', '`', 'code_variable')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Inline Code (`code`)"
                      >
                        &lt;/&gt;
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatToTextarea('\n\n---\n\n')}
                        className="bg-white hover:bg-slate-200 text-slate-900 font-bold px-2 py-1 rounded border border-slate-300 transition text-[11px]"
                        title="Horizontal Divider (---)"
                      >
                        ― Divider
                      </button>
                    </div>

                    <textarea
                      id="editorial-textarea"
                      required
                      rows={14}
                      value={editingPost.content || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full bg-slate-50 border-x border-b border-slate-200 rounded-b-lg p-4 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#22c55e] leading-relaxed"
                      placeholder="Write your full article analysis body here... Use the toolbar above to add bold text, headings (H2/H3/H4), images, links, quotes, and tables!"
                    />

                    {/* Auto-Detected Sports Entities Indicator */}
                    {(() => {
                      const detected = detectEntitiesInText(`${editingPost.title || ''} ${editingPost.content || ''}`);
                      if (detected.length === 0) return null;
                      return (
                        <div className="bg-[#f0fdf4] border border-[#22c55e]/30 rounded-xl p-3 mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#022c22]">
                            <span>⚡ AUTO-DETECTED ENTITIES ({detected.length}) — WILL AUTOMATICALLY LINK TO TOPIC HUBS:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {detected.map((ent, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono font-bold bg-white text-[#022c22] border border-[#22c55e]/40 px-2 py-0.5 rounded-md flex items-center space-x-1"
                              >
                                <span>{ent.name}</span>
                                <span className="text-[8px] text-[#22c55e] uppercase">({ent.type})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 2: TITLE & HEADING TAGS (H1/H2/H3 CUSTOMIZATION) */}
              {postComposerTab === 'headings' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 leading-relaxed font-sans">
                    <p className="font-bold font-mono text-emerald-950 uppercase mb-1">💡 Heading Tag Customization & SEO Hierarchy</p>
                    Customize the HTML heading element used for the main title (H1, H2, or H3) and define a secondary subheading. This provides maximum control over on-page heading hierarchy for Google crawlers and AI indexing engines.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Title Semantic Heading Tag
                      </label>
                      <select
                        value={editingPost.heading_tag || 'h1'}
                        onChange={(e) => setEditingPost({ ...editingPost, heading_tag: e.target.value as 'h1' | 'h2' | 'h3' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#22c55e] text-slate-900"
                      >
                        <option value="h1">&lt;h1&gt; Primary Document Heading (Default)</option>
                        <option value="h2">&lt;h2&gt; Secondary Section Heading</option>
                        <option value="h3">&lt;h3&gt; Tertiary Sub-section Heading</option>
                      </select>
                    </div>

                    <div className="md:col-span-8">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Custom Subheading (Rendered as Sub-banner)
                      </label>
                      <input
                        type="text"
                        value={editingPost.subheading || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, subheading: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="e.g. Tactical Breakdown of Front-Foot Drive Execution"
                      />
                    </div>
                  </div>

                  {/* Live Heading Hierarchy Preview */}
                  <div className="bg-slate-900 p-5 rounded-2xl text-white space-y-3">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
                      LIVE HEADING HIERARCHY PREVIEW
                    </span>
                    <div>
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                        TAG: &lt;{editingPost.heading_tag || 'h1'}&gt;
                      </span>
                      <p className="font-display font-black text-xl text-white uppercase mt-1">
                        {editingPost.title || 'Sample Title Here'}
                      </p>
                    </div>

                    {editingPost.subheading && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                          TAG: &lt;h2&gt; SUBHEADING
                        </span>
                        <p className="font-display font-extrabold text-sm text-emerald-400 mt-1">
                          {editingPost.subheading}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SEO META & CANONICAL */}
              {postComposerTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1 flex justify-between">
                      <span>Custom SEO Meta Title</span>
                      <span className="text-slate-400 font-normal">
                        {(editingPost.meta_title || editingPost.title || '').length}/60 chars
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingPost.meta_title || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      placeholder="Leave blank to use main article title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={editingPost.focus_keyword || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, focus_keyword: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="e.g. Babar Azam cover drive technique"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        SEO Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={tempTags}
                        onChange={(e) => setTempTags(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="e.g. cricket, Pakistan, biomechanics"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1 flex justify-between">
                      <span>Meta Description (Snippet in Search Engines)</span>
                      <span className="text-slate-400 font-normal">
                        {(editingPost.meta_description || '').length}/160 chars
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={editingPost.meta_description || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      placeholder="High-converting 150-word index snippet for Google Search..."
                      maxLength={160}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Custom Canonical URL Override
                      </label>
                      <input
                        type="url"
                        value={editingPost.canonical_url || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, canonical_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                        placeholder="https://thesportsroom.online/blog/..."
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Schema.org Type
                      </label>
                      <select
                        value={editingPost.schema_type || 'NewsArticle'}
                        onChange={(e) => setEditingPost({ ...editingPost, schema_type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#22c55e] bg-white"
                      >
                        <option value="NewsArticle">NewsArticle</option>
                        <option value="BlogPosting">BlogPosting</option>
                        <option value="AnalysisNewsArticle">AnalysisNewsArticle</option>
                        <option value="TechArticle">TechArticle</option>
                        <option value="SportsArticle">SportsArticle</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        Meta Robots Directive
                      </label>
                      <select
                        value={editingPost.meta_robots || 'index, follow'}
                        onChange={(e) => setEditingPost({ ...editingPost, meta_robots: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#22c55e] bg-white"
                      >
                        <option value="index, follow">index, follow (Default)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GEO (GENERATIVE ENGINE OPTIMIZATION FOR AI SEARCH) */}
              {postComposerTab === 'geo' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-emerald-400 font-mono uppercase">🤖 Generative Engine Optimization (GEO Standard)</p>
                    <p className="text-slate-300">
                      GEO structures article data so AI engines (Google Gemini, Perplexity AI, ChatGPT Search) synthesize and cite your article in AI Overviews and conversational summaries.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      GEO Executive Summary (Targeted for LLM Synthesis)
                    </label>
                    <textarea
                      rows={4}
                      value={editingPost.geo_summary || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, geo_summary: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      placeholder="Write a concise 3-4 sentence factual summary containing key numbers, quotes, and conclusions. LLMs pick this up directly for AI Overviews..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      GEO Entity Graph Tags (Comma Separated Named Entities)
                    </label>
                    <input
                      type="text"
                      value={tempEntities}
                      onChange={(e) => setTempEntities(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      placeholder="e.g. Babar Azam, Cover Drive, PCB, Rotation Biomechanics, Gaddafi Stadium"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Named entities (people, stadiums, physics terms, tournaments) help AI models map your content into knowledge graphs.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: AEO (ANSWER ENGINE OPTIMIZATION & FAQ BUILDER) */}
              {postComposerTab === 'aeo' && (
                <div className="space-y-5">
                  <div className="bg-emerald-950 text-emerald-100 p-4 rounded-xl text-xs space-y-1 border border-emerald-900">
                    <p className="font-bold text-emerald-400 font-mono uppercase">⚡ Answer Engine Optimization (AEO Standard)</p>
                    <p className="text-emerald-200/90">
                      AEO optimizes content for Google Featured Snippets (Position Zero) and Voice Assistants (Siri, Alexa, Google Assistant).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      AEO Direct Answer Box (40-60 Word Concise Resolution)
                    </label>
                    <textarea
                      rows={3}
                      value={editingPost.aeo_direct_answer || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, aeo_direct_answer: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#22c55e] focus:bg-white"
                      placeholder="Directly answer the primary question of this article in 40-60 clear words. This gets pulled for Position-Zero snippets!"
                    />
                  </div>

                  {/* Interactive FAQ Builder */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 uppercase">
                          AEO FAQ Builder (Auto Injects FAQPage Schema)
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Questions added here generate structured FAQ accordion UI on the article page and Schema.org FAQPage data.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFaqItem}
                        className="bg-[#022c22] hover:bg-[#034434] text-[#22c55e] font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-800 transition"
                      >
                        + Add Q&A Pair
                      </button>
                    </div>

                    {faqList.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                        No FAQ items added yet. Click "+ Add Q&A Pair" above to build AEO FAQ items.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {faqList.map((faq, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 relative">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs font-bold text-emerald-700">Question #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFaqItem(idx)}
                                className="text-red-500 hover:text-red-700 text-xs font-mono font-bold"
                              >
                                ✕ Delete
                              </button>
                            </div>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleFaqItemChange(idx, 'question', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#22c55e]"
                              placeholder="e.g. What is Babar Azam's cover drive footwork routine?"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => handleFaqItemChange(idx, 'answer', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-[#22c55e]"
                              placeholder="Direct answer to question..."
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#022c22] hover:bg-[#034434] text-[#22c55e] text-xs font-black px-7 py-2.5 rounded-lg uppercase tracking-wider border border-emerald-800 shadow-md transition"
                >
                  Save & Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A2. SUPABASE SQL SETUP MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#022c22] text-[#22c55e] border border-emerald-800 px-2.5 py-0.5 rounded uppercase">
                  FULL DATABASE SQL ENGINE
                </span>
                <h3 className="font-display font-black text-lg text-slate-900 uppercase mt-1">
                  Complete PostgreSQL Database Script (Run in SQL Editor)
                </h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed shrink-0">
              This complete script creates all tables (<code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_posts</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_categories</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_rankings</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_fixtures</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_media</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_subscribers</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_live_streams</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_hero_config</code>, <code className="bg-slate-100 font-mono text-slate-900 px-1 py-0.5 rounded">fts_users</code>), adds all required SEO/GEO/AEO columns, sets up RLS security policies, and registers the Super Admin.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
              <h4 className="font-mono text-xs font-bold text-slate-800 uppercase mb-1">How to execute in Supabase SQL Editor:</h4>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5 font-sans">
                <li>Copy the complete PostgreSQL script below or click <strong>"Copy Full SQL Code"</strong>.</li>
                <li>Go to your <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong>.</li>
                <li>Click <strong>New Query</strong>, paste the script, and click <strong>Run</strong>!</li>
              </ol>
            </div>

            <div className="relative flex-1 min-h-[250px] overflow-hidden">
              <textarea
                readOnly
                rows={12}
                value={`-- ====================================================================
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

CREATE TABLE IF NOT EXISTS public.fts_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description TEXT
);

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

CREATE TABLE IF NOT EXISTS public.fts_media (
    id VARCHAR(128) PRIMARY KEY,
    file_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'image',
    title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.fts_subscribers (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS heading_tag TEXT DEFAULT 'h1';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS subheading TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS geo_summary TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS geo_entities TEXT[];
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_direct_answer TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_faq JSONB;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'NewsArticle';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index, follow';

ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS category_name VARCHAR(255) DEFAULT 'Rankings';
ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS categoryname VARCHAR(255) DEFAULT 'Rankings';

ALTER TABLE public.fts_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public insert posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public update posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public delete posts" ON public.fts_posts;

CREATE POLICY "Public select posts" ON public.fts_posts FOR SELECT USING (true);
CREATE POLICY "Public insert posts" ON public.fts_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update posts" ON public.fts_posts FOR UPDATE USING (true);
CREATE POLICY "Public delete posts" ON public.fts_posts FOR DELETE USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

INSERT INTO public.fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'hananirfan91@gmail.com', 'Super Admin', 'hanan@2007.', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_approved = TRUE, is_writer = TRUE, role = 'Super Admin';`}
                className="w-full h-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl leading-relaxed focus:outline-none overflow-y-auto"
              />
            </div>

            <div className="flex justify-between items-center pt-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const sqlText = `-- FULL TIME SPORTS COMPLETE SCHEMA
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

CREATE TABLE IF NOT EXISTS public.fts_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description TEXT
);

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

CREATE TABLE IF NOT EXISTS public.fts_media (
    id VARCHAR(128) PRIMARY KEY,
    file_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'image',
    title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.fts_subscribers (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS heading_tag TEXT DEFAULT 'h1';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS subheading TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS geo_summary TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS geo_entities TEXT[];
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_direct_answer TEXT;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS aeo_faq JSONB;
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'NewsArticle';
ALTER TABLE public.fts_posts ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index, follow';

ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS category_name VARCHAR(255) DEFAULT 'Rankings';
ALTER TABLE public.fts_rankings ADD COLUMN IF NOT EXISTS categoryname VARCHAR(255) DEFAULT 'Rankings';

ALTER TABLE public.fts_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fts_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public insert posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public update posts" ON public.fts_posts;
DROP POLICY IF EXISTS "Public delete posts" ON public.fts_posts;

CREATE POLICY "Public select posts" ON public.fts_posts FOR SELECT USING (true);
CREATE POLICY "Public insert posts" ON public.fts_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update posts" ON public.fts_posts FOR UPDATE USING (true);
CREATE POLICY "Public delete posts" ON public.fts_posts FOR DELETE USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

INSERT INTO public.fts_users (id, name, email, role, password, is_approved, is_writer)
VALUES ('admin-super', 'Hanan Irfan', 'hananirfan91@gmail.com', 'Super Admin', 'hanan@2007.', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET is_approved = TRUE, is_writer = TRUE, role = 'Super Admin';`;
                  navigator.clipboard.writeText(sqlText);
                  alert("📋 Complete PostgreSQL Database Script copied to clipboard!");
                }}
                className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] border border-emerald-950 font-mono text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
              >
                📋 Copy Full PostgreSQL Code
              </button>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 uppercase">
              Configure Category Node
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Category Unique ID (e.g. hockey)</label>
                <input
                  type="text"
                  required
                  disabled={!!categories.find(c => c.id === editingCategory.id)}
                  value={editingCategory.id || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value.toLowerCase().replace(/[^a-z]+/g, '') })}
                  className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-2 text-xs focus:outline-none"
                  placeholder="hockey"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Display Title</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value, slug: e.target.value.toLowerCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48]"
                  placeholder="Field Hockey"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Sitemap Index Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none"
                  placeholder="Enter SEO description text..."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-xs px-3 py-1.5 text-slate-500 font-bold uppercase hover:bg-slate-50">Cancel</button>
                <button type="submit" className="text-xs px-4 py-2 bg-slate-900 text-white font-bold rounded uppercase">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. RANKINGS MODAL */}
      {isRankingModalOpen && editingRanking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 uppercase">
              Configure Standings Row
            </h3>
            <form onSubmit={handleSaveRanking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-655 uppercase mb-1">Sport category</label>
                  <select
                    value={editingRanking.sport || 'cricket'}
                    onChange={(e) => setEditingRanking({ ...editingRanking, sport: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Current Ranking Position</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingRanking.rank || 1}
                    onChange={(e) => setEditingRanking({ ...editingRanking, rank: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Ranking Table Name (e.g. FIFA Men World Rankings)</label>
                <input
                  type="text"
                  required
                  value={editingRanking.categoryName || ''}
                  onChange={(e) => setEditingRanking({ ...editingRanking, categoryName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-[#e11d48] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Team / Competitor Name</label>
                <input
                  type="text"
                  required
                  value={editingRanking.name || ''}
                  onChange={(e) => setEditingRanking({ ...editingRanking, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-sm"
                  placeholder="e.g. France, Max Verstappen"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Points Record (Value)</label>
                  <input
                    type="text"
                    required
                    value={editingRanking.points || ''}
                    onChange={(e) => setEditingRanking({ ...editingRanking, points: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs"
                    placeholder="e.g. 1858 points, 64-18"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Region / Form Standings (Extra)</label>
                  <input
                    type="text"
                    value={editingRanking.extra || ''}
                    onChange={(e) => setEditingRanking({ ...editingRanking, extra: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs"
                    placeholder="e.g. UEFA, Red Bull Racing"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsRankingModalOpen(false)} className="text-xs px-3 py-1.5 text-slate-500 font-bold uppercase hover:bg-slate-50">Cancel</button>
                <button type="submit" className="text-xs px-4 py-2 bg-slate-900 text-white font-bold rounded uppercase">Save standing row</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. FIXTURE MODAL */}
      {isFixtureModalOpen && editingFixture && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4 uppercase">
              Schedule Fixture Box
            </h3>
            <form onSubmit={handleSaveFixture} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Sport Focus</label>
                  <select
                    value={editingFixture.sport || 'football'}
                    onChange={(e) => setEditingFixture({ ...editingFixture, sport: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Event Stage / Division</label>
                  <input
                    type="text"
                    value={editingFixture.stage || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, stage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs"
                    placeholder="e.g. Premier League"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-2">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Contender 1</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.team1 || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, team1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none text-xs"
                    placeholder="e.g. Arsenal"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-mono font-bold text-center text-rose-500 uppercase mb-1">Score</label>
                  <input
                    type="text"
                    value={editingFixture.score || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, score: e.target.value })}
                    className="w-full bg-rose-50/50 border border-rose-200 text-center rounded py-1 focus:outline-none text-xs font-bold"
                    placeholder="2 - 1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Contender 2</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.team2 || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, team2: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none text-xs"
                    placeholder="e.g. Man City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingFixture.date || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Scheduled Time Zone</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.time || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs"
                    placeholder="e.g. 15:00 GMT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Stadium Venue Location</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.venue || ''}
                    onChange={(e) => setEditingFixture({ ...editingFixture, venue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none text-xs"
                    placeholder="Emirates Stadium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Active Status</label>
                  <select
                    value={editingFixture.status || 'upcoming'}
                    onChange={(e) => setEditingFixture({ ...editingFixture, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none text-slate-800"
                  >
                    <option value="upcoming">Upcoming Match</option>
                    <option value="live">● Live Stream Activity</option>
                    <option value="completed">Match Completed (Full Time)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsFixtureModalOpen(false)} className="text-xs px-3 py-1.5 text-slate-500 font-bold uppercase hover:bg-slate-50">Cancel</button>
                <button type="submit" className="text-xs px-4 py-2 bg-slate-900 text-white font-bold rounded uppercase">Save Fixture</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. LIVE STREAM MANAGEMENT MODAL */}
      {isStreamModalOpen && editingStream && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="bg-[#22c55e] text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Auto Facebook & YouTube Conversion Engine
                </span>
                <h3 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mt-1">
                  {editingStream.id ? 'Edit Live Match Stream' : 'Add New Live Match Stream'}
                </h3>
              </div>
              <button onClick={() => setIsStreamModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            {streamUrlError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{streamUrlError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStream} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Stream Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingStream.title || ''}
                  onChange={(e) => setEditingStream({ ...editingStream, title: e.target.value })}
                  placeholder="e.g. Pakistan vs West Indies 2nd Test 2026 - Day 3 Live Stream"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Tamasha, StreamYard, YouTube, or Facebook Video URL / Embed String *
                </label>
                <input
                  type="text"
                  required
                  value={editingStream.video_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const res = validateAndConvertStreamUrl(val);
                    if (res.isValid) {
                      setStreamUrlError('');
                    }
                    setEditingStream({ 
                      ...editingStream, 
                      video_url: val,
                      platform: res.platform || editingStream.platform,
                      embed_url: res.embedUrl || editingStream.embed_url
                    });
                  }}
                  placeholder="https://tamashaweb.com/live/... or streamyard.com/watch/... or youtube link"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#22c55e]"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Supported formats: Tamasha Live (tamashaweb.com), StreamYard, YouTube (live/shorts), Facebook videos, or raw iframe tags.
                </p>
              </div>

              {/* Auto Detected Embed Preview Indicator */}
              {editingStream.video_url && (
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-200 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#22c55e] font-bold">● Auto Detected Engine:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${editingStream.platform === 'youtube' ? 'bg-red-600' : editingStream.platform === 'tamasha' ? 'bg-emerald-600' : editingStream.platform === 'streamyard' ? 'bg-teal-600' : 'bg-blue-600'}`}>
                      {editingStream.platform === 'youtube' ? 'YouTube Live' : editingStream.platform === 'tamasha' ? 'Tamasha Live' : editingStream.platform === 'streamyard' ? 'StreamYard' : 'Facebook Live'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] truncate">
                    Target Embed URL: {validateAndConvertStreamUrl(editingStream.video_url).embedUrl || 'Waiting for valid link...'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Match Name (e.g. 2nd Test Day 3)
                  </label>
                  <input
                    type="text"
                    value={editingStream.match_name || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, match_name: e.target.value })}
                    placeholder="2nd Test Match - Day 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    value={editingStream.tournament || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, tournament: e.target.value })}
                    placeholder="Pakistan vs West Indies Test Series 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team 1 Name
                  </label>
                  <input
                    type="text"
                    value={editingStream.team_one || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, team_one: e.target.value })}
                    placeholder="Pakistan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team 2 Name
                  </label>
                  <input
                    type="text"
                    value={editingStream.team_two || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, team_two: e.target.value })}
                    placeholder="West Indies"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Stream Status
                  </label>
                  <select
                    value={editingStream.status || 'active'}
                    onChange={(e) => setEditingStream({ ...editingStream, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="active">🔴 Live Now</option>
                    <option value="upcoming">⏳ Upcoming Stream</option>
                    <option value="ended">🏁 Stream Ended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Featured Homepage Status
                  </label>
                  <select
                    value={editingStream.is_featured ? 'true' : 'false'}
                    onChange={(e) => setEditingStream({ ...editingStream, is_featured: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="false">Normal Priority</option>
                    <option value="true">⭐ Featured Top Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    YouTube Live Chat
                  </label>
                  <select
                    value={editingStream.enable_chat ? 'true' : 'false'}
                    onChange={(e) => setEditingStream({ ...editingStream, enable_chat: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="true">Enabled (Sidebar Chat)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Stream Scheduled Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingStream.stream_start || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, stream_start: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Stream Scheduled End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingStream.stream_end || ''}
                    onChange={(e) => setEditingStream({ ...editingStream, stream_end: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Thumbnail Image URL (With Alt Text Optimization)
                </label>
                <input
                  type="text"
                  value={editingStream.thumbnail || ''}
                  onChange={(e) => setEditingStream({ ...editingStream, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Stream Editorial Description & SEO Text
                </label>
                <textarea
                  rows={3}
                  value={editingStream.description || ''}
                  onChange={(e) => setEditingStream({ ...editingStream, description: e.target.value })}
                  placeholder="Enter detailed match stream overview and commentary information..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsStreamModalOpen(false)}
                  className="text-xs px-4 py-2 text-slate-600 font-mono font-bold uppercase hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-6 py-2.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] font-mono font-bold uppercase rounded-xl border border-emerald-950 shadow-md transition"
                >
                  Save & Publish Live Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAN POLL MANAGEMENT MODAL */}
      {isPollModalOpen && editingPoll && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="bg-[#022c22] text-[#22c55e] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Fan Poll Manager
                </span>
                <h3 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mt-1">
                  {editingPoll.id ? 'Edit Match Fan Poll' : 'Create Fan Poll'}
                </h3>
              </div>
              <button onClick={() => setIsPollModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoll} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Match / Tournament Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingPoll.matchName || ''}
                  onChange={(e) => setEditingPoll({ ...editingPoll, matchName: e.target.value })}
                  placeholder="e.g. ICC Champions Trophy 2026 • India vs Australia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Poll Prediction Question *
                </label>
                <input
                  type="text"
                  required
                  value={editingPoll.question || ''}
                  onChange={(e) => setEditingPoll({ ...editingPoll, question: e.target.value })}
                  placeholder="Which team is going to win today's match?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team A Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPoll.teamA || ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, teamA: e.target.value })}
                    placeholder="India"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team A Flag / Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={editingPoll.teamALogo || ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, teamALogo: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team B Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPoll.teamB || ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, teamB: e.target.value })}
                    placeholder="Australia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Team B Flag / Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={editingPoll.teamBLogo || ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, teamBLogo: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Enable Draw Option
                  </label>
                  <select
                    value={editingPoll.enableDraw ? 'true' : 'false'}
                    onChange={(e) => setEditingPoll({ ...editingPoll, enableDraw: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  >
                    <option value="true">Yes (Enable Draw / Tie option)</option>
                    <option value="false">No (Team A vs Team B only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Poll Active Status
                  </label>
                  <select
                    value={editingPoll.status || 'active'}
                    onChange={(e) => setEditingPoll({ ...editingPoll, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                  >
                    <option value="active">● Active (Live on Homepage Hero)</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsPollModalOpen(false)}
                  className="text-xs px-4 py-2 text-slate-600 font-mono font-bold uppercase hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-6 py-2.5 bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] font-mono font-bold uppercase rounded-xl border border-emerald-950 shadow-md transition"
                >
                  Save Fan Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
