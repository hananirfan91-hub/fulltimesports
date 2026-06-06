import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rklhxooaljemearxlxap.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGh4b29hbGplbWVhcnhseGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODAzODYsImV4cCI6MjA5NjA1NjM4Nn0.E1gTPWDlC6YXZY_56PCkcKVCxa7_vlBPQlrf7bLxqp4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function generate() {
  console.log("[Sitemap Generator] Initializing static XML sitemap builder...");

  // Primary canonical domain
  const baseUrl = "https://fulltimesports.vercel.app";

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

  // Sport category URLs
  const categoryUrls = CATEGORIES_ROTATION.map(c => ({
    loc: `${baseUrl}/sport/${c}`,
    changefreq: "daily",
    priority: "0.9"
  }));

  // Query Supabase dynamic blog posts with published status checks
  const postUrls: Array<{ loc: string; changefreq: string; priority: string }> = [];
  try {
    const { data: posts, error } = await supabase
      .from("fts_posts")
      .select("slug, created_at, scheduled_for")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (posts) {
      const now = Date.now();
      posts.forEach((post: any) => {
        // Exclude drafts or future post timings
        if (post.scheduled_for === "draft") return;
        if (post.scheduled_for && new Date(post.scheduled_for).getTime() > now) return;

        postUrls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          changefreq: "weekly",
          priority: "0.8"
        });
      });
      console.log(`[Sitemap Generator] Successfully compiled ${posts.length} post paths from Supabase.`);
    }
  } catch (err) {
    console.warn("[Sitemap Generator] Supabase dynamic fetch failed. Using fallback posts lists:", err);
  }

  // Fallback lists if Supabase was completely empty or offline
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

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write files to public directory
  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const robotsPath = path.join(publicDir, "robots.txt");

  fs.writeFileSync(sitemapPath, sitemapXML, "utf8");
  fs.writeFileSync(robotsPath, robotsTxt, "utf8");

  // Also write directly to the project root directory
  const rootSitemapPath = path.join(process.cwd(), "sitemap.xml");
  const rootRobotsPath = path.join(process.cwd(), "robots.txt");

  fs.writeFileSync(rootSitemapPath, sitemapXML, "utf8");
  fs.writeFileSync(rootRobotsPath, robotsTxt, "utf8");

  console.log(`[Sitemap Generator] Written sitemap.xml to: ${sitemapPath} and ${rootSitemapPath}`);
  console.log(`[Sitemap Generator] Written robots.txt to: ${robotsPath} and ${rootRobotsPath}`);
  console.log("[Sitemap Generator] XML building completed successfully.");
}

generate().catch(err => {
  console.error("[Sitemap Generator] Build script failed:", err);
  process.exit(1);
});
