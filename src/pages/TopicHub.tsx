import React, { useState, useEffect } from 'react';
import { 
  Trophy, Compass, Share2, ArrowRight, Eye, Check, AlertCircle, Sparkles, Filter, Layers, UserCheck, Shield
} from 'lucide-react';
import { Post } from '../types';
import { DB } from '../lib/db';
import { findEntityBySlug, ENTITIES_REGISTRY, detectEntitiesInText, EntityDefinition } from '../lib/entityRegistry';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface TopicHubProps {
  topicSlug: string;
  onNavigate: (path: string) => void;
}

export default function TopicHub({ topicSlug, onNavigate }: TopicHubProps) {
  const [entity, setEntity] = useState<EntityDefinition | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'opinion'>('all');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadTopicData = () => {
      // 1. Find matching entity
      const found = findEntityBySlug(topicSlug);
      
      let targetEntity: EntityDefinition;
      if (found) {
        targetEntity = found;
      } else {
        // Fallback for unlisted entity slugs e.g. "pakistan-cricket"
        const formattedTitle = topicSlug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        targetEntity = {
          name: formattedTitle,
          type: topicSlug.includes('cricket') ? 'team' : 'competition',
          category: 'cricket',
          slug: topicSlug,
          description: `Dedicated editorial hub for ${formattedTitle} news, original analysis, and tactical match insights.`
        };
      }

      setEntity(targetEntity);

      // Set document title & description
      document.title = `${targetEntity.name} Hub & Analysis | The Sports Room`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', targetEntity.description || `Read latest articles, player analysis, and match updates for ${targetEntity.name} on The Sports Room.`);
      }

      // 2. Fetch all matching posts from DB
      const allPosts = DB.getPosts();
      const matchedPosts = allPosts.filter(post => {
        const textToSearch = `${post.title} ${post.category} ${post.content} ${(post.tags || []).join(' ')}`.toLowerCase();
        
        // Match by entity name, slug, or aliases
        const nameMatch = textToSearch.includes(targetEntity.name.toLowerCase());
        const slugMatch = textToSearch.includes(targetEntity.slug.replace(/-/g, ' '));
        let aliasMatch = false;

        if (targetEntity.aliases) {
          for (const alias of targetEntity.aliases) {
            if (alias.length >= 3 && textToSearch.includes(alias.toLowerCase())) {
              aliasMatch = true;
              break;
            }
          }
        }

        return nameMatch || slugMatch || aliasMatch;
      });

      setPosts(matchedPosts);
    };

    loadTopicData();

    window.addEventListener('fts_db_sync', loadTopicData);
    return () => {
      window.removeEventListener('fts_db_sync', loadTopicData);
    };
  }, [topicSlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'news') return post.type === 'news';
    if (activeTab === 'opinion') return post.type === 'blog';
    return true;
  });

  if (!entity) return null;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://thesportsroom.online/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": entity.category.toUpperCase(),
        "item": `https://thesportsroom.online/sport/${entity.category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": entity.name,
        "item": `https://thesportsroom.online/topic/${entity.slug}`
      }
    ]
  };

  // Get related entity subtopics in same category
  const subtopicEntities = ENTITIES_REGISTRY.filter(
    e => e.category === entity.category && e.slug !== entity.slug
  ).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8" id="topic-hub-container">
      {/* Schema Injection */}
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      {/* Dynamic Breadcrumbs Bar */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-slate-500">
        <button onClick={() => onNavigate('/')} className="hover:text-[#22c55e] transition">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate(`/sport/${entity.category}`)} className="hover:text-[#22c55e] transition uppercase">{entity.category}</button>
        <span>/</span>
        <span className="text-[#22c55e] font-bold">{entity.name}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="bg-[#022c22] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] text-white p-8 md:p-12 rounded-3xl border-b-4 border-[#22c55e] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow overflow-hidden relative">
        <div className="space-y-3 max-w-2xl z-10">
          <div className="flex items-center space-x-2 font-mono text-[10px] font-bold tracking-widest text-[#22c55e] uppercase">
            <Layers className="h-4 w-4" />
            <span>EDITORIAL TOPIC HUB • {entity.type.toUpperCase()} ARCHIVE</span>
          </div>

          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-none uppercase">
            {entity.name} <span className="text-[#22c55e]">DIRECTORY</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {entity.description || `Comprehensive coverage, match analysis, tactical breakdowns, and original reporting on ${entity.name}. Updated automatically with every published article.`}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded">
              Category: {entity.category.toUpperCase()}
            </span>
            <span className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded">
              Total Articles: {posts.length}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2 z-10">
          <button 
            onClick={handleCopyLink}
            className="bg-emerald-950/40 hover:bg-emerald-950 text-white font-mono text-[11px] font-bold tracking-wider px-4 py-2.5 rounded border border-emerald-800 flex items-center justify-center space-x-1.5 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{isCopied ? 'COPIED!' : 'SHARE HUB'}</span>
          </button>
          
          <button 
            onClick={() => onNavigate(`/sport/${entity.category}`)}
            className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-extrabold font-mono text-[11px] tracking-wider px-4 py-2.5 rounded flex items-center justify-center space-x-1 transition"
          >
            <span>All {entity.category}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Related Topic Hub Pills Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
          EXPLORE RELATED TOPICS IN {entity.category.toUpperCase()}
        </span>
        <div className="flex flex-wrap gap-2">
          {subtopicEntities.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(`/topic/${sub.slug}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                sub.slug === entity.slug
                  ? 'bg-[#022c22] text-[#22c55e] border-[#22c55e]'
                  : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-950'
              }`}
            >
              #{sub.name}
            </button>
          ))}
        </div>
      </div>

      <AdSensePlaceholder slot="topic-top-banner" format="horizontal" />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ARTICLES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-[#f0fdf4] border border-[#22c55e]/15 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex bg-emerald-950/10 p-1 rounded-md text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'all' ? 'bg-[#022c22] text-white' : 'text-[#052e16]'}`}
              >
                All Stories ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'news' ? 'bg-[#022c22] text-white' : 'text-[#052e16]'}`}
              >
                News
              </button>
              <button
                onClick={() => setActiveTab('opinion')}
                className={`px-3 py-1.5 rounded transition uppercase ${activeTab === 'opinion' ? 'bg-[#022c22] text-white' : 'text-[#052e16]'}`}
              >
                Analysis & Opinions
              </button>
            </div>
            
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              Sorted by Freshness
            </span>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <h3 className="font-display font-bold text-slate-800 text-base uppercase">
                No Stories Cataloged Under {entity.name} Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Articles tagged or featuring {entity.name} will automatically appear here as soon as our desk publishes them.
              </p>
              <button
                onClick={() => onNavigate('/')}
                className="bg-[#022c22] text-white font-mono text-xs font-bold px-4 py-2 rounded uppercase"
              >
                Explore Homepage
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 cursor-pointer group shadow-2xs hover:shadow transition duration-200"
                >
                  <div className="w-full sm:w-52 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img 
                      referrerPolicy="no-referrer" 
                      src={post.featured_image} 
                      alt={post.image_alt || `${post.title} - ${entity.name} Topic Hub on The Sports Room`} 
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500" 
                      loading="lazy"
                      decoding="async"
                    />
                    {post.type === 'blog' && (
                      <span className="absolute top-2 left-2 bg-[#022c22] text-[#22c55e] text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-emerald-850">
                        OPINION
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-[#22c55e] font-bold uppercase">{post.category}</span>
                      <span>•</span>
                      <span>By: {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                    </div>

                    <h2 className="font-display font-black text-lg md:text-xl text-slate-900 leading-tight uppercase group-hover:text-[#22c55e] transition line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {post.meta_description || post.content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').slice(0, 140) + '...'}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.views} views</span>
                      </span>
                      <span className="text-[#22c55e] font-bold flex items-center space-x-1 group-hover:translate-x-1 transition duration-150">
                        <span>Read full article</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: HUB SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-display font-black text-xs text-[#022c22] uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              <span>Topic Authority Card</span>
              <Shield className="h-4 w-4 text-[#22c55e]" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every story published on {entity.name} undergoes human journalistic oversight, fact verification, and structural internal linking.
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Verified Editorial Hub</span>
              <p className="text-[11px] text-emerald-900 leading-snug">
                The Sports Room maintains independent, original commentary without regurgitating external wire press releases.
              </p>
            </div>
          </div>

          <AdSensePlaceholder slot="topic-sidebar" format="rectangle" />
        </div>

      </div>

    </div>
  );
}
