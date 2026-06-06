import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

  const allUrls = [...coreUrls, ...categoryUrls, ...postUrls];
  
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
    const host = req.get("host") || "thesportsroom.vercel.app";
    const xml = await getSitemapXML(host);
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Failed to generate XML sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// Dynamic robots.txt
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "thesportsroom.vercel.app";
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") || host.includes("127.0.0.1") ? "http" : "https";
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${protocol}://${host}/sitemap.xml
`);
});

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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FTS] Full Time Sports server successfully listening at http://0.0.0.0:${PORT}`);
  });
}

configureApp().catch((err) => {
  console.error("Critical server configuration failure:", err);
});
