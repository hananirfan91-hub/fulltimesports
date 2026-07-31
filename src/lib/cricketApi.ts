export interface RapidCricketMatch {
  id: string;
  name?: string;
  team1: string;
  team2: string;
  score1?: string;
  score2?: string;
  status: string;
  venue?: string;
  seriesName?: string;
  date?: string;
}

export interface RapidCricketTeam {
  teamId: string;
  teamName: string;
  teamShortName?: string;
  imageId?: string;
}

export interface RapidCricketSeries {
  seriesId: string;
  seriesName: string;
  startDate?: string;
  endDate?: string;
}

const CRICKET_API_KEY = "333e20b7-7546-4241-85ef-0b75afd79388";
const RAPID_API_HOST = "cricket-api-free-data.p.rapidapi.com";
const RAPID_BASE_URL = "https://cricket-api-free-data.p.rapidapi.com";
const CRICAPI_BASE_URL = "https://api.cricapi.com/v1";

const rapidHeaders = {
  "Content-Type": "application/json",
  "x-rapidapi-host": RAPID_API_HOST,
  "x-rapidapi-key": CRICKET_API_KEY,
};

// In-memory cache to prevent excessive quota consumption
const apiCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

async function fetchCricketApi<T>(rapidEndpoint: string, cricapiEndpoint?: string): Promise<T | null> {
  const cacheKey = rapidEndpoint;
  const cached = apiCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  // 1. Try CricAPI direct endpoint if provided
  if (cricapiEndpoint) {
    try {
      const sep = cricapiEndpoint.includes('?') ? '&' : '?';
      const cricUrl = `${CRICAPI_BASE_URL}${cricapiEndpoint}${sep}apikey=${CRICKET_API_KEY}`;
      const response = await fetch(cricUrl);
      if (response.ok) {
        const json = await response.json();
        if (json && (json.status === "success" || json.data)) {
          apiCache[cacheKey] = { timestamp: Date.now(), data: json };
          return json as T;
        }
      }
    } catch (err) {
      console.warn(`CricAPI call failed:`, err);
    }
  }

  // 2. Try RapidAPI endpoint
  try {
    const sep = rapidEndpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${RAPID_BASE_URL}${rapidEndpoint}${sep}apikey=${CRICKET_API_KEY}`, {
      method: 'GET',
      headers: rapidHeaders,
    });

    if (response.ok) {
      const json = await response.json();
      apiCache[cacheKey] = { timestamp: Date.now(), data: json };
      return json as T;
    }
  } catch (err) {
    console.error(`Error fetching RapidAPI ${rapidEndpoint}:`, err);
  }

  return cached ? (cached.data as T) : null;
}

/**
 * Fetch Live Scores
 */
export async function getLiveCricketScores() {
  return fetchCricketApi<any>("/cricket-livescores", "/currentMatches");
}

/**
 * Fetch Upcoming Matches
 */
export async function getUpcomingCricketMatches() {
  return fetchCricketApi<any>("/cricket-matches-upcoming", "/matches");
}

/**
 * Fetch Recent Matches
 */
export async function getRecentCricketMatches() {
  return fetchCricketApi<any>("/cricket-matches-recent", "/currentMatches");
}

/**
 * Fetch Live Matches List
 */
export async function getLiveCricketMatches() {
  return fetchCricketApi<any>("/cricket-matches-live", "/crikScore");
}

/**
 * Fetch Cricket Schedule (All, International, League, Domestic, Women)
 */
export async function getCricketSchedule(type: 'all' | 'international' | 'league' | 'domestic' | 'women' = 'all') {
  let endpoint = "/cricket-schedule";
  if (type === 'international') endpoint = "/cricket-schedule-international";
  if (type === 'league') endpoint = "/cricket-schedule-league";
  if (type === 'domestic') endpoint = "/cricket-schedule-domestic";
  if (type === 'women') endpoint = "/cricket-schedule-women";
  return fetchCricketApi<any>(endpoint, "/matches");
}

/**
 * Fetch Cricket Series List
 */
export async function getCricketSeries(type: 'all' | 'international' | 'league' | 'domestic' | 'women' = 'all') {
  let endpoint = "/cricket-series";
  if (type === 'international') endpoint = "/cricket-series-international";
  if (type === 'league') endpoint = "/cricket-series-leagues";
  if (type === 'domestic') endpoint = "/cricket-series-domestic";
  if (type === 'women') endpoint = "/cricket-series-women";
  return fetchCricketApi<any>(endpoint, "/series");
}

/**
 * Fetch Teams (International, League, Domestic, Women)
 */
export async function getCricketTeams(type: 'international' | 'league' | 'domestic' | 'women' = 'international') {
  let endpoint = "/cricket-teams";
  if (type === 'league') endpoint = "/cricket-teams-league";
  if (type === 'domestic') endpoint = "/cricket-teams-domestic";
  if (type === 'women') endpoint = "/cricket-teams-women";
  return fetchCricketApi<any>(endpoint, "/teams");
}

/**
 * Fetch Players for a Team
 */
export async function getCricketPlayers(teamId: string = '2') {
  return fetchCricketApi<any>(`/cricket-players?teamid=${encodeURIComponent(teamId)}`, `/players?teamid=${encodeURIComponent(teamId)}`);
}

/**
 * Fetch Match Scoreboard
 */
export async function getMatchScoreboard(matchId: string) {
  return fetchCricketApi<any>(`/cricket-match-scoreboard?matchid=${encodeURIComponent(matchId)}`, `/match_info?id=${encodeURIComponent(matchId)}`);
}

/**
 * Fetch Match Info
 */
export async function getMatchInfo(matchId: string) {
  return fetchCricketApi<any>(`/cricket-match-info?matchid=${encodeURIComponent(matchId)}`, `/match_info?id=${encodeURIComponent(matchId)}`);
}
