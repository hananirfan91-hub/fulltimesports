import React from "react";
import { Link } from "react-router-dom";
import SEOMetaTags from "../components/SEOMetaTags.tsx";

interface TrustPagesProps {
  type: "about" | "contact" | "privacy" | "terms" | "disclaimer" | "policies" | "atlas";
}

export default function TrustPages({ type }: TrustPagesProps) {
  const configs: Record<string, { title: string; heading: string; canonical: string; content: string }> = {
    about: {
      title: "About Us | The Sports Room",
      heading: "About The Sports Room",
      canonical: "https://thesportsroom.online/about",
      content: "The Sports Room is an independent sports journalism publication focused on deep tactical breakdowns, match analyses, telemetry stats, and global sports coverage."
    },
    contact: {
      title: "Contact Us | The Sports Room",
      heading: "Contact Editorial & Support",
      canonical: "https://thesportsroom.online/contact",
      content: "Have news tips, feedback, or business inquiries? Contact us at editorial@thesportsroom.online."
    },
    privacy: {
      title: "Privacy Policy | The Sports Room",
      heading: "Privacy Policy",
      canonical: "https://thesportsroom.online/privacy-policy",
      content: "This Privacy Policy describes how The Sports Room collects, uses, and safeguards personal information when you visit our website."
    },
    terms: {
      title: "Terms of Service | The Sports Room",
      heading: "Terms of Service",
      canonical: "https://thesportsroom.online/terms",
      content: "By using The Sports Room, you agree to comply with our Terms of Service. All editorial content is protected under international copyright law."
    },
    disclaimer: {
      title: "Disclaimer | The Sports Room",
      heading: "Editorial & Legal Disclaimer",
      canonical: "https://thesportsroom.online/disclaimer",
      content: "All content provided on The Sports Room is for informational and educational purposes. Sports team logos and trademarks remain the property of their respective owners."
    },
    policies: {
      title: "Google Publisher Policies & Standards | The Sports Room",
      heading: "Publishing Standards & Policies",
      canonical: "https://thesportsroom.online/google-policies",
      content: "We adhere strictly to Google Publisher Policies, ensuring high-quality, authentic journalism, verified facts, and transparent sourcing."
    },
    atlas: {
      title: "Sports Atlas | Global Sports Directory | The Sports Room",
      heading: "Sports Atlas",
      canonical: "https://thesportsroom.online/sports-atlas",
      content: "Comprehensive directory of sporting events, arenas, clubs, and international federations."
    }
  };

  const current = configs[type] || configs.about;

  return (
    <div className="min-h-screen bg-[#01140f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEOMetaTags
        title={current.title}
        description={current.content}
        canonicalUrl={current.canonical}
      />
      <header className="mb-8 border-b border-slate-800 pb-6">
        <Link to="/" className="text-sm font-semibold text-[#22c55e] hover:underline mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{current.heading}</h1>
      </header>
      <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
        <p>{current.content}</p>
      </div>
    </div>
  );
}
