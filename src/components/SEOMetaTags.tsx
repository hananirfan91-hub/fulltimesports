import React, { useEffect } from 'react';
import { DB } from '../lib/db';

// 100+ high-performance sports, telemetry, biomechanics, and regional Pakistani keywords
export const GLOBAL_SEO_KEYWORDS = [
  "Full Time Sports Pakistan",
  "pakistan coverage of all major sports",
  "FTS BROADCAST NETWORK",
  "EXCLUSIVE VIDEO INTERVIEWS & BREAKDOWNS",
  "sports telemetry reviews",
  "physical strategies",
  "cricket spin biomechanics",
  "Babar Azam cover drive mechanics",
  "Shaheen Afridi wrist position",
  "Pakistan Super League telemetry",
  "PCB cricket tactical plans",
  "inverted central pivots football",
  "Premier League tactical reviews",
  "ground-effect aerodynamics F1",
  "Venturi tunnels racing mechanics",
  "clay tennis court slide friction",
  "penalty corner drag flick velocity",
  "FIH Pro league hockey strategy",
  "mid-range jumpers advanced stats",
  "sub-millisecond polling rate esports",
  "topspin volleyball jump serve",
  "Bernoulli effect volleyball physics",
  "Pakistan sports atlas",
  "athletic tactical handbook",
  "human sports journalism Pakistan",
  "Pakistan athletic science directory",
  "sport biochemistry parameters Pakistan",
  "FTS match analytics portal",
  "live telemetry overlays",
  "cricket biomechanics Pakistan",
  "football coaching adjustments PSL",
  "F1 pneumatic cornering forces",
  "Peshawar Zalmi team telemetry",
  "Lahore Qalandars bowling stats",
  "Karachi Kings match reviews",
  "Islamabad United high pressure games",
  "Pakistan hockey renaissance",
  "national sports science database",
  "sports glossary Pakistan",
  "Magnus effect volleyball curves",
  "aerodynamics in motorsport",
  "kinetic chain hockey flicks",
  "restricted area basketball drives",
  "input to display latency gaming",
  "sub-150ms trigger esports aiming",
  "rest defense dominance inverted fullbacks",
  "Magnus effect drag coefficient spin",
  "loose brick dust tennis slides",
  "FTS live broadcast telemetry",
  "coaching strategies Pakistan national team",
  "Quetta Gladiators performance review",
  "Multan Sultans analytics center",
  "Pakistan hockey federation training",
  "Aisam ul Haq tennis slide biomechanics",
  "Arshad Nadeem javelin throw mechanics",
  "Pakistani athletic physical endurance",
  "local sports clubs Lahore",
  "Rawalpindi stadium pitch analysis",
  "Gaddafi Stadium pitch telemetry",
  "National Stadium Karachi turf friction",
  "Pakistan football federation grassroots",
  "Velaspeed sports analysis",
  "computational football tactics",
  "F1 Venturi floor suction models",
  "Wimbledon grass courts bounce dynamics",
  "ATP slide recovery strategies",
  "FIH goalie response latency",
  "NBA perimeter shooting optimization",
  "esports reaction time optimization",
  "volleyball float serve ball turbulence",
  "high contrast sports layout",
  "monochrome slate theme FTS",
  "sports telemetry tracker",
  "Pakistani athletes training schedules",
  "Khyber Pakhtunkhwa hockey tournaments",
  "Sindh sports association reviews",
  "Balochistan sports development analytics",
  "Gilgit Baltistan high altitude sports training",
  "FTS tactical board",
  "football passing network maps",
  "cricket wagon wheel analytics",
  "FTS sports atlas index",
  "AdSense sports websites approval keys",
  "high performance sports Pakistan",
  "FTS sports glossary list",
  "Pakistan national sports telemetry",
  "cricket seam mechanics",
  "kookaburra ball swing physics",
  "duke ball trajectory analysis",
  "reverse swing thermodynamic factors",
  "ball speed tracking systems",
  "pitch radar guns Pakistan",
  "football high pressing schemas",
  "gegenpressing tactical blueprints",
  "Zonal marking versus man marking",
  "FTS sports news original reporting",
  "Non-scraped human-authored sports journalism",
  "Pakistan athletics news live",
  "FTS live match tracker",
  "Sports biomechanics encyclopedia"
];

interface SEOMetaTagsProps {
  currentPath: string;
}

export default function SEOMetaTags({ currentPath }: SEOMetaTagsProps) {
  useEffect(() => {
    const origin = window.location.origin || 'https://fulltimesportspakistan.com';
    const canonicalUrl = `${origin}${currentPath}`;
    
    let title = "Full Time Sports Pakistan - Live Coverage of All Major Sports, Telemetry & Tactical Reviews";
    let description = "Full Time Sports Pakistan (FTS) is the leading digital reporting network for professional athletic telemetry, football tactical breakdowns, cricket biomechanics, and PSL/international match schedule boards.";
    let keywords = GLOBAL_SEO_KEYWORDS.slice(0, 30).join(", ");
    let pageType = "website";
    let ogImage = `${origin}/logo-preview.png`;
    let ldJsonData: any = null;

    // A. Detect Routing Contexts
    if (currentPath === '/' || currentPath === '') {
      // Home context
      title = "Full Time Sports Pakistan - Live Coverage of All Major Sports, Telemetry & Biomechanics";
      description = "Welcome to Full Time Sports Pakistan (FTS). Stream dynamic athletic telemetry, cricket spinning trajectory reviews, football passing networks, and national athletic science data.";
      keywords = GLOBAL_SEO_KEYWORDS.join(", ");
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": "Full Time Sports Pakistan",
        "alternateName": "FTS Broadcast Network",
        "description": "Full-scale coverage of all major sports in Pakistan focusing on tactical analytics, biomechanical telemetry reviews, and match calendars.",
        "url": origin,
        "logo": `${origin}/logo-preview.png`,
        "sameAs": [
          "https://www.facebook.com/HananIrfan001",
          "https://twitter.com/fts_pakistan"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lahore",
          "addressRegion": "Punjab",
          "addressCountry": "PK"
        }
      };
    } else if (currentPath.startsWith('/sport/')) {
      // Category index
      const categorySlug = currentPath.replace('/sport/', '');
      const categories = DB.getCategories();
      const matchedCat = categories.find(c => c.slug === categorySlug);
      
      if (matchedCat) {
        title = `${matchedCat.name} Tactical Telemetry & Coverage - Full Time Sports Pakistan`;
        description = `Discover detailed ${matchedCat.name} reports, scientific biomechanical analysis, standings tables, live schedule updates, and tactical blueprints for Pakistan and global leagues.`;
        
        // Filter keywords specific to this category helper
        const categoryKeywords = GLOBAL_SEO_KEYWORDS.filter(k => 
          k.toLowerCase().includes(categorySlug.replace('-1', '').split('-')[0]) || 
          k.toLowerCase().includes(matchedCat.name.toLowerCase().split(' ')[0])
        );
        keywords = [...categoryKeywords, ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
        pageType = "series";
        
        ldJsonData = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${matchedCat.name} Journal Index`,
          "description": matchedCat.description,
          "url": canonicalUrl,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": matchedCat.name,
                "item": canonicalUrl
              }
            ]
          }
        };
      }
    } else if (currentPath.startsWith('/blog/')) {
      // Detailed article page
      const articleSlug = currentPath.replace('/blog/', '');
      const posts = DB.getPosts();
      const matchedPost = posts.find(p => p.slug === articleSlug);
      
      if (matchedPost) {
        title = `${matchedPost.title} - Full Time Sports Pakistan`;
        description = matchedPost.meta_description || matchedPost.content.replace(/[#*`]/g, '').slice(0, 160) + "...";
        keywords = [...matchedPost.tags, ...GLOBAL_SEO_KEYWORDS.slice(0, 10)].join(", ");
        pageType = "article";
        ogImage = matchedPost.featured_image;

        ldJsonData = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": matchedPost.title,
          "image": [matchedPost.featured_image],
          "datePublished": matchedPost.created_at,
          "dateModified": matchedPost.created_at,
          "author": [{
            "@type": "Person",
            "name": matchedPost.author,
            "jobTitle": "Chief Tactical Strategist FTS"
          }],
          "publisher": {
            "@type": "Organization",
            "name": "Full Time Sports Pakistan",
            "logo": {
              "@type": "ImageObject",
              "url": `${origin}/logo-preview.png`
            }
          },
          "description": description,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        };
      }
    } else if (currentPath === '/sports-atlas' || currentPath === '/glossary') {
      title = "Sports Science glossary & Atlas - Full Time Sports Pakistan";
      description = "Biomechanical indexes, strategic definitions, ball velocity drag models, and territorial parameters compiled by the FTS research desk.";
      keywords = ["Sports glossary", "sport science database", "cricket telemetry atlas", "FTS terminology INDEX", ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "name": "Sports Science Telemetry Glossary & Atlas",
        "description": "Comprehensive reference dataset mapping biomechanics, kinetic drag physics, and sporting tactics.",
        "url": canonicalUrl
      };
    } else if (currentPath === '/rankings') {
      title = "Match Standings & Team Rankings - Full Time Sports Pakistan";
      description = "Real-time sporting metrics, tournament points systems, and physical team classifications representing domestic and global leagues.";
      keywords = ["Standings", "sports tables", "FTS rankings board", ...GLOBAL_SEO_KEYWORDS.slice(0, 10)].join(", ");
    } else if (currentPath === '/fixtures') {
      title = "Tournament Calendars & Local Match Schedules - Full Time Sports Pakistan";
      description = "Direct time schedules, upcoming match lines, live scores, and stadiums telemetry for cricket, football, hockey, and volleyball.";
      keywords = ["fixtures list", "match times Pakistan", "FTS fixtures", ...GLOBAL_SEO_KEYWORDS.slice(0, 10)].join(", ");
    }

    // B. Inject & Sync with document Head
    document.title = title;

    // Helper: Find or create meta tags securely
    const updateOrCreateMeta = (attr: string, value: string, isProperty = false) => {
      const queryKey = isProperty ? `meta[property="${attr}"]` : `meta[name="${attr}"]`;
      let tag = document.querySelector(queryKey);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', attr);
        } else {
          tag.setAttribute('name', attr);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    // Standard Tags
    updateOrCreateMeta("description", description);
    updateOrCreateMeta("keywords", keywords);

    // Canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph Tags
    updateOrCreateMeta("og:title", title, true);
    updateOrCreateMeta("og:description", description, true);
    updateOrCreateMeta("og:url", canonicalUrl, true);
    updateOrCreateMeta("og:image", ogImage, true);
    updateOrCreateMeta("og:type", pageType, true);
    updateOrCreateMeta("og:site_name", "Full Time Sports Pakistan", true);

    // Structured JSON-LD Data Block Insertion
    let scriptTag = document.getElementById("fts-seo-jsonld");
    if (scriptTag) {
      scriptTag.remove();
    }
    
    if (ldJsonData) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'fts-seo-jsonld');
      scriptTag.textContent = JSON.stringify(ldJsonData, null, 2);
      document.head.appendChild(scriptTag);
    }

  }, [currentPath]);

  return null; // pure side-effect metadata injection
}
