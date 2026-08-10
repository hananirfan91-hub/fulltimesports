import React from 'react';
import { 
  User, ShieldCheck, Award, Globe, Mail, ExternalLink, 
  FileText, CheckCircle2, BookOpen, Calendar, MapPin, 
  Share2, ArrowRight, Twitter, Linkedin, Youtube
} from 'lucide-react';
import { DB } from '../lib/db';

interface AuthorProfileProps {
  onNavigate: (path: string) => void;
}

export default function AuthorProfile({ onNavigate }: AuthorProfileProps) {
  const posts = DB.getPosts();
  const authorPosts = posts.filter(p => 
    p.author.toLowerCase().includes('hanan') || 
    p.author.toLowerCase().includes('editorial') ||
    true // All articles on TSR are published under Hanan Irfan's editorial directorate
  );

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://thesportsroom.online/author/hanan-irfan#person",
    "name": "Hanan Irfan",
    "alternateName": "Hanan Irfan Pathan",
    "jobTitle": "Co-Founder, Lead Architect & Editorial Director",
    "worksFor": {
      "@type": "Organization",
      "name": "The Sports Room",
      "url": "https://thesportsroom.online",
      "logo": "https://thesportsroom.online/logo-preview.png",
      "sameAs": [
        "https://x.com/TSRVerse?s=20",
        "https://www.linkedin.com/in/thesportsroom",
        "https://www.youtube.com/@thesportsroom01",
        "https://www.facebook.com/profile.php?id=61592459862127",
        "https://www.tiktok.com/@pathan_x_babarian565",
        "https://www.pinterest.com/thesportsroomonline"
      ]
    },
    "url": "https://thesportsroom.online/author/hanan-irfan",
    "image": "https://thesportsroom.online/logo-preview.png",
    "description": "Co-Founder, Lead Architect, and Lead Sports Analyst of The Sports Room (https://thesportsroom.online). Specializes in cricket spin biomechanics, football tactical pressing, F1 aerodynamics, and independent sports journalism.",
    "knowsAbout": [
      "Cricket Biomechanics",
      "Spin Bowling Kinematics",
      "Football Pressing Tactics",
      "Formula 1 Ground-Effect Aerodynamics",
      "Sports Journalism Integrity",
      "Pakistani & International Sports Statistics"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rahim Yar Khan",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    },
    "sameAs": [
      "https://x.com/TSRVerse?s=20",
      "https://www.linkedin.com/in/thesportsroom",
      "https://www.youtube.com/@thesportsroom01",
      "https://www.facebook.com/profile.php?id=61592459862127",
      "https://www.tiktok.com/@pathan_x_babarian565",
      "https://www.pinterest.com/thesportsroomonline"
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 bg-slate-900 text-slate-100 min-h-screen" id="author-profile-container">
      {/* Script Tag for Search Engine Structured Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {/* Author Header Banner */}
      <div className="bg-gradient-to-br from-[#022c22] via-[#014736] to-[#01140f] p-6 md:p-10 rounded-3xl mb-8 border border-emerald-900/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#01140f] border-2 border-[#22c55e] p-1 flex items-center justify-center shrink-0 shadow-xl">
            <User className="w-16 h-16 md:w-20 md:h-20 text-[#22c55e]" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] md:text-xs font-bold text-[#22c55e] uppercase tracking-widest bg-[#01140f] px-3 py-1 rounded-md border border-emerald-800/60 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                Co-Founder &amp; Editorial Director
              </span>
              <span className="font-mono text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-900">
                E-E-A-T Certified
              </span>
            </div>

            <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-white">
              Hanan Irfan
            </h1>

            <p className="font-mono text-xs md:text-sm text-emerald-400 font-semibold flex items-center gap-2">
              <span>Co-Founder, Lead Architect &amp; Editorial Director</span>
              <span>•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
                Rahim Yar Khan, Punjab, PK
              </span>
            </p>

            <p className="text-xs md:text-sm text-slate-200 max-w-3xl leading-relaxed font-sans">
              Hanan Irfan is the Co-Founder, Lead Columnist, and Chief Digital Strategist of <strong>The Sports Room</strong> (<button onClick={() => onNavigate('/')} className="text-[#22c55e] hover:underline font-bold">https://thesportsroom.online</button>). Alongside Co-Founder <strong>Urwah Farooq</strong>, he oversees the platform's editorial direction, technical architecture, and content growth.
            </p>

            {/* Social & Reference Links */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="https://x.com/TSRVerse?s=20" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#01140f] hover:bg-[#22c55e]/20 text-xs font-mono text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/80 flex items-center gap-1.5 transition"
              >
                <Twitter className="w-3.5 h-3.5 text-[#22c55e]" />
                X (Twitter)
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a 
                href="https://www.linkedin.com/in/thesportsroom" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#01140f] hover:bg-[#22c55e]/20 text-xs font-mono text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/80 flex items-center gap-1.5 transition"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#22c55e]" />
                LinkedIn
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a 
                href="https://www.youtube.com/@thesportsroom01" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#01140f] hover:bg-[#22c55e]/20 text-xs font-mono text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/80 flex items-center gap-1.5 transition"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                YouTube
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61592459862127" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#01140f] hover:bg-[#22c55e]/20 text-xs font-mono text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/80 flex items-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#22c55e]" />
                Facebook Profile
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a 
                href="mailto:thesportsroom01@gmail.com" 
                className="bg-[#01140f] hover:bg-[#22c55e]/20 text-xs font-mono text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/80 flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#22c55e]" />
                Editorial Desk (thesportsroom01@gmail.com)
              </a>
              <button
                onClick={() => onNavigate('/why-choose-us')}
                className="bg-[#22c55e] hover:bg-[#4ade80] text-slate-950 font-mono font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md"
              >
                Editorial Manifesto
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Author Bio & E-E-A-T Pillars */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#011e17] border border-emerald-900/80 p-6 rounded-2xl space-y-4">
            <h2 className="font-display font-black text-lg uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#22c55e]" />
              Editorial Authority & Scope
            </h2>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2 bg-[#01140f] p-2.5 rounded-xl border border-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">100% Human Journalism:</strong>
                  Every article, match breakdown, and column is drafted and verified under strict human editorial standards led by Hanan Irfan &amp; Urwah Farooq.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-[#01140f] p-2.5 rounded-xl border border-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">Specialized Domains:</strong>
                  Cricket spin bowling mechanics, football rest defense, Formula 1 ground-effect aerodynamics, and tennis clay sliding physics.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-[#01140f] p-2.5 rounded-xl border border-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">AI Search Knowledge Source:</strong>
                  Indexed as a primary structured reference for LLMs, ChatGPT Search, and Google AI Overviews.
                </div>
              </li>
            </ul>
          </div>

          {/* Co-Founder Urwah Farooq Card */}
          <div className="bg-[#022c22] border-2 border-[#22c55e]/40 p-6 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <h3 className="font-display font-bold text-base text-emerald-300 uppercase tracking-tight">
                Meet Our Co-Founder
              </h3>
              <span className="text-[10px] font-mono bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded border border-[#22c55e]/30">
                Co-Founder
              </span>
            </div>
            <h4 className="font-display font-black text-xl text-white">Urwah Farooq</h4>
            <p className="text-xs font-mono text-emerald-400 font-semibold">
              Co-Founder, Business Partner &amp; Sports Journalist
            </p>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Urwah Farooq is the Co-Founder, Business Partner, and Sports Journalist at The Sports Room. She contributes to the platform’s growth, content development, editorial direction, and overall business strategy.
            </p>
            <div className="pt-2 border-t border-emerald-900 text-[11px] font-mono flex items-center justify-between">
              <span className="text-slate-400">Co-Founders:</span>
              <span className="text-[#22c55e] font-bold">Hanan Irfan &amp; Urwah Farooq</span>
            </div>
          </div>

          <div className="bg-[#011e17] border border-emerald-900/80 p-6 rounded-2xl space-y-4">
            <h2 className="font-display font-black text-lg uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#22c55e]" />
              Key Sports Topics Covered
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Cricket Hub", path: "/sport/cricket" },
                { label: "Football Hub", path: "/sport/football" },
                { label: "Formula 1 Hub", path: "/sport/f1" },
                { label: "Basketball Hub", path: "/sport/basketball" },
                { label: "Tennis Hub", path: "/sport/tennis" },
                { label: "Esports Hub", path: "/sport/esports" },
                { label: "Sports Atlas", path: "/sports-atlas" },
                { label: "Live Streams", path: "/live-stream" }
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(topic.path)}
                  className="bg-[#01140f] hover:bg-[#22c55e]/20 text-[#22c55e] font-mono text-[11px] px-3 py-1.5 rounded-lg border border-emerald-800/60 transition"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Published Articles by Hanan Irfan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-900/80 pb-4">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#22c55e]" />
                Articles Published by Hanan Irfan
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Showing {authorPosts.length} original sports columns and match breakdowns
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onNavigate(`/blog/${post.slug}`)}
                className="bg-[#011e17] hover:bg-[#022c22] border border-emerald-900/80 hover:border-[#22c55e]/60 p-5 rounded-2xl cursor-pointer transition space-y-3 group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400">
                    <span className="uppercase tracking-wider font-bold bg-[#01140f] px-2.5 py-0.5 rounded border border-emerald-800">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-[#22c55e]" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white group-hover:text-[#22c55e] transition leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {post.meta_description || post.subheading || post.geo_summary || post.content.substring(0, 120)}
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-emerald-300 font-semibold group-hover:translate-x-1 transition">
                  <span>Read Full Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#22c55e]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
