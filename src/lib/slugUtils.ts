export function normalizeSlug(raw: string): string {
  if (!raw) return '';
  
  // Remove URL domain or route prefixes if raw is a full path or URL
  let cleaned = raw.replace(/^(https?:\/\/[^\/]+)?(\/blog\/|\/sport\/|\/)?/, '');
  
  // Clean query strings & hash tags
  cleaned = cleaned.split('?')[0].split('#')[0];
  
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // Keep raw if URI decode fails
  }

  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
