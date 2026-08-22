import React, { useEffect } from 'react';
import { DB } from '../lib/db';

// 100+ high-performance sports, telemetry, biomechanics, and regional keywords
export const GLOBAL_SEO_KEYWORDS = [
  "The Sports Room",
  "live cricket scores",
  "real-time match updates",
  "upcoming cricket matches",
  "cricket match schedules",
  "international cricket live",
  "cricket tournaments 2026",
  "PSL 2026 live scores",
  "IPL 2026 live coverage",
  "Major League Cricket MLC 2026",
  "The Hundred Men 2026",
  "Lanka Premier League LPL 2026",
  "Pakistan vs West Indies test series 2026",
  "ball by ball cricket updates",
  "recent match results scoreboard",
  "tournament standings and fixtures",
  "The Sports Room Sports Analysis",
  "The Sports Room Football Coverage",
  "The Sports Room Cricket Analysis",
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
  "The Sports Room match analytics portal",
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
  "kinetic chain hockey clicks",
  "restricted area basketball drives",
  "input to display latency gaming",
  "sub-150ms trigger esports aiming",
  "rest defense dominance inverted fullbacks",
  "Magnus effect drag coefficient spin",
  "loose brick dust tennis slides",
  "The Sports Room live broadcast telemetry",
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
  "monochrome slate theme TSR",
  "sports telemetry tracker",
  "Pakistani athletes training schedules",
  "Khyber Pakhtunkhwa hockey tournaments",
  "Sindh sports association reviews",
  "Balochistan sports development analytics",
  "Gilgit Baltistan high altitude sports training",
  "The Sports Room tactical board",
  "football passing network maps",
  "cricket wagon wheel analytics",
  "The Sports Room sports atlas index",
  "AdSense sports websites approval keys",
  "high performance sports Pakistan",
  "The Sports Room sports glossary list",
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
  "The Sports Room sports news original reporting",
  "Non-scraped human-authored sports journalism",
  "Pakistan athletics news live",
  "The Sports Room live match tracker",
  "Sports biomechanics encyclopedia"
];

interface SEOMetaTagsProps {
  currentPath: string;
}

export default function SEOMetaTags({ currentPath }: SEOMetaTagsProps) {
  useEffect(() => {
    // Determine the primary canonical origin for the site to prevent duplicate indexation across preview or dev sandboxes.
    let origin = 'https://thesportsroom.online';
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (
        hostname &&
        !hostname.includes('localhost') &&
        !hostname.includes('127.0.0.1') &&
        !hostname.includes('0.0.0.0') &&
        !hostname.includes('run.app') &&
        !hostname.includes('aistudio') &&
        !hostname.includes('webcontainer') &&
        !hostname.includes('gitpod') &&
        !hostname.includes('codesandbox')
      ) {
        origin = window.location.origin;
      }
    }

    // Ensure relative path holds exact leading slash consistency and avoids trailing duplicates
    const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
    const canonicalUrl = `${origin}${cleanPath === '/' ? '' : cleanPath}`;
    
    let title = "The Sports Room | Live Cricket Scores, Real-Time Match Updates & Tournaments";
    let description = "Follow live cricket scores, real-time match updates, upcoming schedules, and complete coverage of international series and major tournaments on The Sports Room.";
    let keywords = GLOBAL_SEO_KEYWORDS.slice(0, 30).join(", ");
    let pageType = "website";
    let ogImage = `${origin}/logo-preview.png`;
    let ldJsonData: any = null;

    // A. Detect Routing Contexts
    if (currentPath === '/' || currentPath === '') {
      // Home context: 30-65 character SEO title with main topic near beginning
      title = "The Sports Room – Latest Sports News, Scores & Updates";
      description = "Get the latest sports news, live match scores, expert tactical analysis, and sports updates on The Sports Room. Explore daily sports quizzes and rankings.";
      keywords = GLOBAL_SEO_KEYWORDS.join(", ");
      
      // Comprehensive Knowledge Graph: Organization + WebSite + WebPage + Breadcrumbs + FAQ
      ldJsonData = [
        {
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "@id": `${origin}/#organization`,
          "name": "The Sports Room",
          "alternateName": ["TSR", "The Sports Room Online"],
          "url": origin,
          "logo": {
            "@type": "ImageObject",
            "url": `${origin}/logo-preview.png`,
            "width": 512,
            "height": 512
          },
          "founder": [
            {
              "@type": "Person",
              "name": "Hanan Irfan",
              "jobTitle": "Co-Founder, Lead Architect & Editorial Director"
            },
            {
              "@type": "Person",
              "name": "Urwah Farooq",
              "jobTitle": "Co-Founder, Business Partner & Sports Journalist"
            }
          ],
          "sameAs": [
            "https://x.com/TSRVerse?s=20",
            "https://www.linkedin.com/company/tsr-official",
            "https://www.youtube.com/@thesportsroom01",
            "https://www.facebook.com/profile.php?id=61592459862127",
            "https://www.tiktok.com/@pathan_x_babarian565",
            "https://www.pinterest.com/thesportsroomonline"
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Babar Colony",
            "addressLocality": "Rahim Yar Khan",
            "addressRegion": "Punjab",
            "postalCode": "64200",
            "addressCountry": "PK"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+923106359235",
            "contactType": "editorial",
            "email": "thesportsroom01@gmail.com"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          "name": "The Sports Room",
          "alternateName": "TSR Sports Lounge",
          "url": origin,
          "description": "The Sports Room is an independent digital sports platform delivering latest sports news, live match scores, expert analysis, cricket telemetry, daily sports quizzes, and leaderboards.",
          "publisher": {
            "@id": `${origin}/#organization`
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${origin}/glossary?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${origin}/#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": origin
            }
          ]
        },
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${origin}/#webpage`,
          "url": origin,
          "name": "The Sports Room – Latest Sports News, Scores & Updates",
          "description": "Get the latest sports news, live match scores, expert tactical analysis, and sports updates on The Sports Room. Explore daily sports quizzes and rankings.",
          "isPartOf": {
            "@id": `${origin}/#website`
          },
          "about": {
            "@id": `${origin}/#organization`
          },
          "publisher": {
            "@id": `${origin}/#organization`
          },
          "breadcrumb": {
            "@id": `${origin}/#breadcrumb`
          },
          "inLanguage": "en-US",
          "datePublished": "2024-01-15T00:00:00+00:00",
          "dateModified": "2026-08-15T10:00:00+00:00"
        },
        {
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          "@id": `${origin}/#lounge`,
          "name": "The Sports Room Sports Lounge",
          "description": "The dedicated human-written analytical lounge for physical biomechanics, F1 thermodynamics and football statistics reviews.",
          "url": origin,
          "logo": `${origin}/logo-preview.png`,
          "sameAs": [
            "https://x.com/TSRVerse?s=20",
            "https://www.linkedin.com/company/tsr-official",
            "https://www.youtube.com/@thesportsroom01",
            "https://www.facebook.com/profile.php?id=61592459862127",
            "https://www.tiktok.com/@pathan_x_babarian565",
            "https://www.pinterest.com/thesportsroomonline"
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Babar Colony",
            "addressLocality": "Rahim Yar Khan",
            "addressRegion": "Punjab",
            "addressCountry": "PK"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${origin}/#faq`,
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is The Sports Room?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sports Room (thesportsroom.online) is an independent digital sports media and analytics platform co-founded by Hanan Irfan and Urwah Farooq. It delivers real-time sports news, live match coverage, deep tactical breakdowns, cricket telemetry, daily sports quizzes, and fan leaderboard rankings."
              }
            },
            {
              "@type": "Question",
              "name": "How does the Daily Sports Quiz and Monthly Leaderboard work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Users can take one verified daily sports quiz per calendar day containing 5 multiple-choice questions. Submissions earn points that tally towards the monthly leaderboard standings, allowing sports enthusiasts to test their knowledge and earn recognition."
              }
            },
            {
              "@type": "Question",
              "name": "What live sports coverage and match updates are provided?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sports Room provides real-time ball-by-ball updates, live embedded video streams, tournament schedules, team standings, and comprehensive match summaries across cricket, football, Formula 1, tennis, basketball, and field hockey."
              }
            },
            {
              "@type": "Question",
              "name": "How is sports data and factual information verified on The Sports Room?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Every article, schedule, and telemetry metric is 100% human-authored and fact-checked against official sports governing bodies, including the International Cricket Council (ICC), UEFA, and Formula 1 official telemetry registers."
              }
            }
          ]
        }
      ];
    } else if (currentPath === '/live-stream' || currentPath.startsWith('/live-stream')) {
      title = "Live Sports Streaming | The Sports Room";
      description = "Watch official embedded Facebook Live and YouTube Live sports streams directly on The Sports Room. Stay updated with live cricket, football, Formula 1, tennis, basketball and more.";
      keywords = "The Sports Room live stream, live cricket streaming, Facebook live cricket, YouTube live sports, live match stream, live football streaming, F1 live streaming, embedded sports live stream";
      pageType = "website";

      ldJsonData = [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          "name": "Live Sports Streaming | The Sports Room",
          "description": description,
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
                "name": "Live Stream",
                "item": canonicalUrl
              }
            ]
          },
          "publisher": {
            "@type": "Organization",
            "name": "The Sports Room",
            "url": origin,
            "logo": {
              "@type": "ImageObject",
              "url": `${origin}/logo-preview.png`
            }
          }
        }
      ];
    } else if (currentPath.startsWith('/sport/')) {
      // Category index
      const categorySlug = currentPath.replace('/sport/', '');
      const categories = DB.getCategories();
      const matchedCat = categories.find(c => c.slug === categorySlug);
      
      if (matchedCat) {
        title = `${matchedCat.name} Tactical Telemetry, Match Reports & Live Standings - The Sports Room`;
        description = `Read expert ${matchedCat.name} match reports, live standings tables, tactical biomechanics analysis, and upcoming tournament schedules inside The Sports Room.`;
        
        // Filter keywords specific to this category helper
        const categoryKeywords = GLOBAL_SEO_KEYWORDS.filter(k => 
          k.toLowerCase().includes(categorySlug.replace('-1', '').split('-')[0]) || 
          k.toLowerCase().includes(matchedCat.name.toLowerCase().split(' ')[0])
        );
        keywords = [...categoryKeywords, ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
        pageType = "series";
        
        // Get posts inside this category to do full child-listing topical mapping!
        const posts = DB.getPosts().filter(p => p.category === categorySlug);
        const itemListElements = posts.map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": p.title,
          "url": `${origin}/blog/${p.slug}`
        }));

        ldJsonData = [
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${canonicalUrl}#collection`,
            "name": `${matchedCat.name} News, Analysis & Reports`,
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
          }
        ];

        if (itemListElements.length > 0) {
          ldJsonData.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${canonicalUrl}#itemlist`,
            "name": `Latest ${matchedCat.name} sports editorial reports`,
            "numberOfItems": itemListElements.length,
            "itemListElement": itemListElements
          });
        }
      }
    } else if (currentPath.startsWith('/topic/')) {
      const topicSlug = currentPath.replace('/topic/', '');
      const formattedTitle = topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      title = `${formattedTitle} Directory & Analysis | The Sports Room`;
      description = `Read comprehensive editorial coverage, statistics, and tactical breakdown for ${formattedTitle} on The Sports Room.`;
      keywords = `${formattedTitle}, ${formattedTitle} news, ${formattedTitle} analysis, ${GLOBAL_SEO_KEYWORDS.slice(0, 10).join(', ')}`;
      pageType = "website";

      ldJsonData = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${canonicalUrl}#topic-collection`,
          "name": `${formattedTitle} Sports Topic Hub`,
          "description": description,
          "url": canonicalUrl,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Topics", "item": `${origin}/topic/${topicSlug}` }
            ]
          }
        }
      ];
    } else if (currentPath.startsWith('/blog/')) {
      // Detailed article page
      const articleSlug = currentPath.replace('/blog/', '');
      const posts = DB.getPosts();
      const matchedPost = posts.find(p => p.slug === articleSlug);
      
      if (matchedPost) {
        const customCanonical = matchedPost.canonical_url || canonicalUrl;
        title = matchedPost.meta_title ? matchedPost.meta_title : `${matchedPost.title} | ${matchedPost.category.toUpperCase()} News - The Sports Room`;
        description = matchedPost.meta_description || matchedPost.content.replace(/[#*`]/g, '').slice(0, 160) + "...";
        
        const combinedKeywords = [];
        if (matchedPost.focus_keyword) combinedKeywords.push(matchedPost.focus_keyword);
        if (matchedPost.geo_entities) combinedKeywords.push(...matchedPost.geo_entities);
        if (matchedPost.tags) combinedKeywords.push(...matchedPost.tags);
        combinedKeywords.push(...GLOBAL_SEO_KEYWORDS.slice(0, 10));
        
        keywords = combinedKeywords.join(", ");
        pageType = "article";
        ogImage = matchedPost.featured_image;

        const mainSchemaType = matchedPost.schema_type || (matchedPost.type === 'blog' ? 'BlogPosting' : 'NewsArticle');

        ldJsonData = [
          {
            "@context": "https://schema.org",
            "@type": mainSchemaType,
            "@id": `${customCanonical}#article`,
            "headline": matchedPost.meta_title || matchedPost.title,
            "image": [matchedPost.featured_image],
            "datePublished": matchedPost.created_at,
            "dateModified": matchedPost.created_at,
            "abstract": matchedPost.geo_summary || matchedPost.meta_description || description,
            "keywords": keywords,
            "author": [{
              "@type": "Person",
              "name": matchedPost.author,
              "jobTitle": "Sports Journalism Specialist TSR"
            }],
            "publisher": {
              "@type": "Organization",
              "name": "The Sports Room",
              "logo": {
                "@type": "ImageObject",
                "url": `${origin}/logo-preview.png`
              }
            },
            "description": description,
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["#direct-answer-summary", "#article-headline"]
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": customCanonical
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "@id": `${customCanonical}#breadcrumbs`,
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
                "name": matchedPost.category,
                "item": `${origin}/sport/${matchedPost.category}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": matchedPost.title,
                "item": customCanonical
              }
            ]
          }
        ];

        // AEO FAQ Schema injection if post contains FAQ items
        if (matchedPost.aeo_faq && matchedPost.aeo_faq.length > 0) {
          ldJsonData.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${customCanonical}#faq`,
            "mainEntity": matchedPost.aeo_faq.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          });
        }
      }
    } else if (currentPath === '/sports-atlas' || currentPath === '/glossary') {
      title = "Sports Science Glossary & Atlas - The Sports Room";
      description = "Biomechanical indexes, strategic definitions, ball velocity drag models, and territorial parameters compiled by The Sports Room research desk.";
      keywords = ["Sports glossary", "sport science database", "cricket telemetry atlas", "TSR terminology INDEX", ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "@id": `${canonicalUrl}#definedtermset`,
        "name": "Sports Science Telemetry Glossary & Atlas",
        "description": "Comprehensive reference dataset mapping biomechanics, kinetic drag physics, and sporting tactics.",
        "url": canonicalUrl
      };
    } else if (currentPath === '/rankings') {
      title = "Match Standings & Team Rankings - The Sports Room";
      description = "Real-time sporting metrics, tournament points systems, and physical team classifications representing domestic and global leagues - only in The Sports Room.";
      keywords = ["Standings", "sports tables", "TSR rankings board", ...GLOBAL_SEO_KEYWORDS.slice(0, 10)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": "Sports League Rankings & Leaderboards",
        "description": description,
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
              "name": "Rankings",
              "item": canonicalUrl
            }
          ]
        }
      };
    } else if (currentPath.startsWith('/author/')) {
      title = "Hanan Irfan | Founder, Sole Editorial Director & Lead Analyst - The Sports Room";
      description = "Hanan Irfan is the Founder, Sole Editorial Director, and Lead Sports Analyst of The Sports Room (https://thesportsroom.online). Read his independent sports columns, cricket biomechanics breakdowns, and tactical match reports.";
      keywords = ["Hanan Irfan", "Hanan Irfan Sports Columnist", "The Sports Room Founder", "Independent Sports Journalist", "Cricket Biomechanics Analyst", "Formula 1 Aerodynamics Reviewer", ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${canonicalUrl}#person`,
        "name": "Hanan Irfan",
        "jobTitle": "Founder, Sole Editorial Director & Lead Sports Columnist",
        "url": canonicalUrl,
        "worksFor": {
          "@type": "Organization",
          "name": "The Sports Room",
          "url": origin,
          "logo": `${origin}/logo-preview.png`,
          "sameAs": [
            "https://x.com/TSRVerse?s=20",
            "https://www.linkedin.com/company/tsr-official",
            "https://www.youtube.com/@thesportsroom01",
            "https://www.facebook.com/profile.php?id=61592459862127",
            "https://www.tiktok.com/@pathan_x_babarian565"
          ]
        },
        "sameAs": [
          "https://x.com/TSRVerse?s=20",
          "https://www.linkedin.com/company/tsr-official",
          "https://www.youtube.com/@thesportsroom01",
          "https://www.facebook.com/profile.php?id=61592459862127",
          "https://www.tiktok.com/@pathan_x_babarian565",
          "https://www.pinterest.com/thesportsroomonline"
        ]
      };
    } else if (currentPath === '/why-choose-us' || currentPath === '/why-choose-the-sports-room') {
      title = "Why Choose The Sports Room? | Independent Sports Journalism & Analytics";
      description = "Discover why sports fans, researchers, and AI engines choose The Sports Room. Co-Founded by Hanan Irfan & Urwah Farooq, offering independent journalism, fast breaking news, and deep match analysis across 10+ sports.";
      keywords = ["Why Choose The Sports Room", "Independent Sports Journalism", "Reliable Sports News Platform", "Hanan Irfan", "Urwah Farooq", "Co-Founders", "Unbiased Match Analysis", "Verified Sports Telemetry", ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": title,
        "description": description,
        "url": canonicalUrl,
        "author": [
          {
            "@type": "Person",
            "name": "Hanan Irfan",
            "jobTitle": "Co-Founder, Lead Architect & Editorial Director"
          },
          {
            "@type": "Person",
            "name": "Urwah Farooq",
            "jobTitle": "Co-Founder, Business Partner & Sports Journalist"
          }
        ],
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
              "name": "Why Choose The Sports Room?",
              "item": canonicalUrl
            }
          ]
        }
      };
    } else if (currentPath === '/what-is-the-sports-room') {
      title = "What is The Sports Room? | Independent Sports Platform by Hanan Irfan & Urwah Farooq";
      description = "Learn about The Sports Room (https://thesportsroom.online), an independent sports news and analytics portal co-founded by Hanan Irfan & Urwah Farooq. Discover our story, mission, technology, and leadership.";
      keywords = ["What is The Sports Room", "About The Sports Room", "Hanan Irfan", "Urwah Farooq", "Co-Founders", "Independent Sports Platform", "Sports News Mission", "AI Search Sports Reference", ...GLOBAL_SEO_KEYWORDS.slice(0, 15)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": title,
        "description": description,
        "url": canonicalUrl,
        "author": [
          {
            "@type": "Person",
            "name": "Hanan Irfan",
            "jobTitle": "Co-Founder, Lead Architect & Editorial Director"
          },
          {
            "@type": "Person",
            "name": "Urwah Farooq",
            "jobTitle": "Co-Founder, Business Partner & Sports Journalist"
          }
        ],
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
              "name": "What is The Sports Room?",
              "item": canonicalUrl
            }
          ]
        }
      };
    } else if (currentPath === '/fixtures') {
      title = "Tournament Calendars & Local Match Schedules - The Sports Room";
      description = "Direct time schedules, upcoming match lines, live scores, and stadiums telemetry for cricket, football, hockey, and volleyball - only in The Sports Room.";
      keywords = ["fixtures list", "match times Pakistan", "TSR fixtures", ...GLOBAL_SEO_KEYWORDS.slice(0, 10)].join(", ");
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": "Sports Matches Schedules & Fixtures Boards",
        "description": description,
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
              "name": "Schedules & Fixtures",
              "item": canonicalUrl
            }
          ]
        }
      };
    } else {
      // Default fallback web page schema for about, contact, policy pages
      const pageTitleCapitalized = currentPath.replace('/', '').replace(/-/g, ' ').toUpperCase();
      title = `${pageTitleCapitalized || 'TSR Portal'} | The Sports Room Sports Lounge`;
      description = `Read our official documentation, details and user information guidelines for The Sports Room digital media ecosystem.`;
      
      ldJsonData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": `${pageTitleCapitalized || 'Sports Lounge Info'}`,
        "description": description,
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
              "name": pageTitleCapitalized || "Portal Page",
              "item": canonicalUrl
            }
          ]
        }
      };
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
    updateOrCreateMeta("og:site_name", "The Sports Room", true);

    // Structured JSON-LD Data Block Insertion
    let scriptTag = document.getElementById("thesportsroom-seo-jsonld");
    if (scriptTag) {
      scriptTag.remove();
    }
    // and cleanup legacy fts-seo-jsonld if it exists
    const legacyTag = document.getElementById("fts-seo-jsonld");
    if (legacyTag) {
      legacyTag.remove();
    }
    
    if (ldJsonData) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'thesportsroom-seo-jsonld');
      scriptTag.textContent = JSON.stringify(ldJsonData, null, 2);
      document.head.appendChild(scriptTag);
    }

  }, [currentPath]);

  return null; // pure side-effect metadata injection
}
