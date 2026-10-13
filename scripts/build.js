import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("[Build] Starting comprehensive deployment build...");

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");

// 1. Ensure dist and dist/assets directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
const distAssetsDir = path.join(distDir, "assets");
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

// 2. Copy root index.html to dist/index.html
const rootIndexHtml = path.join(rootDir, "index.html");
const distIndexHtml = path.join(distDir, "index.html");
if (fs.existsSync(rootIndexHtml)) {
  fs.copyFileSync(rootIndexHtml, distIndexHtml);
  console.log("[Build] Copied index.html -> dist/index.html");
} else {
  console.warn("[Build] Warning: root index.html not found!");
}

// 3. Copy all public assets to dist
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
  console.log("[Build] Copied public/ -> dist/");
}

// 4. Bundle server.ts with esbuild
console.log("[Build] Bundling server.ts...");
execSync(
  "npx esbuild server.ts --bundle --platform=node --format=cjs --outfile=dist/server.cjs --sourcemap --external:vite --external:express --external:compression --external:dotenv --external:@supabase/supabase-js --external:axios --external:cheerio",
  { stdio: "inherit" }
);

// 5. Generate dynamic XML sitemaps
console.log("[Build] Generating XML sitemaps...");
execSync("npx tsx generate-sitemap.ts", { stdio: "inherit" });

// 6. Ensure robots.txt & sitemap.xml exist in dist
["sitemap.xml", "robots.txt"].forEach((file) => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

console.log("[Build] Build completed successfully. Verified dist/index.html exists:", fs.existsSync(distIndexHtml));
