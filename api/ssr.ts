import fs from "fs";
import path from "path";
import { renderSSRPage } from "../src/server/ssrRenderer.ts";

let cachedTemplate: string | null = null;

function getHtmlTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const possiblePaths = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.resolve(__dirname, "../dist/index.html"),
    path.resolve(__dirname, "../index.html")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        cachedTemplate = fs.readFileSync(p, "utf8");
        return cachedTemplate;
      } catch (e) {
        console.warn(`[Vercel SSR] Failed reading template from ${p}:`, e);
      }
    }
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Sports Room</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
}

export default async function handler(req: any, res: any) {
  const url = req.url || "/";

  // Let static asset requests pass or return 404 if extension detected
  if (url.includes(".") && !url.endsWith(".html")) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  try {
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "thesportsroom.online";
    const template = getHtmlTemplate();
    const renderedHtml = await renderSSRPage(url, template, String(host));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    res.statusCode = 200;
    res.end(renderedHtml);
  } catch (error: any) {
    console.error("[Vercel SSR Handler Error]:", error);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    res.end(getHtmlTemplate());
  }
}
