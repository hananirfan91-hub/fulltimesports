export interface EntityDefinition {
  name: string;
  type: 'player' | 'team' | 'competition' | 'country' | 'venue' | 'sport';
  category: string; // e.g. 'cricket', 'football', 'formula-1', etc.
  slug: string;
  aliases?: string[];
  description?: string;
}

export const ENTITIES_REGISTRY: EntityDefinition[] = [
  // CRICKET PLAYERS
  { name: 'Babar Azam', type: 'player', category: 'cricket', slug: 'babar-azam', aliases: ['Babar', 'Azam'] },
  { name: 'Shaheen Afridi', type: 'player', category: 'cricket', slug: 'shaheen-afridi', aliases: ['Shaheen', 'Shaheen Shah Afridi'] },
  { name: 'Mohammad Rizwan', type: 'player', category: 'cricket', slug: 'mohammad-rizwan', aliases: ['Rizwan', 'M Rizwan'] },
  { name: 'Sufyan Muqeem', type: 'player', category: 'cricket', slug: 'sufyan-muqeem', aliases: ['Muqeem'] },
  { name: 'Naseem Shah', type: 'player', category: 'cricket', slug: 'naseem-shah', aliases: ['Naseem'] },
  { name: 'Fakhar Zaman', type: 'player', category: 'cricket', slug: 'fakhar-zaman', aliases: ['Fakhar'] },
  { name: 'Haris Rauf', type: 'player', category: 'cricket', slug: 'haris-rauf', aliases: ['Rauf'] },
  { name: 'Shadab Khan', type: 'player', category: 'cricket', slug: 'shadab-khan', aliases: ['Shadab'] },
  { name: 'Saim Ayub', type: 'player', category: 'cricket', slug: 'saim-ayub', aliases: ['Saim'] },
  { name: 'Virat Kohli', type: 'player', category: 'cricket', slug: 'virat-kohli', aliases: ['Kohli'] },
  { name: 'Rohit Sharma', type: 'player', category: 'cricket', slug: 'rohit-sharma', aliases: ['Rohit'] },
  { name: 'Jasprit Bumrah', type: 'player', category: 'cricket', slug: 'jasprit-bumrah', aliases: ['Bumrah'] },
  { name: 'Pat Cummins', type: 'player', category: 'cricket', slug: 'pat-cummins', aliases: ['Cummins'] },
  { name: 'Steve Smith', type: 'player', category: 'cricket', slug: 'steve-smith' },
  { name: 'Mitchell Starc', type: 'player', category: 'cricket', slug: 'mitchell-starc', aliases: ['Starc'] },
  { name: 'Joe Root', type: 'player', category: 'cricket', slug: 'joe-root', aliases: ['Root'] },
  { name: 'Ben Stokes', type: 'player', category: 'cricket', slug: 'ben-stokes', aliases: ['Stokes'] },
  { name: 'Kane Williamson', type: 'player', category: 'cricket', slug: 'kane-williamson', aliases: ['Williamson'] },
  { name: 'Rashid Khan', type: 'player', category: 'cricket', slug: 'rashid-khan' },

  // CRICKET TEAMS & COUNTRIES
  { name: 'Pakistan Cricket', type: 'team', category: 'cricket', slug: 'pakistan-cricket', aliases: ['Pakistan', 'Pak Cricket', 'Green Shirts'] },
  { name: 'India Cricket', type: 'team', category: 'cricket', slug: 'india-cricket', aliases: ['India', 'Team India', 'Men in Blue'] },
  { name: 'Australia Cricket', type: 'team', category: 'cricket', slug: 'australia-cricket', aliases: ['Australia', 'Aussies'] },
  { name: 'England Cricket', type: 'team', category: 'cricket', slug: 'england-cricket', aliases: ['England', 'Three Lions Cricket'] },
  { name: 'South Africa Cricket', type: 'team', category: 'cricket', slug: 'south-africa-cricket', aliases: ['South Africa', 'Proteas'] },
  { name: 'Bangladesh Cricket', type: 'team', category: 'cricket', slug: 'bangladesh-cricket', aliases: ['Bangladesh', 'Tigers'] },
  { name: 'Afghanistan Cricket', type: 'team', category: 'cricket', slug: 'afghanistan-cricket', aliases: ['Afghanistan'] },
  { name: 'New Zealand Cricket', type: 'team', category: 'cricket', slug: 'new-zealand-cricket', aliases: ['New Zealand', 'Black Caps'] },
  { name: 'Sri Lanka Cricket', type: 'team', category: 'cricket', slug: 'sri-lanka-cricket', aliases: ['Sri Lanka', 'Lions'] },

  // CRICKET LEAGUES & TOURNAMENTS
  { name: 'PSL', type: 'competition', category: 'cricket', slug: 'psl', aliases: ['Pakistan Super League', 'HBL PSL'] },
  { name: 'IPL', type: 'competition', category: 'cricket', slug: 'ipl', aliases: ['Indian Premier League', 'TATA IPL'] },
  { name: 'BBL', type: 'competition', category: 'cricket', slug: 'bbl', aliases: ['Big Bash League'] },
  { name: 'CPL', type: 'competition', category: 'cricket', slug: 'cpl', aliases: ['Caribbean Premier League'] },
  { name: 'SA20', type: 'competition', category: 'cricket', slug: 'sa20', aliases: ['SA20 League'] },
  { name: 'ILT20', type: 'competition', category: 'cricket', slug: 'ilt20' },
  { name: 'The Hundred', type: 'competition', category: 'cricket', slug: 'the-hundred' },
  { name: 'Cricket World Cup 2027', type: 'competition', category: 'cricket', slug: 'cricket-world-cup-2027', aliases: ['CWC 2027', 'World Cup 2027', '2027 World Cup', 'ICC World Cup 2027', 'ICC Cricket World Cup 2027', 'South Africa 2027'], description: 'Complete editorial coverage, schedules, qualifications, venues in South Africa, Zimbabwe, and Namibia, and match analysis for the ICC Cricket World Cup 2027.' },
  { name: 'ICC Cricket World Cup', type: 'competition', category: 'cricket', slug: 'icc-cricket-world-cup', aliases: ['World Cup', 'ODI World Cup'] },
  { name: 'ICC Champions Trophy', type: 'competition', category: 'cricket', slug: 'icc-champions-trophy', aliases: ['Champions Trophy'] },
  { name: 'ICC T20 World Cup', type: 'competition', category: 'cricket', slug: 'icc-t20-world-cup', aliases: ['T20 World Cup'] },
  { name: 'World Test Championship', type: 'competition', category: 'cricket', slug: 'world-test-championship', aliases: ['WTC'] },
  { name: 'Asia Cup', type: 'competition', category: 'cricket', slug: 'asia-cup' },
  { name: 'ICC Rankings', type: 'competition', category: 'cricket', slug: 'icc-rankings', aliases: ['ICC Test Rankings', 'ICC ODI Rankings', 'ICC T20 Rankings'], description: 'Official ICC player and team rankings across Test, ODI, and T20 international formats.' },
  { name: 'Knowledge Hub', type: 'competition', category: 'cricket', slug: 'knowledge-hub', aliases: ['Knowledge Base', 'Sports Science Hub', 'Tactical Manuals'], description: 'Comprehensive sports science, biomechanics, tactical manuals, and educational breakdowns.' },

  // FOOTBALL PLAYERS & TEAMS
  { name: 'Lionel Messi', type: 'player', category: 'football', slug: 'lionel-messi', aliases: ['Messi'] },
  { name: 'Cristiano Ronaldo', type: 'player', category: 'football', slug: 'cristiano-ronaldo', aliases: ['Ronaldo', 'CR7'] },
  { name: 'Kylian Mbappé', type: 'player', category: 'football', slug: 'kylian-mbappe', aliases: ['Mbappe'] },
  { name: 'Erling Haaland', type: 'player', category: 'football', slug: 'erling-haaland', aliases: ['Haaland'] },
  { name: 'Jude Bellingham', type: 'player', category: 'football', slug: 'jude-bellingham', aliases: ['Bellingham'] },
  { name: 'Real Madrid', type: 'team', category: 'football', slug: 'real-madrid', aliases: ['Los Blancos'] },
  { name: 'Barcelona', type: 'team', category: 'football', slug: 'barcelona', aliases: ['Barca', 'FC Barcelona'] },
  { name: 'Manchester City', type: 'team', category: 'football', slug: 'manchester-city', aliases: ['Man City'] },
  { name: 'Arsenal', type: 'team', category: 'football', slug: 'arsenal', aliases: ['Gunners'] },
  { name: 'Liverpool', type: 'team', category: 'football', slug: 'liverpool', aliases: ['Reds'] },
  { name: 'Chelsea', type: 'team', category: 'football', slug: 'chelsea', aliases: ['Blues'] },
  { name: 'UEFA Champions League', type: 'competition', category: 'football', slug: 'champions-league', aliases: ['UCL', 'Champions League'] },
  { name: 'Premier League', type: 'competition', category: 'football', slug: 'premier-league', aliases: ['EPL'] },
  { name: 'La Liga', type: 'competition', category: 'football', slug: 'la-liga' },

  // FORMULA 1
  { name: 'Max Verstappen', type: 'player', category: 'formula-1', slug: 'max-verstappen', aliases: ['Verstappen'] },
  { name: 'Lewis Hamilton', type: 'player', category: 'formula-1', slug: 'lewis-hamilton', aliases: ['Hamilton'] },
  { name: 'Charles Leclerc', type: 'player', category: 'formula-1', slug: 'charles-leclerc', aliases: ['Leclerc'] },
  { name: 'Red Bull Racing', type: 'team', category: 'formula-1', slug: 'red-bull-racing', aliases: ['Red Bull'] },
  { name: 'Ferrari', type: 'team', category: 'formula-1', slug: 'ferrari', aliases: ['Scuderia Ferrari'] },

  // BASKETBALL
  { name: 'LeBron James', type: 'player', category: 'basketball', slug: 'lebron-james', aliases: ['LeBron'] },
  { name: 'Stephen Curry', type: 'player', category: 'basketball', slug: 'stephen-curry', aliases: ['Curry', 'Steph Curry'] },
  { name: 'NBA', type: 'competition', category: 'basketball', slug: 'nba' },

  // TENNIS
  { name: 'Novak Djokovic', type: 'player', category: 'tennis', slug: 'novak-djokovic', aliases: ['Djokovic'] },
  { name: 'Carlos Alcaraz', type: 'player', category: 'tennis', slug: 'carlos-alcaraz', aliases: ['Alcaraz'] },
  { name: 'Wimbledon', type: 'competition', category: 'tennis', slug: 'wimbledon' },
];

export function findEntityBySlug(slug: string): EntityDefinition | undefined {
  const normalized = slug.toLowerCase().trim();
  return ENTITIES_REGISTRY.find(e => e.slug === normalized || e.name.toLowerCase() === normalized);
}

export function detectEntitiesInText(text: string): EntityDefinition[] {
  if (!text) return [];
  const matches: EntityDefinition[] = [];
  const lowerText = text.toLowerCase();

  for (const entity of ENTITIES_REGISTRY) {
    const mainNameMatch = new RegExp(`\\b${entity.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text);
    let aliasMatch = false;

    if (!mainNameMatch && entity.aliases) {
      for (const alias of entity.aliases) {
        if (alias.length >= 4 && new RegExp(`\\b${alias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)) {
          aliasMatch = true;
          break;
        }
      }
    }

    if (mainNameMatch || aliasMatch) {
      matches.push(entity);
    }
  }

  return matches;
}
