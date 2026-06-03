import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Clock, Eye, Share2, Facebook, Twitter, Link as LinkIcon, 
  CheckCircle, MessageSquare, Compass, Send, ShieldAlert, Award
} from 'lucide-react';
import { Post } from '../types';
import { DB } from '../lib/db';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface ArticleDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

// Custom sports Q&A directory mapping to answer direct burning user questions within columns
const CORE_QUESTIONS_ANSWERS: Record<string, { q: string, a: string }> = {
  'spin-renaissance-t20-cricket-analysis': {
    q: 'Why are wrist-spinners rewriting modern T20 powerplay manuals?',
    a: 'Early wickets are the greatest predictor of T20 defense success. Leg-spinners applying upwards of 2400 RPM spin generate dynamic Magnus effect drag. This causes late vertical dipping and lateral drifting that scrambles structural batting setups, reducing reflex reaction windows to under 0.4 seconds.'
  },
  'tactical-extinction-classical-fullbacks-inverted-pivot': {
    q: 'How did classical overlapping fullbacks evolve into central midfield organizers?',
    a: 'To secure structural safety against sudden transition play, elite coaches invert fullbacks into a central double-pivot. This isolates opposing wingers for 1v1 overloads, protects the middle corridor, and creates fluid central passing lines.'
  },
  'ground-effect-physics-modern-formula-1-car': {
    q: 'What makes ground-effect Venturi tunnels fundamentally superior to traditional wings?',
    a: 'Underbody Venturi tunnels generate strategic vacuum pressure to pull the chassis downward. This shifts downforce production away from drag-inducing wings, leaving a clean trailing air column which allows following cars to overtake safely.'
  },
  'the-mechanics-of-court-slides-clay-tennis-court-tactics': {
    q: 'How does sliding revolutionize defensive court coverage on clay surfaces?',
    a: 'Sliding through loose brick elements enables controlled deceleration during active shot execution. Rather than stopping and restarting, players slide through the hit, shaving 1.2 seconds off recovery and positioning setup time.'
  },
  'penalty-corner-drag-flick-mechanics-field-hockey': {
    q: 'Why are drag-flicks nearly impossible for modern field hockey goalkeepers to systematically stop?',
    a: 'The drag-flick is a total-body kinetic whipsaw. Flickers drag the ball behind their stance in a continuous scoop motion. They channel potential force from the ankles up to the wrists, launching the ball at 120 km/h with high launch angles in milliseconds.'
  }
};

export default function ArticleDetail({ slug, onNavigate }: ArticleDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const activePost = DB.getPostBySlug(slug);
    if (activePost) {
      setPost(activePost);
      // Increment views
      DB.incrementViews(activePost.id);

      // Pull related articles
      const allPosts = DB.getPosts();
      const relatedFiltered = allPosts
        .filter(p => p.id !== activePost.id && p.category === activePost.category)
        .slice(0, 3);
      setRelated(relatedFiltered.length > 0 ? relatedFiltered : allPosts.filter(p => p.id !== activePost.id).slice(0, 3));

      // Pull comments simulation from localStorage
      const commentKey = `comments_${activePost.id}`;
      const saved = localStorage.getItem(commentKey);
      if (saved) {
        setComments(JSON.parse(saved));
      } else {
        const dummyComments = [
          { id: 'c1', author: 'Markus Vance', text: 'This mathematical overview of the Venturi tunnels is the best I have ever read in Formula 1 media. Outstanding quality!', date: '2026-06-03' },
          { id: 'c2', author: 'Vikram Singh', text: 'I really agree with the analysis of Rashid Khan’s wrist motion. T20 batting setups are indeed struggling heavily.', date: '2026-06-03' }
        ];
        localStorage.setItem(commentKey, JSON.stringify(dummyComments));
        setComments(dummyComments);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-[#22c55e] mx-auto animate-pulse" />
        <h3 className="font-display font-bold text-lg text-slate-800">Editorial Article Not Found</h3>
        <p className="text-sm text-slate-500">The requested slug does not map to any active article in the FTS local database.</p>
        <button onClick={() => onNavigate('/')} className="bg-[#022c22] text-white font-mono text-[10px] uppercase py-2 px-4 rounded font-bold">Return Home</button>
      </div>
    );
  }

  // Handle Comments Submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: newCommentName.trim(),
      text: newCommentText.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
    setNewCommentName('');
    setNewCommentText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Get active article QA
  const getQuickQA = (post: Post) => {
    if (CORE_QUESTIONS_ANSWERS[post.slug]) {
      return CORE_QUESTIONS_ANSWERS[post.slug];
    }
    return {
      q: `What is the core tactical mystery analyzed in "${post.title}"?`,
      a: post.meta_description || `This investigative column dissects the physical execution and team-level metrics of ${post.category}. Read our manual reporter report below for detailed tactics.`
    };
  };

  const articleQA = getQuickQA(post);

  // Parse Simple Markdown Elements dynamically to guarantee React-19 stability without dynamic unsafe compiles
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let insideTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const nodes: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check for Table elements (| column | column |)
      if (trimmed.startsWith('|')) {
        insideTable = true;
        const cols = trimmed.split('|')
          .map(c => c.trim())
          .filter((c, i, arr) => i > 0 && i < arr.length - 1); // skip outer elements
        
        // Skip separator line e.g., | :--- | :--- |
        if (trimmed.includes(':---') || trimmed.includes('---:')) {
          return;
        }

        if (tableHeaders.length === 0) {
          tableHeaders = cols;
        } else {
          tableRows.push(cols);
        }
        return;
      } else if (insideTable && !trimmed.startsWith('|')) {
        // Table finished, render gathered table structure
        nodes.push(
          <div key={`table-${index}`} className="overflow-x-auto my-6 border border-slate-200 rounded-lg">
            <table className="w-full text-xs md:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-3 font-semibold text-slate-800 uppercase font-mono tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    {row.map((cell, cidx) => {
                      // Check for ** bold inside cell
                      const parts = cell.split('**');
                      return (
                        <td key={cidx} className="p-3 text-slate-705">
                          {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-extrabold text-[#22c55e]">{p}</strong> : p)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        insideTable = false;
        tableHeaders = [];
        tableRows = [];
      }

      if (trimmed === '') return;

      // Render Headings ###
      if (trimmed.startsWith('###')) {
        nodes.push(<h3 key={index} className="font-display font-black text-xl md:text-2xl text-slate-900 mt-8 mb-4 tracking-tight uppercase border-l-4 border-[#22c55e] pl-3">{trimmed.replace('###', '').trim()}</h3>);
      } else if (trimmed.startsWith('####')) {
        nodes.push(<h4 key={index} className="font-sans font-bold text-base md:text-lg text-slate-800 mt-6 mb-3 uppercase tracking-wide">{trimmed.replace('####', '').trim()}</h4>);
      } 
      // Render simple text block with inline styles
      else {
        // Parse inline **bold** words
        const parts = line.split('**');
        nodes.push(
          <p key={index} className="font-sans text-slate-700 text-sm md:text-[15px] leading-relaxed mb-4">
            {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-extrabold text-slate-950 bg-[#f0fdf4] px-1 rounded">{p}</strong> : p)}
          </p>
        );
      }
    });

    return nodes;
  };

  // Breadcrumb schema
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
      "name": post.category,
      "item": `https://fulltimesports.vercel.app/sport/${post.category}`
    },{
      "@type": "ListItem",
      "position": 3,
      "name": post.title,
      "item": `https://fulltimesports.vercel.app/blog/${post.slug}`
    }]
  };

  // Article object schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "image": [
      post.featured_image
    ],
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": [{
        "@type": "Person",
        "name": post.author,
        "jobTitle": "Sports Journalism Desk",
        "url": "https://fulltimesports.vercel.app/authors/fts-desk"
      }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6" id="article-reader-container">
      {/* Schemas */}
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

      {/* Back button */}
      <button 
        onClick={() => onNavigate(`/sport/${post.category}`)}
        className="flex items-center space-x-1 font-mono text-xs font-bold text-slate-500 hover:text-[#22c55e] transition mb-6 uppercase"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to {post.category} coverage</span>
      </button>

      {/* AdSense Top Header space */}
      <AdSensePlaceholder slot="article-top-leaderboard" format="horizontal" />

      {/* Main Grid: Reading Pane vs Rail Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: READER BLOCK */}
        <article className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-6" id="analytical-reader-pane">
          
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#022c22] border border-[#22c55e]/30 text-[#22c55e] font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded">
              {post.category} BREAKDOWN
            </span>
            {post.type === 'blog' && (
              <span className="bg-[#22c55e] text-[#022c22] font-mono text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded">
                ★ SPECIAL OPINION COLUMNIST
              </span>
            )}
            <span className="text-slate-400 font-mono text-xs">
              Published: {new Date(post.created_at).toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'})}
            </span>
          </div>

          {/* Article Large Title */}
          <h1 className="font-display font-black text-2xl md:text-4.5xl text-slate-900 tracking-tight leading-none uppercase">
            {post.title}
          </h1>

          {/* Sub-author card strip */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between font-mono text-xs text-slate-505">
            <div className="flex items-center space-x-2">
              <div className="bg-[#022c22] text-[#22c55e] font-black h-8 w-8 rounded-full flex items-center justify-center text-sm border-2 border-[#22c55e]">
                {post.author[0].toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-900">BY: {post.author.toUpperCase()}</span>
                <span className="block text-[10px] text-slate-400">SENIOR SPORT EDITORIAL BOARD</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>8 min read</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-slate-400" />
                <span>{post.views} views</span>
              </span>
            </div>
          </div>

          {/* Interactive Burning Q&A block fulfilling the main directive */}
          <div className="bg-gradient-to-r from-[#022c22] to-[#01140f] border-l-4 border-[#22c55e] rounded-2xl p-5 md:p-6 text-white shadow-md relative overflow-hidden" id="editorial-resolution-key">
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-0.5 px-2 bg-[#22c55e] text-[#022c22] font-mono text-[9px] font-black uppercase rounded tracking-wider">
                Resolution Desk
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                Summary of the Core Question Answered below
              </span>
            </div>
            <p className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-widest leading-none">THE BURNING QUESTION:</p>
            <h3 className="font-display font-extrabold text-sm md:text-base text-white mt-1 mb-2.5 uppercase leading-snug">
              {articleQA.q}
            </h3>
            <div className="border-t border-emerald-900/50 pt-2.5">
              <p className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-widest leading-none">THE BRIEF DIRECT ANSWER:</p>
              <p className="text-slate-300 text-xs md:text-sm mt-1 leading-relaxed">
                {articleQA.a}
              </p>
            </div>
          </div>

          {/* Cover image area */}
          <div className="w-full h-80 md:h-[420px] rounded-2xl overflow-hidden bg-slate-100 border relative shadow-inner">
            <img 
              referrerPolicy="no-referrer"
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Custom rendered body */}
          <div className="markdown-body prose max-w-none pb-6 space-y-4">
            {renderMarkdown(post.content)}
          </div>

          {/* IN-ARTICLE VIDEO INTEGRATION (YouTube highlights inline matching video_url) */}
          {post.video_url && (
            <div className="bg-[#022c22] p-5 rounded-3xl border border-emerald-950 my-8">
              <h4 className="font-mono text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-3">
                FTS TV • Editorial Video Review Segment
              </h4>
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-emerald-950">
                <iframe 
                  src={`https://www.youtube.com/embed/${post.video_url}?mute=1&controls=1&modestbranding=1`}
                  title="Video review block"
                  className="w-full h-full object-cover"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Dynamic AdSense Inline Placement */}
          <AdSensePlaceholder slot="article-mid-content" format="horizontal" />

          {/* Keyword tags cluster */}
          <div className="pt-6 border-t border-slate-200">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
              SEO COUPLER KEYWORDS
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {post.tags.map((tag, i) => (
                <span key={i} className="bg-slate-50 border border-slate-200 hover:border-[#22c55e] hover:text-[#22c55e] text-slate-700 px-3 py-1 rounded transition duration-155 cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Social share widget row */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-700">PROMOTE INDEPENDENT CODES EDITORIAL:</span>
            
            <div className="flex items-center space-x-2">
              <button className="bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white text-[#1877F2] p-2 rounded transition" title="Share on Facebook">
                <Facebook className="h-4 w-4" />
              </button>
              <button className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2] hover:text-white text-[#1DA1F2] p-2 rounded transition" title="Tweet Card">
                <Twitter className="h-4 w-4" />
              </button>
              
              <button 
                onClick={handleCopyLink}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1 transition"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>{isCopied ? 'COPIED!' : 'COPY URL'}</span>
              </button>
            </div>
          </div>

          {/* Comments simulation (Functional blog interactivity) */}
          <section className="pt-8 border-t border-slate-200" id="comments-section">
            <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight mb-4 flex items-center space-x-1.5">
              <MessageSquare className="h-5 w-5 text-[#22c55e]" />
              <span>Discussion Board ({comments.length})</span>
            </h3>

            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-250/70 rounded-xl space-y-1 text-sm">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-900">{c.author}</span>
                    <span className="text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-slate-700 leading-normal">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment formulate */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-display font-bold text-xs uppercase text-slate-850">Add an Editorial review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Your Name..." 
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="bg-white border rounded p-2 text-xs focus:outline-none w-full"
                />
              </div>
              <textarea 
                required
                rows={3}
                placeholder="Submit your review comment..." 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="bg-white border rounded p-3 text-xs focus:outline-none w-full"
              />
              <button 
                type="submit"
                className="bg-[#022c22] hover:bg-emerald-900 text-white font-mono text-[10px] font-bold py-1.5 px-4 rounded uppercase tracking-wider flex items-center space-x-1 transition"
              >
                <Send className="h-3 w-3" />
                <span>Post opinion</span>
              </button>
            </form>
          </section>

        </article>


        {/* RIGHT COLUMN: RAIL RELATED PANELS */}
        <div className="lg:col-span-4 space-y-8" id="editorial-rail">
          
          {/* Related Columns */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-display font-black text-xs text-slate-990 uppercase tracking-widest border-b pb-2.5 mb-4 flex justify-between items-center">
              <span>Related Columns</span>
              <Award className="h-4 w-4 text-[#22c55e] animate-pulse" />
            </h3>

            <div className="space-y-4">
              {related.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onNavigate(`/blog/${item.slug}`)}
                  className="cursor-pointer group flex items-start space-x-3 pb-3 border-b border-slate-200/60 last:border-0"
                >
                  <img referrerPolicy="no-referrer" src={item.featured_image || ''} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0 bg-slate-150" />
                  <div className="overflow-hidden">
                    <span className="text-[8px] font-mono font-bold text-[#22c55e] uppercase tracking-wider block">
                      {item.category} • {item.author}
                    </span>
                    <h4 className="text-xs font-bold text-slate-805 group-hover:text-[#22c55e] uppercase leading-snug line-clamp-2 mt-0.5 transition">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AdSense vertical sidebar */}
          <AdSensePlaceholder slot="article-sidebar-square" format="rectangle" />

          {/* Quick legal checklist */}
          <div className="bg-[#022c22] text-slate-300 p-5 rounded-2xl border border-emerald-950 text-[10px] leading-relaxed">
            <span className="font-bold text-[#22c55e] block uppercase mb-1">AdSense & Copyright Declaration:</span>
            This sports article constitutes original, manual investigative journalism by our human expert panel. Standard citation rules apply. No automated scraper tools or unauthorized copyrighted imagery used. FTS respects full regulatory policies.
          </div>

        </div>

      </div>

    </div>
  );
}
