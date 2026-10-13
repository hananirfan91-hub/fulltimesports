import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy-loaded pages matching project architecture
const ArticleDetail = lazy(() => import("./pages/ArticleDetail.tsx"));
const SportCategory = lazy(() => import("./pages/SportCategory.tsx"));
const TopicHub = lazy(() => import("./pages/TopicHub.tsx"));
const LiveStream = lazy(() => import("./pages/LiveStream.tsx"));
const RC24ApkDownload = lazy(() => import("./pages/RC24ApkDownload.tsx"));
const AuthorProfile = lazy(() => import("./pages/AuthorProfile.tsx"));
const WhyChooseUs = lazy(() => import("./pages/WhyChooseUs.tsx"));
const WhatIsTheSportsRoom = lazy(() => import("./pages/WhatIsTheSportsRoom.tsx"));
const PlayersList = lazy(() => import("./pages/PlayersList.tsx"));
const PlayerDetail = lazy(() => import("./pages/PlayerDetail.tsx"));
const Glossary = lazy(() => import("./pages/Glossary.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const TrustPages = lazy(() => import("./pages/TrustPages.tsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-[#01140f] flex items-center justify-center text-[#22c55e]">Loading...</div>}>
        <Routes>
          <Route path="/" element={<SportCategory />} />
          <Route path="/blog/:slug" element={<ArticleDetail />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/sport/:category" element={<SportCategory />} />
          <Route path="/topic/:topic" element={<TopicHub />} />
          <Route path="/live-stream" element={<LiveStream />} />
          <Route path="/rc24-apk-download" element={<RC24ApkDownload />} />
          <Route path="/author/:authorSlug" element={<AuthorProfile />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
          <Route path="/what-is-the-sports-room" element={<WhatIsTheSportsRoom />} />
          <Route path="/players" element={<PlayersList />} />
          <Route path="/player/:slug" element={<PlayerDetail />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Trust and Policy Routes */}
          <Route path="/about" element={<TrustPages type="about" />} />
          <Route path="/about-us" element={<TrustPages type="about" />} />
          <Route path="/contact" element={<TrustPages type="contact" />} />
          <Route path="/contact-us" element={<TrustPages type="contact" />} />
          <Route path="/privacy-policy" element={<TrustPages type="privacy" />} />
          <Route path="/terms" element={<TrustPages type="terms" />} />
          <Route path="/terms-of-service" element={<TrustPages type="terms" />} />
          <Route path="/disclaimer" element={<TrustPages type="disclaimer" />} />
          <Route path="/google-policies" element={<TrustPages type="policies" />} />
          <Route path="/sports-atlas" element={<TrustPages type="atlas" />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
