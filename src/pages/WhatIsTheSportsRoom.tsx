import React from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function WhatIsTheSportsRoom() {
  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title="What Is The Sports Room? | Mission, Editorial Values & Standards"
        description="Discover the core mission and sports coverage principles of The Sports Room media platform."
        canonicalUrl="https://thesportsroom.online/what-is-the-sports-room"
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← Home</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">What Is The Sports Room?</h1>
      </header>
      <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
        <p>A sports media platform dedicated to tactical journalism, telemetry, and live match coverage.</p>
      </div>
    </div>
  );
}
