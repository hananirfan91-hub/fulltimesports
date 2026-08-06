import { DB } from './db';
import { Post, Category, LiveStreamItem } from '../types';

export interface SearchResult {
  text: string;
  matchedPosts?: Post[];
  suggestedLinks?: { label: string; url: string }[];
}

// Static Knowledge Base for TSR Platform
const PLATFORM_FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['owner', 'founder', 'who created', 'who owns', 'hanan', 'author', 'editor'],
    answer: "**The Sports Room (TSR)** is founded and directed solely by **Hanan Irfan**, an independent sports journalist dedicated to 100% human editorial integrity, verified match reporting, and deep tactical analysis without AI clickbait. Learn more on our [About Us](/about-us) or [Why Choose Us](/why-choose-us) pages!"
  },
  {
    keywords: ['live', 'stream', 'broadcast', 'watch', 'match', 'channel'],
    answer: "You can watch HD live sports broadcasts with interactive commentary directly in our [Live Streams](/live-streams) center! We embed live feeds for Cricket, Football, and F1 matches."
  },
  {
    keywords: ['what is', 'about the sports room', 'platform', 'tsr', 'mission'],
    answer: "**The Sports Room** is a premier independent sports media platform delivering tactical breakdowns, match analytics, and in-depth sports journalism across Cricket, Football, Formula 1, Basketball, Tennis, Esports, Hockey, and Volleyball. Explore [What Is TSR](/what-is-the-sports-room) for complete details."
  },
  {
    keywords: ['why choose', 'guarantee', 'features', 'benefits', 'special'],
    answer: "We offer 10 core editorial principles: 100% human-authored articles, deep tactical analysis, live embedded match feeds, global sports atlas, zero clickbait, and verified sports statistics. Read our full manifesto at [Why Choose Us](/why-choose-us)."
  },
  {
    keywords: ['atlas', 'map', 'stadium', 'geography', 'venues'],
    answer: "Explore stadium locations, iconic sporting venues, and global fan demographics using our interactive [Sports Atlas](/sports-atlas)!"
  },
  {
    keywords: ['contact', 'support', 'ticket', 'email', 'submit', 'message'],
    answer: "You can reach out directly to founder Hanan Irfan or submit an editorial support ticket at our [Contact Us](/contact-us) hub, or email us at `hananirfan91@gmail.com`."
  },
  {
    keywords: ['rankings', 'stats', 'standings', 'leaderboard', 'icc'],
    answer: "Check out official team standings, player stats, and historical rankings across major sports in our [Rankings](/rankings) section and [Knowledge Hub](/knowledge-hub)!"
  },
  {
    keywords: ['privacy', 'terms', 'disclaimer', 'policy', 'rules'],
    answer: "We prioritize user privacy and editorial transparency. Read our official policies: [Privacy Policy](/privacy-policy), [Terms of Service](/terms), and [Disclaimer](/disclaimer)."
  }
];

export async function answerQueryFromDatabase(userQuery: string): Promise<string> {
  const queryLower = userQuery.toLowerCase().trim();

  // 1. Check Platform FAQs first for direct hit
  for (const faq of PLATFORM_FAQS) {
    if (faq.keywords.some(kw => queryLower.includes(kw))) {
      return faq.answer;
    }
  }

  // 2. Fetch all real content from the Database
  let posts: Post[] = [];
  let categories: Category[] = [];
  let liveStreams: LiveStreamItem[] = [];

  try {
    posts = await DB.getPosts();
    categories = await DB.getCategories();
    liveStreams = await DB.getLiveStreams();
  } catch (err) {
    console.error("Knowledge Engine DB fetch error:", err);
  }

  // 3. Search database for sports category match
  const matchedCategory = categories.find(c => 
    queryLower.includes(c.name.toLowerCase()) || queryLower.includes(c.slug.toLowerCase())
  );

  // 4. Score database posts against user query
  const words = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  const scoredPosts = posts.map(post => {
    let score = 0;
    const titleLower = post.title.toLowerCase();
    const contentLower = (post.content || '').toLowerCase();
    const excerptText = post.meta_description || post.subheading || post.geo_summary || post.aeo_direct_answer || post.content.substring(0, 150) + '...';
    const excerptLower = excerptText.toLowerCase();
    const categoryLower = post.category.toLowerCase();
    const tagsStr = (post.tags || []).join(' ').toLowerCase();

    // Exact phrase match in title
    if (titleLower.includes(queryLower)) score += 20;

    // Word matches
    words.forEach(word => {
      if (titleLower.includes(word)) score += 5;
      if (categoryLower.includes(word)) score += 4;
      if (tagsStr.includes(word)) score += 3;
      if (excerptLower.includes(word)) score += 2;
      if (contentLower.includes(word)) score += 1;
    });

    return { post, excerptText, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  // 5. Synthesize intelligent answer based on Database results
  if (scoredPosts.length > 0) {
    const topItem = scoredPosts[0];
    const topPost = topItem.post;
    const relatedPosts = scoredPosts.slice(1, 3).map(p => p.post);

    let response = `Based on **The Sports Room** database, here is the most relevant article matching your query:\n\n`;
    response += `📌 **[${topPost.title}](/blog/${topPost.slug})**\n`;
    response += `*Category:* ${topPost.category.toUpperCase()} | *By:* ${topPost.author}\n`;
    response += `> ${topItem.excerptText}\n\n`;

    if (relatedPosts.length > 0) {
      response += `**More related articles from our database:**\n`;
      relatedPosts.forEach(rp => {
        response += `- [${rp.title}](/blog/${rp.slug})\n`;
      });
    }

    if (matchedCategory) {
      response += `\nYou can also explore the full **[${matchedCategory.name} Hub](/sport/${matchedCategory.slug})** for more updates!`;
    }

    return response;
  }

  // 6. If no specific post score matched, check category match
  if (matchedCategory) {
    const categoryPosts = posts.filter(p => p.category.toLowerCase() === matchedCategory.slug.toLowerCase());
    let catResponse = `Welcome to **The Sports Room ${matchedCategory.name} Hub**!\n\n${matchedCategory.description}\n\n`;
    catResponse += `Explore the **[${matchedCategory.name} Section](/sport/${matchedCategory.slug})** for the latest tactical breakdowns.`;
    
    if (categoryPosts.length > 0) {
      catResponse += `\n\n**Featured Articles:**\n`;
      categoryPosts.slice(0, 3).forEach(p => {
        catResponse += `- [${p.title}](/blog/${p.slug})\n`;
      });
    }
    return catResponse;
  }

  // 7. Check if asking about live streams
  if (queryLower.includes('stream') || queryLower.includes('match') || queryLower.includes('score') || queryLower.includes('fixture')) {
    let streamResp = `We have active embedded match feeds in our **[Live Streams](/live-streams)** center!\n\n`;
    if (liveStreams.length > 0) {
      streamResp += `**Available Streams:**\n`;
      liveStreams.slice(0, 3).forEach(s => {
        streamResp += `- **${s.title}** (${s.match_name || s.tournament || 'Live Match'} - ${s.status.toUpperCase()})\n`;
      });
    }
    return streamResp;
  }

  // 8. General fallback response with helpful directory
  return `I searched **The Sports Room** database for "${userQuery}". While I couldn't find an exact article title match, here are the core sections you can explore:\n\n` +
    `- 🏏 **[Cricket Hub](/sport/cricket)** — PSL, IPL, ICC World Cup & spin biomechanics\n` +
    `- ⚽ **[Football Hub](/sport/football)** — Premier League, Champions League & tactical breakdowns\n` +
    `- 🏎️ **[Formula 1 Hub](/sport/f1)** — Aerodynamics, Telemetry & Grand Prix analysis\n` +
    `- 📺 **[Live Streams](/live-streams)** — Embedded HD match feeds with live commentary\n` +
    `- 🗺️ **[Sports Atlas](/sports-atlas)** — Interactive stadium map and sports geography\n` +
    `- 👤 **[About Founder Hanan Irfan](/about-us)** — Platform background and mission\n\n` +
    `Feel free to ask a question about specific sports, player analytics, or editorial policies!`;
}
