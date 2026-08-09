import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 301 Redirect Middleware to eliminate duplicate paths for Google Search Console ('Page with redirect' & 'Alternate canonical')
app.use((req, res, next) => {
  const reqPath = req.path;
  // Redirect trailing slashes for non-root URLs
  if (reqPath.length > 1 && reqPath.endsWith('/')) {
    const query = req.url.slice(reqPath.length);
    const safepath = reqPath.slice(0, -1);
    return res.redirect(301, safepath + query);
  }
  // Redirect legacy /article/ slug to standard /blog/ slug
  if (reqPath.startsWith('/article/')) {
    const slug = reqPath.replace('/article/', '');
    return res.redirect(301, `/blog/${slug}`);
  }
  next();
});

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rotate through sporting categories for backgrounds
const CATEGORIES_ROTATION = [
  "football",
  "cricket",
  "basketball",
  "f1",
  "esports",
  "tennis",
  "hockey",
  "volleyball"
];

function getRandomSportImage(category: string): string {
  const mappings: Record<string, string> = {
    football: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80",
    cricket: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?w=1200&auto=format&fit=crop&q=80",
    basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80",
    f1: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
    esports: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80",
    hockey: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=1200&auto=format&fit=crop&q=80",
    volleyball: "https://images.unsplash.com/photo-1592656094267-764a45068526?w=1200&auto=format&fit=crop&q=80"
  };
  return mappings[category] || mappings.football;
}

// Helper function to build dynamic XML sitemap based on requesting host
async function getSitemapXML(host: string): Promise<string> {
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Core static URLs
  const coreUrls = [
    { loc: `${baseUrl}/`, changefreq: "always", priority: "1.0" },
    { loc: `${baseUrl}/topic/cricket-world-cup-2027`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/cricket-world-cup-2027`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/author/hanan-irfan`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/why-choose-us`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/what-is-the-sports-room`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/live-stream`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/about-us`, changefreq: "monthly", priority: "0.4" },
    { loc: `${baseUrl}/contact-us`, changefreq: "monthly", priority: "0.4" },
    { loc: `${baseUrl}/privacy-policy`, changefreq: "monthly", priority: "0.3" },
    { loc: `${baseUrl}/terms`, changefreq: "monthly", priority: "0.3" },
    { loc: `${baseUrl}/disclaimer`, changefreq: "monthly", priority: "0.3" },
    { loc: `${baseUrl}/google-policies`, changefreq: "daily", priority: "0.7" },
    { loc: `${baseUrl}/sports-atlas`, changefreq: "weekly", priority: "0.6" }
  ];

  // Dynamic category paths
  const categoryUrls = CATEGORIES_ROTATION.map(c => ({
    loc: `${baseUrl}/sport/${c}`,
    changefreq: "daily",
    priority: "0.9"
  }));

  // Topic Hub URLs
  const topicSlugs = [
    "babar-azam", "shaheen-afridi", "mohammad-rizwan", "sufyan-muqeem", "naseem-shah",
    "pakistan-cricket", "india-cricket", "australia-cricket", "england-cricket",
    "psl", "ipl", "icc-champions-trophy", "asia-cup", "icc-cricket-world-cup", "icc-rankings", "knowledge-hub",
    "lionel-messi", "cristiano-ronaldo", "champions-league", "premier-league",
    "max-verstappen", "real-madrid", "barcelona"
  ];
  const topicUrls = topicSlugs.map(t => ({
    loc: `${baseUrl}/topic/${t}`,
    changefreq: "daily",
    priority: "0.85"
  }));

  // Query Supabase for posts to add dynamic blog paths
  const postUrls: Array<{ loc: string; changefreq: string; priority: string }> = [];
  try {
    const { data: posts, error } = await supabase
      .from("fts_posts")
      .select("slug, created_at, scheduled_for")
      .order("created_at", { ascending: false });

    if (!error && posts) {
      const now = Date.now();
      posts.forEach((post: any) => {
        // filter out drafts or future scheduled posts
        if (post.scheduled_for === "draft") return;
        if (post.scheduled_for && new Date(post.scheduled_for).getTime() > now) return;

        postUrls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          changefreq: "weekly",
          priority: "0.8"
        });
      });
    }
  } catch (err) {
    console.warn("[Sitemap Builder] Could not query Supabase posts for sitemap, falling back to static:", err);
  }

  // Fallback posts if Supabase is offline or empty during generation
  if (postUrls.length === 0) {
    const fallbackSlugs = [
      "spin-renaissance-t20-cricket-analysis",
      "tactical-extinction-classical-fullbacks-inverted-pivot",
      "analytical-obsession-nba-midrange-efficiency",
      "aerodynamics-f1-ground-effect-engineering-upgrades",
      "esports-franchise-economics-paradox-valuations",
      "science-lateral-tennis-footwork-clay-sliding",
      "strategic-analysis-hockey-penalty-corner-dragflick",
      "rotational-mechanics-volleyball-serve-aerodynamics-float-jump"
    ];
    fallbackSlugs.forEach(slug => {
      postUrls.push({
        loc: `${baseUrl}/blog/${slug}`,
        changefreq: "weekly",
        priority: "0.8"
      });
    });
  }

  const allUrls = [...coreUrls, ...categoryUrls, ...topicUrls, ...postUrls];
  
  const xmlItems = allUrls.map(item => `  <url>
    <loc>${item.loc}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
}

// Dynamic XML Sitemap Endpoint
app.get("/sitemap.xml", async (req, res) => {
  try {
    const host = req.get("host") || "thesportsroom.online";
    const xml = await getSitemapXML(host);
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Failed to generate XML sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// Direct route for Machine-Readable LLM Summary (AIO / GEO / Agentic Browsing)
app.get("/llms.txt", (req, res) => {
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Access-Control-Allow-Origin", "*");
  const filePath = path.join(process.cwd(), "llms.txt");
  res.sendFile(filePath);
});

// Direct route for WebMCP Manifest (Agentic Web Protocol standard)
app.get("/webmcp.json", (req, res) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  res.header("Access-Control-Allow-Origin", "*");
  const filePath = path.join(process.cwd(), "public", "webmcp.json");
  res.sendFile(filePath);
});

// Direct route for Web App Manifest
app.get("/site.webmanifest", (req, res) => {
  res.header("Content-Type", "application/manifest+json; charset=utf-8");
  const filePath = path.join(process.cwd(), "public", "site.webmanifest");
  res.sendFile(filePath);
});

// Dynamic robots.txt with complete AI search engine rules
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "thesportsroom.online";
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${protocol}://${host}/sitemap.xml
LLMs-txt: ${protocol}://${host}/llms.txt
`);
});

// Helper for SSR Pre-rendering article & metadata for web crawlers / LLMs
async function renderSSRPage(reqUrl: string, htmlTemplate: string, host: string): Promise<string> {
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const cleanPath = reqUrl.split("?")[0];

  let title = "The Sports Room | Live Cricket Scores, Real-Time Match Updates & Tournaments";
  let description = "Follow live cricket scores, real-time match updates, upcoming schedules, and complete coverage of international series and major tournaments on The Sports Room.";
  let keywords = "The Sports Room, live cricket scores, real-time match updates, upcoming cricket matches, cricket match schedules";
  let canonicalUrl = `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`;
  let ogImage = `${baseUrl}/logo-preview.png`;
  let pageType = "website";
  let jsonLdData: any = null;
  let preRenderedBody = "";

  if (cleanPath.startsWith("/blog/") || cleanPath.startsWith("/article/")) {
    const slug = cleanPath.replace("/blog/", "").replace("/article/", "");
    try {
      const { data: post } = await supabase
        .from("fts_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (post) {
        title = post.meta_title || `${post.title} | The Sports Room`;
        description = post.meta_description || post.geo_summary || post.subheading || (post.content ? post.content.replace(/[#*`]/g, "").slice(0, 160) : title);
        ogImage = post.featured_image || ogImage;
        pageType = "article";

        const tagsArray = post.tags || [];
        const geoArray = post.geo_entities || [];
        keywords = [post.focus_keyword, ...tagsArray, ...geoArray, "The Sports Room", "sports journalism"].filter(Boolean).join(", ");

        const newsArticleSchema: any = {
          "@context": "https://schema.org",
          "@type": post.schema_type || "NewsArticle",
          "@id": `${canonicalUrl}#article`,
          "headline": post.title,
          "description": description,
          "image": [ogImage],
          "datePublished": post.created_at,
          "dateModified": post.created_at,
          "author": [{
            "@type": "Person",
            "name": post.author || "Hanan Irfan",
            "jobTitle": "Lead Sports Columnist & Editorial Director",
            "url": `${baseUrl}/author/hanan-irfan`
          }],
          "publisher": {
            "@type": "Organization",
            "name": "The Sports Room",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo-preview.png`
            },
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61592459862127",
              "https://twitter.com/thesportsroom",
              "https://www.tiktok.com/@pathan_x_babarian565",
              "https://www.pinterest.com/thesportsroomonline"
            ]
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        };

        if (post.geo_summary) {
          newsArticleSchema["abstract"] = post.geo_summary;
        }

        const breadcrumbsSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumbs`,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": post.category || "Sports", "item": `${baseUrl}/sport/${post.category || "cricket"}` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
          ]
        };

        jsonLdData = [newsArticleSchema, breadcrumbsSchema];

        if (post.aeo_faq && Array.isArray(post.aeo_faq) && post.aeo_faq.length > 0) {
          jsonLdData.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${canonicalUrl}#faq`,
            "mainEntity": post.aeo_faq.map((item: any) => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": { "@type": "Answer", "text": item.answer }
            }))
          });
        }

        const paragraphs = (post.content || "").split("\n\n").map((p: string) => {
          if (p.startsWith("## ")) return `<h2>${p.replace("## ", "")}</h2>`;
          if (p.startsWith("### ")) return `<h3>${p.replace("### ", "")}</h3>`;
          if (p.trim()) return `<p>${p.replace(/[#*`]/g, "")}</p>`;
          return "";
        }).join("");

        preRenderedBody = `
          <article class="max-w-4xl mx-auto px-4 py-8">
            <nav class="text-xs text-emerald-400 mb-4 font-mono">
              <a href="/">Home</a> &gt; <a href="/sport/${post.category}">${post.category}</a> &gt; <span>${post.title}</span>
            </nav>
            <h1 class="text-3xl font-bold text-white mb-2">${post.title}</h1>
            <div class="text-xs text-slate-300 font-mono mb-6">
              Published by <a href="/author/hanan-irfan" class="text-emerald-400 font-bold hover:underline">Hanan Irfan</a> | ${new Date(post.created_at).toDateString()}
            </div>
            ${post.geo_summary ? `<div class="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl mb-6 text-sm text-emerald-100"><strong>Key Takeaway &amp; Summary:</strong> ${post.geo_summary}</div>` : ""}
            ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="w-full max-h-96 object-cover rounded-2xl mb-6" />` : ""}
            <div class="prose prose-invert max-w-none text-slate-200 leading-relaxed">${paragraphs}</div>
          </article>
        `;
      }
    } catch (e) {
      console.warn("[SSR Render] Could not fetch post for SSR:", e);
    }
  } else if (cleanPath.startsWith("/author/")) {
    title = "Hanan Irfan | Co-Founder, Editorial Director & Lead Analyst - The Sports Room";
    description = "Hanan Irfan is the Co-Founder, Lead Architect, and Editorial Director of The Sports Room (https://thesportsroom.online), co-founded alongside Urwah Farooq. Read independent sports columns, cricket biomechanics breakdowns, and tactical match reports.";
    keywords = "Hanan Irfan, Urwah Farooq, Co-Founders The Sports Room, Independent Sports Journalists";
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${canonicalUrl}#person`,
      "name": "Hanan Irfan",
      "jobTitle": "Co-Founder, Editorial Director & Lead Sports Columnist",
      "url": canonicalUrl,
      "worksFor": {
        "@type": "Organization",
        "name": "The Sports Room",
        "url": baseUrl,
        "logo": `${baseUrl}/logo-preview.png`,
        "sameAs": [
          "https://www.facebook.com/profile.php?id=61592459862127",
          "https://twitter.com/thesportsroom",
          "https://www.tiktok.com/@pathan_x_babarian565",
          "https://www.pinterest.com/thesportsroomonline"
        ]
      }
    };
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">Hanan Irfan - Co-Founder &amp; Editorial Director</h1>
        <p class="text-emerald-400 font-mono text-xs mb-4">The Sports Room (https://thesportsroom.online)</p>
        <p class="text-sm text-slate-300 leading-relaxed">Hanan Irfan is the Co-Founder, Lead Architect, and Editorial Director of The Sports Room, running the platform alongside Co-Founder Urwah Farooq. He writes un-scraped, human-authored sports journalism covering cricket seam biomechanics, football pressing tactics, and Formula 1 ground effect aerodynamics.</p>
      </section>
    `;
  } else if (cleanPath.startsWith("/topic/") || cleanPath === "/cricket-world-cup-2027") {
    const topicSlug = cleanPath === "/cricket-world-cup-2027" ? "cricket-world-cup-2027" : cleanPath.replace("/topic/", "");
    const topicTitle = topicSlug === "cricket-world-cup-2027" ? "Cricket World Cup 2027" : topicSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    title = `${topicTitle} | Schedule, Teams, Analysis & Coverage - The Sports Room`;
    description = `Comprehensive editorial coverage, tournament schedules, qualifications, host venues, and team breakdowns for ${topicTitle} on The Sports Room. Co-Founded by Hanan Irfan & Urwah Farooq.`;
    keywords = `${topicTitle}, ${topicTitle} schedule, ${topicTitle} teams, ${topicTitle} news, ${topicTitle} analysis, The Sports Room`;
    
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#topic-hub`,
      "name": `${topicTitle} Editorial Hub`,
      "description": description,
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "The Sports Room",
        "url": baseUrl
      }
    };

    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <nav class="text-xs text-emerald-400 mb-4 font-mono"><a href="/">Home</a> &gt; <a href="/sport/cricket">Cricket</a> &gt; <span>${topicTitle}</span></nav>
        <h1 class="text-3xl font-bold text-white mb-2">${topicTitle} - Editorial Central Hub</h1>
        <p class="text-emerald-400 font-mono text-xs mb-4">The Sports Room (https://thesportsroom.online)</p>
        <p class="text-sm text-slate-300 leading-relaxed">Follow complete coverage, match schedules, host venue updates (South Africa, Zimbabwe, Namibia), team qualification pathways, and deep tactical analysis for ${topicTitle} by Co-Founders Hanan Irfan & Urwah Farooq.</p>
      </section>
    `;
  } else if (cleanPath.startsWith("/sport/")) {
    const category = cleanPath.replace("/sport/", "").toLowerCase();
    const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    title = `${catTitle} News, Tactical Analysis & Match Statistics | The Sports Room`;
    description = `In-depth, un-scraped sports journalism and statistical coverage for ${catTitle} on The Sports Room. Read technical breakdowns and match analysis by Co-Founders Hanan Irfan & Urwah Farooq.`;
    keywords = `${catTitle}, ${catTitle} news, ${catTitle} analysis, ${catTitle} statistics, ${catTitle} updates, The Sports Room`;

    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#category-hub`,
      "name": `${catTitle} Editorial Category`,
      "description": description,
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "The Sports Room",
        "url": baseUrl
      }
    };

    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <nav class="text-xs text-emerald-400 mb-4 font-mono"><a href="/">Home</a> &gt; <span>${catTitle}</span></nav>
        <h1 class="text-3xl font-bold text-white mb-2">${catTitle} Editorial Hub</h1>
        <p class="text-emerald-400 font-mono text-xs mb-4">The Sports Room (https://thesportsroom.online)</p>
        <p class="text-sm text-slate-300 leading-relaxed">Discover deep tactical reviews, player statistics, match previews, and human-authored sports journalism covering ${catTitle}. Co-Founded by Hanan Irfan & Urwah Farooq.</p>
      </section>
    `;
  } else if (cleanPath === "/why-choose-us") {
    title = "Why Choose Us | The Sports Room - Human-Authored Sports Analytics";
    description = "Discover why readers trust The Sports Room for original, un-scraped sports journalism, deep seam biomechanics, pressing matrices, and real-time match stats co-founded by Hanan Irfan & Urwah Farooq.";
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">Why Choose The Sports Room?</h1>
        <p class="text-sm text-slate-300 leading-relaxed">Unlike AI-generated content farms or aggregated sports sites, The Sports Room provides 100% human-written, deeply researched sports journalism co-founded and run by Hanan Irfan & Urwah Farooq.</p>
      </section>
    `;
  } else if (cleanPath === "/what-is-the-sports-room") {
    title = "What is The Sports Room? | Independent Sports Platform by Hanan Irfan & Urwah Farooq";
    description = "Learn about The Sports Room (https://thesportsroom.online), an independent sports news and analytics portal co-founded by Hanan Irfan & Urwah Farooq. Discover our story, mission, technology, and leadership.";
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">What is The Sports Room?</h1>
        <p class="text-sm text-slate-300 leading-relaxed">The Sports Room is a premier digital publication co-founded and run by Hanan Irfan and Urwah Farooq, delivering independent sports journalism and live match updates across international sports.</p>
      </section>
    `;
  } else if (cleanPath === "/live-stream") {
    title = "Live Sports Streams & Match Audio Broadcasts | The Sports Room";
    description = "Watch live sports streams, legal match embeds, real-time commentary, and fan polls for ICC cricket tournaments, football leagues, and international events.";
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">Live Sports Streams &amp; Match Center</h1>
        <p class="text-sm text-slate-300 leading-relaxed">Stream live sports coverage, interactive match chat rooms, fan prediction polls, and real-time scoreboards on The Sports Room.</p>
      </section>
    `;
  } else if (cleanPath === "/about-us") {
    title = "About Us | The Sports Room - Independent Sports Media";
    description = "Learn more about Co-Founders Hanan Irfan and Urwah Farooq, analytical methodology, and founding vision behind The Sports Room digital sports portal.";
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">About The Sports Room</h1>
        <p class="text-sm text-slate-300 leading-relaxed">Co-founded and run by Hanan Irfan and Urwah Farooq, The Sports Room is an independent sports media organization committed to analytical rigor and un-scraped reporting.</p>
      </section>
    `;
  } else if (cleanPath === "/") {
    title = "The Sports Room | Live Cricket Scores, Match Updates & Sports Analysis";
    description = "Follow live cricket scores, real-time match updates, upcoming schedules, and in-depth tactical analysis across international cricket, football, and F1 on The Sports Room.";
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "name": "The Sports Room",
      "url": baseUrl,
      "publisher": {
        "@type": "Organization",
        "name": "The Sports Room",
        "url": baseUrl,
        "logo": `${baseUrl}/logo-preview.png`
      }
    };
    preRenderedBody = `
      <section class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
        <h1 class="text-3xl font-bold text-white mb-2">The Sports Room - Live Cricket Scores &amp; Sports Journalism</h1>
        <p class="text-emerald-400 font-mono text-xs mb-4">Co-Founders: Hanan Irfan &amp; Urwah Farooq | https://thesportsroom.online</p>
        <p class="text-sm text-slate-300 leading-relaxed">Welcome to The Sports Room. Access live scorecards, match predictions, ICC tournament schedules, and deep tactical breakdowns for cricket, football, basketball, and Formula 1.</p>
      </section>
    `;
  }

  let result = htmlTemplate;
  result = result.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);

  const metaTagsHtml = `
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="${pageType}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${jsonLdData ? `<script type="application/ld+json">${JSON.stringify(jsonLdData)}</script>` : ""}
  `;

  result = result.replace("</head>", `${metaTagsHtml}\n</head>`);

  if (preRenderedBody) {
    result = result.replace('<div id="root">', `<div id="root">${preRenderedBody}`);
  }

  return result;
}

// Primary Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ftsBroadcastNode: "active" });
});

// Configure Vite dynamic middleware for Hot Rebuilding development or static production serving
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[FTS] Mounting Vite dynamic middleware for active dev reload...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[FTS] Configuring Express static directory assets serving...");
    const distPath = path.join(process.cwd(), "dist");
    const fs = await import("fs");
    app.use(express.static(distPath, { index: false }));
    app.get("*", async (req, res) => {
      const host = req.get("host") || "thesportsroom.online";
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, "utf8");
        const renderedHtml = await renderSSRPage(req.url, rawHtml, host);
        res.setHeader("Content-Type", "text/html");
        res.send(renderedHtml);
      } else {
        res.status(404).send("Application build index missing");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FTS] Full Time Sports server successfully listening at http://0.0.0.0:${PORT}`);
  });
}

configureApp().catch((err) => {
  console.error("Critical server configuration failure:", err);
});
