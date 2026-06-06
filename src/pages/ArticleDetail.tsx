import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Clock, Eye, Share2, Facebook, Twitter, Link as LinkIcon, 
  CheckCircle, MessageSquare, Compass, Send, ShieldAlert, Award
} from 'lucide-react';
import { Post } from '../types';
import { DB } from '../lib/db';
import { SEO_KEYWORDS_REGISTRY } from '../lib/seoKeywords';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

const alert = (msg: string) => {
  try {
    window.alert(msg);
  } catch (e) {
    console.warn("Alert blocked by browser sandbox:", msg);
  }
};

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
      const clonedPost = { ...activePost };
      
      const keywords = SEO_KEYWORDS_REGISTRY[clonedPost.slug];
      if (keywords && !clonedPost.content.includes("Editorial SEO Research Matrix")) {
        let tableMarkdown = "\n\n### 📈 Editorial SEO Research Matrix: Target Audience & Low-Competition Search Intent\n\n";
        tableMarkdown += "To maintain elite search visibility under the **PEO Analytical Standard**, we conducted dedicated automated keyword diagnostics. Below are **50 low-competition search query phrases** (Search Difficulty under 20%, Moderate monthly volume) integrated natively into the physical biomechanical and tactical text structure of this article:\n\n";
        tableMarkdown += "| # | Low-Competition Keyword String | Search Volume | Keyword Difficulty (KD) | Intent Typology |\n";
        tableMarkdown += "|---|---|---|---|---|\n";
        keywords.forEach((kw, i) => {
          tableMarkdown += `| ${i + 1} | **${kw.keyword}** | ${kw.volume} | ${kw.kd} | ${kw.intent} |\n`;
        });
        clonedPost.content += tableMarkdown;
      }

      setPost(clonedPost);
      
      // Update browser/tab document title and meta properties for SEO
      document.title = `${activePost.title} | The Sports Room`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', activePost.meta_description || `Detail analysis on ${activePost.title}. Dissecting raw sports biometrics, physical speed, tactical mechanics, and strategies.`);
      }

      // Increment views
      DB.incrementViews(activePost.id);

      // Pull related articles
      const allPosts = DB.getPosts();
      const relatedFiltered = allPosts
        .filter(p => p.id !== activePost.id && p.category === activePost.category)
        .slice(0, 3);
      setRelated(relatedFiltered.length > 0 ? relatedFiltered : allPosts.filter(p => p.id !== activePost.id).slice(0, 3));

      // Pull comments simulation from localStorage securely
      const commentKey = `comments_${activePost.id}`;
      const dummyComments = [
        { id: 'c1', author: 'Markus Vance', text: 'This mathematical overview of the Venturi tunnels is the best I have ever read in Formula 1 media. Outstanding quality!', date: '2026-06-03' },
        { id: 'c2', author: 'Vikram Singh', text: 'I really agree with the analysis of Rashid Khan’s wrist motion. T20 batting setups are indeed struggling heavily.', date: '2026-06-03' }
      ];
      try {
        const saved = localStorage.getItem(commentKey);
        if (saved) {
          setComments(JSON.parse(saved));
        } else {
          localStorage.setItem(commentKey, JSON.stringify(dummyComments));
          setComments(dummyComments);
        }
      } catch (e) {
        console.warn("Failed to access localStorage comments:", e);
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
        <p className="text-sm text-slate-500">The requested slug does not map to any active article in The Sports Room local database.</p>
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
    try {
      localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("localStorage comment write blocked:", e);
    }
    setNewCommentName('');
    setNewCommentText('');
  };

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (e) {
      console.warn("Clipboard copy blocked:", e);
      // Fallback: alert URL
      alert(`Article URL: ${window.location.href}`);
    }
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

  const parseInlineElements = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    
    let match;
    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      const matchStr = match[0];
      const matchIndex = match.index;
      
      if (matchIndex > currentIndex) {
        elements.push(text.substring(currentIndex, matchIndex));
      }
      
      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        const boldText = matchStr.slice(2, -2);
        elements.push(
          <strong key={`b-${keyIdx++}`} className="font-extrabold text-slate-950 bg-emerald-50/70 px-1 rounded border-b border-emerald-100">
            {boldText}
          </strong>
        );
      } else if (matchStr.startsWith('[') && matchStr.includes('](')) {
        const closingBracket = matchStr.indexOf('](');
        const linkText = matchStr.slice(1, closingBracket);
        const linkUrl = matchStr.slice(closingBracket + 2, -1);
        
        elements.push(
          <button
            key={`a-${keyIdx++}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(linkUrl);
            }}
            className="text-[#22c55e] hover:text-emerald-700 font-bold underline transition inline-block mx-0.5"
          >
            {linkText}
          </button>
        );
      }
      
      currentIndex = regex.lastIndex;
    }
    
    if (currentIndex < text.length) {
      elements.push(text.substring(currentIndex));
    }
    
    return elements.length > 0 ? elements : [text];
  };

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
                      return (
                        <td key={cidx} className="p-3 text-slate-700">
                          {parseInlineElements(cell)}
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

      // Handle custom block inline image parsed at any position
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const url = imgMatch[2];
        nodes.push(
          <div key={`img-${index}`} className="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm">
            <img src={url} alt={alt} referrerPolicy="no-referrer" className="w-full max-h-[450px] object-cover rounded-xl" />
            {alt && <p className="text-center text-xs text-slate-400 font-mono mt-2 uppercase tracking-wide">▲ {alt}</p>}
          </div>
        );
        return;
      }

      // Handle custom block inline video parsed at any position
      const ytMatch = trimmed.match(/^@\[youtube\]\((.*?)\)/) || trimmed.match(/^\[video\]\((.*?)\)/);
      if (ytMatch) {
        let ytId = ytMatch[1];
        if (ytId.includes("youtube.com") || ytId.includes("youtu.be")) {
          try {
            const urlObj = new URL(ytId);
            if (ytId.includes("youtu.be")) {
              ytId = urlObj.pathname.substring(1);
            } else {
              ytId = urlObj.searchParams.get("v") || ytId;
            }
          } catch (_) {}
        }
        nodes.push(
          <div key={`video-${index}`} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 my-6 shadow-lg">
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe 
                src={`https://www.youtube.com/embed/${ytId}?mute=1&controls=1`}
                title="Video Player"
                className="w-full h-full object-cover"
                allowFullScreen
              />
            </div>
          </div>
        );
        return;
      }

      // Render Headings
      if (trimmed.startsWith('# ')) {
        nodes.push(<h1 key={index} className="font-display font-black text-2xl md:text-3xl text-slate-900 mt-8 mb-4 tracking-tight uppercase border-l-4 border-[#22c55e] pl-3">{trimmed.replace('# ', '').trim()}</h1>);
      } else if (trimmed.startsWith('## ')) {
        nodes.push(<h2 key={index} className="font-display font-black text-xl md:text-2xl text-slate-900 mt-8 mb-4 tracking-tight uppercase border-l-4 border-[#22c55e] pl-3">{trimmed.replace('## ', '').trim()}</h2>);
      } else if (trimmed.startsWith('### ')) {
        nodes.push(<h3 key={index} className="font-display font-black text-lg md:text-xl text-slate-900 mt-6 mb-3 tracking-tight uppercase border-l-4 border-[#22c55e] pl-3">{trimmed.replace('### ', '').trim()}</h3>);
      } else if (trimmed.startsWith('#### ')) {
        nodes.push(<h4 key={index} className="font-sans font-bold text-base md:text-lg text-slate-800 mt-5 mb-2.5 uppercase tracking-wide">{trimmed.replace('#### ', '').trim()}</h4>);
      } 
      // Render dynamic bullet and numbered lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.slice(2);
        nodes.push(
          <li key={index} className="ml-5 list-disc text-slate-700 text-sm md:text-[15px] leading-relaxed mb-1.5 font-sans">
            {parseInlineElements(itemContent)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        if (match) {
          const num = match[1];
          const itemContent = match[2];
          nodes.push(
            <li key={index} className="ml-5 list-decimal text-slate-700 text-sm md:text-[15px] leading-relaxed mb-1.5 font-sans">
              {parseInlineElements(itemContent)}
            </li>
          );
        }
      }
      // Render standard paragraph text blocks
      else {
        nodes.push(
          <p key={index} className="font-sans text-slate-700 text-sm md:text-[15px] leading-relaxed mb-4">
            {parseInlineElements(line)}
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

          {/* Section 2 Branding Header */}
          <h2 className="font-display font-black text-xs text-[#22c55e] uppercase tracking-widest mt-1">
            The Sports Room High-Precision Editorial Verdict
          </h2>

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
            {post.content.trim().startsWith('<') ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} className="space-y-4 text-slate-700 text-sm md:text-[15px] leading-relaxed" />
            ) : (
              renderMarkdown(post.content)
            )}
          </div>

          {/* IN-ARTICLE VIDEO INTEGRATION (YouTube highlights inline matching video_url) */}
          {post.video_url && (
            <div className="bg-[#022c22] p-5 rounded-3xl border border-emerald-950 my-8">
              <h4 className="font-mono text-xs font-bold text-[#22c55e] uppercase tracking-wider mb-3">
                TSR TV • Editorial Video Review Segment
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
            <span className="text-xs font-bold text-slate-700">VISIT EDITORIAL FB & TWITTER CHANNELS:</span>
            
            <div className="flex items-center space-x-2">
              <a 
                href="https://www.facebook.com/HananIrfan001"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2]/10 hover:bg-[#1877F2] hover:text-white text-[#1877F2] p-2 rounded transition inline-flex items-center justify-center cursor-pointer" 
                title="Visit our Facebook Page"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://x.com/hananirfan91"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2] hover:text-white text-[#1DA1F2] p-2 rounded transition inline-flex items-center justify-center cursor-pointer" 
                title="Visit our Twitter/X Page"
              >
                <Twitter className="h-4 w-4" />
              </a>
              
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

          {/* Dynamic SEO Payload Desk Panel if available */}
          {post.seo_payload && (
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 mt-12 border border-slate-800 relative overflow-hidden" id="seo-editorial-workspace">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-4 font-mono text-[100px] font-black leading-none text-teal-400 select-none">
                SEO
              </div>
              
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="p-0.5 px-2 bg-teal-500/10 text-teal-400 font-mono text-[9px] font-bold uppercase tracking-wider rounded border border-teal-500/20">
                  CMS Editor Desk
                </span>
                <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                  SEO Audit & Publishing Helper
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                This draft article was composed with high search intent optimization. As a CMS editor, you can check keywords, copy metadata, verify schemas, and review draft layout notes before publishing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
                {/* Keywords cluster */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block mb-1">Focus Keyword</span>
                    <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-white border border-slate-800 flex justify-between items-center group">
                      <span>{post.seo_payload.focus_keyword || post.category}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(post.seo_payload.focus_keyword || post.category);
                          alert("Focus keyword copied!");
                        }}
                        className="text-[9px] text-teal-400 hover:text-white uppercase font-bold py-1 px-2 bg-teal-500/10 hover:bg-teal-500/20 rounded border border-teal-500/20 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Secondary Targets</span>
                    <div className="flex flex-wrap gap-1.55">
                      {(post.seo_payload.secondary_keywords || []).map((word: string, i: number) => (
                        <span key={i} className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] font-mono font-semibold px-2.5 py-1 rounded">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">CTR Meta Description</span>
                    <p className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                      {post.seo_payload.meta_description}
                    </p>
                  </div>
                </div>

                {/* Linking and Notes */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block mb-1">Internal links (10 Suggestions)</span>
                    <div className="max-h-40 overflow-y-auto bg-slate-950 rounded-lg p-2.5 border border-slate-800 space-y-2">
                      {(post.seo_payload.internal_link_recommendations || []).map((link: any, i: number) => (
                        <div key={i} className="text-[10px] text-slate-300 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                          <span className="font-bold text-white block">Link to: {link.article_title}</span>
                          <span className="text-slate-500 block">Anchor: "<span className="text-teal-400 italic font-mono">{link.anchor_text}</span>"</span>
                          <span className="text-[9px] text-slate-450 block mt-0.5">{link.reason_for_linking}</span>
                        </div>
                      ))}
                      {(!post.seo_payload.internal_link_recommendations || post.seo_payload.internal_link_recommendations.length === 0) && (
                        <div className="text-[10px] text-slate-500 italic p-2 text-center">
                          Auto contextual link generation standby
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Media Placeholders Included</span>
                    <div className="flex flex-wrap gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {["[FEATURED_IMAGE_PLACEHOLDER]", "[MATCH_IMAGE_PLACEHOLDER]", "[PLAYER_IMAGE_PLACEHOLDER]", "[VIDEO_EMBED_PLACEHOLDER]"].map((ph, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible structured structured schemas list */}
              <div className="pt-6 space-y-4">
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
                  JSON-LD Structural Business Schemas (Google Grounding Ready)
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Article", "NewsArticle", "FAQPage", "Breadcrumb"].map((schemaType) => {
                    const payloadKey = schemaType === "Article" ? "article_schema" :
                                       schemaType === "NewsArticle" ? "news_article_schema" :
                                       schemaType === "FAQPage" ? "faq_schema" : "breadcrumb_schema";
                    const schemaObject = post.seo_payload[payloadKey] || {
                      "@context": "https://schema.org",
                      "@type": schemaType,
                      "headline": post.title
                    };

                    return (
                      <button
                        key={schemaType}
                        onClick={() => {
                          const codeText = JSON.stringify(schemaObject, null, 2);
                          navigator.clipboard.writeText(codeText);
                          alert(`${schemaType} schema copied to clipboard!`);
                        }}
                        className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white p-3 py-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-center flex flex-col justify-center items-center gap-1 transition cursor-pointer"
                      >
                        <span className="font-bold text-white block">{schemaType}</span>
                        <span className="text-[8px] text-teal-400 uppercase tracking-widest font-bold">Copy Markup</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">Editorial Validation Controls</span>
                  <div className="space-y-1.5">
                    {(post.seo_payload.editor_notes || [
                      "Please edit raw placeholders with fitting graphics or direct YouTube embed keys before publishing.",
                      "Ensure to verify current standings data if match schedules have concluded.",
                      "Re-verify context formatting aligns with the standard SEO slugs."
                    ]).map((note: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-350">
                        <span className="text-amber-500 font-bold font-mono mt-0.5">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <span className="font-bold text-[#22c55e] block uppercase mb-1">Copyright & Editorial Standards:</span>
            This sports article constitutes original, manual investigative journalism by our human expert panel. Standard citation rules apply. No automated scraper tools or unauthorized copyrighted imagery used. FTS respects full regulatory policies.
          </div>

        </div>

      </div>

    </div>
  );
}
