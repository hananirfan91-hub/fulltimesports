import React, { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, Globe, Share2, Compass, ArrowRight, Eye, 
  Sparkles, FileText, Check, Facebook, Twitter, MessageSquare, AlertCircle
} from 'lucide-react';
import { Post, Category, RankingItem, FixtureItem } from '../types';
import { DB } from '../lib/db';
import AdSensePlaceholder from '../components/AdSensePlaceholder';
import { SPORT_TACTICAL_MANUALS } from '../data/sportManuals';

interface SportCategoryProps {
  categorySlug: string;
  onNavigate: (path: string) => void;
  activeGeo: string;
  onChangeGeo: (geo: string) => void;
}

// Custom sports sector Q&A directory mapping to answer direct burning user questions
const SPORT_CATEGORY_ANSWERS: Record<string, { q: string, a: string }> = {
  'cricket': {
    q: 'Why are wrist-spinners (leg-spinners) dominant in powerplays despite the fielding restrictions?',
    a: 'Leg-spinners applying upwards of 2400 RPM spin utilize fluid Magnus effect drag. This generates late vertical dipping and lateral drifting that scrambles the batsmans footwork before the bounce. They do not rely on pitch friction like finger spinners, cutting batting reaction time to under 0.4 seconds.'
  },
  'football': {
    q: 'Why have classical overlapping fullbacks been replaced with inverted central pivots?',
    a: 'Elite modern formations require rest-defense dominance in center midfield. Inverting fullbacks into a central double-pivot blocks counter-attack lanes, grants possession numerical superiority (+1 player), and frees up wingers to isolate defenders in 1v1 situations.'
  },
  'formula-1': {
    q: 'How has the return to ground-effect aerodynamics improved overtaking in Formula 1?',
    a: 'Ground-effect shifts downforce production from drag-heavy topside wings to underbody Venturi tunnels. Venturi tunnels suck cars into the track using negative kinetic airspeed, which leaves a much cleaner trailing wake, letting cars follow close behind without losing grip.'
  },
  'tennis': {
    q: 'What is the precise friction physics behind slide recovery on clay tennis courts?',
    a: 'Clay court slides surf over loose brick dust. Players drop their center of gravity to decelerate *while* actively launching groundstrokes. This simultaneous slide and hit shaves 1.2 seconds off recovery and positioning setup time compared to hard courts.'
  },
  'hockey': {
    q: 'How do penalty-corner drag flickers achieve velocities exceeding 120 km/h?',
    a: 'The drag-flick is a kinetic chain slingshot. Flickers drag the ball from behind their body in a long continuous contact arc. Power cascades upward from the ankles to the hips, torso, and wrists, shooting the ball into top corners in milliseconds.'
  },
  'basketball': {
    q: 'Why does advanced statistical modeling discourage mid-range jumpers?',
    a: 'Points-per-possession statistics demonstrate mid-range shots provide a low conversion rate relative to three-point shots (worth 50% more points) and restricted-area paint drives. Analytical models have pushed offenses outward, prioritizing spacing.'
  },
  'esports': {
    q: 'How much do high frame rates and polling rates impact aiming accuracy?',
    a: 'High frame rates (240Hz+) and sub-millisecond mouse polling (1000Hz+) reduce input-to-display latency. This provides real-time tracking, syncing sightlines with muscle memory and reducing neurological response constraints for sub-150ms triggers.'
  },
  'volleyball': {
    q: 'What causes jump-serves to dip suddenly to the court?',
    a: 'An optimal jump-serve uses heavy topspin. By striking the ball on its upper half, the server induces high speed forward rotation. Air pressure drops underneath the ball (Bernoullis effect), making it plunge down past the net into vacant zones.'
  }
};

export default function SportCategory({ categorySlug, onNavigate, activeGeo, onChangeGeo }: SportCategoryProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sportRankings, setSportRankings] = useState<RankingItem[]>([]);
  const [sportFixtures, setSportFixtures] = useState<FixtureItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'opinion'>('all');
  const [regionalFilter, setRegionalFilter] = useState('all');
  const [isShareAlertOpen, setIsShareAlertOpen] = useState(false);

  useEffect(() => {
    const cats = DB.getCategories();
    const matched = cats.find(c => c.slug === categorySlug);
    setCategory(matched || null);

    if (matched) {
      document.title = `${matched.name} Tactical Analysis & Stats | Full Time Sports Pakistan`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Premium physical investigations, biomechanics telemetry, match strategies, and fixtures for ${matched.name} in Pakistan.`);
      }
    }

    // Fetch related items filtered by sport
    const allPosts = DB.getPosts().filter(p => p.category === categorySlug);
    setPosts(allPosts);

    const rankings = DB.getRankings().filter(r => r.sport === categorySlug);
    setSportRankings(rankings);

    const fixtures = DB.getFixtures().filter(f => f.sport === categorySlug);
    setSportFixtures(fixtures);
  }, [categorySlug]);

  if (!category) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-slate-800">Sport Category Not Found</h3>
        <p className="text-sm text-slate-500">The sports desk you are trying to access has not been mapped inside our database yet.</p>
        <button onClick={() => onNavigate('/')} className="bg-[#022c22] text-white font-mono text-[10px] uppercase py-2 px-4 rounded font-bold">Go Back Home</button>
      </div>
    );
  }

  // Filter posts based on Category Level tab and Region Code
  const filteredPosts = posts.filter(post => {
    // 1. Tab filter
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'news' && post.type === 'news') || 
                       (activeTab === 'opinion' && post.type === 'blog');

    // 2. Regional filter simulation
    // Let's check matching tags for localized terms
    if (regionalFilter === 'all') return matchesTab;
    
    const geoTerms: { [key: string]: string[] } = {
      IN: ['india', 'pakistan', 'icc', 'subcontinent', 'rashid', 'delhi'],
      UK: ['uk', 'premier', 'league', 'chelsea', 'arsenal', 'guardiola'],
      US: ['usa', 'nba', 'boston', 'kings', 'esports', 'faze'],
      AU: ['australia', 'melbourne', 'big bash', 'sheffield'],
    };

    const targetKeywords = geoTerms[regionalFilter] || [];
    const matchesGeo = post.tags.some(tag => 
      targetKeywords.some(kw => tag.toLowerCase().includes(kw))
    );

    return matchesTab && matchesGeo;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShareAlertOpen(true);
    setTimeout(() => setIsShareAlertOpen(false), 3000);
  };

  // Breadcrumb scheme injection
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://fulltimesports.vercel.app/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": category.name,
      "item": `https://fulltimesports.vercel.app/sport/${category.slug}`
    }]
  };

  // Get active sport answers Q&A
  const qaAnswer = SPORT_CATEGORY_ANSWERS[categorySlug] || {
    q: `How is tactical data analyzed inside the ${category.name} desk?`,
    a: `Our experts investigate tracking dynamics, spatial patterns, and player velocity models using physics foundations rather than standard scoreboard regurgitation.`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8" id="sport-category-page">
      {/* Schema Markup Injection */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Header Banner - STYLED DARK SPORT GREEN WITH NEON ACCENTS */}
      <div className="bg-[#022c22] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] text-white p-8 md:p-12 rounded-3xl border-b-4 border-[#22c55e] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative shadow overflow-hidden">
        <div className="space-y-3 z-10 max-w-2xl relative">
          <div className="flex items-center space-x-2 font-mono text-[10px] font-bold tracking-widest text-[#22c55e] uppercase">
            <Compass className="h-4 w-4 animate-spin" />
            <span>FTS ACTIVE DIRECTORY • {category.name} DESK</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-none uppercase">
            {category.name} <span className="text-[#22c55e]">JOURNAL</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-normal max-w-xl">
            {category.description}
          </p>
        </div>

        {/* Action button bar */}
        <div className="flex flex-col sm:flex-row gap-2 z-10">
          <button 
            onClick={handleCopyLink}
            className="bg-emerald-950/40 hover:bg-emerald-950 text-white font-mono text-[11px] font-bold tracking-wider px-4 py-2.5 rounded border border-emerald-800 flex items-center justify-center space-x-1.5 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>COPY LINK</span>
          </button>
          
          <button 
            onClick={() => onNavigate('/')}
            className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-extrabold font-mono text-[11px] tracking-wider px-4 py-2.5 rounded flex items-center justify-center space-x-1 transition"
          >
            <span>Match center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isShareAlertOpen && (
        <div className="bg-emerald-950 border border-emerald-550/40 text-[#22c55e] p-3 rounded-lg text-xs flex items-center space-x-2 w-fit">
          <Check className="h-4 w-4" />
          <span>Category desk URL copied to clipboard!</span>
        </div>
      )}

      {/* AdSense Placement */}
      <AdSensePlaceholder slot="sport-top-banner" format="horizontal" />


      {/* GRID SYSTEM: FILTRATION FEED vs RELEVANT MANUAL STANDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ARTICLES CORES FEED */}
        <div className="lg:col-span-8 space-y-6">

          {/* PAGE RESOLVES AN ANSWER TO AN EXPLICIT USER QUESTION */}
          <div className="bg-gradient-to-r from-[#022c22] to-[#01140f] border-2 border-[#22c55e]/25 rounded-2xl p-6 text-white shadow-md relative overflow-hidden" id="category-answer-box">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-radial from-[#22c55e]/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-0.5 px-2 bg-[#22c55e] text-[#022c22] font-mono text-[9px] font-black uppercase rounded tracking-wider">
                Resolution Key
              </span>
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider font-mono">
                Providing Clarity and Analytical Depth
              </span>
            </div>
            <p className="text-[10px] font-mono font-bold text-[#22c55e] uppercase tracking-widest leading-none">THE BURNING QUESTION:</p>
            <h2 className="font-display font-extrabold text-sm md:text-base text-white mt-1 mb-2.5 uppercase leading-snug">
              {qaAnswer.q}
            </h2>
            <div className="border-t border-emerald-900/50 pt-2.5">
              <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none">THE SCIENTIFIC ANSWER:</p>
              <p className="text-slate-350 text-xs md:text-sm mt-1 leading-relaxed">
                {qaAnswer.a}
              </p>
            </div>
          </div>
          
          {/* Controls Bar */}
          <div className="bg-[#f0fdf4] border border-[#22c55e]/15 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-emerald-950/10 p-1 rounded-md text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'all' ? 'bg-[#022c22] text-white shadow-xs' : 'text-[#052e16] hover:text-[#022c22]'}`}
              >
                All Rows
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'news' ? 'bg-[#022c22] text-white shadow-xs' : 'text-[#052e16] hover:text-[#022c22]'}`}
              >
                News
              </button>
              <button
                onClick={() => setActiveTab('opinion')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'opinion' ? 'bg-[#022c22] text-white shadow-xs' : 'text-[#052e16] hover:text-[#022c22]'}`}
              >
                Analysis & Opinions (PEO)
              </button>
            </div>

            {/* Local GEO filtration focus selectors */}
            <div className="flex items-center space-x-2 text-xs">
              <Globe className="h-4 w-4 text-[#22c55e]" />
              <span className="font-semibold text-slate-700">Region Focus:</span>
              <select
                value={regionalFilter}
                onChange={(e) => setRegionalFilter(e.target.value)}
                className="bg-white border rounded px-2.5 py-1 focus:outline-none focus:border-[#22c55e] text-slate-800 font-semibold"
              >
                <option value="all">Global Edition (All)</option>
                <option value="IN">Indian Subcontinent</option>
                <option value="UK">United Kingdom (EPL focus)</option>
                <option value="US">USA (NBA & Esports)</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>

          {/* Posts Dynamic Container */}
          {filteredPosts.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl bg-white p-12 text-center text-slate-650 max-w-xl mx-auto space-y-2">
              <AlertCircle className="h-8 w-8 text-emerald-800 mx-auto" />
              <h4 className="font-display font-bold">No Regional Posts Matching Filters Working Desk</h4>
              <p className="text-xs text-slate-500">Our editor board has not tagged sport entries with keywords related to this regional query yet inside the Local FTS database.</p>
              <button onClick={() => setRegionalFilter('all')} className="mt-2 bg-[#022c22] text-white text-xs px-3 py-1.5 rounded font-mono font-bold uppercase transition">Clear Filter</button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 cursor-pointer group shadow-xs hover:shadow transition duration-200"
                >
                  <div className="w-full sm:w-52 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img referrerPolicy="no-referrer" src={post.featured_image} alt="" className="w-full h-full object-cover group-hover:scale-103 transition duration-500" />
                    {post.type === 'blog' && (
                      <span className="absolute top-2 left-2 bg-[#022c22] text-[#22c55e] text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-emerald-850">
                        OPINION COLUMN
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-450">
                      <span className="text-[#22c55e] font-bold uppercase">{post.category}</span>
                      <span>•</span>
                      <span>By: {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                    </div>
                    <h2 className="font-display font-black text-lg md:text-xl text-slate-900 leading-tight uppercase group-hover:text-[#22c55e] transition line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-655 leading-relaxed line-clamp-2">
                      {post.meta_description || post.content.replace(/[#*`]/g, '').slice(0, 150) + '...'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-450 pt-2 border-t border-slate-100">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.views} column views</span>
                      </span>
                      <span className="text-[#22c55e] font-bold flex items-center space-x-1 group-hover:translate-x-1 transition duration-150">
                        <span>Read full investigation</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Infeed monetization block */}
          <AdSensePlaceholder slot="sport-infeed-middle" format="horizontal" />

          {/* Human-Style Opinion Block (PEO SEO requirement) */}
          <div className="bg-[#022c22] text-white rounded-2xl p-6 shadow space-y-3 border-l-4 border-[#22c55e]">
            <span className="text-[10px] bg-[#01140f] border border-emerald-950 text-[#22c55e] font-mono font-bold px-2 py-0.5 rounded uppercase">
              Expert Storytelling Panel PEO
            </span>
            <h3 className="font-display font-black text-lg uppercase tracking-tight text-white mt-1">
              THE INTELLECTUAL MECHANICS OF {category.name.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our specialists avoid cheap auto-generated score dumps or live streams scrapers. We believe every serve, every leg-spin revolution, and every inverted fullback pivot holds a physical and tactical blueprint that must be captured with elegant narrative. Read columns to explore the deeper tactical layers.
            </p>
          </div>

        </div>


        {/* RIGHT COLUMN: MANUAL STANDINGS AND SCHEDULES */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. STANDINGS TABLE PANEL */}
          {sportRankings.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-display font-black text-xs text-[#022c22] uppercase tracking-widest border-b border-slate-100 pb-2.5 mb-4 flex justify-between items-center">
                <span>{category.name} Desk Standing Rankings</span>
                <Trophy className="h-4.5 w-4.5 text-[#22c55e] animate-bounce" />
              </h3>

              <div className="space-y-4">
                {sportRankings.map((r) => (
                  <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 font-mono text-xs text-slate-705">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">#{r.rank}</span>
                      <span className="font-bold text-slate-900">{r.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[#022c22]">{r.points}</span>
                      {r.extra && <span className="text-[8px] block font-normal text-[#22c55e] uppercase mt-0.5">{r.extra}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. FIXTURES AND SCHEDULE PANEL */}
          {sportFixtures.length > 0 && (
            <div className="bg-[#022c22] text-white border border-emerald-950 rounded-2xl p-5 shadow">
              <h3 className="font-display font-bold text-xs text-[#22c55e] uppercase tracking-widest border-b border-emerald-900 pb-2.5 mb-4">
                Calendar Schedule Desk
              </h3>

              <div className="space-y-3.5">
                {sportFixtures.map((fix) => (
                  <div key={fix.id} className="p-3 bg-[#01140f] rounded border border-emerald-950 flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono">
                      <span>{fix.stage || 'Schedules Node'}</span>
                      {fix.status === 'live' ? (
                        <span className="text-red-500 font-bold animate-pulse">● LIVE NOW</span>
                      ) : (
                        <span>{fix.date} • {fix.time}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-100">
                      <span>{fix.team1}</span>
                      <span className="bg-[#022c22] border border-[#22c55e]/20 px-2 py-0.5 rounded text-[#22c55e] font-mono font-black text-[10px]">
                        {fix.score || 'VS'}
                      </span>
                      <span>{fix.team2}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 italic">
                      Venue: {fix.venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AdSensePlaceholder slot="sport-sidebar-rectangle" format="rectangle" />

          {/* Social Desk widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-3 shadow-xs">
            <h4 className="font-display text-xs font-bold text-slate-900 uppercase">Connect on Social Desk</h4>
            <p className="text-[10px] text-slate-500">Stay updated on expert human sports coverage by following our official handles.</p>
            <div className="flex justify-center space-x-2">
              <a 
                href="https://facebook.com/fulltimesportspakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-200 rounded hover:border-[#22c55e] text-slate-505 hover:text-[#22c55e] transition inline-flex items-center justify-center cursor-pointer" 
                title="Visit our Facebook Page"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://x.com/hananirfan91"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-slate-200 rounded hover:border-[#22c55e] text-slate-505 hover:text-[#22c55e] transition inline-flex items-center justify-center cursor-pointer" 
                title="Visit our Twitter/X Page"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* C. MASSIVE ATHLETIC BIOMECHANICS ATLAS & TACTICAL DEEP DIVE MANUAL */}
      {SPORT_TACTICAL_MANUALS[categorySlug] && (
        <div className="bg-slate-900 border border-slate-800 text-slate-105 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 mt-12" id="fts-sports-science-atlas">
          <div className="border-b border-emerald-950 pb-6">
            <div className="inline-flex items-center space-x-2 font-mono text-[9px] font-black text-[#22c55e] bg-[#01140f] px-2.5 py-1.5 rounded tracking-wide border border-emerald-950 uppercase mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Academic Reference Vault</span>
            </div>
            <h2 className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight text-white leading-none">
              ATHLETIC SCIENCE & TACTICAL MANUAL: <span className="text-[#22c55e]">{category.name.toUpperCase()} DESK</span>
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {SPORT_TACTICAL_MANUALS[categorySlug].introduction}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {SPORT_TACTICAL_MANUALS[categorySlug].chapters.map((ch, idx) => (
                <div key={idx} className="bg-[#0c1915]/50 border border-emerald-950/40 p-5 rounded-2xl space-y-2.5">
                  <h3 className="font-display font-black text-sm md:text-base text-white tracking-tight uppercase border-b border-emerald-950/20 pb-2 flex items-center space-x-2">
                    <span className="text-[#22c55e] font-mono text-xs">0{idx + 1}.</span>
                    <span>{ch.title}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {ch.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Pakistan Geographic Association */}
              <div className="p-5 bg-gradient-to-b from-[#023326] to-[#011c15] border border-[#22c55e]/20 rounded-2xl space-y-3">
                <span className="text-[9px] font-mono font-bold text-[#22c55e] bg-[#01140f] px-2 py-0.5 rounded uppercase">
                  GEO-ANALYSIS DIRECTORY
                </span>
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">
                  pakistan domestic integration
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {SPORT_TACTICAL_MANUALS[categorySlug].pakistanPerspective}
                </p>
              </div>

              {/* Formula & Biomechanical Metrics */}
              {SPORT_TACTICAL_MANUALS[categorySlug].biochemicalFormulas && (
                <div className="p-5 bg-[#0d151d] border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/20 px-2 py-0.5 rounded uppercase">
                    Calculated Biomechanics Models
                  </span>
                  <h4 className="font-display font-black text-xs text-slate-300 uppercase tracking-wider">
                    Core Physics Blueprints
                  </h4>
                  <div className="space-y-2">
                    {SPORT_TACTICAL_MANUALS[categorySlug].biochemicalFormulas.map((f, i) => (
                      <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[10px] text-sky-400">
                        {f}
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500 italic leading-snug">
                    Telemetry values are computed in real-time tracking from high-speed digital footage.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
