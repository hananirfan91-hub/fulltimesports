import React, { useState, useEffect } from 'react';
import { 
  Users, LayoutGrid, FileText, FolderPlus, Trophy, Calendar, Image as ImageIcon, 
  Trash2, Edit3, Plus, Key, LogOut, CheckCircle, AlertTriangle, ShieldCheck, 
  Tag, Upload, CalendarClock, Globe, PlusCircle, ArrowUpRight, MessageSquare, Mail
} from 'lucide-react';
import { Post, Category, RankingItem, FixtureItem, MediaItem, AdminUser, TicketMessage, Subscriber } from '../types';
import { DB } from '../lib/db';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'rankings' | 'fixtures' | 'media' | 'homepage' | 'profile' | 'tickets' | 'subscribers'>('posts');
  
  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [tickets, setTickets] = useState<TicketMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Editing Forms States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [tempTags, setTempTags] = useState('');

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

  // Load database content on mount
  useEffect(() => {
    setCurrentAdmin(DB.getCurrentAdmin());
    setAdmins(DB.getAdmins());
    refreshData();
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
          role: 'Super Admin'
        };

        // Try dynamically registering profile and signing up in the background
        try {
          await supabase.from('fts_profiles').upsert([
            { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role, password: loginPassword }
          ]);
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
          role: meta.role || 'Contributor'
        };

        DB.setCurrentAdmin(adminUser);
        setCurrentAdmin(adminUser);
        setLoginPassword('');
        setTimeout(() => refreshData(), 100);
        setIsSigningIn(false);
        return;
      }

      // 3. Fallback: Lookup in fts_profiles table
      const { data: profileList, error: profError } = await supabase
        .from('fts_profiles')
        .select('*')
        .eq('email', emailLower)
        .eq('password', loginPassword);

      if (!profError && profileList && profileList.length > 0) {
        const found = profileList[0];
        const adminUser: AdminUser = {
          id: found.id || `user-${Date.now()}`,
          name: found.name,
          email: found.email,
          role: found.role
        };

        DB.setCurrentAdmin(adminUser);
        setCurrentAdmin(adminUser);
        setLoginPassword('');
        setTimeout(() => refreshData(), 100);
        setIsSigningIn(false);
        return;
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

      // 1. Try writing profile to public profiles table first
      const { error: profError } = await supabase.from('fts_profiles').insert([{
        id: newUserId,
        name: signupName.trim(),
        email: emailLower,
        role: roleSelected,
        password: signupPassword
      }]);

      if (profError) {
        console.warn("Supabase profiles insert warn:", profError);
      }

      // 2. Try registering on Supabase Auth
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

      // 3. Log them in automatically
      const newlyRegisteredData: AdminUser = {
        id: newUserId,
        name: signupName.trim(),
        email: emailLower,
        role: roleSelected
      };

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

      // 2. Sync to Supabase
      const { error: syncError } = await supabase
        .from('fts_profiles')
        .upsert([
          { 
            id: currentAdmin.id, 
            name: profileName.trim(), 
            email: currentAdmin.email, 
            role: profileRole 
          }
        ], { onConflict: 'email' });

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
    setEditingPost({
      title: '',
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
      meta_description: '',
      scheduled_for: '',
    });
    setTempTags('');
    setIsPostModalOpen(true);
  };

  const openEditPost = (post: Post) => {
    setEditingPost(post);
    setTempTags(post.tags.join(', '));
    setIsPostModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title) return;

    const tagsArray = tempTags.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const generatedSlug = editingPost.slug || editingPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalPost = {
      ...editingPost,
      tags: tagsArray,
      slug: generatedSlug,
      author: editingPost.author || currentAdmin?.name || 'FTS Desk',
      author_email: editingPost.author_email || currentAdmin?.email || '',
    } as Omit<Post, 'id' | 'created_at' | 'views'> & { id?: string };

    if (finalPost.id) {
      DB.updatePost(finalPost.id, finalPost);
    } else {
      DB.insertPost(finalPost);
    }

    setIsPostModalOpen(false);
    setEditingPost(null);
    refreshData();
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Are you sure you want to delete this editorial article?")) {
      DB.deletePost(id);
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
                      placeholder="e.g. author@fulltimesports.com"
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

        {currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
          <>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'categories' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <FolderPlus className="h-4 w-4" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'rankings' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Trophy className="h-4 w-4" />
              <span>Manual Rankings</span>
            </button>
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'fixtures' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Calendar className="h-4 w-4" />
              <span>Manual Fixtures</span>
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
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition ${activeTab === 'tickets' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Inbound Tickets ({tickets.length})</span>
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-extrabold text-lg text-slate-900">EDITORIAL ARTICLES PORTAL</h3>
            <button 
              onClick={openNewPost}
              className="bg-[#022c22] border border-[#22c55e]/30 hover:bg-[#22c55e] hover:text-[#022c22] text-[#22c55e] text-xs font-mono font-bold tracking-wider uppercase px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Compose Analysis</span>
            </button>
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
                        <div className="flex items-center justify-end space-x-2">
                          {post.is_draft && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to publish "${post.title}" live now?`)) {
                                  DB.updatePost(post.id, { is_draft: false, scheduled_for: '' });
                                  refreshData();
                                }
                              }}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#f0fdf4] border border-[#22c55e]/30 text-emerald-700 hover:bg-[#22c55e] hover:text-[#022c22] rounded transition"
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
                        navigator.clipboard.writeText(item.file_url);
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

      {/* 6. HOMEPAGE PORTAL MANAGER COLUMN */}
      {activeTab === 'homepage' && currentAdmin?.email.toLowerCase() === 'hananirfan91@gmail.com' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-extrabold text-lg text-slate-900 mb-2">HOMEPAGE GRID CONTROL</h3>
          <p className="text-xs text-slate-500 mb-6">Assign editorial priority rankings to dictate cards stacking in the 3D Hero layout immediately.</p>

          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-slate-500 uppercase pb-1.5 border-b border-slate-200">Featured Breaking News slot (Left Hero Card)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img referrerPolicy="no-referrer" src={post.featured_image} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-slate-800 text-xs line-clamp-1 uppercase">{post.title}</h5>
                      <span className="text-[9px] text-slate-450 uppercase">{post.category}</span>
                    </div>
                  </div>
                  <div>
                    {post.is_featured ? (
                      <span className="bg-rose-50 border border-rose-300 text-rose-700 font-mono text-[9px] font-bold px-2 py-1 rounded">
                        ★ DISPLAYED ACTIVE
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleToggleHeroFeature(post.id)}
                        className="bg-slate-900 text-white font-mono text-[9px] hover:bg-slate-800 py-1 px-2.5 rounded transition"
                      >
                        SET FEATURED
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-mono text-xs font-bold text-slate-500 uppercase pb-1.5 border-b border-slate-200 mt-8">Set Trending Posts state (Slide Carousel options)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img referrerPolicy="no-referrer" src={post.featured_image} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-slate-800 text-xs line-clamp-1 uppercase">{post.title}</h5>
                      <span className="text-[9px] text-slate-450 uppercase">{post.category} • {post.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={post.is_trending} 
                      onChange={(e) => handleToggleTrendingFlag(post.id, e.target.checked)}
                      className="cursor-pointer h-4 w-4 text-[#e11d48] border-slate-300 rounded focus:ring-[#e11d48]"
                      id={`trending-${post.id}`}
                    />
                    <label htmlFor={`trending-${post.id}`} className="text-xs text-slate-600 font-medium">Trending</label>
                  </div>
                </div>
              ))}
            </div>
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


      {/* ================= MODAL FORMS COMPILATION ================= */}

      {/* A. POST COMPOSER MODAL */}
      {isPostModalOpen && editingPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <h3 className="font-display font-black text-xl text-slate-900 border-b pb-3 mb-6 uppercase tracking-tight">
              {editingPost.id ? 'UPDATE EDITORIAL SPORTS POST' : 'WRITE ORIGINAL EDITORIAL POST'}
            </h3>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Article Title (SEO Priority)</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48]"
                    placeholder="e.g. Masterclass: Mechanics of rotation jump serve in Volleyball"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Sport Category</label>
                  <select
                    value={editingPost.category || 'football'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48] text-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Post Slg (Auto-generated if empty)</label>
                  <input
                    type="text"
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#e11d48]"
                    placeholder="custom-url-string-slug"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Structure Type</label>
                  <select
                    value={editingPost.type || 'news'}
                    onChange={(e) => setEditingPost({ ...editingPost, type: e.target.value as 'news' | 'blog' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48] text-slate-800"
                  >
                    <option value="news">News Article (Standard Feed Layout)</option>
                    <option value="blog">Blog Column (PEO Opinion Style Column)</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Author Name Attribution</label>
                  <input
                    type="text"
                    disabled={currentAdmin?.email.toLowerCase() !== 'hananirfan91@gmail.com'}
                    value={editingPost.author || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full bg-slate-100 disabled:opacity-75 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingPost.featured_image || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#e11d48]"
                    placeholder="Provide image web link or select from list"
                  />
                  {/* Shortcut to select from preseeded library */}
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {media.slice(0, 4).map(m => (
                      <img 
                        key={m.id} 
                        src={m.file_url} 
                        onClick={() => setEditingPost({ ...editingPost, featured_image: m.file_url })}
                        alt="" 
                        className="w-8 h-8 rounded border border-slate-200 hover:border-[#e11d48] cursor-pointer" 
                      />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">YouTube Embed ID (YouTube highlight video)</label>
                  <input
                    type="text"
                    value={editingPost.video_url || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, video_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#e11d48]"
                    placeholder="e.g. H9T9e03d_jE (Letters from share URL)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 uppercase mb-1">SEO Description (AdSense metadata & snippets)</label>
                <input
                  type="text"
                  value={editingPost.meta_description || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48]"
                  placeholder="Insert 150-word index snippet summary"
                  maxLength={160}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#e11d48] uppercase mb-1 flex items-center space-x-1">
                    <Tag className="h-3.5 w-3.5" />
                    <span>SEO Tags (Comma separated keywords)</span>
                  </label>
                  <input
                    type="text"
                    value={tempTags}
                    onChange={(e) => setTempTags(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e11d48]"
                    placeholder="e.g. cricket news, standings, Rashid Khan tips"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-amber-600 uppercase mb-1 flex items-center space-x-1">
                    <CalendarClock className="h-3.5 w-3.5 animate-pulse" />
                    <span>Schedule Release Post (Lock until date/time)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editingPost.scheduled_for && editingPost.scheduled_for !== 'draft' ? editingPost.scheduled_for : ''}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduled_for: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-700 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/60 p-3 rounded-lg">
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
                  className="rounded border-slate-300 text-emerald-655 focus:ring-emerald-555 h-4 w-4"
                />
                <div>
                  <label htmlFor="is_draft_toggle" className="block text-xs font-mono font-bold text-slate-705 uppercase cursor-pointer select-none">
                    Save as Draft Article
                  </label>
                  <p className="text-[10px] text-slate-405 leading-tight">Drafts are securely stored in Supabase cloud but 100% hidden from the public feed until manually published live.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-655 uppercase mb-1">
                  Editorial Content Analysis Body (Markdown text enabled)
                </label>
                <textarea
                  required
                  rows={8}
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-4 text-sm focus:outline-none focus:bg-white focus:border-[#e11d48] font-sans leading-relaxed"
                  placeholder="Write 800 - 1500 word highly original human opinion narrative... Supports markdown tags like # header, Table columns, etc."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2 rounded-lg uppercase tracking-wider"
                >
                  Commit to Local Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. CATEGORY MODAL */}
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

    </div>
  );
}
