import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
import { renderSSRPage } from "../src/server/ssrRenderer.ts";

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
      res.statusCode = 404;
      res.end("Application build index missing");
      return;
    }

    const renderedHtml = await renderSSRPage(url, rawHtml, host);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.end(renderedHtml);
  } catch (error) {
    console.error("[SSR Handler Error]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<h1>500 Internal Server Error</h1>");
  }
}
