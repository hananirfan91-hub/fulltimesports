import express from "express";
import path from "path";
import fs from "fs";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { renderSSRPage, supabase, CATEGORIES_ROTATION, getRandomSportImage } from "./src/server/ssrRenderer.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// High-Performance Gzip/Brotli Compression for all textual and JSON responses
app.use(compression());

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
    { loc: `${baseUrl}/sports-atlas`, changefreq: "weekly", priority: "0.6", lastmod: todayIso },
    { loc: `${baseUrl}/glossary`, changefreq: "weekly", priority: "0.7", lastmod: todayIso }
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

  // Preserve all existing entries from public/sitemap.xml while automatically adding any new URLs
  const sitemapEntries = new Map<string, { loc: string; lastmod?: string; changefreq?: string; priority?: string }>();

  // 1. Seed with existing entries from public/sitemap.xml so existing sitemap content is NEVER lost
  try {
    const staticSitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    if (fs.existsSync(staticSitemapPath)) {
      const staticXml = fs.readFileSync(staticSitemapPath, "utf-8");
      const urlBlocks = staticXml.match(/<url>[\s\S]*?<\/url>/gi) || [];
      for (const block of urlBlocks) {
        const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
        if (locMatch && locMatch[1]) {
          const rawLoc = locMatch[1].trim();
          const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/i);
          const changefreqMatch = block.match(/<changefreq>(.*?)<\/changefreq>/i);
          const priorityMatch = block.match(/<priority>(.*?)<\/priority>/i);
          
          sitemapEntries.set(rawLoc, {
            loc: rawLoc,
            lastmod: lastmodMatch ? lastmodMatch[1].trim() : undefined,
            changefreq: changefreqMatch ? changefreqMatch[1].trim() : undefined,
            priority: priorityMatch ? priorityMatch[1].trim() : undefined
          });
        }
      }
    }
  } catch (readErr) {
    console.warn("[Sitemap Builder] Could not read static public/sitemap.xml:", readErr);
  }

  // 2. Add/merge coreUrls, categoryUrls, topicUrls, playerUrls, postUrls
  const allUrls = [...coreUrls, ...categoryUrls, ...topicUrls, ...playerUrls, ...postUrls];
  allUrls.forEach(item => {
    // Standardize URL to current host and primary thesportsroom.online domain
    const standardLoc = item.loc;
    const existing = sitemapEntries.get(standardLoc);
    if (!existing) {
      sitemapEntries.set(standardLoc, item);
    } else {
      // Keep existing data, update lastmod if newer
      if (item.lastmod && (!existing.lastmod || item.lastmod > existing.lastmod)) {
        existing.lastmod = item.lastmod;
      }
    }
  });

  const xmlItems = Array.from(sitemapEntries.values()).map(item => `  <url>
    <loc>${item.loc}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>\n    ` : ''}${item.changefreq ? `<changefreq>${item.changefreq}</changefreq>\n    ` : ''}${item.priority ? `<priority>${item.priority}</priority>\n  ` : ''}</url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
}

// Helper to append a newly published URL directly to static sitemap files on disk
function appendUrlToStaticSitemaps(newLoc: string, lastmod?: string, changefreq = "weekly", priority = "0.8") {
  const filePaths = [
    path.join(process.cwd(), "public", "sitemap.xml"),
    path.join(process.cwd(), "sitemap.xml"),
    path.join(process.cwd(), "public", "news-sitemap.xml"),
    path.join(process.cwd(), "news-sitemap.xml")
  ];

  const dateStr = lastmod || new Date().toISOString().split("T")[0];
  const urlSnippet = `  <url>\n    <loc>${newLoc}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n</urlset>`;

  filePaths.forEach(fp => {
    try {
      if (fs.existsSync(fp)) {
        let content = fs.readFileSync(fp, "utf-8");
        // Check if URL already exists
        if (!content.includes(`<loc>${newLoc}</loc>`)) {
          if (content.includes("</urlset>")) {
            content = content.replace("</urlset>", urlSnippet);
            fs.writeFileSync(fp, content, "utf-8");
          }
        }
      }
    } catch (e) {
      console.warn(`[Sitemap Auto-Add] Failed to append to ${fp}:`, e);
    }
  });
}

// Endpoint to automatically add any new article or page URL into sitemap files
app.post("/api/sitemap/add", (req, res) => {
  try {
    const { url, slug, type = "article", lastmod, changefreq, priority } = req.body || {};
    let finalUrl = url;
    if (!finalUrl && slug) {
      finalUrl = type === "player" 
        ? `https://thesportsroom.online/player/${slug}` 
        : `https://thesportsroom.online/blog/${slug}`;
    }

    if (!finalUrl) {
      return res.status(400).json({ error: "Missing url or slug" });
    }

    appendUrlToStaticSitemaps(
      finalUrl, 
      lastmod, 
      changefreq || (type === "page" ? "monthly" : "weekly"), 
      priority || (type === "page" ? "0.8" : "0.8")
    );

    res.json({ success: true, added: finalUrl });
  } catch (err: any) {
    console.error("Error in /api/sitemap/add:", err);
    res.status(500).json({ error: err.message || "Failed to add to sitemap" });
  }
});

// Dynamic XML Sitemap Endpoint
app.get("/sitemap.xml", async (req, res) => {
  try {
    const host = req.get("host") || "thesportsroom.online";
    const xml = await getSitemapXML(host);
    res.header("Content-Type", "application/xml; charset=utf-8");
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

// Note: renderSSRPage is imported from ./src/server/ssrRenderer.ts

// Primary Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ftsBroadcastNode: "active" });
});

// In-Memory Fast Cache for Cricket Matches to prevent duplicate external HTTP loops & improve API response time
let matchesCache: { data: any; timestamp: number } | null = null;
const MATCHES_CACHE_TTL_MS = 25000; // 25 seconds server cache

// SportScore Cricket Matches Proxy Endpoint with Live Detail Enrichment & In-Memory Cache
app.get("/api/cricket/matches", async (req, res) => {
  const now = Date.now();
  if (matchesCache && (now - matchesCache.timestamp < MATCHES_CACHE_TTL_MS)) {
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Cache-Status", "HIT");
    return res.json(matchesCache.data);
  }

  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const apiUrl = `https://sportscore.com/api/widget/matches/?sport=cricket&limit=${limit}`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      if (matchesCache) {
        // Return stale cache if external endpoint has transient failure
        return res.json(matchesCache.data);
      }
      throw new Error(`SportScore API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.matches)) {
      // Enrich matches with live detail endpoint in parallel
      data.matches = await Promise.all(
        data.matches.map(async (m: any) => {
          const slug = m.url ? m.url.replace(/^\/cricket\/match\/|\/$/g, "") : null;
          const isLiveOrFinished = m.status === "live" || 
            (m.status_text && (m.status_text.toLowerCase().includes("live") || m.status_text.toLowerCase().includes("innings") || m.status_text.toLowerCase().includes("in progress"))) ||
            (!m.home_score || m.home_score === "-");

          if (slug && isLiveOrFinished) {
            try {
              const detailRes = await fetch(`https://sportscore.com/api/widget/match/?sport=cricket&slug=${slug}`, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  "Accept": "application/json"
                },
                signal: AbortSignal.timeout(2000)
              });
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                const detailMatch = detailData?.match;
                if (detailMatch) {
                  const updatedHomeScore = (detailMatch.home_score && detailMatch.home_score !== "-") ? detailMatch.home_score : m.home_score;
                  const updatedAwayScore = (detailMatch.away_score && detailMatch.away_score !== "-") ? detailMatch.away_score : m.away_score;
                  const updatedStatus = detailMatch.status || m.status;
                  const updatedStatusText = detailMatch.status_text || m.status_text;

                  return {
                    ...m,
                    home_score: updatedHomeScore,
                    away_score: updatedAwayScore,
                    status: updatedStatus,
                    status_text: updatedStatusText,
                    detail_enriched: true
                  };
                }
              }
            } catch {
              // Graceful fallback to default match object
            }
          }
          return m;
        })
      );

      matchesCache = { data, timestamp: Date.now() };
    }

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Cache-Status", "MISS");
    return res.json(data);
  } catch (error: any) {
    console.error("[Cricket API] Error fetching matches from SportScore:", error);
    if (matchesCache) {
      return res.json(matchesCache.data);
    }
    return res.status(502).json({
      error: "Cricket matches are temporarily unavailable.",
      message: error?.message || "Failed to fetch from SportScore",
      matches: []
    });
  }
});

// Configure Vite dynamic middleware for Hot Rebuilding development or static production serving
async function configureApp() {
  const distPath = path.join(process.cwd(), "dist");
  const publicPath = path.join(process.cwd(), "public");

  // Always serve pre-built hashed assets and static files with high performance caching
  app.use("/assets", express.static(path.join(distPath, "assets"), {
    maxAge: "1y",
    immutable: true
  }));
  app.use(express.static(distPath, {
    index: false,
    maxAge: "7d",
    setHeaders: (res, filePath) => {
      if (filePath.includes("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/\.(jpg|jpeg|png|webp|avif|svg|ico)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    }
  }));
  app.use(express.static(publicPath, { index: false }));

  if (process.env.NODE_ENV !== "production") {
    console.log("[FTS] Mounting Vite dynamic middleware for active dev reload...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      // Let static assets / non-HTML requests pass through
      if (url.includes(".") && !url.endsWith(".html")) {
        return next();
      }
      try {
        const host = req.get("host") || "thesportsroom.online";
        const indexPath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf8");
        template = await vite.transformIndexHtml(url, template);
        const renderedHtml = await renderSSRPage(url, template, host);
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(renderedHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("[FTS] Configuring Express static directory assets serving with caching...");
    const distPath = path.join(process.cwd(), "dist");
    const fs = await import("fs");
    app.use(express.static(distPath, { 
      index: false,
      maxAge: "7d",
      setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/")) {
          // Hashed Vite assets can be cached for 1 year
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(jpg|jpeg|png|webp|avif|svg|ico)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      }
    }));
    app.get("*", async (req, res) => {
      const host = req.get("host") || "thesportsroom.online";
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        const rawHtml = fs.readFileSync(indexPath, "utf8");
        const renderedHtml = await renderSSRPage(req.url, rawHtml, host);
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
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
