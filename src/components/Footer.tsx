import React, { useState } from 'react';
import { Mail, Facebook, Globe, Compass, CheckCircle2 } from 'lucide-react';
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
    "url": "https://thesportsroom.online",
    "logo": "https://images.unsplash.com/photo-1540747737956-378724044282?w=150",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61590649439504",
      "https://www.tiktok.com/@pathan_x_babarian565",
      "https://hanan56.vercel.app"
    ],
    "publishingPrinciples": "https://thesportsroom.online/editorial-standards",
    "correctionPolicy": "https://thesportsroom.online/corrections"
  };

  return (
    <footer className="bg-[#01140f] text-slate-300 border-t border-emerald-950 mt-12" id="global-footer">
      {/* 2. Schema Markup Injection dynamically */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* Main Grid Links & Info */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Logo variant="horizontal" className="mb-3" />
          <p className="text-xs leading-relaxed text-slate-400">
            The Sports Room is a premium sports news platform providing real-time live scores, match breakdowns, player insights, and breaking global sports coverage.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a href="https://www.facebook.com/profile.php?id=61590649439504" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#022c22] border border-emerald-900 text-slate-300 hover:text-[#22c55e] hover:border-[#22c55e] transition flex items-center justify-center gap-1.5 text-xs font-mono font-bold" aria-label="Facebook">
              <Facebook className="h-4 w-4 text-[#22c55e]" />
              <span>Facebook</span>
            </a>
            <a href="https://www.tiktok.com/@pathan_x_babarian565" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#022c22] border border-emerald-900 text-slate-300 hover:text-[#22c55e] hover:border-[#22c55e] transition font-bold text-xs font-mono flex items-center gap-1.5" aria-label="TikTok">
              <span>🎵</span>
              <span>TikTok</span>
            </a>
            <a href="https://hanan56.vercel.app" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#022c22] border border-emerald-900 text-slate-300 hover:text-[#22c55e] hover:border-[#22c55e] transition font-bold text-xs font-mono flex items-center gap-1.5" aria-label="Hanan Irfan">
              <Globe className="h-4 w-4 text-[#22c55e]" />
              <span>Hanan Irfan</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-mono font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">
            Multi-Sport Nodes
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate(`/sport/${c.slug}`)}
                className="text-left text-slate-400 hover:text-[#22c55e] transition font-mono"
              >
                {c.name} Coverage
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">
            Specialist Desks
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <button onClick={() => onNavigate('/')} className="text-slate-400 hover:text-[#22c55e] transition">
                Home Desk
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/live-stream')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] mr-1 animate-pulse"></span>
                Live Telemetry &amp; Scores
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/sports-atlas')} className="text-slate-400 hover:text-[#22c55e] transition">
                Sports Science Glossary &amp; Atlas (100+ Term Index)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/about-us')} className="text-slate-400 hover:text-[#22c55e] transition">
                About The Sports Room
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact-us')} className="text-slate-400 hover:text-[#22c55e] transition">
                Contact &amp; Editorial Desk
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">
            Targeted Regional Desks
          </h4>
          <p className="text-xs leading-relaxed text-slate-400">
            The Sports Room localizes global coverage for primary regions: Pakistan, India, UK, USA, Australia, South Africa, West Indies &amp; Sri Lanka.
          </p>
        </div>
      </div>

      {/* Legal & Copyright bottom bar */}
      <div className="bg-[#01140f] py-6 text-xs border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 gap-4">
          <p>© 2026 The Sports Room. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <button onClick={() => onNavigate('/about-us')} className="hover:text-white transition">About</button>
            <button onClick={() => onNavigate('/contact-us')} className="hover:text-white transition">Contact</button>
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-white transition">Terms of Service</button>
            <button onClick={() => onNavigate('/disclaimer')} className="hover:text-white transition">Disclaimer</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
