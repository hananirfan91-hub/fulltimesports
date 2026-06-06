import React, { useState } from 'react';
import { Mail, Facebook, Twitter, Instagram, Youtube, Compass, CheckCircle2 } from 'lucide-react';
import { DB } from '../lib/db';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const categories = DB.getCategories();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      DB.insertSubscriber(email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  // Schema Markup generation as per Technical SEO prompt guidelines
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "The Sports Room",
    "alternateName": "TSR News",
    "url": "https://fulltimesports.vercel.app",
    "logo": "https://images.unsplash.com/photo-1540747737956-378724044282?w=150",
    "sameAs": [
      "https://www.facebook.com/HananIrfan001",
      "https://twitter.com/fulltimesports",
      "https://instagram.com/fulltimesports"
    ],
    "publishingPrinciples": "https://fulltimesports.vercel.app/editorial-standards",
    "correctionPolicy": "https://fulltimesports.vercel.app/corrections"
  };

  return (
    <footer className="bg-[#022c22] text-slate-350 mt-12 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] border-t-4 border-[#22c55e]" id="global-footer">
      {/* 2. Schema Markup Injection dynamically */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* Top Newsletter & social section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-b border-emerald-950">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight uppercase">
              SUBSCRIBE TO THE <span className="text-[#22c55e]">TSR DISPATCH</span>
            </h3>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              Get original expert opinions, mathematical tactical breakdowns, Formula 1 telemetry details, and cricket insider updates delivered straight to your inbox weekly.
            </p>
          </div>
          <div className="w-full">
            {subscribed ? (
              <div className="bg-emerald-950 border border-emerald-500/30 text-[#22c55e] p-3 rounded flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-xs font-semibold">Subscription successful! Check your spam folder.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-700" />
                  <input
                    type="email"
                    required
                    placeholder="Enter editorial email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#01140f] border border-emerald-950 rounded px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-[#22c55e] placeholder-slate-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-extrabold text-xs px-6 py-3 rounded uppercase tracking-wider font-mono transition duration-150 shrink-0"
                >
                  Join Dispatch
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Grid Links & GEO SEO Focus */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          {/* Replaced Text to the beautiful brand logo */}
          <Logo variant="horizontal" className="mb-4" />
          <p className="text-xs leading-relaxed text-slate-400">
            The Sports Room is a premier global sports media platform providing original human investigations into the kinetic mechanics, statistics, and micro-tactics of elite athletes. No automated scraping, no cheap machine translations—pure editorial craftsmanship.
          </p>
          <p className="text-xs leading-relaxed text-slate-400 mt-4 border-t border-emerald-900/60 pt-3">
            <strong>HQ Address:</strong> Babar Colony, Rahim Yar Khan, Pakistan<br />
            <strong>Official Phone:</strong> +92 3106359235<br />
            <strong>Editorial:</strong> hananirfan91@gmail.com
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="https://www.facebook.com/HananIrfan001" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#22c55e] transition" title="TSR Pakistan Facebook Page"><Facebook className="h-4 w-4" /></a>
            <a href="https://x.com/hananirfan91" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#22c55e] transition" title="TSR Pakistan Twitter/X Page"><Twitter className="h-4 w-4" /></a>
            <a href="https://instagram.com/fts_pakistan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#22c55e] transition" title="TSR Pakistan Instagram Feed"><Instagram className="h-4 w-4" /></a>
            <a href="https://youtube.com/@fulltimesportspakistan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#22c55e] transition" title="TSR Pakistan YouTube Channel"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4 border-b border-emerald-950 pb-2">
            Multi-Sport Nodes
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate(`/sport/${c.slug}`)}
                className="text-left text-slate-400 hover:text-[#22c55e] transition"
              >
                {c.name} Coverage
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4 border-b border-emerald-950 pb-2">
            Specialist Desks
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/sports-atlas')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1">
                <Compass className="h-3 w-3 text-[#22c55e]" />
                <span className="font-semibold text-emerald-400">Sports Science Glossary &amp; Atlas (100+ Term Index)</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/about-us')} className="text-slate-400 hover:text-[#22c55e] transition">
                Original Human Opinion Columnists
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact-us')} className="text-slate-400 hover:text-[#22c55e] transition">
                Submit an Editorial Press Release
              </button>
            </li>
          </ul>
        </div>

        {/* Dynamic GEO SEO Highlight Text blocks */}
        <div>
          <h4 className="font-display font-semibold text-white uppercase tracking-wider text-sm mb-4 border-b border-emerald-950 pb-2">
            Targeted Regional Desks
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-400">
            The Sports Room localizes global coverage for primary markets. Our sub-continental nodes cover <strong className="text-slate-200">India & Pakistan</strong> (live test cricket, Lahore derby), <strong className="text-slate-200">United Kingdom</strong> (EPL tactical breakdowns, telemetry mechanics), <strong className="text-slate-200">USA</strong> (NBA court statistics drafts), and <strong className="text-slate-200">Australia</strong> (A-league, Sheffield, Big Bash dynamics). Filter content dynamically to read region-specific analysis.
          </p>
        </div>
      </div>

      {/* SEO Footer Text Block */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 border-t border-emerald-950 text-[10px] text-slate-500 leading-relaxed">
        <p className="mb-2">
          <strong>SEO Meta Reference:</strong> The Sports Room carries specialized thematic networks covering: cricket news, live cricket analysis, football news, match strategies, English Premier League analytics, NBA news, stats, stands, Formula 1 race results, technical aerodynamic telemetry standings, Esports tournaments, CS2 Counter Strike updates, Grand Slam court slide physics, and penalty corner biomechanics.
        </p>
        <p>
          Editorial compliance ensures: original editorial reviews, no crawled feeds, human-style expert analysis. Content provided on this portal is updated manually by editors within the CMS to ensure elite sports journalism. All rights reserved.
        </p>
      </div>

      {/* Small Legal bottom strip */}
      <div className="bg-slate-950 py-6 text-xs border-t border-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
          <p>© 2026 The Sports Room Network LLC. All editorial opinions are fully licensed.</p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 font-medium text-slate-400">
            <button onClick={() => onNavigate('/sports-atlas')} className="hover:text-[#22c55e] text-[#22c55e] transition font-bold">Sports Science Atlas</button>
            <button onClick={() => onNavigate('/about-us')} className="hover:text-[#22c55e] transition">About Us</button>
            <button onClick={() => onNavigate('/contact-us')} className="hover:text-[#22c55e] transition">Contact Us</button>
            <button onClick={() => onNavigate('/google-policies')} className="hover:text-[#22c55e] text-[#22c55e] transition font-bold">Google Policies &amp; SEO</button>
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-[#22c55e] transition">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-[#22c55e] transition">Terms of Service</button>
            <button onClick={() => onNavigate('/disclaimer')} className="hover:text-[#22c55e] transition">Disclaimer</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
