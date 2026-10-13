import React from "react";
import { useParams, Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

export default function AuthorProfile() {
  const { authorSlug } = useParams<{ authorSlug: string }>();
  const name = authorSlug ? authorSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Hanan Irfan";
  const canonicalUrl = `https://thesportsroom.online/author/${authorSlug || "hanan-irfan"}`;

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title={`${name} - Sports Analyst & Author | The Sports Room`}
        description={`Author profile and published sports analyses by ${name} on The Sports Room.`}
        canonicalUrl={canonicalUrl}
      />
      <header className="mb-8 border-b border-slate-800 pb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#022c22] border-2 border-[#22c55e] flex items-center justify-center text-2xl font-bold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">{name}</h1>
          <p className="text-sm text-[#22c55e] mt-1">Lead Tactical Sports Analyst & Editor</p>
        </div>
      </header>
      <div className="text-slate-300 leading-relaxed">
        <p>
          Specializing in telemetry data, football tactical systems, cricket pitch analytics, and motorsport engineering breakdowns.
        </p>
      </div>
    </div>
  );
}
