import { ENTITIES_REGISTRY, EntityDefinition } from './entityRegistry';

/**
 * Intelligent Internal Linking Engine for The Sports Room
 * Automatically links entity terms (Players, Teams, Tournaments, Countries)
 * to their dynamic topic hubs on first occurrence only.
 */
export function injectInternalLinks(content: string, currentArticleSlug?: string): string {
  if (!content) return content;

  // We sort entities by length descending so longer phrases ("Pakistan Cricket") take precedence over shorter sub-words ("Pakistan")
  const sortedEntities = [...ENTITIES_REGISTRY].sort((a, b) => b.name.length - a.name.length);
  const linkedEntitiesSet = new Set<string>();

  const lines = content.split('\n');
  let inCodeBlock = false;

  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    // Check for code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    // Skip code blocks, headings, markdown tables header separators, blockquote headers
    if (
      inCodeBlock ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('|') ||
      trimmed.startsWith('![') ||
      trimmed.startsWith('@[')
    ) {
      return line;
    }

    let modifiedLine = line;

    for (const entity of sortedEntities) {
      // Don't link if already linked in this document or if entity slug matches current article slug
      if (linkedEntitiesSet.has(entity.slug) || (currentArticleSlug && entity.slug === currentArticleSlug)) {
        continue;
      }

      // Regex to match exact phrase on word boundaries that is NOT already inside an existing link [...] or HTML <a...>
      const entityRegex = new RegExp(`\\b(${escapeRegExp(entity.name)})\\b`, 'i');

      // Check if entity is present in line
      const match = entityRegex.exec(modifiedLine);
      if (match) {
        const matchedStr = match[1];
        const matchIndex = match.index;

        // Check if index is inside an existing link e.g. [text](url) or inside <a href="...">...</a>
        const prefix = modifiedLine.substring(0, matchIndex);
        const isInsideMarkdownLink = /\[[^\]]*$/.test(prefix) || /\]\([^)]*$/.test(prefix);
        const isInsideHtmlTag = /<a[^>]*>[^<]*$/i.test(prefix) || /<[^>]*$/.test(prefix);

        if (!isInsideMarkdownLink && !isInsideHtmlTag) {
          // Replace ONLY the first match on this line with an internal markdown link
          const replacement = `[${matchedStr}](/topic/${entity.slug})`;
          modifiedLine = modifiedLine.substring(0, matchIndex) + replacement + modifiedLine.substring(matchIndex + matchedStr.length);
          linkedEntitiesSet.add(entity.slug);
        }
      }
    }

    return modifiedLine;
  });

  return processedLines.join('\n');
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
