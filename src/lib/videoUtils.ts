/**
 * Safely extracts a clean, valid 11-character YouTube video ID from any YouTube URL,
 * share link, embed link, or raw ID string (including strings with query params like ?si=...).
 */
export function getYouTubeId(urlOrId?: string | null, fallbackId: string = 'YBzE8S5S9_U'): string {
  if (!urlOrId || typeof urlOrId !== 'string') return fallbackId;

  const trimmed = urlOrId.trim();
  if (!trimmed) return fallbackId;

  // 1. Match full YouTube URLs or embed paths
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  let candidateId = '';
  if (match && match[1]) {
    candidateId = match[1];
  } else {
    // 2. Extract base ID before any query parameters or slashes (e.g. "7-ukxXhmggE?si=5wC6jEDJx8DN0DEk" -> "7-ukxXhmggE")
    candidateId = trimmed.split(/[?&#\/]/)[0].trim();
  }

  // 3. Known deleted/unavailable YouTube IDs fallback check
  const brokenIds = ['7-ukxXhmggE'];
  if (brokenIds.includes(candidateId)) {
    return fallbackId;
  }

  // Standard YouTube IDs are exactly 11 characters of [a-zA-Z0-9_-]
  if (/^[a-zA-Z0-9_-]{11}$/.test(candidateId)) {
    return candidateId;
  }

  return fallbackId;
}
