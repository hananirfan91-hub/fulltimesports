// Vercel Serverless Function for SportScore Cricket API with Live Detail Enrichment

export default async function handler(req: any, res: any) {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 50;
    const apiUrl = `https://sportscore.com/api/widget/matches/?sport=cricket&limit=${limit}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`SportScore API responded with HTTP status ${response.status}`);
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
                signal: AbortSignal.timeout(3000)
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
              // Graceful fallback
            }
          }
          return m;
        })
      );
    }

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("[Vercel Function] Error in /api/cricket/matches:", error);
    return res.status(502).json({
      error: "Cricket matches are temporarily unavailable.",
      message: error?.message || "Failed to fetch from SportScore",
      matches: []
    });
  }
}
