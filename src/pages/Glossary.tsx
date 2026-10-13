import React from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function Glossary() {
  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title="Sports Glossary & Tactical Terminology | The Sports Room"
        description="Comprehensive dictionary of sports terms, tactical concepts, telemetry jargon, and rules across global sports."
        canonicalUrl="https://thesportsroom.online/glossary"
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← Home</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Sports Tactical Glossary</h1>
      </header>
      <div className="prose prose-invert max-w-none text-slate-300">
        <p>Definitions and mechanical breakdowns of modern sports tactics.</p>
      </div>
    </div>
  );
}
