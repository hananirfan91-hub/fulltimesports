import React from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function WhyChooseUs() {
  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title="Why Choose The Sports Room | Authentic & Fact-Checked Sports Journalism"
        description="Learn why millions of readers rely on The Sports Room for fact-checked sports coverage, tactical breakdowns, and real-time scores."
        canonicalUrl="https://thesportsroom.online/why-choose-us"
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">← Home</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Why Choose The Sports Room</h1>
      </header>
      <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
        <p>100% human-authored analysis, verified against official sports governing bodies.</p>
      </div>
    </div>
  );
}
