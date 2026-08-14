import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SEOMetaTags from './components/SEOMetaTags';
import { ChatBot } from './components/ChatBot';
import { DB } from './lib/db';
import DailyQuizModal from './components/DailyQuizModal';
import LeaderboardModal from './components/LeaderboardModal';

// Lazy load non-homepage route chunks to optimize initial JS payload and eliminate unused JS on mobile FCP/LCP
const SportCategory = lazy(() => import('./pages/SportCategory'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const TopicHub = lazy(() => import('./pages/TopicHub'));
const TrustPages = lazy(() => import('./pages/TrustPages'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Glossary = lazy(() => import('./pages/Glossary'));
const LiveStream = lazy(() => import('./pages/LiveStream'));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs'));
const WhatIsTheSportsRoom = lazy(() => import('./pages/WhatIsTheSportsRoom'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-xl w-3/4"></div>
      <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-200 rounded-xl"></div>
        <div className="h-40 bg-slate-200 rounded-xl"></div>
        <div className="h-40 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [activeGeo, setActiveGeo] = useState('global'); // 'global' | 'IN' | 'UK' | 'US' | 'AU'
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  // Initialize DB Seeds on load
  useEffect(() => {
    DB.init();
    
    // Process initial path of the loaded window
    const path = window.location.pathname;
    if (path && path !== '/') {
      setCurrentPath(path);
    }

    // Check query params for opening quiz or leaderboard directly
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('quiz') === 'open') {
      setIsQuizModalOpen(true);
    }
    if (urlParams.get('leaderboard') === 'open') {
      setIsLeaderboardModalOpen(true);
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
    if (path === '/quiz') {
      setIsQuizModalOpen(true);
      return;
    }
    if (path === '/leaderboard') {
      setIsLeaderboardModalOpen(true);
      return;
    }

    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render proper elements based on matched clean path strings
  const renderActiveView = () => {
    // 1. Home Node
    if (currentPath === '/' || currentPath === '') {
      return (
        <Home 
          onNavigate={handleNavigate} 
          activeGeo={activeGeo} 
          onOpenQuiz={() => setIsQuizModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
        />
      );
    }

    // 2. Rankings Panel Public link (seamless redirect)
    if (currentPath === '/rankings') {
      setTimeout(() => handleNavigate('/'), 0);
      return null;
    }

    // 3. Match calendars schedule link (seamless redirect)
    if (currentPath === '/fixtures') {
      setTimeout(() => handleNavigate('/'), 0);
      return null;
    }

    // 4. Admin CMS portal dashboard
    if (currentPath === '/admin') {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }

    // Live Stream Module Route (/live-stream)
    if (currentPath === '/live-stream' || currentPath.startsWith('/live-stream')) {
      const urlParams = new URLSearchParams(window.location.search);
      const streamId = urlParams.get('id') || undefined;
      return <LiveStream onNavigate={handleNavigate} streamId={streamId} />;
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

    // 6. Detailed core article reading node (/blog/:slug-hash or /article/:slug-hash)
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return <ArticleDetail slug={slug} onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith('/article/')) {
      const slug = currentPath.replace('/article/', '');
      return <ArticleDetail slug={slug} onNavigate={handleNavigate} />;
    }

    // Dynamic Editorial Topic Hubs (/topic/:topicSlug)
    if (currentPath.startsWith('/topic/')) {
      const topicSlug = currentPath.replace('/topic/', '');
      return <TopicHub topicSlug={topicSlug} onNavigate={handleNavigate} />;
    }

    if (currentPath === '/knowledge-hub') {
      return <TopicHub topicSlug="knowledge-hub" onNavigate={handleNavigate} />;
    }

    if (currentPath === '/cricket-world-cup-2027') {
      return <TopicHub topicSlug="cricket-world-cup-2027" onNavigate={handleNavigate} />;
    }

    // 7. Sports Science Atlas & Glossary index
    if (currentPath === '/sports-atlas' || currentPath === '/glossary') {
      return <Glossary onNavigate={handleNavigate} />;
    }

    // E-E-A-T & Authoritative Identity Pages
    if (currentPath.startsWith('/author/')) {
      return <AuthorProfile onNavigate={handleNavigate} />;
    }
    if (currentPath === '/why-choose-us' || currentPath === '/why-choose-the-sports-room') {
      return <WhyChooseUs onNavigate={handleNavigate} />;
    }
    if (currentPath === '/what-is-the-sports-room') {
      return <WhatIsTheSportsRoom onNavigate={handleNavigate} />;
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

    // Stable 404 fallback page matching TSR brand
    return (
      <div className="max-w-xl mx-auto my-24 bg-[#022c22] border border-[#22c55e]/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl" id="fallback-404-pane">
        <span className="font-mono text-xs font-bold text-[#22c55e] uppercase tracking-widest block bg-[#01140f] py-1 rounded w-fit mx-auto px-3 border border-[#22c55e]/20">
          Error 404 Node Lost
        </span>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-white">Desk Page Lost In Orbit</h2>
        <p className="text-xs text-slate-300 leading-normal">
          The sports registry or sitemap node you followed is no longer active inside our secondary database wrappers. Go back to Home to restore connection.
        </p>
        <button 
          onClick={() => handleNavigate('/')}
          className="bg-[#22c55e] text-slate-950 font-mono font-bold text-[10px] py-2.5 px-6 rounded-lg uppercase tracking-wider transition hover:bg-[#34d399]"
        >
          Return to match center
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 font-sans flex flex-col justify-between" id="applet-frame">
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
        <Suspense fallback={<PageSkeleton />}>
          {renderActiveView()}
        </Suspense>
      </main>

      {/* AI Voice Assistant ChatBot */}
      <ChatBot onNavigate={handleNavigate} />

      {/* Structured Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Interactive Modals for Fan Engagement */}
      <DailyQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onNavigateLeaderboard={() => {
          setIsQuizModalOpen(false);
          setIsLeaderboardModalOpen(true);
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        onOpenQuiz={() => {
          setIsLeaderboardModalOpen(false);
          setIsQuizModalOpen(true);
        }}
      />
    </div>
  );
}
