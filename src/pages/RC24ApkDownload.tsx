import React from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function RC24ApkDownload() {
  const canonicalUrl = "https://thesportsroom.online/rc24-apk-download";

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title="Real Cricket 24 (RC24) APK Download & Setup Guide | The Sports Room"
        description="Download and setup guide for Real Cricket 24 (RC24) APK with verified gameplay features, patch notes, and compatibility checklist."
        canonicalUrl={canonicalUrl}
      />
      <header className="mb-8 border-b border-slate-800 pb-4">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-2 block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Real Cricket 24 (RC24) Download & Tactical Review
        </h1>
      </header>
      <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
        <p>
          Real Cricket 24 is one of the premier mobile cricket simulations with realistic ball physics, dynamic commentary, and authentic stadium atmospheres.
        </p>
        <p>
          Learn more about shot mechanics, bowling variations, and career mode strategies in our detailed guides.
        </p>
      </div>
    </div>
  );
}
