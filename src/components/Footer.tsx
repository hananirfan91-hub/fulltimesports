import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Mail, MapPin, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { DB } from '../lib/db';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const categories = DB.getCategories();

  // Schema Markup generation as per Technical SEO prompt guidelines
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "The Sports Room",
    "alternateName": "TSR News",
    "url": "https://thesportsroom.online",
    "logo": "https://images.unsplash.com/photo-1540747737956-378724044282?w=150",
    "email": "thesportsroom01@gmail.com",
    "sameAs": [
      "https://x.com/TSRVerse?s=20",
      "https://www.linkedin.com/company/tsr-official",
      "https://www.youtube.com/@thesportsroom01",
      "https://www.facebook.com/profile.php?id=61592459862127",
      "https://www.tiktok.com/@pathan_x_babarian565",
      "https://www.pinterest.com/thesportsroomonline"
    ],
    "publishingPrinciples": "https://thesportsroom.online/editorial-standards",
    "correctionPolicy": "https://thesportsroom.online/corrections"
  };

  const socialLinks = [
    {
      name: 'X (Twitter)',
      url: 'https://x.com/TSRVerse?s=20',
      icon: <Twitter className="h-4 w-4 text-[#1DA1F2]" />,
      badge: '@TSRVerse',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/tsr-official',
      icon: <Linkedin className="h-4 w-4 text-[#0A66C2]" />,
      badge: 'The Sports Room',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@thesportsroom01',
      icon: <Youtube className="h-4 w-4 text-red-500" />,
      badge: '@thesportsroom01',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61592459862127',
      icon: <Facebook className="h-4 w-4 text-[#1877F2]" />,
      badge: 'Official Page',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@pathan_x_babarian565',
      icon: <span className="text-sm leading-none">🎵</span>,
      badge: '@pathan_x_babarian565',
    },
    {
      name: 'Pinterest',
      url: 'https://www.pinterest.com/thesportsroomonline',
      icon: <span className="text-sm leading-none">📌</span>,
      badge: 'thesportsroomonline',
    },
    {
      name: 'Editorial Desk',
      url: 'mailto:thesportsroom01@gmail.com',
      icon: <Mail className="h-4 w-4 text-[#22c55e]" />,
      badge: 'thesportsroom01@gmail.com',
      isMail: true,
    },
  ];

  return (
    <footer className="bg-[#01140f] text-slate-300 border-t border-emerald-950 mt-16" id="global-footer">
      {/* Schema Markup Injection */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* Top Banner: Official Channels & Social Hub */}
      <div className="border-b border-emerald-950/80 bg-[#000d0a] py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#22c55e] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Official Media Nodes &amp; Social Desks
              </span>
              <h3 className="font-display font-bold text-white text-base md:text-lg mt-0.5">
                Connect with The Sports Room Editorial Desk
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Follow our official verified broadcast handles for real-time sports updates, tactical analysis, and editorial columns.
            </p>
          </div>

          {/* Social Links Grid with Clean Spacing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target={item.isMail ? undefined : "_blank"}
                rel={item.isMail ? undefined : "noopener noreferrer"}
                className="group bg-[#011d16] hover:bg-[#022c22] border border-emerald-900/80 hover:border-[#22c55e]/60 rounded-xl p-2.5 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-[#01140f] border border-emerald-900/50 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  {!item.isMail && (
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#22c55e] transition" />
                  )}
                </div>
                <div>
                  <span className="block font-mono text-xs font-bold text-slate-200 group-hover:text-[#22c55e] transition truncate">
                    {item.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono truncate">
                    {item.badge}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Links & Info */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Brand & Editorial Identity Column */}
        <div className="lg:col-span-4 space-y-4">
          <Logo variant="horizontal" className="mb-2" />
          <p className="text-xs leading-relaxed text-slate-400">
            The Sports Room is a premier sports journalism platform providing real-time telemetry, in-depth match breakdowns, player insights, and global sports news co-founded by Hanan Irfan &amp; Urwah Farooq.
          </p>

          <div className="p-3.5 rounded-xl bg-[#001c15] border border-emerald-900/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="font-bold">Editorial HQ:</span>
              <span className="text-slate-300">Rahim Yar Khan, PK</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-300">
              <Mail className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="font-bold">Direct Desk:</span>
              <a href="mailto:thesportsroom01@gmail.com" className="text-slate-300 hover:text-[#22c55e] transition underline underline-offset-2">
                thesportsroom01@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Multi-Sport Nodes */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-mono font-bold text-white text-xs uppercase tracking-wider border-b border-emerald-900 pb-2 flex items-center justify-between">
            <span>Multi-Sport Nodes</span>
            <span className="text-[10px] text-[#22c55e] font-normal">Active Index</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate(`/sport/${c.slug}`)}
                className="text-left text-slate-400 hover:text-[#22c55e] transition font-mono flex items-center space-x-1.5 group py-0.5"
              >
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Specialist Desks */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-mono font-bold text-white text-xs uppercase tracking-wider border-b border-emerald-900 pb-2">
            Specialist Desks &amp; Index
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <button onClick={() => onNavigate('/')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>Home Page</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/live-stream')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0 animate-pulse"></span>
                <span className="text-emerald-300">Live Telemetry &amp; Scores</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/sports-atlas')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>Sports Glossary &amp; Atlas</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/what-is-the-sports-room')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group font-medium text-emerald-400">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>What is The Sports Room?</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/why-choose-us')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group font-medium text-emerald-400">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>Why Choose TSR?</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/about-us')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>Co-Founders &amp; Leadership</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact-us')} className="text-slate-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group">
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>Contact &amp; Editorial Desk</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('tsr_open_install_prompt'))} 
                className="text-emerald-400 hover:text-[#22c55e] transition flex items-center space-x-1.5 group font-bold"
              >
                <ChevronRight className="w-3 h-3 text-emerald-800 group-hover:text-[#22c55e] transition shrink-0" />
                <span>📲 Install Web App (PWA)</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Regional Desks & Standards */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-mono font-bold text-white text-xs uppercase tracking-wider border-b border-emerald-900 pb-2">
            Targeted Desks
          </h4>
          <p className="text-xs leading-relaxed text-slate-400">
            Localized global sports coverage across primary international desks: <strong className="text-slate-200">Pakistan, India, UK, USA, Australia, South Africa &amp; Sri Lanka</strong>.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#22c55e] bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-900">
              <ShieldCheck className="w-3 h-3" />
              EEAT Verified Journalism
            </span>
          </div>
        </div>
      </div>

      {/* Legal & Copyright bottom bar */}
      <div className="bg-[#000a08] py-5 text-xs border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 gap-4">
          <p className="font-mono text-xs text-slate-400 text-center md:text-left">
            © 2026 The Sports Room. All rights reserved. Co-founded by Hanan Irfan &amp; Urwah Farooq.
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-mono text-xs text-slate-400">
            <button onClick={() => onNavigate('/about-us')} className="hover:text-[#22c55e] transition">About</button>
            <button onClick={() => onNavigate('/contact-us')} className="hover:text-[#22c55e] transition">Contact</button>
            <button onClick={() => onNavigate('/editorial-policy')} className="hover:text-[#22c55e] transition">Editorial Standards</button>
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-[#22c55e] transition">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-[#22c55e] transition">Terms of Service</button>
            <button onClick={() => onNavigate('/disclaimer')} className="hover:text-[#22c55e] transition">Disclaimer</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
