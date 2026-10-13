import React from "react";
import { useParams, Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function TopicHub() {
  const { topic } = useParams<{ topic: string }>();
  const formattedTitle = topic ? topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Topic";
  const canonicalUrl = `https://thesportsroom.online/topic/${topic}`;

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title={`${formattedTitle} News, Tactical Breakdown & Analysis | The Sports Room`}
        description={`All articles, tactical analyses, and telemetry reports regarding ${formattedTitle} on The Sports Room.`}
        canonicalUrl={canonicalUrl}
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← Home</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{formattedTitle} Topic Hub</h1>
      </header>
      <div className="text-slate-300">
        <p>Curated archive of all tactical stories relating to {formattedTitle}.</p>
      </div>
    </div>
  );
}
