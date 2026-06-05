import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SportCategory from './pages/SportCategory';
import ArticleDetail from './pages/ArticleDetail';
import RankingsFixtures from './pages/RankingsFixtures';
import TrustPages from './pages/TrustPages';
import AdminDashboard from './components/AdminDashboard';
import Glossary from './pages/Glossary';
import SEOMetaTags from './components/SEOMetaTags';
import { DB } from './lib/db';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [activeGeo, setActiveGeo] = useState('global'); // 'global' | 'IN' | 'UK' | 'US' | 'AU'

  // Initialize DB Seeds on load
  useEffect(() => {
    DB.init();
    
    // Process initial path of the loaded window
    const path = window.location.pathname;
    if (path && path !== '/') {
      setCurrentPath(path);
    }

    // Set popstate listener to support browser Back and Forward buttons cleanly
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Professional Navigation router syncing Histroy records immediately
  const handleNavigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render proper elements based on matched clean path strings
  const renderActiveView = () => {
    // 1. Home Node
    if (currentPath === '/' || currentPath === '') {
      return <Home onNavigate={handleNavigate} activeGeo={activeGeo} />;
    }

    // 2. Rankings Panel Public link
    if (currentPath === '/rankings') {
      return <RankingsFixtures initialTab="rankings" onNavigate={handleNavigate} />;
    }

    // 3. Match calendars schedule link
    if (currentPath === '/fixtures') {
      return <RankingsFixtures initialTab="fixtures" onNavigate={handleNavigate} />;
    }

    // 4. Admin CMS portal dashboard
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }

    // 5. Dynamic Sport taxonomy pages (/sport/:slug)
    if (currentPath.startsWith('/sport/')) {
      const slug = currentPath.replace('/sport/', '');
      return (
        <SportCategory 
          categorySlug={slug} 
          onNavigate={handleNavigate} 
          activeGeo={activeGeo} 
          onChangeGeo={setActiveGeo}
        />
      );
    }

    // 6. Detailed core article reading node (/blog/:slug-hash)
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return <ArticleDetail slug={slug} onNavigate={handleNavigate} />;
    }

    // 7. Sports Science Atlas & Glossary index
    if (currentPath === '/sports-atlas' || currentPath === '/glossary') {
      return <Glossary onNavigate={handleNavigate} />;
    }

    // 8. Trust compliance pages
    if (currentPath === '/google-policies' || currentPath === '/editorial-standards') {
      return <TrustPages page="google-policies" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/about-us') {
      return <TrustPages page="about-us" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/contact-us') {
      return <TrustPages page="contact-us" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/privacy-policy') {
      return <TrustPages page="privacy-policy" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/terms') {
      return <TrustPages page="terms" onNavigate={handleNavigate} />;
    }
    if (currentPath === '/disclaimer') {
      return <TrustPages page="disclaimer" onNavigate={handleNavigate} />;
    }

    // Stable 404 fallback page matching FTS brand
    return (
      <div className="max-w-xl mx-auto my-24 bg-white border rounded-2xl p-8 text-center space-y-4 shadow-sm" id="fallback-404-pane">
        <span className="font-mono text-xs font-bold text-[#e11d48] uppercase tracking-widest block bg-rose-50/50 py-1 rounded w-fit mx-auto px-3">
          Error 404 Node Lost
        </span>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-slate-900">Desk Page Lost In Orbit</h2>
        <p className="text-xs text-slate-500 leading-normal">
          The sports registry or sitemap node you followed is no longer active inside our secondary database wrappers. Go back to Home to restore connection.
        </p>
        <button 
          onClick={() => handleNavigate('/')}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono font-bold text-[10px] py-2.5 px-6 rounded uppercase tracking-wider transition"
        >
          Return to match center
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between" id="applet-frame">
      {/* Automated dynamic meta and JSON-LD seo generator */}
      <SEOMetaTags currentPath={currentPath} />

      {/* Dynamic Navbar */}
      <Navbar 
        currentPath={currentPath} 
        onNavigate={handleNavigate} 
        activeGeo={activeGeo} 
        onChangeGeo={setActiveGeo} 
      />

      {/* Main viewport frame */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Structured Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
