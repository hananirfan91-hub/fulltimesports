import { Post } from '../types';
import { detectEntitiesInText } from './entityRegistry';

export interface RelatedArticleScore {
  post: Post;
  score: number;
  matchingEntities: string[];
}

/**
 * Intelligent Related Articles Engine
 * Uses Category, Entity detection, Keyword Tags, and Freshness to calculate semantic relevance.
 */
export function getSmartRelatedArticles(currentPost: Post, allPosts: Post[], limit = 6): Post[] {
  if (!currentPost || !allPosts || allPosts.length === 0) return [];

  const currentEntities = detectEntitiesInText(`${currentPost.title} ${currentPost.content} ${(currentPost.tags || []).join(' ')}`);
  const currentEntitySlugs = new Set(currentEntities.map(e => e.slug));

  const scored: RelatedArticleScore[] = allPosts
    .filter(p => p.id !== currentPost.id)
    .map(p => {
      let score = 0;
      const matchingEntities: string[] = [];

      // Category match (+30)
      if (p.category && currentPost.category && p.category.toLowerCase().trim() === currentPost.category.toLowerCase().trim()) {
        score += 30;
      }

      // Type match (news vs blog) (+10)
      if (p.type === currentPost.type) {
        score += 10;
      }

      // Entity overlap (+20 per shared entity)
      const pEntities = detectEntitiesInText(`${p.title} ${p.content} ${(p.tags || []).join(' ')}`);
      pEntities.forEach(e => {
        if (currentEntitySlugs.has(e.slug)) {
          score += 20;
          if (!matchingEntities.includes(e.name)) {
            matchingEntities.push(e.name);
          }
        }
      });

      // Tags overlap (+15 per shared tag)
      if (p.tags && currentPost.tags) {
        const currentTagsLower = currentPost.tags.map(t => t.toLowerCase());
        p.tags.forEach(t => {
          if (currentTagsLower.includes(t.toLowerCase())) {
            score += 15;
          }
        });
      }

      // Same author bonus (+5)
      if (p.author && currentPost.author && p.author === currentPost.author) {
        score += 5;
      }

      // Recency weighting
      const postDate = new Date(p.created_at).getTime();
      const now = new Date().getTime();
      const daysOld = Math.max(0, (now - postDate) / (1000 * 60 * 60 * 24));
      if (daysOld < 7) score += 15;
      else if (daysOld < 30) score += 8;

      return { post: p, score, matchingEntities };
    });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.post);
}

/**
 * Bidirectional Linking Engine
 * Finds other articles in the database that reference entities featured in the current article.
 */
export function getBidirectionalReferences(currentPost: Post, allPosts: Post[], limit = 5): Post[] {
  if (!currentPost || !allPosts) return [];

  const currentEntities = detectEntitiesInText(`${currentPost.title} ${currentPost.content}`);
  if (currentEntities.length === 0) return [];

  const entityNamesLower = currentEntities.map(e => e.name.toLowerCase());

  return allPosts
    .filter(p => p.id !== currentPost.id)
    .filter(p => {
      const pText = `${p.title} ${p.content}`.toLowerCase();
      return entityNamesLower.some(name => pText.includes(name));
    })
    .slice(0, limit);
}
