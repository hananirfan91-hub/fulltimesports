import React, { useState } from 'react';
import { Menu, X, Search, Trophy, Calendar, Globe, ChevronDown, User, Heart } from 'lucide-react';
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
  { code: 'IN', name: 'India (Cricket First)' },
  { code: 'UK', name: 'United Kingdom (PL Focus)' },
  { code: 'US', name: 'USA (NBA & Esports)' },
  { code: 'AU', name: 'Australia (Multi-Sport)' },
];

export default function Navbar({ currentPath, onNavigate, activeGeo, onChangeGeo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const categories = DB.getCategories();

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
    <header className="sticky top-0 z-50 bg-[#022c22] border-b border-[#22c55e]/25 shadow-lg text-white" id="main-header">
      {/* Editorial Utility Top bar */}
      <div className="bg-[#01140f] text-slate-300 text-xs py-2 px-4 shadow-inner hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-[#22c55e] font-bold">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping mr-2"></span>
              LIVE TRANSFERS ACTIVE
            </span>
            <span className="text-[#14532d]">|</span>
            <span className="text-slate-350 hover:text-[#22c55e] cursor-pointer transition duration-150" onClick={() => onNavigate('/fixtures')}>
              Upcoming Matches In 2 Hours
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
                      className="absolute right-0 mt-2 w-48 rounded bg-slate-900 text-white shadow-2xl border border-slate-800 z-20 py-1"
                    >
                      {GEO_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            onChangeGeo(country.code);
                            setShowGeoDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex justify-between items-center transition duration-150 ${activeGeo === country.code ? 'font-bold text-[#22c55e]' : ''}`}
                        >
                          {country.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={() => onNavigate('/rankings')} className="flex items-center space-x-1 text-slate-300 hover:text-white transition duration-150">
              <Trophy className="h-3.5 w-3.5" />
              <span>Rankings</span>
            </button>
            <button onClick={() => onNavigate('/fixtures')} className="flex items-center space-x-1 text-slate-300 hover:text-white transition duration-150">
              <Calendar className="h-3.5 w-3.5" />
              <span>Fixtures</span>
            </button>
            <button onClick={() => onNavigate('/admin')} className="flex items-center space-x-1 text-slate-950 hover:bg-[#34d399] transition font-bold bg-[#22c55e] px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
              <User className="h-3 w-3" />
              <span>CMS Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')} 
          className="cursor-pointer flex items-center select-none active:scale-98 transition duration-150"
          id="logo-container"
        >
          <Logo variant="horizontal" />
        </div>

        {/* Central Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6">
          <button 
            onClick={() => onNavigate('/')} 
            className={`font-display text-sm font-semibold tracking-wide uppercase transition duration-150 ${currentPath === '/' ? 'text-[#22c55e]' : 'text-slate-200 hover:text-[#22c55e]'}`}
          >
            Home
          </button>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/sport/${cat.slug}`)}
              className={`font-display text-sm font-semibold tracking-wide uppercase transition duration-150 ${currentPath === `/sport/${cat.slug}` ? 'text-[#22c55e]' : 'text-slate-200 hover:text-[#22c55e]'}`}
            >
              {cat.name}
            </button>
          ))}

          {/* More Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-1 font-display text-sm font-semibold tracking-wide uppercase text-slate-200 hover:text-[#22c55e] focus:outline-none"
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
                    className="absolute right-0 mt-3 w-56 rounded bg-[#01140f] shadow-xl border border-[#22c55e]/20 z-20 py-2 font-sans text-sm"
                  >
                    <div className="px-3 py-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-emerald-950">
                      Additional Sports
                    </div>
                    {categories.slice(5).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate(`/sport/${cat.slug}`);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-emerald-950/50 transition font-medium ${currentPath === `/sport/${cat.slug}` ? 'text-[#22c55e]' : 'text-slate-300'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                    <div className="border-t border-emerald-950 my-1"></div>
                    <button
                      onClick={() => {
                        onNavigate('/rankings');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-950/50 transition font-medium text-slate-300 flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4 text-[#22c55e]" />
                      <span>Global Rankings</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('/fixtures');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-950/50 transition font-medium text-slate-300 flex items-center space-x-2"
                    >
                      <Calendar className="h-4 w-4 text-[#22c55e]" />
                      <span>Match Fixtures</span>
                    </button>
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
              placeholder="Search news, tags, columns..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-9 pr-4 py-1.5 bg-[#01140f] border border-[#22c55e]/15 rounded-full focus:outline-none focus:bg-[#022c22] focus:border-[#22c55e]/50 text-sm placeholder-slate-455 text-white transition"
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
                    className="absolute left-0 mt-2 w-[400px] bg-slate-900 border border-[#22c55e]/25 text-white rounded-lg shadow-2xl z-20 overflow-hidden divide-y divide-emerald-950"
                  >
                    <div className="px-4 py-2 bg-[#01140f] text-[10px] font-bold text-slate-405 uppercase tracking-widest flex justify-between">
                      <span>Article Search Matches</span>
                      <span>{searchResults.length} found</span>
                    </div>
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleResultClick(post.slug)}
                        className="p-3 hover:bg-slate-800 cursor-pointer transition flex space-x-3 items-center"
                      >
                        <img 
                          referrerPolicy="no-referrer"
                          src={post.featured_image} 
                          alt={post.title} 
                          className="w-12 h-12 object-cover rounded bg-slate-950 shrink-0 border border-emerald-900" 
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#22c55e] tracking-wide">{post.category}</span>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1 leading-tight">{post.title}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{post.author} • {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Favorite Trigger (Purely client UX visual placeholder) */}
          <button onClick={() => onNavigate('/')} className="text-slate-400 hover:text-[#22c55e] p-1.5 rounded-full hover:bg-[#01140f] transition duration-150 select-none">
            <Heart className="h-5 w-5" />
          </button>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden text-white p-1 bg-[#01140f] rounded border border-emerald-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            className="lg:hidden border-t border-emerald-900 bg-[#022c22] text-white"
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
                  className="block w-full pl-9 pr-4 py-2 bg-[#01140f] border border-[#22c55e]/15 rounded-md focus:outline-none focus:bg-[#022c22] text-sm transition text-white"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 mt-1 w-full bg-slate-900 border border-emerald-950 rounded shadow-lg z-20 overflow-hidden divide-y divide-emerald-950">
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          handleResultClick(post.slug);
                          setMobileMenuOpen(false);
                        }}
                        className="p-3 hover:bg-slate-800 cursor-pointer transition flex items-center space-x-2"
                      >
                        <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{post.title}</h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Geo Grid inside mobile */}
              <div className="bg-[#01140f] p-2.5 rounded-lg border border-emerald-950">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Regional Sport Focus</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {GEO_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onChangeGeo(c.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left px-2 py-1.5 rounded transition ${activeGeo === c.code ? 'bg-[#22c55e] text-slate-950 font-bold' : 'hover:bg-emerald-900/50 text-slate-300'}`}
                    >
                      {c.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Links */}
              <div className="grid grid-cols-2 gap-2 text-slate-200 py-2 font-display text-sm font-semibold uppercase">
                <button
                  onClick={() => {
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 border-b border-emerald-950"
                >
                  Home
                </button>
                {categories.map((cat) => (
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

              {/* Utility shortcuts */}
              <div className="pt-2 border-t border-emerald-950 flex flex-col space-y-2 font-medium text-xs text-slate-300">
                <button
                  onClick={() => {
                    onNavigate('/rankings');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:bg-emerald-950/20 transition"
                >
                  🏆 View Global Rankings
                </button>
                <button
                  onClick={() => {
                    onNavigate('/fixtures');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:bg-emerald-950/20 transition"
                >
                  📅 Match Fixtures / Schedules
                </button>
                <button
                  onClick={() => {
                    onNavigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-[#22c55e] text-slate-950 hover:bg-[#34d399] rounded font-extrabold tracking-wider transition uppercase"
                >
                  🔒 GO TO CMS ADMIN PANEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
