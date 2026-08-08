import React, { useState } from 'react';
import { Menu, X, Search, Trophy, Calendar, Globe, ChevronDown, User, Heart, Inbox, Bell, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DB } from '../lib/db';
import Logo from './Logo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  activeGeo: string;
  onChangeGeo: (geo: string) => void;
}

const GEO_COUNTRIES = [
  { code: 'global', name: 'Global Edition' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'US', name: 'USA' },
];

export default function Navbar({ currentPath, onNavigate, activeGeo, onChangeGeo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCricketDropdown, setShowCricketDropdown] = useState(false);
  const [mobileCricketOpen, setMobileCricketOpen] = useState(false);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [upcomingMatchLine, setUpcomingMatchLine] = useState("Upcoming Matches In 2 Hours");

  // Subscriber Inbox Modal States
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [subEmailInput, setSubEmailInput] = useState(() => localStorage.getItem('tsr_subscriber_email') || '');
  const [activeSub, setActiveSub] = useState(() => {
    const saved = localStorage.getItem('tsr_subscriber_email');
    return saved ? DB.getSubscriberByEmail(saved) : null;
  });

  const categories = DB.getCategories();

  React.useEffect(() => {
    const syncInbox = () => {
      const saved = localStorage.getItem('tsr_subscriber_email') || subEmailInput;
      if (saved) {
        setActiveSub(DB.getSubscriberByEmail(saved));
      }
    };
    syncInbox();
    window.addEventListener('fts_db_sync', syncInbox);
    return () => window.removeEventListener('fts_db_sync', syncInbox);
  }, [subEmailInput]);

  const unreadCount = activeSub?.inbox?.filter(m => !m.read).length || 0;

  React.useEffect(() => {
    const updateLine = () => {
      try {
        const fixtures = DB.getFixtures();
        const upcoming = fixtures.filter(f => f.status === 'upcoming');
        
        if (upcoming.length > 0) {
          const now = new Date();
          const totalMinutes = now.getHours() * 60 + now.getMinutes();
          const cycleMinutes = 120; // 2 hour loop
          const remainingMinutes = cycleMinutes - (totalMinutes % cycleMinutes);
          const hours = Math.floor(remainingMinutes / 60);
          const mins = remainingMinutes % 60;
          
          const matchIndex = Math.floor(totalMinutes / cycleMinutes) % upcoming.length;
          const chosenMatch = upcoming[matchIndex];
          
          setUpcomingMatchLine(`Upcoming: ${chosenMatch.team1} vs ${chosenMatch.team2} (${chosenMatch.sport.toUpperCase()}) in ${hours > 0 ? `${hours}h ` : ''}${mins}m`);
        } else {
          setUpcomingMatchLine("TSR Broadcast Network: Matches Scheduled in 2 Hours");
        }
      } catch (e) {
        setUpcomingMatchLine("Upcoming Matches In 2 Hours");
      }
    };

    updateLine();
    const interval = setInterval(updateLine, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const posts = DB.getPosts();
      const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (slug: string) => {
    onNavigate(`/blog/${slug}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const activeGeoName = GEO_COUNTRIES.find(c => c.code === activeGeo)?.name || 'Global';

  return (
    <header className="sticky top-0 z-50 bg-[#01140f] border-b border-emerald-950 shadow-md text-white" id="main-header">
      {/* Editorial Utility Top bar */}
      <div className="bg-[#022c22] text-slate-200 text-xs py-2 px-4 shadow-inner hidden md:block border-b border-emerald-950">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-[#22c55e] font-bold uppercase tracking-wider text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] mr-2"></span>
              The Sports Room — Quality Sports Analysis &amp; Editorial Columns
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {/* Geo Selection */}
            <div className="relative">
              <button 
                onClick={() => setShowGeoDropdown(!showGeoDropdown)} 
                className="flex items-center space-x-1.5 text-slate-300 hover:text-white font-medium focus:outline-none transition duration-150"
              >
                <Globe className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>{activeGeoName}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showGeoDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowGeoDropdown(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-[#01140f] text-white shadow-2xl border border-emerald-900 z-20 py-1"
                    >
                      {GEO_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            onChangeGeo(country.code);
                            setShowGeoDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-[#022c22] flex justify-between items-center transition duration-150 ${activeGeo === country.code ? 'font-bold text-[#22c55e]' : ''}`}
                        >
                          {country.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setShowInboxModal(true)}
              className="relative flex items-center space-x-1.5 text-slate-200 hover:text-[#22c55e] transition font-mono font-bold bg-[#022c22] border border-[#22c55e]/30 px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider"
              title="My Subscriber Inbox & Latest Updates"
            >
              <Inbox className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-[#22c55e] text-slate-950 font-sans font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                  {unreadCount}
                </span>
              )}
            </button>

            <button onClick={() => onNavigate('/admin')} className="flex items-center space-x-1 text-slate-950 hover:bg-[#34d399] transition font-bold bg-[#22c55e] px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider font-mono">
              <User className="h-3 w-3" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')} 
          className="cursor-pointer flex items-center select-none active:scale-98 transition duration-150 shrink-0"
          id="logo-container"
        >
          <Logo variant="horizontal" />
        </div>

        {/* Central Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6">
          {/* 1. Home */}
          <button 
            onClick={() => onNavigate('/')} 
            className={`font-display text-sm font-bold tracking-wide uppercase transition duration-150 ${currentPath === '/' ? 'text-[#22c55e]' : 'text-slate-200 hover:text-[#22c55e]'}`}
          >
            Home
          </button>

          {/* 2. Cricket Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShowCricketDropdown(true)}
            onMouseLeave={() => setShowCricketDropdown(false)}
          >
            <button 
              onClick={() => {
                onNavigate('/sport/cricket');
                setShowCricketDropdown(false);
              }}
              className={`flex items-center space-x-1 font-display text-sm font-bold tracking-wide uppercase transition duration-150 ${
                currentPath.includes('cricket') || currentPath.includes('/topic/psl') || currentPath.includes('/topic/ipl')
                  ? 'text-[#22c55e]'
                  : 'text-slate-200 hover:text-[#22c55e]'
              }`}
            >
              <span>Cricket</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showCricketDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#01140f] shadow-2xl border border-emerald-900 z-50 p-3 font-sans text-xs space-y-2 text-slate-100"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-900 px-1">
                    <span className="font-mono text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
                      🏏 Cricket Central Hub
                    </span>
                    <button 
                      onClick={() => { onNavigate('/sport/cricket'); setShowCricketDropdown(false); }}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => { onNavigate('/topic/pakistan-cricket'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#022c22] transition flex items-center justify-between font-medium text-slate-200 hover:text-[#22c55e]"
                    >
                      <span>🇵🇰 Pakistan Cricket</span>
                      <span className="text-[10px] text-[#22c55e] font-mono font-bold bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded">Live</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('/topic/india-cricket'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#022c22] transition flex items-center justify-between font-medium text-slate-200 hover:text-[#22c55e]"
                    >
                      <span>🇮🇳 India Cricket</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('/topic/cricket-world-cup-2027'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 hover:bg-[#022c22] transition flex items-center justify-between font-bold text-white hover:text-[#22c55e]"
                    >
                      <span>🌍 Cricket World Cup 2027</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.5 rounded">2027</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('/topic/psl'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#022c22] transition flex items-center justify-between font-medium text-slate-200 hover:text-[#22c55e]"
                    >
                      <span>⚡ PSL (Pakistan Super League)</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('/topic/ipl'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#022c22] transition flex items-center justify-between font-medium text-slate-200 hover:text-[#22c55e]"
                    >
                      <span>🏆 IPL (Indian Premier League)</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('/topic/icc-cricket-world-cup'); setShowCricketDropdown(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#022c22] transition flex items-center justify-between font-medium text-slate-200 hover:text-[#22c55e]"
                    >
                      <span>🌍 World Cup &amp; Rankings</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Live Page */}
          <button
            onClick={() => onNavigate('/live-stream')}
            className={`flex items-center space-x-1.5 font-display text-sm font-bold tracking-wide uppercase transition duration-150 px-3 py-1 rounded-full border ${
              currentPath === '/live-stream'
                ? 'bg-[#22c55e] text-slate-950 border-[#22c55e] font-black shadow-md'
                : 'bg-[#022c22] text-white hover:bg-[#22c55e] hover:text-slate-950 border-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Live Stream</span>
          </button>

          {/* 4. Football */}
          <button
            onClick={() => onNavigate('/sport/football')}
            className={`font-display text-sm font-bold tracking-wide uppercase transition duration-150 ${currentPath === '/sport/football' ? 'text-[#22c55e]' : 'text-slate-200 hover:text-[#22c55e]'}`}
          >
            Football
          </button>

          {/* 5. Basketball */}
          <button
            onClick={() => onNavigate('/sport/basketball')}
            className={`font-display text-sm font-bold tracking-wide uppercase transition duration-150 ${currentPath === '/sport/basketball' ? 'text-[#22c55e]' : 'text-slate-200 hover:text-[#22c55e]'}`}
          >
            Basketball
          </button>

          {/* 6. More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-1 font-display text-sm font-bold tracking-wide uppercase text-slate-200 hover:text-[#22c55e] focus:outline-none"
            >
              <span>More</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#01140f] shadow-2xl border border-emerald-900 z-20 py-2 font-sans text-sm text-slate-200 max-h-80 overflow-y-auto"
                  >
                    <div className="px-3 py-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-emerald-900">
                      Additional Sports Desks
                    </div>
                    {categories
                      .filter(c => !['cricket', 'football', 'basketball'].includes(c.slug))
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onNavigate(`/sport/${cat.slug}`);
                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-[#022c22] transition font-medium ${currentPath === `/sport/${cat.slug}` ? 'text-[#22c55e] font-bold' : 'text-slate-200 hover:text-[#22c55e]'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Search & Utility */}
        <div className="flex items-center space-x-4">
          {/* Dynamic Search Box */}
          <div className="relative hidden md:block w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              aria-label="Search news, tags, columns"
              placeholder="Search news, tags, columns..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-9 pr-4 py-1.5 bg-[#022c22] border border-emerald-900 rounded-full focus:outline-none focus:border-[#22c55e] text-sm placeholder-slate-400 text-white transition"
            />
            {/* Dynamic Dropdown Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSearchResults([])}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-[400px] bg-[#01140f] border border-emerald-900 text-white rounded-2xl shadow-2xl z-20 overflow-hidden divide-y divide-emerald-950"
                  >
                    <div className="px-4 py-2 bg-[#022c22] text-[10px] font-bold text-[#22c55e] uppercase tracking-widest flex justify-between">
                      <span>Article Search Matches</span>
                      <span>{searchResults.length} found</span>
                    </div>
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleResultClick(post.slug)}
                        className="p-3 hover:bg-[#022c22] cursor-pointer transition flex space-x-3 items-center"
                      >
                        <img 
                          referrerPolicy="no-referrer"
                          src={post.featured_image} 
                          alt={post.title} 
                          className="w-12 h-12 object-cover rounded-lg bg-[#01140f] shrink-0 border border-emerald-900" 
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#22c55e] tracking-wide">{post.category}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1 leading-tight">{post.title}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{post.author} • {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Favorite Trigger */}
          <button onClick={() => onNavigate('/')} aria-label="Favorites" className="text-slate-300 hover:text-[#22c55e] p-1.5 rounded-full hover:bg-[#022c22] transition duration-150 select-none">
            <Heart className="h-5 w-5" />
          </button>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden text-white p-1.5 bg-[#022c22] rounded-lg border border-emerald-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-[#22c55e]" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-emerald-950 bg-[#01140f] text-white"
          >
            <div className="p-4 space-y-3">
              {/* Mobile Search */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles, columns..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-9 pr-4 py-2 bg-[#022c22] border border-emerald-900 rounded-xl focus:outline-none focus:border-[#22c55e] text-sm transition text-white placeholder-slate-400"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 mt-1 w-full bg-[#01140f] border border-emerald-900 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-emerald-950">
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          handleResultClick(post.slug);
                          setMobileMenuOpen(false);
                        }}
                        className="p-3 hover:bg-[#022c22] cursor-pointer transition flex items-center space-x-2"
                      >
                        <h5 className="text-xs font-bold text-white line-clamp-1">{post.title}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Geo Grid inside mobile */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Regional Sport Focus</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {GEO_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onChangeGeo(c.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1.5 rounded transition ${activeGeo === c.code ? 'bg-[#16a34a] text-white font-bold' : 'hover:bg-slate-200 text-slate-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Links */}
              <div className="space-y-2 text-slate-800 py-2 font-display text-sm font-semibold uppercase">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onNavigate('/');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 border-b border-slate-200 text-[#16a34a] font-bold"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/live-stream');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 border-b border-slate-200 text-rose-600 font-bold flex items-center space-x-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Live Stream</span>
                  </button>
                  <button
                    onClick={() => setMobileCricketOpen(!mobileCricketOpen)}
                    className="text-left py-2 border-b border-slate-200 flex items-center justify-between text-[#16a34a] font-bold"
                  >
                    <span>Cricket</span>
                    <ChevronDown className={`h-4 w-4 transform transition ${mobileCricketOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {mobileCricketOpen && (
                  <div className="bg-[#01140f] p-3 rounded-xl border border-[#22c55e]/30 space-y-2 text-xs font-sans normal-case">
                    <div className="text-[10px] font-mono font-bold text-[#22c55e] uppercase">⭐ Top Priority: International</div>
                    <div className="grid grid-cols-2 gap-1.5 text-slate-200 font-medium">
                      <button onClick={() => { onNavigate('/topic/pakistan-cricket'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🇵🇰 Pakistan</button>
                      <button onClick={() => { onNavigate('/topic/india-cricket'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🇮🇳 India</button>
                      <button onClick={() => { onNavigate('/topic/cricket-world-cup-2027'); setMobileMenuOpen(false); }} className="text-left p-1.5 text-[#22c55e] font-bold">🌍 CWC 2027</button>
                      <button onClick={() => { onNavigate('/topic/australia-cricket'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🇦🇺 Australia</button>
                      <button onClick={() => { onNavigate('/topic/england-cricket'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</button>
                      <button onClick={() => { onNavigate('/topic/icc-cricket-world-cup'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🌍 World Cup</button>
                      <button onClick={() => { onNavigate('/topic/icc-champions-trophy'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🏆 Champions</button>
                      <button onClick={() => { onNavigate('/topic/asia-cup'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🏏 Asia Cup</button>
                      <button onClick={() => { onNavigate('/topic/icc-rankings'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">📊 Rankings</button>
                    </div>

                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase pt-2 border-t border-emerald-950">⚡ T20 Leagues & Base</div>
                    <div className="grid grid-cols-2 gap-1.5 text-slate-200 font-medium">
                      <button onClick={() => { onNavigate('/topic/psl'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">⚡ PSL</button>
                      <button onClick={() => { onNavigate('/topic/ipl'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🏆 IPL</button>
                      <button onClick={() => { onNavigate('/sport/cricket'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">🏏 All Cricket</button>
                      <button onClick={() => { onNavigate('/knowledge-hub'); setMobileMenuOpen(false); }} className="text-left p-1.5 hover:text-[#22c55e]">📚 Knowledge</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c => c.slug !== 'cricket').map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate(`/sport/${cat.slug}`);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left py-2 border-b border-emerald-950"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Utility shortcuts */}
              <div className="pt-2 border-t border-emerald-950 flex flex-col space-y-2 font-medium text-xs text-slate-300">
                <button
                  onClick={() => {
                    setShowInboxModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 bg-[#022c22] text-[#22c55e] border border-[#22c55e]/40 hover:bg-[#034434] rounded font-bold tracking-wider transition uppercase flex items-center justify-center space-x-2"
                >
                  <Inbox className="h-4 w-4" />
                  <span>Subscriber Inbox ({unreadCount} New)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-[#22c55e] text-slate-950 hover:bg-[#34d399] rounded font-extrabold tracking-wider transition uppercase"
                >
                  🔒 CREATE ACCOUNT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBSCRIBER INBOX & NOTIFICATIONS MODAL */}
      <AnimatePresence>
        {showInboxModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#01140f] border border-[#22c55e]/40 text-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-emerald-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Inbox className="h-5 w-5 text-[#22c55e]" />
                  <h3 className="font-display font-extrabold text-base text-white uppercase tracking-wider">Subscriber Inbox & Notifications</h3>
                </div>
                <button onClick={() => setShowInboxModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Email selector / verify bar */}
              <div className="bg-[#022c22] border border-[#22c55e]/30 rounded-xl p-3 space-y-2">
                <label className="block font-mono text-[10px] text-slate-300 font-bold uppercase">Subscribed Email Address</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter your subscribed email address..."
                    value={subEmailInput}
                    onChange={(e) => setSubEmailInput(e.target.value)}
                    className="flex-1 bg-[#01140f] border border-[#22c55e]/30 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#22c55e]"
                  />
                  <button
                    onClick={() => {
                      if (subEmailInput) {
                        const emailNorm = subEmailInput.trim().toLowerCase();
                        localStorage.setItem('tsr_subscriber_email', emailNorm);
                        let found = DB.getSubscriberByEmail(emailNorm);
                        if (!found) {
                          found = DB.insertSubscriber(emailNorm);
                        }
                        setActiveSub(found);
                      }
                    }}
                    className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-mono font-bold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider transition shrink-0"
                  >
                    Check Inbox
                  </button>
                </div>
                {activeSub && (
                  <p className="text-[11px] text-[#22c55e] font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Connected as <strong>{activeSub.email}</strong> ({activeSub.inbox?.length || 0} messages)</span>
                  </p>
                )}
              </div>

              {/* Inbox Message List */}
              <div className="space-y-3">
                {!activeSub || !activeSub.inbox || activeSub.inbox.length === 0 ? (
                  <div className="text-center py-8 bg-[#022c22]/40 rounded-xl border border-dashed border-emerald-900">
                    <Mail className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-300">No inbox notifications for this email yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Enter your subscribed email above to access your personal inbox and breaking match alerts.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeSub.inbox.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-xl border transition ${
                          msg.read 
                            ? 'bg-[#022c22]/30 border-emerald-950/60 opacity-80' 
                            : 'bg-[#022c22] border-[#22c55e]/50 shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                              {msg.type || 'update'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(msg.sent_at).toLocaleString()}
                            </span>
                          </div>

                          {!msg.read && (
                            <button
                              onClick={() => {
                                DB.markSubscriberMessageRead(activeSub.email, msg.id);
                                const updated = DB.getSubscriberByEmail(activeSub.email);
                                if (updated) setActiveSub({ ...updated });
                              }}
                              className="text-[10px] font-mono text-[#22c55e] hover:underline"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-white">{msg.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{msg.message}</p>

                        {msg.link && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-900/60 flex justify-between items-center">
                            <a
                              href={msg.link}
                              onClick={() => setShowInboxModal(false)}
                              className="inline-flex items-center text-xs font-mono font-bold text-[#22c55e] hover:underline"
                            >
                              View Live Match / Article →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
