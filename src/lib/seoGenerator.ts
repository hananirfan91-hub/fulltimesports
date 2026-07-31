import { Post } from '../types';
import { detectEntitiesInText } from './entityRegistry';

/**
 * Ensures 100% SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization)
 * readiness for any post created or updated on The Sports Room desk.
 */
export function ensureFullSeoGeoAeo(post: Post): Post {
  const title = post.title || 'Sports Analysis & Live Coverage';
  const cleanContent = (post.content || '').replace(/<[^>]*>/g, '').replace(/[#*`]/g, '');
  const category = (post.category || 'cricket').toUpperCase();

  // Detect entities in text
  const detectedEntities = detectEntitiesInText(`${title} ${cleanContent}`);
  const entityNames = detectedEntities.map(e => e.name);

  // 1. Focus Keyword
  let focusKeyword = post.focus_keyword || '';
  if (!focusKeyword) {
    if (entityNames.length > 0) {
      focusKeyword = `${entityNames[0]} ${category.toLowerCase()}`;
    } else {
      focusKeyword = `${title.split(' ').slice(0, 3).join(' ')} ${category.toLowerCase()}`;
    }
  }

  // 2. Meta Title
  let metaTitle = post.meta_title || '';
  if (!metaTitle) {
    metaTitle = `${title} | The Sports Room Editorial`;
  }

  // 3. Meta Description
  let metaDescription = post.meta_description || '';
  if (!metaDescription) {
    const snippet = cleanContent.slice(0, 145).trim();
    metaDescription = snippet 
      ? `${snippet}... Read complete analysis & live sports commentary on The Sports Room.`
      : `Read detailed analysis, expert commentary, and latest updates on ${title} at The Sports Room.`;
  }

  // 4. GEO (Generative Engine Optimization) Summary
  let geoSummary = post.geo_summary || '';
  if (!geoSummary) {
    const primaryEntity = entityNames[0] || category;
    geoSummary = `KEY TAKEAWAY: This report delivers verified journalistic coverage of ${primaryEntity}. Key highlights include match performance metrics, team tactical shifts, and authoritative sports analysis published by The Sports Room desk.`;
  }

  // 5. GEO Entities
  let geoEntities = post.geo_entities || [];
  if (!geoEntities || geoEntities.length === 0) {
    geoEntities = entityNames.length > 0 ? entityNames : [category, 'Sports Journalism', 'Match Analysis'];
  }

  // 6. AEO (Answer Engine Optimization) Direct Answer
  let aeoDirectAnswer = post.aeo_direct_answer || '';
  if (!aeoDirectAnswer) {
    aeoDirectAnswer = `Q: What are the key points of ${title}? A: This article provides verified editorial analysis regarding ${title}, detailing match statistics, player performances, and official tournament standings.`;
  }

  // 7. AEO FAQ
  let aeoFaq = post.aeo_faq || [];
  if (!aeoFaq || aeoFaq.length === 0) {
    const primaryEntity = entityNames[0] || 'the match';
    aeoFaq = [
      {
        question: `What is the significance of ${title}?`,
        answer: `This publication provides in-depth reporting and statistical context around ${primaryEntity} during the current ${category} season.`
      },
      {
        question: `Where can I read updated analysis for ${primaryEntity}?`,
        answer: `The Sports Room provides real-time editorial updates, expert commentary, and match statistics.`
      }
    ];
  }

  return {
    ...post,
    focus_keyword: focusKeyword,
    meta_title: metaTitle,
    meta_description: metaDescription,
    geo_summary: geoSummary,
    geo_entities: geoEntities,
    aeo_direct_answer: aeoDirectAnswer,
    aeo_faq: aeoFaq,
    heading_tag: post.heading_tag || 'h1',
    schema_type: post.schema_type || 'NewsArticle',
    meta_robots: post.meta_robots || 'index, follow',
    canonical_url: post.canonical_url || `https://thesportsroom.online/blog/${post.slug || 'article'}`
  };
}
