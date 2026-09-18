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
  // Redirect alternate RC24 paths to primary canonical URL
  if (reqPath === '/rc24-apk' || reqPath === '/real-cricket-24-apk-download' || reqPath === '/rc24') {
    return res.redirect(301, '/rc24-apk-download');
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
  const todayIso = new Date().toISOString().split('T')[0];

  // Core static URLs
  const coreUrls = [
    { loc: `${baseUrl}/`, changefreq: "always", priority: "1.0", lastmod: todayIso },
    { loc: `${baseUrl}/live-stream`, changefreq: "always", priority: "0.98", lastmod: todayIso },
    { loc: `${baseUrl}/rc24-apk-download`, changefreq: "daily", priority: "0.95", lastmod: todayIso },
    { loc: `${baseUrl}/players`, changefreq: "daily", priority: "0.92", lastmod: todayIso },
    { loc: `${baseUrl}/topic/cricket-world-cup-2027`, changefreq: "daily", priority: "0.9", lastmod: todayIso },
    { loc: `${baseUrl}/cricket-world-cup-2027`, changefreq: "daily", priority: "0.9", lastmod: todayIso },
    { loc: `${baseUrl}/author/hanan-irfan`, changefreq: "daily", priority: "0.9", lastmod: todayIso },
    { loc: `${baseUrl}/why-choose-us`, changefreq: "weekly", priority: "0.8", lastmod: todayIso },
    { loc: `${baseUrl}/what-is-the-sports-room`, changefreq: "weekly", priority: "0.8", lastmod: todayIso },
    { loc: `${baseUrl}/about-us`, changefreq: "monthly", priority: "0.4", lastmod: todayIso },
    { loc: `${baseUrl}/contact-us`, changefreq: "monthly", priority: "0.4", lastmod: todayIso },
    { loc: `${baseUrl}/privacy-policy`, changefreq: "monthly", priority: "0.3", lastmod: todayIso },
    { loc: `${baseUrl}/terms`, changefreq: "monthly", priority: "0.3", lastmod: todayIso },
    { loc: `${baseUrl}/disclaimer`, changefreq: "monthly", priority: "0.3", lastmod: todayIso },
    { loc: `${baseUrl}/google-policies`, changefreq: "daily", priority: "0.7", lastmod: todayIso },
    { loc: `${baseUrl}/sports-atlas`, changefreq: "weekly", priority: "0.6", lastmod: todayIso }
  ];

  // Dynamic category paths
  const categoryUrls = CATEGORIES_ROTATION.map(c => ({
    loc: `${baseUrl}/sport/${c}`,
    changefreq: "daily",
    priority: "0.9",
    lastmod: todayIso
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
    priority: "0.85",
    lastmod: todayIso
  }));

  // Query Supabase for dynamic entities (posts, streams, players)
  const postUrls: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [];
  const playerUrls: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [];
  const seenPlayerSlugs = new Set<string>();

  try {
    const { data: posts, error } = await supabase
      .from("fts_posts")
      .select("slug, created_at, scheduled_for, updated_at")
      .order("created_at", { ascending: false });

    if (!error && posts) {
      const now = Date.now();
      posts.forEach((post: any) => {
        // filter out drafts or future scheduled posts
        if (post.scheduled_for === "draft") return;
        if (post.scheduled_for && new Date(post.scheduled_for).getTime() > now) return;

        const lastmod = post.updated_at || post.created_at 
          ? new Date(post.updated_at || post.created_at).toISOString().split('T')[0] 
          : todayIso;

        postUrls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod
        });
      });
    }

    // Query active and recent live streams
    const { data: streams } = await supabase
      .from("fts_live_streams")
      .select("id, status, updated_at, created_at")
      .order("created_at", { ascending: false });

    if (streams && streams.length > 0) {
      streams.forEach((stream: any) => {
        const lastmod = stream.updated_at || stream.created_at
          ? new Date(stream.updated_at || stream.created_at).toISOString().split('T')[0]
          : todayIso;

        postUrls.push({
          loc: `${baseUrl}/live-stream?id=${stream.id}`,
          changefreq: stream.status === 'active' ? 'always' : 'weekly',
          priority: stream.status === 'active' ? '0.95' : '0.7',
          lastmod
        });
      });
    }

    // Query active player profiles directly from Supabase
    const { data: players } = await supabase
      .from("players")
      .select("slug, is_published, updated_at, created_at")
      .order("created_at", { ascending: false });

    if (players && players.length > 0) {
      players.forEach((player: any) => {
        if (player.is_published === false) return;
        const rawSlug = String(player.slug || '').trim().toLowerCase();
        if (!rawSlug || seenPlayerSlugs.has(rawSlug)) return;
        seenPlayerSlugs.add(rawSlug);

        const lastmod = player.updated_at || player.created_at
          ? new Date(player.updated_at || player.created_at).toISOString().split('T')[0]
          : todayIso;

        playerUrls.push({
          loc: `${baseUrl}/player/${rawSlug}`,
          changefreq: "weekly",
          priority: "0.88",
          lastmod
        });
      });
    }
  } catch (err) {
    console.warn("[Sitemap Builder] Could not query Supabase posts/streams/players for sitemap, falling back to static:", err);
  }

  // Ensure default/seed player profiles are always present in the sitemap even if Supabase is offline
  const fallbackPlayerSlugs = [
    "babar-azam",
    "shaheen-shah-afridi",
    "max-verstappen",
    "lionel-messi"
  ];
  fallbackPlayerSlugs.forEach(slug => {
    if (!seenPlayerSlugs.has(slug)) {
      seenPlayerSlugs.add(slug);
      playerUrls.push({
        loc: `${baseUrl}/player/${slug}`,
        changefreq: "weekly",
        priority: "0.88",
        lastmod: todayIso
      });
    }
  });

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
        priority: "0.8",
        lastmod: todayIso
      });
    });
  }

  const allUrls = [...coreUrls, ...categoryUrls, ...topicUrls, ...playerUrls, ...postUrls];
  
  const xmlItems = allUrls.map(item => `  <url>
    <loc>${item.loc}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>\n    ` : ''}<changefreq>${item.changefreq}</changefreq>
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

// Google News XML Sitemap Endpoint
app.get("/news-sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.header("Cache-Control", "public, max-age=300, must-revalidate");
  res.header("Access-Control-Allow-Origin", "*");
  const filePath = path.join(process.cwd(), "public", "news-sitemap.xml");
  res.sendFile(filePath);
});

// Direct route for Machine-Readable LLM Summary (AIO / GEO / Agentic Browsing)
app.get("/llms.txt", (req, res) => {
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=300, must-revalidate");
  res.header("Access-Control-Allow-Origin", "*");
  const filePath = path.join(process.cwd(), "public", "llms.txt");
  res.sendFile(filePath);
});

// Direct route for WebMCP Manifest (Agentic Web Protocol standard)
app.get("/webmcp.json", (req, res) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  res.header("Cache-Control", "public, max-age=300, must-revalidate");
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

// IndexNow Protocol Key Verification Endpoints (for Bing, Yandex, Seznam, Naver)
const DEFAULT_INDEXNOW_KEY = process.env.INDEXNOW_KEY || "c03b12368c8b4bf09bc77a4a98e89f81";

app.get(["/c03b12368c8b4bf09bc77a4a98e89f81.txt", "/indexnow.txt", "/indexnow-key.txt"], (req, res) => {
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(DEFAULT_INDEXNOW_KEY);
});

// Dynamic key matcher for any 32-character hex IndexNow key
app.get("/:key([a-f0-9]{32}).txt", (req, res) => {
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(req.params.key);
});

// IndexNow Submission API Endpoint (Submits URLs directly to Bing / IndexNow)
app.post("/api/indexnow", async (req, res) => {
  try {
    const host = req.get("host") || "thesportsroom.online";
    const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
    const primaryDomain = "thesportsroom.online";

    let urlList: string[] = req.body.urls || [];

    if (!Array.isArray(urlList) || urlList.length === 0) {
      // Gather all posts from database to submit full catalog
      const { data: posts } = await supabase.from("fts_posts").select("slug").limit(100);
      const postUrls = (posts || []).map(p => `https://${primaryDomain}/blog/${p.slug}`);
      const categoryUrls = CATEGORIES_ROTATION.map(c => `https://${primaryDomain}/sport/${c}`);
      urlList = [
        `https://${primaryDomain}/`,
        `https://${primaryDomain}/sitemap.xml`,
        `https://${primaryDomain}/news-sitemap.xml`,
        `https://${primaryDomain}/what-is-the-sports-room`,
        `https://${primaryDomain}/why-choose-us`,
        `https://${primaryDomain}/cricket-world-cup-2027`,
        ...categoryUrls,
        ...postUrls
      ];
    }

    // Ensure all URLs are properly formatted
    const cleanUrlList = Array.from(new Set(urlList.map(u => {
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `https://${primaryDomain}${u.startsWith("/") ? "" : "/"}${u}`;
    })));

    const payload = {
      host: primaryDomain,
      key: DEFAULT_INDEXNOW_KEY,
      keyLocation: `https://${primaryDomain}/${DEFAULT_INDEXNOW_KEY}.txt`,
      urlList: cleanUrlList
    };

    console.log(`[IndexNow] Submitting ${cleanUrlList.length} URLs to Bing & IndexNow API...`);

    // Submit to official IndexNow API endpoint
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    // Also submit to Bing direct endpoint
    try {
      await fetch("https://www.bing.com/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
    } catch (bingErr) {
      console.warn("[IndexNow] Bing direct endpoint notice:", bingErr);
    }

    res.json({
      success: true,
      status: response.status,
      submittedCount: cleanUrlList.length,
      urls: cleanUrlList.slice(0, 10),
      message: `Successfully notified Bing and IndexNow search engines for ${cleanUrlList.length} URLs.`
    });
  } catch (error: any) {
    console.error("[IndexNow] Submission failed:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to submit URLs to IndexNow"
    });
  }
});

// Dynamic robots.txt with complete AI search engine rules
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "thesportsroom.online";
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

# Google Crawlers (Search & News)
User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

User-agent: Google-Extended
Allow: /

# Bing & Microsoft Copilot
User-agent: Bingbot
Allow: /

User-agent: msnbot
Allow: /

User-agent: BingPreview
Allow: /

User-agent: msnbot-media
Allow: /

User-agent: AdIdxBot
Allow: /

# OpenAI / ChatGPT
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic / Claude
User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-ai
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /

# Apple
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Social Crawlers
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Sitemaps and AI manifests
Sitemap: ${protocol}://${host}/sitemap.xml
Sitemap: ${protocol}://${host}/news-sitemap.xml
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
              "https://x.com/TSRVerse?s=20",
              "https://www.linkedin.com/in/thesportsroom",
              "https://www.youtube.com/@thesportsroom01",
              "https://www.facebook.com/profile.php?id=61592459862127",
              "https://www.tiktok.com/@pathan_x_babarian565",
              "https://www.pinterest.com/thesportsroomonline"
            ]
          },
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["#direct-answer-summary", "#article-headline"]
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
  } else if (cleanPath === "/players") {
    title = "Sports Player Profiles, Stats & Career Records | The Sports Room";
    description = "Explore sports player profiles, career statistics, teams, achievements, records and latest news from cricket, football, basketball, tennis and F1.";
    keywords = "player profiles, sports player profiles, cricket player profiles, football player profiles, player statistics, sports player statistics, cricket player stats, football player stats, player career records, athlete profiles, sports player database, The Sports Room";
    canonicalUrl = `${baseUrl}/players`;
    pageType = "website";

    try {
      const { data: playersList } = await supabase
        .from("players")
        .select("name, slug, sport, country, playing_role, current_team, photo_url, is_published")
        .order("created_at", { ascending: false });

      const activePlayers = (playersList || []).filter((p: any) => p.is_published !== false);

      jsonLdData = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${canonicalUrl}#players-directory`,
          "name": "Player Profiles, Statistics & Career Records | The Sports Room",
          "description": description,
          "url": canonicalUrl,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
              { "@type": "ListItem", "position": 2, "name": "Players", "item": canonicalUrl }
            ]
          },
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": activePlayers.slice(0, 50).map((p: any, idx: number) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${baseUrl}/player/${p.slug}`,
              "name": p.name
            }))
          }
        }
      ];

      const playersCards = activePlayers.map((p: any) => `
        <div class="bg-[#022c22] border border-[#22c55e]/20 rounded-2xl p-5 hover:border-[#22c55e]/60 transition">
          <div class="flex items-center space-x-4">
            ${p.photo_url ? `<img src="${p.photo_url}" alt="${p.name}" class="w-16 h-16 rounded-full object-cover border-2 border-[#22c55e]/40" />` : `<div class="w-16 h-16 rounded-full bg-emerald-950 flex items-center justify-center text-xl font-bold text-emerald-400 border border-emerald-800">${p.name.charAt(0)}</div>`}
            <div>
              <h3 class="text-lg font-bold text-white"><a href="/player/${p.slug}" class="hover:text-[#22c55e]">${p.name}</a></h3>
              <p class="text-xs text-emerald-400 font-mono">${p.playing_role || 'Athlete'} &bull; ${p.country || ''}</p>
              ${p.current_team ? `<p class="text-xs text-slate-300 mt-1 font-mono">${p.current_team}</p>` : ''}
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-950 flex justify-between items-center text-xs">
            <span class="text-emerald-400 font-mono font-bold uppercase">${p.sport || 'Sports'}</span>
            <a href="/player/${p.slug}" class="text-[#22c55e] font-bold hover:underline">View Profile &rarr;</a>
          </div>
        </div>
      `).join("");

      preRenderedBody = `
        <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
          <nav aria-label="Breadcrumb" class="mb-4 text-xs font-mono">
            <ol class="flex items-center space-x-2 text-slate-400">
              <li><a href="/" class="hover:text-[#22c55e]">Home</a></li>
              <li>/</li>
              <li><span class="text-[#22c55e]">Players</span></li>
            </ol>
          </nav>
          <h1 class="text-3xl sm:text-4xl font-black font-display text-white mb-2">Player Profiles, Statistics &amp; Career Records</h1>
          <p class="text-sm text-slate-300 mb-8 max-w-3xl leading-relaxed">Explore detailed player profiles, sports statistics, career records and achievements from cricket, football, basketball, tennis, Formula 1 and other major sports. The Sports Room brings player information together in one place, making it easier to follow your favorite athletes, their teams, performances and career journeys.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            ${playersCards || '<p class="text-slate-400">Player profiles directory loading...</p>'}
          </div>

          <section class="border-t border-emerald-900/40 pt-8 space-y-6 text-sm text-slate-300">
            <h2 class="text-2xl font-bold text-white">Explore Sports Player Profiles</h2>
            <p>Find sports player profiles featuring important career information, playing roles, teams, countries, statistics and major achievements. Whether you follow international cricket, football leagues, basketball, tennis or motorsport, our player profiles help you quickly learn more about the athletes making an impact in their sport.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h2 class="text-lg font-bold text-white mb-2">Cricket Player Profiles &amp; Statistics</h2>
                <p>Follow cricket player profiles with career statistics, teams, playing roles, major performances and achievements. Explore information about international cricketers and players from major cricket competitions, including their career records and latest related news.</p>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white mb-2">Football Player Profiles &amp; Career Stats</h2>
                <p>Discover football player profiles covering clubs, national teams, positions, appearances, goals, assists and career highlights. Follow established stars and emerging players while keeping up with the latest football news connected to their careers.</p>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white mb-2">Basketball, Tennis &amp; F1 Players</h2>
                <p>Explore player information from basketball, tennis, Formula 1 and other popular sports. Each profile focuses on useful information such as career achievements, teams, statistics and notable performances, giving sports fans a quick way to learn more about their favorite athletes.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <h2 class="text-lg font-bold text-white mb-2">Player Statistics &amp; Career Records</h2>
                <p>Looking for a player's career statistics or major records? Our profiles bring important numbers and career milestones together where reliable information is available. Statistics may include matches, appearances, runs, goals, points, wins, podiums and other sport-specific records.</p>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white mb-2">Latest News About Your Favorite Players</h2>
                <p>Player careers are constantly changing. Follow the latest sports news, match performances, transfers, milestones and major updates connected to the players featured on The Sports Room. Related articles are linked from player profiles so you can move from a player's career information directly to the latest coverage.</p>
              </div>
            </div>

            <div class="pt-4 space-y-4">
              <h2 class="text-lg font-bold text-white">Find Your Favorite Player</h2>
              <p>Use the player directory to search for athletes by name, sport or country. From international cricket players to football stars, basketball athletes, tennis players and Formula 1 drivers, The Sports Room is building a growing collection of sports player profiles for fans around the world.</p>

              <h2 class="text-lg font-bold text-white">About The Sports Room Player Directory</h2>
              <p>The Sports Room is building a simple and useful sports player database covering different sports, teams and competitions. Our goal is to make player information easy to find while connecting profiles with relevant news, match coverage and sports analysis.</p>
              <p class="text-emerald-400 font-medium">Explore the profiles below and discover more about the players shaping the world of sport.</p>
            </div>
          </section>
        </main>
      `;
    } catch (err) {
      console.warn("[SSR Render] Could not load players list for SSR:", err);
    }
  } else if (cleanPath.startsWith("/player/") || cleanPath.startsWith("/players/")) {
    const playerSlug = cleanPath.replace(/^\/players?\//, '').replace(/\/$/, '');
    canonicalUrl = `${baseUrl}/player/${playerSlug}`;
    pageType = "profile";

    try {
      const { data: player } = await supabase
        .from("players")
        .select("*")
        .eq("slug", playerSlug)
        .maybeSingle();

      if (player) {
        title = player.seo_title || `${player.name} Profile, Career Stats, Achievements & News | The Sports Room`;
        description = player.seo_description || `${player.name} player profile covering career statistics, team (${player.current_team || 'National'}), achievements, biography, and latest news on The Sports Room.`;
        keywords = `${player.name}, ${player.name} stats, ${player.name} profile, ${player.sport}, ${player.country}, ${player.current_team || ''}, athlete biography, The Sports Room`;
        if (player.photo_url) {
          ogImage = player.photo_url;
        }

        const socialArray = Object.values(player.social_links || {}).filter(Boolean);

        jsonLdData = [
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": `${canonicalUrl}#athlete`,
            "name": player.name,
            "url": canonicalUrl,
            "image": player.photo_url || `${baseUrl}/logo-preview.png`,
            "jobTitle": player.playing_role || "Professional Athlete",
            "nationality": player.nationality || player.country || undefined,
            "birthDate": player.date_of_birth ? player.date_of_birth.slice(0, 10) : undefined,
            "birthPlace": player.birthplace || undefined,
            "description": player.biography || description,
            "knowsAbout": [player.sport, "Sports", "Athletics"],
            "memberOf": player.current_team ? {
              "@type": "SportsTeam",
              "name": player.current_team,
              "sport": player.sport
            } : undefined,
            "sameAs": socialArray.length > 0 ? socialArray : undefined
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "@id": `${canonicalUrl}#breadcrumb`,
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
              { "@type": "ListItem", "position": 2, "name": "Players", "item": `${baseUrl}/players` },
              { "@type": "ListItem", "position": 3, "name": player.name, "item": canonicalUrl }
            ]
          }
        ];

        // Format stats cards if available
        let statsHtml = '';
        if (player.statistics && typeof player.statistics === 'object') {
          const statEntries = Object.entries(player.statistics);
          if (statEntries.length > 0) {
            statsHtml = `
              <div class="my-6">
                <h2 class="text-xl font-bold text-white mb-3">Career Statistics</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  ${statEntries.map(([k, v]) => `
                    <div class="bg-[#022c22] border border-emerald-900/60 p-3 rounded-xl text-center">
                      <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">${k.replace(/_/g, ' ')}</div>
                      <div class="text-lg font-bold text-[#22c55e] mt-1">${v}</div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }
        }

        // Format achievements if available
        let achievementsHtml = '';
        if (player.achievements && Array.isArray(player.achievements) && player.achievements.length > 0) {
          achievementsHtml = `
            <div class="my-6">
              <h2 class="text-xl font-bold text-white mb-3">Key Achievements</h2>
              <ul class="space-y-2">
                ${player.achievements.map((ach: any) => `
                  <li class="bg-[#022c22] border border-emerald-900/60 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span class="font-bold text-white">${typeof ach === 'string' ? ach : (ach.title || '')}</span>
                    ${ach.year ? `<span class="text-[#22c55e] font-mono font-bold">${ach.year}</span>` : ''}
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        }

        preRenderedBody = `
          <article class="max-w-4xl mx-auto px-4 py-8 text-slate-100">
            <nav aria-label="Breadcrumb" class="mb-4 text-xs font-mono">
              <ol class="flex items-center space-x-2 text-slate-400">
                <li><a href="/" class="hover:text-[#22c55e]">Home</a></li>
                <li>/</li>
                <li><a href="/players" class="hover:text-[#22c55e]">Players</a></li>
                <li>/</li>
                <li><span class="text-[#22c55e]">${player.name}</span></li>
              </ol>
            </nav>
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-[#022c22] border border-[#22c55e]/30 rounded-2xl p-6 mb-6">
              ${player.photo_url ? `<img src="${player.photo_url}" alt="${player.name}" class="w-32 h-32 rounded-2xl object-cover border-2 border-[#22c55e]" />` : ''}
              <div class="flex-1 text-center sm:text-left">
                <div class="flex flex-wrap gap-2 justify-center sm:justify-start mb-2">
                  <span class="text-[10px] font-mono font-bold bg-[#22c55e] text-slate-950 px-2 py-0.5 rounded uppercase">${player.sport || 'Sports'}</span>
                  ${player.country ? `<span class="text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded">${player.country}</span>` : ''}
                  ${player.jersey_number ? `<span class="text-[10px] font-mono font-bold bg-slate-800 text-slate-200 px-2 py-0.5 rounded">#${player.jersey_number}</span>` : ''}
                </div>
                <h1 class="text-3xl font-black text-white">${player.name}</h1>
                <p class="text-sm text-[#22c55e] font-mono mt-1">${player.playing_role || ''} ${player.current_team ? `&bull; ${player.current_team}` : ''}</p>
                <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
                  ${player.date_of_birth ? `<div><span class="text-slate-500 block text-[10px]">DOB</span>${player.date_of_birth.slice(0, 10)}</div>` : ''}
                  ${player.birthplace ? `<div><span class="text-slate-500 block text-[10px]">BIRTHPLACE</span>${player.birthplace}</div>` : ''}
                  ${player.nationality ? `<div><span class="text-slate-500 block text-[10px]">NATIONALITY</span>${player.nationality}</div>` : ''}
                  ${player.current_team ? `<div><span class="text-slate-500 block text-[10px]">TEAM</span>${player.current_team}</div>` : ''}
                </div>
              </div>
            </div>

            ${player.biography ? `
              <div class="my-6">
                <h2 class="text-xl font-bold text-white mb-3">Biography</h2>
                <div class="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm bg-[#001712] border border-emerald-950 p-5 rounded-2xl">
                  ${player.biography.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
                </div>
              </div>
            ` : ''}

            ${player.career_highlights ? `
              <div class="my-6">
                <h2 class="text-xl font-bold text-white mb-3">Career Highlights</h2>
                <div class="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm bg-[#001712] border border-emerald-950 p-5 rounded-2xl">
                  ${player.career_highlights.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
                </div>
              </div>
            ` : ''}

            ${statsHtml}
            ${achievementsHtml}
          </article>
        `;
      }
    } catch (err) {
      console.warn("[SSR Render] Could not load player profile for SSR:", err);
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
          "https://x.com/TSRVerse?s=20",
          "https://www.linkedin.com/in/thesportsroom",
          "https://www.youtube.com/@thesportsroom01",
          "https://www.facebook.com/profile.php?id=61592459862127",
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
  } else if (cleanPath === "/rc24-apk-download") {
    title = "RC24 APK Download – Latest Version, Features & Guide";
    description = "Download and learn about RC24 APK, including its latest version, features, installation steps, requirements, and important details.";
    keywords = "RC24 APK Download, RC 24 APK, Real Cricket 24 APK, RC24 download, Real Cricket 24 latest version, RC 24 Android download, Real Cricket APK download, RC24 mobile cricket";
    canonicalUrl = `${baseUrl}/rc24-apk-download`;
    ogImage = `${baseUrl}/rc24-hero-banner.webp`;
    pageType = "website";

    jsonLdData = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": title,
        "description": description,
        "url": canonicalUrl,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "publisher": {
          "@type": "Organization",
          "name": "The Sports Room",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo-preview.png`
          }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Cricket",
            "item": `${baseUrl}/sport/cricket`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "RC24 APK Download",
            "item": canonicalUrl
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${canonicalUrl}#software`,
        "name": "Real Cricket 24 (RC 24)",
        "alternateName": ["RC24 APK", "RC 24 APK Download", "Real Cricket 24", "Real Cricket 5.2"],
        "operatingSystem": "Android 6.0 and up",
        "fileSize": "870MB",
        "softwareVersion": "5.2",
        "applicationCategory": "GameApplication",
        "downloadUrl": "https://drive.google.com/uc?export=download&id=1c7fYbKqPgjnPz47ptAK9rpTSJx72AYoz",
        "publisher": {
          "@type": "Organization",
          "name": "Nautilus Mobile & KRAFTON"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is RC 24?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "RC 24 is a common short name for Real Cricket 24, a premier cricket game associated with Nautilus Mobile and KRAFTON."
            }
          },
          {
            "@type": "Question",
            "name": "What does RC24 download mean?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "RC24 download usually refers to downloading the Android installation package (APK/XAPK) for Real Cricket 24."
            }
          },
          {
            "@type": "Question",
            "name": "Is RC 24 the same as Real Cricket 24?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. RC 24 and RC24 are commonly used short names for Real Cricket 24."
            }
          },
          {
            "@type": "Question",
            "name": "What Android version does RC 24 require?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The requirement depends on the version. Some Real Cricket 24 releases require Android 6.0 or later, while newer Real Cricket releases (v5.2) require Android 7.0 or later."
            }
          },
          {
            "@type": "Question",
            "name": "How much storage does Real Cricket need?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The RC 24 APK package is 870 MB. After installation and downloading audio commentary packs and high-res stadium textures, you should keep at least 2 GB to 2.5 GB of free phone memory."
            }
          }
        ]
      }
    ];

    preRenderedBody = `
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <nav aria-label="Breadcrumb" class="mb-4 text-xs font-mono">
          <ol class="flex items-center space-x-2 text-slate-400">
            <li><a href="/" class="hover:text-[#22c55e]">Home</a></li>
            <li>/</li>
            <li><a href="/sport/cricket" class="hover:text-[#22c55e]">Cricket</a></li>
            <li>/</li>
            <li><span class="text-[#22c55e]">RC24 APK Download</span></li>
          </ol>
        </nav>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-4">RC24 APK Download</h1>
        <p class="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">Download and learn about RC24 APK, including its latest version, features, installation steps, requirements, and important details.</p>
        
        <div class="mb-8">
          <a href="https://drive.google.com/uc?export=download&id=1c7fYbKqPgjnPz47ptAK9rpTSJx72AYoz" target="_blank" rel="noopener noreferrer" class="inline-block bg-[#22c55e] text-slate-950 font-bold px-6 py-3 rounded-xl text-center">
            Download RC 24 APK (870 MB)
          </a>
        </div>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">RC 24 APK Information</h2>
          <p class="text-sm text-slate-300 leading-relaxed">RC 24 is a 3D cricket simulation game for Android featuring 650+ realistic shots, authentic stadiums, multiple formats, and multiplayer options. Package size is 870 MB with Android 6.0+ compatibility.</p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">Real Cricket 24 Features &amp; Gameplay</h2>
          <p class="text-sm text-slate-300 leading-relaxed">Real Cricket 24 offers deep batting control, bowling variations, realistic fielding physics, commentary tracks, and tournament modes.</p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-base font-semibold text-emerald-400">What is RC 24?</h3>
              <p class="text-sm text-slate-300">RC 24 is a common short name for Real Cricket 24, a premier cricket game developed by Nautilus Mobile and KRAFTON.</p>
            </div>
            <div>
              <h3 class="text-base font-semibold text-emerald-400">What Android version does RC 24 require?</h3>
              <p class="text-sm text-slate-300">RC 24 requires Android 6.0 or higher with at least 2 GB to 2.5 GB of free device memory for full assets.</p>
            </div>
          </div>
        </section>
      </main>
    `;
  } else if (cleanPath === "/live-stream") {
    title = "Live Sports Streaming | Cricket, Football & More";
    description = "Watch live sports online with The Sports Room. Find cricket, football, basketball, tennis, F1 and more with live match updates.";
    keywords = "Live sports streaming, live cricket streaming, live football streaming, watch live sports online, live match updates, The Sports Room live stream, ICC cricket live, UEFA Champions League live, NBA live";
    jsonLdData = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        "name": "Live Sports Streaming | Cricket, Football & More",
        "description": description,
        "url": canonicalUrl,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "publisher": {
          "@type": "Organization",
          "name": "The Sports Room",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo-preview.png`
          }
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Live Streams",
            "item": canonicalUrl
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How can I watch live sports on The Sports Room?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can watch live sports directly on this page by selecting any active match card from the list. The player will load the official live stream embed or broadcast link automatically."
            }
          },
          {
            "@type": "Question",
            "name": "What sports are available for live streaming?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Sports Room features live streams and match updates for cricket, football, Formula 1, tennis, basketball, and field hockey whenever official broadcasts or embed feeds are active."
            }
          },
          {
            "@type": "Question",
            "name": "Is live sports streaming free on The Sports Room?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, accessing the live match player, live scorecards, match analysis, and community chat on The Sports Room is completely free."
            }
          },
          {
            "@type": "Question",
            "name": "What should I do if a stream does not play?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "If a stream appears blank or shows a playback notice, click the \"Re-sync Broadcast\" button or use the \"Open Live Player\" button to view the broadcast directly on the provider's platform."
            }
          },
          {
            "@type": "Question",
            "name": "How often are live match streams updated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The live match list and streaming feeds are updated continuously before and during every scheduled match day."
            }
          }
        ]
      }
    ];
    preRenderedBody = `
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <nav aria-label="Breadcrumb" class="mb-4 text-xs font-mono">
          <ol class="flex items-center space-x-2 text-slate-400">
            <li><a href="/" class="hover:text-[#22c55e]">Home</a></li>
            <li>/</li>
            <li><span class="text-[#22c55e]">Live Streams</span></li>
          </ol>
        </nav>
        <h1 class="text-3xl sm:text-4xl font-black font-display text-white mb-2">Live Sports Streaming</h1>
        <p class="text-sm text-slate-300 mb-8 max-w-3xl">Watch live sports online with The Sports Room. Find cricket, football, basketball, tennis, F1 and more with live match updates.</p>
        
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">Watch Live Sports Online</h2>
          <p class="text-sm text-slate-300 leading-relaxed">Follow live sports coverage from around the world on The Sports Room. Watch cricket matches, football games, tennis tournaments, basketball showdowns, and motorsport events in real time. Whether you want to follow international series, major league rivalries, or championship finals, The Sports Room provides match streaming embeds, live scorecards, and real-time updates for passionate sports fans.</p>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section>
            <h2 class="text-xl font-bold text-white mb-2">Live Cricket Streaming</h2>
            <p class="text-sm text-slate-300 leading-relaxed">Cricket fans can track major tournaments and bilateral series across all formats—Test cricket, One Day Internationals (ODIs), and T20 leagues. Follow live matches from the ICC Cricket World Cup, ICC Champions Trophy, Asia Cup, Pakistan Super League (PSL), Indian Premier League (IPL), Big Bash League (BBL), and bilateral international series. Stay updated with ball-by-ball developments, batting strike rates, bowling figures, and live commentary feeds.</p>
          </section>
          <section>
            <h2 class="text-xl font-bold text-white mb-2">Live Football Streaming</h2>
            <p class="text-sm text-slate-300 leading-relaxed">Catch live football matches from top domestic leagues and continental competitions across Europe and worldwide. Follow the UEFA Champions League, English Premier League (EPL), La Liga, Serie A, Bundesliga, and international fixtures including the FIFA World Cup and UEFA European Championship. Track live scores, goal alerts, lineup formations, and tactical match moments.</p>
          </section>
        </div>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-base font-semibold text-emerald-400">How can I watch live sports on The Sports Room?</h3>
              <p class="text-sm text-slate-300">You can watch live sports directly on this page by selecting any active match card from the list above. The player will load the official live stream embed or broadcast link automatically.</p>
            </div>
            <div>
              <h3 class="text-base font-semibold text-emerald-400">What sports are available for live streaming?</h3>
              <p class="text-sm text-slate-300">The Sports Room features live streams and match updates for cricket, football, Formula 1, tennis, basketball, and field hockey whenever official broadcasts or embed feeds are active.</p>
            </div>
            <div>
              <h3 class="text-base font-semibold text-emerald-400">Is live sports streaming free on The Sports Room?</h3>
              <p class="text-sm text-slate-300">Yes, accessing the live match player, live scorecards, match analysis, and community chat on The Sports Room is completely free.</p>
            </div>
          </div>
        </section>
      </main>
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
