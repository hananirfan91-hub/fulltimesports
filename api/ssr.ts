import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = req.url || "/";
    const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "thesportsroom.online";

    const distIndexPath = path.join(process.cwd(), "dist", "index.html");
    const rootIndexPath = path.join(process.cwd(), "index.html");

    let rawHtml = "";
    if (fs.existsSync(distIndexPath)) {
      rawHtml = fs.readFileSync(distIndexPath, "utf8");
    } else if (fs.existsSync(rootIndexPath)) {
      rawHtml = fs.readFileSync(rootIndexPath, "utf8");
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end("<!doctype html><html><head><title>The Sports Room</title></head><body><div id='root'></div></body></html>");
      return;
    }

    try {
      const { renderSSRPage } = await import("../src/server/ssrRenderer.js").catch(() => import("../src/server/ssrRenderer"));
      if (typeof renderSSRPage === "function") {
        const renderedHtml = await renderSSRPage(url, rawHtml, host);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
        res.end(renderedHtml);
        return;
      }
    } catch {
      // If dynamic SSR module loading fails in serverless environment, serve static HTML seamlessly
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.end(rawHtml);
  } catch (error) {
    console.error("[SSR Handler Fallback]", error);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<!doctype html><html><head><title>The Sports Room</title></head><body><div id='root'></div></body></html>");
  }
}
