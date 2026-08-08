import { Post, Category, AdminUser, MediaItem, RankingItem, FixtureItem, TicketMessage, Subscriber, LiveStreamItem, HeroConfig, FanPoll } from '../types';
import { supabase } from './supabase';
import { normalizeSlug } from './slugUtils';
import { ensureFullSeoGeoAeo } from './seoGenerator';

const memoryStore: Record<string, string> = {};

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("safeLocalStorage getItem error:", e);
      return memoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("safeLocalStorage setItem error:", e);
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("safeLocalStorage removeItem error:", e);
      delete memoryStore[key];
    }
  }
};

const localStorage = safeLocalStorage;

const STORAGE_KEYS = {
  POSTS: 'fts_posts',
  CATEGORIES: 'fts_categories',
  ADMINS: 'fts_admins',
  MEDIA: 'fts_media',
  RANKINGS: 'fts_rankings',
  FIXTURES: 'fts_fixtures',
  CURRENT_ADMIN: 'fts_current_admin',
  TICKETS: 'fts_tickets',
  SUBSCRIBERS: 'fts_subscribers',
  LIVE_STREAMS: 'fts_live_streams',
  HERO_CONFIG: 'fts_hero_config',
  FAN_POLLS: 'fts_fan_polls',
};

// Seed Categories
const SEED_CATEGORIES: Category[] = [
  { id: 'cricket', name: 'Cricket', slug: 'cricket', description: 'Comprehensive coverage of international cricket, ICC tournaments, Test series, IPL, and T20 leagues.' },
  { id: 'football', name: 'Football', slug: 'football', description: 'Global soccer updates: Premier League, UEFA Champions League, La Liga, international transfers, and tactical analysis.' },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', description: 'Deep dives into NBA, FIBA championships, player statistics, drafts, and tactical boards.' },
  { id: 'f1', name: 'Formula 1', slug: 'f1', description: 'High-speed analysis of Grand Prix races, driver standings, engineering updates, and team strategies.' },
  { id: 'esports', name: 'Esports', slug: 'esports', description: 'Coverage of global tournaments, League of Legends, Valorant Champions, CS2, Dota 2, and gaming insights.' },
  { id: 'tennis', name: 'Tennis', slug: 'tennis', description: 'Grand Slam updates, ATP/WTA rankings, legendary matches, and court performance breakdowns.' },
  { id: 'hockey', name: 'Hockey', slug: 'hockey', description: 'Field hockey championships, Olympian reviews, penalty corner tactics, and national leagues.' },
  { id: 'volleyball', name: 'Volleyball', slug: 'volleyball', description: 'FIVB world tours, indoor power spikes, defensive sets, and beach volleyball championships.' },
];

// Seed Admin Users
const SEED_ADMINS: AdminUser[] = [
  { id: 'admin-super-1', name: 'Hanan Irfan', email: 'hananirfan91@gmail.com', role: 'Super Admin', password: 'hanan@2007.', is_approved: true, is_writer: true },
  { id: 'admin-super-2', name: 'Urwah Farooq', email: 'urwahfarooq303@gmail.com', role: 'Super Admin', password: 'urwah@2006', is_approved: true, is_writer: true },
];

const SEED_MEDIA: MediaItem[] = [
  { id: 'img-1', file_url: 'https://images.unsplash.com/photo-1540747737956-378724044282?w=800&auto=format&fit=crop&q=80', type: 'image', title: 'Stadium Light Flood' },
  { id: 'img-2', file_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80', type: 'image', title: 'Soccer Goal Net' },
  { id: 'img-3', file_url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80', type: 'image', title: 'Cricket Boundary Shot' },
  { id: 'img-4', file_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80', type: 'image', title: 'Baketball Hoop Slam' },
  { id: 'img-5', file_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80', type: 'image', title: 'F1 Cockpit View' },
];

// High-quality Editorial Posts Seeding
const SEED_POSTS: Post[] = [
  {
    id: 'post-cricket-cwc-2027',
    title: 'ICC Cricket World Cup 2027: 14-Team Expanded Format, African Host Venues & Qualification Roadmaps',
    slug: 'cricket-world-cup-2027-expanded-format-venues-qualification',
    content: `### The Grand Return of the 14-Team ODI World Cup in Southern Africa

The 14th edition of the flagship Men's ICC Cricket World Cup is scheduled to take place in October and November 2027, co-hosted across three African nations: **South Africa, Zimbabwe, and Namibia**. 

Marking a major structural expansion from the 10-team round-robin format used in 2019 and 2023, the 2027 World Cup reinstates the popular **14-team format** last seen during the memorable 2011 and 2015 tournaments.

| Tournament Parameter | 2023 World Cup (India) | 2027 World Cup (SA, ZIM, NAM) |
| :--- | :--- | :--- |
| **Participating Nations** | 10 Teams | **14 Teams** |
| **Tournament Format** | Single Round-Robin | **2 Groups of 7 -> Super Sixes -> Semi-Finals** |
| **Total Matches** | 48 Matches | **54 Matches** |
| **Automatic Qualifiers** | Hosts + Top 8 ODI Ranking | **Co-hosts (SA, ZIM) + Top 8 ICC ODI Rankings** |

#### Tactical Conditions Across High-Veldt & Coastal African Pitches

Host venues across South Africa (including Wanderers Johannesburg, SuperSport Park Centurion, Kingsmead Durban, and Newlands Cape Town), Harrare Sports Club in Zimbabwe, and Wanderers Cricket Ground in Windhoek present contrasting pitch characteristics:

1. **High Altitude Pace & Bounce (Gauteng High-Veldt)**: At Centurion and Johannesburg, thin air combined with hard clay surfaces yields extra seam movement and high ball speed, favoring fast bowlers with steep bounce.
2. **Coastal Swing & Drift (Cape Town & Durban)**: Coastal humidity and sea breezes provide lateral swing with the new white ball, challenging top-order batters in morning sessions.
3. **Spin Assistance in Harare & Windhoek**: Dry afternoon surfaces in Harare and Windhoek offer slower grip and turn, rewarding disciplined wrist-spinners.

#### Qualification Pathways and Team Projections

The qualification route guarantees direct entries for co-hosts **South Africa** and **Zimbabwe** (subject to ICC full-member criteria), alongside the **top 8 teams in the official ICC ODI Team Rankings** as of the cutoff date. The remaining 4 slots will be decided through global World Cup Qualifier play-offs, giving associate powerhouses and emerging nations a direct platform to compete on cricket's largest stage.`,
    category: 'cricket',
    tags: ['cricket world cup 2027', 'cwc 2027', 'icc cricket world cup', 'cricket news', 'south africa 2027', 'zimbabwe cricket', 'namibia cricket', 'world cup schedule'],
    featured_image: 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    video_url: '6p8bV_G7u20',
    author: 'Hanan Irfan',
    created_at: '2026-08-01T10:00:00Z',
    is_featured: false,
    is_trending: true,
    type: 'news',
    views: 2890,
    meta_description: 'Detailed tactical preview, host venues breakdown, and qualification roadmap for the 14-team ICC Cricket World Cup 2027 in South Africa, Zimbabwe, and Namibia.'
  },
  {
    id: 'post-cricket-1',
    title: 'The Great Spin Renaissance: How Wrist Spinners Are Rewriting T20 Tactical Manuals',
    slug: 'spin-renaissance-t20-cricket-analysis',
    content: `### The Redefined Art of Leg-Break Bowling in the Powerplay

In contemporary short-form cricket, the traditional script designated spinners as middle-over containment specialists. Captains would cautiously shield leg-spinners until field restrictions eased, fearing the consequences of a loose, full toss or over-pitched delivery with only two fielders outside the 30-yard circle. 

Today, that orthodoxy lies in ruins. Analytical dashboards representing millions of data points have exposed a fundamental truth: **taking wickets in the powerplay is the single greatest predictor of T20 match success**, far outweighing the value of cautious runs containment. Wrist-spinners, once considered high-risk luxuries, have emerged as the premier powerplay aggressors.

| Metric | Traditional Off-Spin | Modern Wrist-Spin (Right-arm Leggie) |
| :--- | :--- | :--- |
| Powerplay Strike Rate (balls per wicket) | 28.4 | 19.1 |
| False Shot Percentage induced | 11.2% | 18.7% |
| Middle Stump Attack Efficiency | 42.1% | 58.9% |

#### The Physics of Dynamic Drift and Revolutions

The core weapon of the modern wrist-spinner is not merely the deviation off the pitch, but the aerodynamic forces acting on the ball during flight. Highly skilled leg-spin bowlers apply upwards of 2,400 revolutions per minute (RPM). This high-velocity spinning action creates a pressure differential—known as the **Magnus Effect**—which pulls the ball downwards quicker than the batsman anticipates, creating "dip."

Simultaneously, the sideways spin lateral pressure induces a dramatic "drift." This lateral banana curve moves the ball away from or into the batter's line of sight before it ever makes contact with the turf. By the time the ball pitches, the batsman's footwork has already been compromised by the unexpected trajectory.

#### Case Analysis: The Deceptive Under-Cut Googly

Unlike the classical, big-ripping leg-breaks made famous by Shane Warne, modern T20 specialists such as Rashid Khan and dynamic spinners from the subcontinent employ a quicker, more vertical release. 
The hand speed is nearly identical to an orthodox fast-medium bowler, clocking releases at over 90 km/h. This "speed-spinning" reduces the batsman's reaction time from 0.52 seconds to less than 0.4 seconds.

When combined with the disguised "googly"—released from the back of the hand with an inverted wrist tilt—the ball breaks sharply back into the right-handed batsman, aiming squarely at the gap between bat and pad. It is an editorial consensus that the traditional forward defensive is no longer a viable safety net; T20 batting requires a complete overhaul to combat this wrist-spin dominance.

*The Sports Room Editorial Board Rating: Expert Analysis.*`,
    category: 'cricket',
    tags: ['cricket news', 'wrist spin tactics', 'T20 powerplay', 'ICC rankings', 'bowling mechanics', 'Rashid Khan analysis', 'spinning masterclass'],
    featured_image: 'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    video_url: 'H9T9e03d_jE',
    author: 'Hanan Irfan',
    created_at: '2026-06-03T09:12:00Z',
    is_featured: true, // Left panel
    is_trending: true,
    type: 'news',
    views: 1450,
    meta_description: 'Discover how modern wrist spinners are dismantling traditional batting setups in the Powerplay. Complete tactical breakdown and aerodynamic physics analysis.'
  },
  {
    id: 'post-football-1',
    title: 'Tactical Breakdown: The Extinction of Classical Fullbacks and the Rise of the Inverted Pivot',
    slug: 'tactical-extinction-classical-fullbacks-inverted-pivot',
    content: `### The Micro-Tactical Overhaul of Modern Build-up Play

For decades, the standard fullback had a simple, high-octane job: sprint down the touchline, provide overlapping width, and swing diagonal crosses into the penalty box, before retreating rapidly to form a defensive back-four block. The lines were straight, the roles linear, and the physical demands centered around pure aerobic stamina.

In Europe's elite tactical systems, however, this classical archetype is rapidly going extinct. Initiated by Pep Guardiola and refined across tactical workshops in the Premier League and Bundesliga, elite clubs now employ the **Inverted Fullback** as a central midfield organizer.

\`\`\`
Traditional Build-up:        Modern Inverted Build-up:
      ⚽                           ⚽
  CB      CB                  CB   DM/LB   CB
LB          RB                 \\\\    /       /
  LM  CM  RM                    LM  CM   RM
   F      F                      LF  CF  RF
\`\`\`

#### Transitioning from Out-of-Possession Rest Defense

The primary motivation for tucking a fullback (traditionally the left-back or right-back) into the midfield circle during possession is to establish a secure "Rest Defense." When an attacking team loses the ball in the final third, they are highly vulnerable to immediate counter-attacks through the center of the pitch.

By shifting a technically gifted fullback into a dual-pivot midfield system (matching a standard 3-2-2-3 or 2-3-5 in possession), the manager ensures:
1. **Central Suffocation**: Three defenders and two deep holding midfielders form a protective cage, blocking immediate central exit passes.
2. **Numerical Superiority**: In midfield transition, a 3v2 or 4v3 advantage is sustained, allowing rapid short passing and ball retention.
3. **Restored Counter-pressing**: Defensive counterpressing triggers are shorter because the inverted defender is already centrally located.

#### The Technical Demands of Spatial Awareness

This position requires a mind-boggling array of technical attributes. The inverted fullback must comfortably accept the ball under extreme pressure with their back to the opposition goal—a scenario standard fullbacks never encounter on the touchline.

They must possess elite scanning frequency (checking over the shoulder 3-4 times every 10 seconds) to gauge surrounding space, and command master-level central progressive passing. Players like John Stones or Trent Alexander-Arnold do not just defend; they act as secondary playmakers, manipulating the opposition's defensive block from deep half-spaces.

*Editorial Opinion: The fullback is no longer a position—it is a modern strategic junction.*`,
    category: 'football',
    tags: ['football news', 'tactical breakdown', 'inverted fullback', 'Premier league tactics', 'Pep Guardiola', 'football analytics', 'modern formations'],
    featured_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    video_url: '6p8bV_G7u20',
    author: 'Hanan Irfan',
    created_at: '2026-06-03T08:30:00Z',
    is_featured: false,
    is_trending: true,
    type: 'blog', // Bottom Ticker or Bottom Section
    views: 1210,
    meta_description: 'An in-depth analysis of how elite football managers are abandoning classic fullbacks for inverted central pivots to control transition play and dominate counters.'
  },
  {
    id: 'post-basketball-1',
    title: 'The Analytical Obsession with Half-Court Efficiency: NBA Mid-Range Death Sentence',
    slug: 'analytical-obsession-nba-midrange-efficiency',
    content: `### The Scientific Decimation of the 15-Foot Jumper

In the golden eras of NBA basketball, the mid-range turnaround jumper was the ultimate signature of offensive greatness. Michael Jordan and Kobe Bryant made their careers in the spaces between the paint and the three-point arc. It was an art form of pivots, pump fakes, and high-elevation fadeaways.

However, the modern analytics revolution has turned the mid-range area into a statistical graveyard. The formula is mathematically unyielding, and coaches are ruthlessly enforcing it to reshape court positioning.

#### The Unforgiving Mathematics of Shot Selection

The math dictating modern shot selections is incredibly elementary yet completely devastating to mid-range ball handlers:

| Shot Location | Average League FG% | Expected Points per Shot | Efficiency Rank |
| :--- | :--- | :--- | :--- |
| **At the Rim (Dunks/Layups)** | 63.8% | 1.28 points | #1 |
| **Corner Three-Pointer** | 38.5% | 1.16 points | #2 |
| **Above-the-Break Three-Pointer** | 35.1% | 1.05 points | #3 |
| **Mid-Range Jumper (10-18 feet)** | 40.2% | **0.80 points** | **#4 (Dead Last)** |

To equal the scoring productivity of a modest 35% three-point shooter, a mid-range scorer must hit an astronomical **52.5% of their two-point jumpers**. Over an 82-game regular season, utilizing high volumes of mid-range possessions is quite simply a mathematical handicap.

#### The Gravitational Pull of Shot Creation

In response, teams now utilize "5-Out" offenses, spreading all five active players beyond the three-point line. This layout creates immense gravitational pull, sucking defenders outward and completely clearing the paint. 

As defenders scramble to recover across massive distances, offenses generate high-efficiency layups or kick-out passes for unguarded catch-and-shoot corners. The mid-range is now largely reserved for late-clock emergencies or elite individual anomalies who can defy the mathematics under extreme postseason defensive pressure.`,
    category: 'basketball',
    tags: ['NBA news', 'basketball analytics', 'three point revolution', 'mid range jumper', 'expected points shot', 'NBA stats', 'court efficiency'],
    featured_image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    video_url: 'q7Myr7Gsk-g',
    author: 'Hanan Irfan',
    created_at: '2026-06-03T07:45:00Z',
    is_featured: false, // Stack Right Carousel 1
    is_trending: true,
    type: 'news',
    views: 980,
    meta_description: 'Analyze the mathematical models that have practically eliminated the mid-range jumper from modern NBA offensive systems in favor of corners and paint play.'
  },
  {
    id: 'post-f1-1',
    title: 'Aerodynamics Mastery: Inside the Extreme Ground-Effect Upgrades Defining 2026 Grid Battles',
    slug: 'aerodynamics-f1-ground-effect-engineering-upgrades',
    content: `### The High-Engineering Battle Beneath the Carbon-Fiber Floor

While Formula 1 commentators obsess over driver rivalries and pit-stop technical errors, the real war for the 2026 Constructors' World Championship is fought entirely out of sight, beneath the carbon-fiber floor of the race cars. 

The modern regulatory era resurrected **Ground-Effect Aerodynamics**—a strategic redirection of high-speed air using venturi tunnels molded into the undertray. This design shifts the downforce generation away from drag-inducing wings, allowing cars to follow closely through corners without losing vital wing stability.

\`\`\`
Ground Effect Venturi Tunnel Flow:
   Air Inflow  =================> (Throat: High Velocity, Low Pressure) ===> Diffuser Outflow
   [Undertray Curved Profile]                       |              [Suction Pulls Car Down]
                                                    v
\`\`\`

#### The Volatile Physics of Venturi Tunnels and Porpoising

The underlying principle of ground effect is the **Bernoulli Law**. As high-velocity air enters the narrow inlet tunnels underneath the sidepods, it passes through a restricted "throat." According to fluid dynamics, narrowing the passage forces the air velocity to accelerate dramatically, causing a corresponding drop in air pressure.

This localized low-pressure zone acts as a literal vacuum, sucking the tire contact patch firmly into the tarmac. The major challenge for aerodynamics engineers is managing this suction boundary. If the physical ride height gets too low, the tunnel stalls, downforce instantly vanishes, and the chassis bounces upwards—known as **porpoising**. 

#### The Secrets of Flexible Floors and Dampers

To master this volatile aerodynamic behavior, engineers build highly complex pre-stressed carbon-fiber floor plies that dynamically flex under high loads. By legalizing subtle floor movements, teams are able to seal the edges of the floor against the track surface, preventing high-pressure outside air from interrupting the underfloor vacuum stream.

Combined with sophisticated mechanical damper systems that control roll, pitch, and heave, the top teams keep their underfloor aerodynamics operating within a razors-thin 1.5mm window of optimal ride height, regardless of high speeds or heavy braking zones.`,
    category: 'f1',
    tags: ['F1 news', 'Formula 1 aerodynamics', 'ground effect Venturi', 'Grand prix engineering', 'F1 technical updates', 'chassis design'],
    featured_image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    video_url: 'YBzE8S5S9_U',
    author: 'Hanan Irfan',
    created_at: '2026-06-02T16:20:00Z',
    is_featured: false, // Stack Right Carousel 2
    is_trending: true,
    type: 'news',
    views: 1150,
    meta_description: 'An elite technical deep dive into ground-effect aerodynamics in modern F1. Venturi tunnel dynamics, flexible floors, and mechanical ride-height seals explained.'
  },
  {
    id: 'post-esports-1',
    title: 'The Esports Franchise Paradox: High Sponsoring Overhead vs Volatile Digital Valuations',
    slug: 'esports-franchise-economics-paradox-valuations',
    content: `### The Financial Reckoning of Competitive Video Gaming leagues

During the boom years of the late 2010s, esports was heralded as the undisputed future of global entertainment. Traditional venture capitalists, sports franchise owners, and global brands poured hundreds of millions of dollars into buying localized franchise slots in prestigious closed-loop leagues.

Fast forward to 2026, and the industry is undergoing a severe correction. The franchise model, heavily borrowed from traditional American sports (NFL/NBA), is showing critical structural vulnerabilities when applied to localized competitive gaming.

#### The Core Structural Disconnects of Gaming Models

The traditional sports franchise model operates on three major pillars: massive local stadium ticket sales, lucrative localized regional television broadcasting deals, and multi-generational fan bases. Esports struggles to replicate these:

1. **Digital-First Dispersion**: Fans do not live in specific geographic boundaries. A fan of a European esports team might live in Tokyo, rendering local ticket-sales strategies ineffective.
2. **Broadcasting Monopolies**: Traditional teams do not own the sport they play (no one owns the intellectual property of "soccer"). Esports teams are entirely dependent on game developers (Riot Games, Valve, Activision) who hold absolute, dictatorial control over licensing, patch notes, and esports ecosystems.
3. **Severe Monetization Bottlenecks**: The average esports viewer has one of the lowest average revenues per fan in global entertainment. Gamers are accustomed to free, high-speed broadcasts on Twitch and YouTube, rejecting paywalls or high pay-per-view premiums.

#### Charting a New Sustainable Path: Digital Items and Co-Streaming

The organizations surviving the correction have shifted focus from massive sponsorships to direct digital content integration. Through publisher revenue share programs, teams create themed in-game cosmetics—such as team jerseys, weapon skins, and custom emotes.

When a fan purchases a digital skin to support their favorite squad, up to 50% of the proceeds flow directly to the team's balance sheet. This direct-to-consumer monetization, combined with cost-efficient remote operations, is replacing the bloated multi-million dollar physical arenas with a lean, sustainable digital media model.`,
    category: 'esports',
    tags: ['esports tournaments', 'esports economics', 'gaming franchise', 'Riot games league', 'gaming industry valuation', 'streamer revenue'],
    featured_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    video_url: 'YBzE8S5S9_U', // Shared or YouTube ID
    author: 'Hanan Irfan',
    created_at: '2026-06-02T10:05:00Z',
    is_featured: false,
    is_trending: false,
    type: 'blog', // Bottom Ticker 2
    views: 840,
    meta_description: 'An expert economic review of the esports franchise bubble, detailing structural monetization challenges and the pivot to digital cosmetics and co-streaming models.'
  },
  {
    id: 'post-tennis-1',
    title: 'The Science of Lateral Footwork: Clay Court Sliding Techniques and Kinetic Recovery',
    slug: 'science-lateral-tennis-footwork-clay-sliding',
    content: `### Masterclass: How ATP Stars Optimize Friction and Body Centrous Shifts

Clay court tennis is the ultimate test of lateral aerobic mechanics and slide-based kinetic chain distribution. Unlike hard courts, where friction values are constant and predictable, the brick dust surface of Roland Garros is a shifting, dynamic matrix.

To compete successfully on clay, modern players have developed highly sophisticated sliding mechanics that allow them to change direction while maintaining perfect upper-body balance.

#### The Three Stages of a Clay Court Slide

An elite clay court slide is not a random slide; it is a highly calculated three-stage kinetic sequence:

1. **The Brake and Pivot**: As the player sprints towards a wide ball, instead of stepping firmly to plant, they land on their outside foot with their ankle tilted outward at a specific angle. They allow the clay particles to roll under the shoe tread, creating controlled friction.
2. **The Swing Integration**: The slide continues *through* the hitting zone. By striking the ball while sliding, the player utilizes the kinetic momentum of their slide to add raw power to their groundstrokes. This requires exceptional core strength to keep the spine fully vertical.
3. **The Recoil Compression**: The moment the ball leaves the strings, the player compresses their knees, dropping their center of gravity. They press their inside foot into the clay as an anchor, terminating the slide instantly, and explosively push back towards the center mark.

#### Training the Elastic Kinetic Chain

Sliding on clay requires extreme flexibility and explosive plyometric stability. Physical trainers focus heavily on lateral lunges, hip mobility (allowing external rotation under load), and strengthening the adductor muscles. Without this muscle group synchronization, the extreme torque placed on knee joint ligaments and lower vertebrae would cause immediate injury.`,
    category: 'tennis',
    tags: ['tennis news', 'clay court sliding', 'court biomechanics', 'ATP tour analysis', 'Roland Garros physics', 'footwork masterclass'],
    featured_image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80',
    author: 'Hanan Irfan',
    created_at: '2026-06-01T14:15:00Z',
    is_featured: false,
    is_trending: false,
    type: 'news',
    views: 710,
    meta_description: 'Discover the biomechanics behind clay court tennis sliding. Learn the step-by-step kinetic chain, friction management, and recovery drills used by professional ATP stars.'
  },
  {
    id: 'post-hockey-1',
    title: 'Strategic Analysis of Penalty Corner Conversions: Drag Flick Dynamics and Defensive Blocks',
    slug: 'strategic-analysis-hockey-penalty-corner-dragflick',
    content: `### The Math and Physics of Field Hockey's Most Lethal Set Piece

In modern professional field hockey, the **Penalty Corner** (or short corner) is the primary engine of offensive output. Match analysis confirms that up to 45% of total goals scored in top-tier international competitions (such as the Olympics or FIH Pro League) originate from these tightly drilled set-play sequences.

The battle between the attacking drag-flicker and the defensive runners is a high-speed game of chicken, played out in milliseconds over a distance of exactly 14.63 meters.

\`\`\`
Penalty Corner Layout:
     Attacker Out-Push (23m line) ====> Stopper (edge of circle) ==> Drag-Flick progressive scoop
                                                                              |
                                     Defensive First Runner (from goal line) v
                                                                    Goal Mouth Guard
\`\`\`

#### The Science Behind the Drag Flick

The drag flick is a highly specialized shooting technique which avoids the regulatory prohibition of raising a standard hit above the backboard. Instead of hitting the ball with a striking swing, the flicker "scoops" the ball, dragging it along the ground for several meters before whipping it into the high net.

The physics of a world-class drag flick rely heavily on:
- **Stick Bow Loading**: Modern composite sticks feature a legal 25mm bow curved near the head. By resting the ball in this bow, the player acts as a slingshot, storing potential energy in the bending shaft before releasing it.
- **Rotational Torque**: The flicker starts the drag well behind their body, rotating their shoulders and hips aggressively. This transfers entire weight leverage into the ball, yielding velocities exceeding 125 km/h.

#### The Suicidal Bravery of the Defensive Run

To combat this lethal velocity, defensive structures place four defenders plus the goalkeeper behind the goal line. The moment the ball is pushed out, the "First Runner" sprints directly at the flicker's stick angle, holding their stick low to act as a physical shield.

This runner has less than 0.6 seconds to cover 10 meters, positioning themselves to block the ball with their body or stick. It is a dual of extreme tactical drilling, where a fraction of a degree in launch angle determines whether a nation wins gold or returns empty-handed.`,
    category: 'hockey',
    tags: ['hockey news', 'field hockey tactics', 'penalty corner drag flick', 'FIH tournament strategy', 'olympic hockey coaching', 'dragflick biomechanics'],
    featured_image: 'https://images.unsplash.com/photo-1580748141549-71748d60bdc5?w=1200&auto=format&fit=crop&q=80',
    author: 'Hanan Irfan',
    created_at: '2026-05-31T11:40:00Z',
    is_featured: false,
    is_trending: false,
    type: 'news',
    views: 630,
    meta_description: 'An exhaustive tactical breakdown of field hockey penalty corner routines, drag-flick rotational physics, stick bow dynamics, and defensive rushing screens.'
  },
  {
    id: 'post-volleyball-1',
    title: 'The Rotational Mechanics of the Float vs Jump Serve: Volleyball Spin Aerodynamics',
    slug: 'rotational-mechanics-volleyball-serve-aerodynamics-float-jump',
    content: `### Demystifying Fluid Drag and Turbulence in Modern Indoor Serving

Ask any elite volleyball receiver which serve they dread most, and they won't say the 110 km/h power jump serve. Instead, they will name the deceptive, oscillating **Hybrid Float Serve**. 

While the power serve relies on brutal force to overpower defensive reflexes, the float serve exploits the volatile physics of fluid dynamics, causing the ball to dip, dive, and veer unpredictably at the very last moment.

#### The Physics of the Non-Spinning Ball: The Karman Vortex Street

To deliver a float serve, a player must strike the volleyball precisely in its center of mass with a stiff, flat palm, instantly withdrawing their hand to prevent follow-through. This imparts zero rotation (no spin) to the ball.

As a non-spinning sphere travels through the air at speeds between 50-70 km/h, the surrounding airflow cannot roll smoothly over its surface. Instead, the air breaks into highly turbulent eddies on the trailing side, forming what aerodynamicists call a **Karman Vortex Street**.

These small pockets of low and high pressure form and collapse randomly behind the ball:
- When a vortex forms on the left, the ball gets pulled slightly left.
- When it collapses and forms on the top, the ball drops suddenly.

To the receiving passer, the ball literally dances in mid-air, changing direction in an instant with zero visual cues from ball rotation.

#### The High-Spin Power Server: The Magnus Force Offset

Conversely, the jump serve is struck with extreme topspin. The hand wraps over the top of the ball, imparting rapid forward rotation.

This topspin creates a standard **Magnus Force** where the boundary layer of air moves faster over the top of the ball, reducing local pressure underneath and forcing the ball to dive downwards in a highly predictable, high-speed arc. While extremely fast, receivers can calculate this trajectory early because the forward spin is highly visible, allowing them to position their forearms to cushion the impact.`,
    category: 'volleyball',
    tags: ['volleyball news', 'volleyball server mechanics', 'fluid dynamics ball sports', 'scientific serve tutorials', 'FIVB world tour tactics', 'Magnus effect'],
    featured_image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80',
    author: 'Hanan Irfan',
    created_at: '2026-05-30T10:15:00Z',
    is_featured: false,
    is_trending: false,
    type: 'news',
    views: 590,
    meta_description: 'Learn the scientific flight aerodynamics separating high-speed jump serves and unpredictably shifting float serves in professional indoor volleyball.'
  }
];

// Seed Rankings
const SEED_RANKINGS: RankingItem[] = [
  // Cricket
  { id: 'crk-r-1', sport: 'cricket', categoryName: 'ICC Men Test Team Rankings', rank: 1, name: 'India', points: 122, extra: 'Form: W-W-L-W' },
  { id: 'crk-r-2', sport: 'cricket', categoryName: 'ICC Men Test Team Rankings', rank: 2, name: 'Australia', points: 117, extra: 'Form: W-L-W-W' },
  { id: 'crk-r-3', sport: 'cricket', categoryName: 'ICC Men Test Team Rankings', rank: 3, name: 'England', points: 111, extra: 'Form: L-L-W-W' },
  { id: 'crk-r-4', sport: 'cricket', categoryName: 'ICC Men Test Team Rankings', rank: 4, name: 'New Zealand', points: 104, extra: 'Form: L-W-L-L' },
  
  // Football
  { id: 'fb-r-1', sport: 'football', categoryName: 'FIFA Men World Rankings', rank: 1, name: 'Argentina', points: 1858, extra: 'CONMEBOL' },
  { id: 'fb-r-2', sport: 'football', categoryName: 'FIFA Men World Rankings', rank: 2, name: 'France', points: 1840, extra: 'UEFA' },
  { id: 'fb-r-3', sport: 'football', categoryName: 'FIFA Men World Rankings', rank: 3, name: 'Belgium', points: 1795, extra: 'UEFA' },
  { id: 'fb-r-4', sport: 'football', categoryName: 'FIFA Men World Rankings', rank: 4, name: 'England', points: 1794, extra: 'UEFA' },
  
  // Basketball
  { id: 'bb-r-1', sport: 'basketball', categoryName: 'NBA Standings (Eastern Conference)', rank: 1, name: 'Boston Celtics', points: '64 - 18', extra: 'PCT: .780' },
  { id: 'bb-r-2', sport: 'basketball', categoryName: 'NBA Standings (Eastern Conference)', rank: 2, name: 'New York Knicks', points: '50 - 32', extra: 'PCT: .610' },
  { id: 'bb-r-3', sport: 'basketball', categoryName: 'NBA Standings (Western Conference)', rank: 1, name: 'Oklahoma City Thunder', points: '57 - 25', extra: 'PCT: .695' },
  { id: 'bb-r-4', sport: 'basketball', categoryName: 'NBA Standings (Western Conference)', rank: 2, name: 'Denver Nuggets', points: '57 - 25', extra: 'PCT: .695' },
  
  // F1
  { id: 'f1-r-1', sport: 'f1', categoryName: 'F1 Drivers Championship Standings', rank: 1, name: 'Max Verstappen', points: 258, extra: 'Red Bull Racing' },
  { id: 'f1-r-2', sport: 'f1', categoryName: 'F1 Drivers Championship Standings', rank: 2, name: 'Lando Norris', points: 211, extra: 'McLaren' },
  { id: 'f1-r-3', sport: 'f1', categoryName: 'F1 Drivers Championship Standings', rank: 3, name: 'Charles Leclerc', points: 177, extra: 'Ferrari' },
  { id: 'f1-r-4', sport: 'f1', categoryName: 'F1 Drivers Championship Standings', rank: 4, name: 'Lewis Hamilton', points: 154, extra: 'Mercedes' },

  // Esports
  { id: 'esp-r-1', sport: 'esports', categoryName: 'HLTV CS2 World Team Rankings', rank: 1, name: 'FaZe Clan', points: 980, extra: 'Europe' },
  { id: 'esp-r-2', sport: 'esports', categoryName: 'HLTV CS2 World Team Rankings', rank: 2, name: 'Natus Vincere', points: 945, extra: 'Ukraine' },
  { id: 'esp-r-3', sport: 'esports', categoryName: 'HLTV CS2 World Team Rankings', rank: 3, name: 'Team Vitality', points: 890, extra: 'France' },

  // Tennis
  { id: 'ten-r-1', sport: 'tennis', categoryName: 'ATP Singles World Rankings', rank: 1, name: 'Jannik Sinner', points: 9525, extra: 'Italy' },
  { id: 'ten-r-2', sport: 'tennis', categoryName: 'ATP Singles World Rankings', rank: 2, name: 'Carlos Alcaraz', points: 8580, extra: 'Spain' },
  { id: 'ten-r-3', sport: 'tennis', categoryName: 'ATP Singles World Rankings', rank: 3, name: 'Novak Djokovic', points: 8360, extra: 'Serbia' },

  // Hockey
  { id: 'hok-r-1', sport: 'hockey', categoryName: 'FIH Men World Rankings', rank: 1, name: 'Netherlands', points: 3120, extra: 'Europe' },
  { id: 'hok-r-2', sport: 'hockey', categoryName: 'FIH Men World Rankings', rank: 2, name: 'Belgium', points: 3050, extra: 'Europe' },
  { id: 'hok-r-3', sport: 'hockey', categoryName: 'FIH Men World Rankings', rank: 3, name: 'India', points: 2980, extra: 'Asia' },

  // Volleyball
  { id: 'vol-r-1', sport: 'volleyball', categoryName: 'FIVB Men World Rankings', rank: 1, name: 'Poland', points: 421, extra: 'Europe' },
  { id: 'vol-r-2', sport: 'volleyball', categoryName: 'FIVB Men World Rankings', rank: 2, name: 'United States', points: 390, extra: 'NORCECA' },
  { id: 'vol-r-3', sport: 'volleyball', categoryName: 'FIVB Men World Rankings', rank: 3, name: 'Italy', points: 375, extra: 'Europe' }
];

// Seed Fixtures
const SEED_FIXTURES: FixtureItem[] = [
  { id: 'fix-1', sport: 'cricket', team1: 'India', team2: 'Australia', date: '2026-06-05', time: '09:00 GMT', venue: 'MCG, Melbourne', status: 'upcoming', stage: 'Border-Gavaskar Trophy' },
  { id: 'fix-2', sport: 'football', team1: 'Arsenal', team2: 'Manchester City', date: '2026-06-04', time: '18:45 GMT', venue: 'Emirates Stadium, London', status: 'live', score: '1 - 1', stage: 'Premier League Matchday 36' },
  { id: 'fix-3', sport: 'basketball', team1: 'Boston Celtics', team2: 'Dallas Mavericks', date: '2026-06-03', time: '23:30 GMT', venue: 'TD Garden, Boston', status: 'upcoming', stage: 'NBA Finals Game 1' },
  { id: 'fix-4', sport: 'f1', team1: 'Red Bull Racing', team2: 'McLaren F1', date: '2026-06-07', time: '13:00 GMT', venue: 'Circuit de Monaco', status: 'upcoming', stage: 'Monaco Grand Prix' },
  { id: 'fix-5', sport: 'esports', team1: 'T1', team2: 'Gen.G', date: '2026-06-03', time: '11:00 GMT', venue: 'LoL Park, Seoul', status: 'live', score: '2 - 1', stage: 'LCK Summer Split' },
  { id: 'fix-6', sport: 'tennis', team1: 'Carlos Alcaraz', team2: 'Jannik Sinner', date: '2026-06-02', time: '14:00 GMT', venue: 'Court Philippe-Chatrier, Paris', status: 'completed', score: '3-2 (6-4, 5-7, 7-6, 4-6, 6-3)', stage: 'French Open Semifinals' },
  { id: 'fix-7', sport: 'hockey', team1: 'India', team2: 'Germany', date: '2026-06-06', time: '16:00 GMT', venue: 'National Hockey Stadium, Delhi', status: 'upcoming', stage: 'FIH Pro League' },
  { id: 'fix-8', sport: 'volleyball', team1: 'Poland', team2: 'Brazil', date: '2026-06-04', time: '19:00 GMT', venue: 'Spodek, Katowice', status: 'upcoming', stage: 'Nations League' },
];

// Seed Live Streams
const SEED_STREAMS: LiveStreamItem[] = [
  {
    id: 'stream-1',
    title: 'Pakistan vs West Indies 2nd Test 2026 - Day 3 Live Coverage & Commentary',
    description: 'Watch live ball-by-ball stream, tactical analysis, and commentary of Pakistan vs West Indies 2nd Test match live from National Stadium, Karachi.',
    platform: 'youtube',
    video_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embed_url: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    thumbnail: 'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    status: 'active',
    is_featured: true,
    match_name: '2nd Test Match - Day 3',
    team_one: 'Pakistan',
    team_two: 'West Indies',
    tournament: 'Pakistan vs West Indies Test Series 2026',
    stream_start: new Date(Date.now() - 3600000).toISOString(),
    stream_end: new Date(Date.now() + 18000000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: true,
    views: 14250
  },
  {
    id: 'stream-2',
    title: 'PSL 2026 Grand Final - Lahore Qalandars vs Multan Sultans Live Match',
    description: 'Official live match stream of Pakistan Super League (PSL) 2026 Final featuring high-voltage T20 action and live scoreboard.',
    platform: 'youtube',
    video_url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    embed_url: 'https://www.youtube.com/embed/21X5lGlDOfg',
    thumbnail: 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    status: 'active',
    is_featured: false,
    match_name: 'PSL 2026 Championship Final',
    team_one: 'Lahore Qalandars',
    team_two: 'Multan Sultans',
    tournament: 'HBL PSL 2026',
    stream_start: new Date(Date.now() - 1800000).toISOString(),
    stream_end: new Date(Date.now() + 10800000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: true,
    views: 28900
  },
  {
    id: 'stream-3',
    title: 'UEFA Champions League Final - Real Madrid vs Manchester City Official Stream',
    description: 'Live broadcast of the UEFA Champions League Final. Watch tactile build-up play, pitch cams, and English commentary.',
    platform: 'facebook',
    video_url: 'https://www.facebook.com/facebook/videos/10153231379946729/',
    embed_url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=false&width=1280',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    status: 'upcoming',
    is_featured: false,
    match_name: 'UEFA Champions League Final',
    team_one: 'Real Madrid',
    team_two: 'Manchester City',
    tournament: 'UEFA Champions League 2026',
    stream_start: new Date(Date.now() + 86400000).toISOString(),
    stream_end: new Date(Date.now() + 97200000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: false,
    views: 4500
  },
  {
    id: 'stream-4',
    title: 'Monaco Grand Prix 2026 - Main Race Live Telemetry & Track Cam Stream',
    description: 'Live Formula 1 Grand Prix coverage with real-time pitstop telemetry, sector timings, and driver cockpit streams.',
    platform: 'youtube',
    video_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    embed_url: 'https://www.youtube.com/embed/5qap5aO4i9A',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    status: 'upcoming',
    is_featured: false,
    match_name: 'Monaco Grand Prix',
    team_one: 'Red Bull Racing',
    team_two: 'Ferrari',
    tournament: 'FIA Formula 1 World Championship 2026',
    stream_start: new Date(Date.now() + 172800000).toISOString(),
    stream_end: new Date(Date.now() + 180000000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: true,
    views: 1200
  },
  {
    id: 'stream-5',
    title: 'StreamYard Live Sports Desk & Panel Discussion',
    description: 'Live interactive panel discussion and match breakdown broadcasted directly via StreamYard studio.',
    platform: 'streamyard',
    video_url: 'https://streamyard.com/watch/demo-sports-room',
    embed_url: 'https://streamyard.com/watch/demo-sports-room',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    status: 'active',
    is_featured: false,
    match_name: 'Live Sports Desk & Fan Q&A',
    team_one: 'Sports Desk',
    team_two: 'Guest Analysts',
    tournament: 'StreamYard Live Studio',
    stream_start: new Date(Date.now() - 1800000).toISOString(),
    stream_end: new Date(Date.now() + 7200000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: false,
    views: 3200
  },
  {
    id: 'stream-6',
    title: 'Pakistan vs West Indies Test Series 2026 - Live HD Stream',
    description: 'Watch Pakistan vs West Indies Test Series 2026 live streaming in High Definition powered by Tamasha Web. Full match coverage, ball-by-ball action, and commentary.',
    platform: 'tamasha',
    video_url: 'https://tamashaweb.com/pakistan-vs-west-indies-test-series-2026',
    embed_url: 'https://tamashaweb.com/pakistan-vs-west-indies-test-series-2026',
    thumbnail: 'https://images.unsplash.com/photo-1540747737956-378724044282?w=1200&auto=format&fit=crop&q=80',
    status: 'active',
    is_featured: true,
    match_name: 'Pakistan vs West Indies Test Series 2026',
    team_one: 'Pakistan',
    team_two: 'West Indies',
    tournament: 'PAK vs WI Test Series 2026',
    stream_start: new Date(Date.now() - 3600000).toISOString(),
    stream_end: new Date(Date.now() + 14400000).toISOString(),
    created_by: 'Hanan Irfan',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    enable_chat: true,
    views: 8900
  }
];

export class DB {
  // Helper to safely upsert post(s) to Supabase with automatic fallback if table is missing extended or is_draft columns
  static async safeUpsertPosts(posts: Post[]) {
    if (!posts || posts.length === 0) return;

    const buildPayload = (p: Post, mode: 'full' | 'base' | 'legacy') => {
      const cleanSlug = normalizeSlug(p.slug || p.title || '');
      const tagsVal = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []);
      const geoEntitiesVal = Array.isArray(p.geo_entities) ? p.geo_entities : [];
      const aeoFaqVal = Array.isArray(p.aeo_faq) ? p.aeo_faq : [];

      const legacy: any = {
        id: p.id,
        title: p.title || '',
        slug: cleanSlug,
        content: p.content || '',
        category: (p.category || 'cricket').toLowerCase().trim(),
        tags: tagsVal,
        featured_image: p.featured_image || '',
        video_url: p.video_url || '',
        author: p.author || 'FTS Desk',
        author_email: p.author_email || '',
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
        is_featured: Boolean(p.is_featured),
        is_trending: Boolean(p.is_trending),
        type: p.type === 'blog' ? 'blog' : 'news',
        scheduled_for: p.is_draft ? 'draft' : (p.scheduled_for || ''),
        meta_description: p.meta_description || '',
        views: Number(p.views) || 0,
      };

      if (mode === 'legacy') return legacy;

      const base = {
        ...legacy,
        is_draft: Boolean(p.is_draft),
      };

      if (mode === 'base') return base;

      return {
        ...base,
        heading_tag: p.heading_tag || 'h1',
        subheading: p.subheading || '',
        meta_title: p.meta_title || '',
        focus_keyword: p.focus_keyword || '',
        canonical_url: p.canonical_url || '',
        geo_summary: p.geo_summary || '',
        geo_entities: geoEntitiesVal,
        aeo_direct_answer: p.aeo_direct_answer || '',
        aeo_faq: aeoFaqVal,
        schema_type: p.schema_type || 'NewsArticle',
        meta_robots: p.meta_robots || 'index, follow',
      };
    };

    // Tier 1: Try Full payload
    const fullPayloads = posts.map(p => buildPayload(p, 'full'));
    const { error: fullError } = await supabase.from('fts_posts').upsert(fullPayloads);

    if (fullError) {
      console.warn("Supabase full post upsert notice:", fullError.message);
      
      // Tier 2: Try Base payload (with is_draft)
      const basePayloads = posts.map(p => buildPayload(p, 'base'));
      const { error: baseError } = await supabase.from('fts_posts').upsert(basePayloads);

      if (baseError) {
        console.warn("Supabase base post upsert notice:", baseError.message);

        // Tier 3: Try Legacy payload (without is_draft column)
        const legacyPayloads = posts.map(p => buildPayload(p, 'legacy'));
        const { error: legacyError } = await supabase.from('fts_posts').upsert(legacyPayloads);
        if (legacyError) {
          console.error("Supabase legacy post upsert error:", legacyError);
          throw new Error(legacyError.message || "Supabase database rejected article insert/update. Please run the SQL schema script in Supabase SQL Editor.");
        }
      }
    }
  }

  private static lastSyncTimestamp = 0;
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache window to eliminate unnecessary Supabase egress

  static parseRemotePost(p: any): Post {
    const safeArrayParse = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) {
        const trimmed = val.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          // Parse PostgreSQL text[] representation e.g. {"cricket news", "wrist spin tactics"}
          return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"/, '').replace(/"$/, ''));
        }
        try { return JSON.parse(trimmed); } catch { return [trimmed]; }
      }
      return [];
    };

    const cleanSlug = normalizeSlug(p.slug || p.id || '');
    const basePost: Post = {
      id: String(p.id || ''),
      title: String(p.title || ''),
      slug: cleanSlug,
      content: String(p.content || ''),
      category: String(p.category || 'cricket').toLowerCase().trim(),
      tags: safeArrayParse(p.tags),
      featured_image: String(p.featured_image || ''),
      video_url: String(p.video_url || ''),
      author: String(p.author || 'FTS Desk'),
      author_email: String(p.author_email || ''),
      created_at: String(p.created_at || new Date().toISOString()),
      updated_at: p.updated_at ? String(p.updated_at) : undefined,
      is_featured: Boolean(p.is_featured),
      is_trending: Boolean(p.is_trending),
      type: p.type === 'blog' ? 'blog' : 'news',
      scheduled_for: String(p.scheduled_for || ''),
      meta_description: String(p.meta_description || ''),
      views: Number(p.views) || 0,
      is_draft: p.is_draft === true || p.scheduled_for === 'draft',
      heading_tag: p.heading_tag || 'h1',
      subheading: String(p.subheading || ''),
      meta_title: String(p.meta_title || ''),
      focus_keyword: String(p.focus_keyword || ''),
      canonical_url: String(p.canonical_url || ''),
      geo_summary: String(p.geo_summary || ''),
      geo_entities: safeArrayParse(p.geo_entities),
      aeo_direct_answer: String(p.aeo_direct_answer || ''),
      aeo_faq: safeArrayParse(p.aeo_faq),
      schema_type: p.schema_type || 'NewsArticle',
      meta_robots: p.meta_robots || 'index, follow',
    };
    const fullPost = ensureFullSeoGeoAeo(basePost);
    (fullPost as any).is_synced = true;
    return fullPost;
  }

  static async syncFromSupabase(force = false) {
    const now = Date.now();
    // Cache check: Skip remote queries if data was synced within 5-10 minutes unless explicitly forced
    if (!force && now - DB.lastSyncTimestamp < DB.CACHE_TTL_MS) {
      return;
    }
    DB.lastSyncTimestamp = now;

    try {
      // 1. Sync Categories
      const { data: categories, error: catError } = await supabase.from('fts_categories').select('*');
      if (catError) {
        console.error("Supabase fetch categories error:", catError);
      } else if (categories) {
        if (categories.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        } else {
          const localCats = this.getCategories();
          if (localCats.length > 0) {
            const { error: upsertErr } = await supabase.from('fts_categories').upsert(localCats);
            if (upsertErr) console.error("Supabase categories upsert error:", upsertErr);
          }
        }
      }

      // 2. Sync Posts: Fetch all posts with fallback for column safety
      let remotePosts: any[] | null = null;
      let postError: any = null;

      const { data: summaryData, error: summaryErr } = await supabase
        .from('fts_posts')
        .select('id, title, slug, category, tags, featured_image, image_alt, video_url, author, author_email, created_at, updated_at, is_featured, is_trending, type, meta_description, views, is_draft')
        .order('created_at', { ascending: false });

      if (summaryErr) {
        // Fallback to select('*') if explicit column selection fails due to missing optional schema fields
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('fts_posts')
          .select('*')
          .order('created_at', { ascending: false });

        remotePosts = fallbackData;
        postError = fallbackErr;
      } else {
        remotePosts = summaryData;
      }

      if (postError) {
        console.error("Supabase fetch posts error:", postError);
      } else if (remotePosts) {
        const localPosts = this.getAdminAllPosts();
        const parsedRemote = remotePosts.map(p => this.parseRemotePost(p));

        if (parsedRemote.length === 0 && localPosts.length > 0) {
          // If remote database has 0 posts and local DB has unsynced posts, seed remote DB once
          const unsyncedSeed = localPosts.filter(p => !(p as any).is_synced);
          if (unsyncedSeed.length > 0) {
            await this.safeUpsertPosts(unsyncedSeed);
            unsyncedSeed.forEach(p => (p as any).is_synced = true);
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(localPosts));
          }
        } else {
          // Build canonical map from Supabase
          const postsMap = new Map<string, Post>();

          parsedRemote.forEach((rp: Post) => {
            if (rp.id) {
              (rp as any).is_synced = true;
              postsMap.set(rp.id, rp);
            }
          });

          // Always ensure default seed posts across all sports are retained if absent from remote
          SEED_POSTS.forEach(dp => {
            if (!postsMap.has(dp.id)) {
              postsMap.set(dp.id, dp);
            }
          });

          const unsyncedToPush: Post[] = [];
          localPosts.forEach((lp: Post) => {
            if (!lp.id) return;
            const existing = postsMap.get(lp.id);
            if (!existing) {
              // If this local post was newly written locally and not yet synced to Supabase, push it now!
              (lp as any).is_synced = true;
              postsMap.set(lp.id, lp);
              unsyncedToPush.push(lp);
            } else {
              // Preserve full content if local post already fetched full article body
              if (lp.content && lp.content.length > (existing.content || '').length) {
                existing.content = lp.content;
              }

              // Compare timestamps if both exist
              const existingTime = new Date(existing.updated_at || existing.created_at).getTime() || 0;
              const localTime = new Date(lp.updated_at || lp.created_at).getTime() || 0;
              if (lp.updated_at && localTime > existingTime) {
                (lp as any).is_synced = true;
                postsMap.set(lp.id, lp);
                unsyncedToPush.push(lp);
              }
            }
          });

          const mergedList = Array.from(postsMap.values());
          mergedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(mergedList));

          if (unsyncedToPush.length > 0) {
            await this.safeUpsertPosts(unsyncedToPush);
          }
        }
      }

      // 3. Sync Rankings
      try {
        const { data: rankings, error: rankError } = await supabase.from('fts_rankings').select('*');
        if (rankError) {
          console.warn("Supabase fetch rankings notice:", rankError.message);
        } else if (rankings && rankings.length > 0) {
          const formattedRankings = rankings.map((r: any) => ({
            id: String(r.id),
            sport: String(r.sport || 'cricket'),
            categoryName: String(r.category_name || r.categoryName || 'Rankings'),
            rank: Number(r.rank) || 1,
            name: String(r.name || ''),
            country: r.country ? String(r.country) : undefined,
            points: String(r.points || '0'),
            extra: r.extra ? String(r.extra) : undefined,
          }));
          localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(formattedRankings));
        } else {
          const localRankings = this.getRankings();
          if (localRankings.length > 0) {
            const dbRankings = localRankings.map(r => ({
              id: r.id,
              sport: r.sport,
              category_name: r.categoryName || (r as any).category_name || 'Rankings',
              rank: r.rank,
              name: r.name,
              country: r.country || '',
              points: r.points,
              extra: r.extra || ''
            }));
            const { error: rankUpsertErr } = await supabase.from('fts_rankings').upsert(dbRankings);
            if (rankUpsertErr) console.warn("Supabase rankings upsert notice:", rankUpsertErr.message);
          }
        }
      } catch (e) {
        console.warn("Supabase rankings fetch exception:", e);
      }

      // 4. Sync Fixtures
      try {
        const { data: fixtures, error: fixError } = await supabase.from('fts_fixtures').select('*');
        if (fixError) {
          console.warn("Supabase fetch fixtures notice:", fixError.message);
        } else if (fixtures && fixtures.length > 0) {
          localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(fixtures));
        } else {
          const localFixtures = this.getFixtures();
          if (localFixtures.length > 0) {
            const { error: fixUpsertErr } = await supabase.from('fts_fixtures').upsert(localFixtures);
            if (fixUpsertErr) console.warn("Supabase fixtures upsert notice:", fixUpsertErr.message);
          }
        }
      } catch (e) {
        console.warn("Supabase fixtures fetch exception:", e);
      }

      // 5. Sync Media
      try {
        const { data: media, error: mediaError } = await supabase.from('fts_media').select('*');
        if (mediaError) {
          console.warn("Supabase fetch media notice:", mediaError.message);
        } else if (media && media.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
        } else {
          const localMedia = this.getMedia();
          if (localMedia.length > 0) {
            const { error: mediaUpsertErr } = await supabase.from('fts_media').upsert(localMedia);
            if (mediaUpsertErr) console.warn("Supabase media upsert notice:", mediaUpsertErr.message);
          }
        }
      } catch (e) {
        console.warn("Supabase media fetch exception:", e);
      }

      // 6. Sync Live Streams
      const { data: streams, error: streamError } = await supabase.from('fts_live_streams').select('*');
      if (streamError) {
        console.warn("Supabase fetch live streams notice:", streamError.message);
      } else if (streams) {
        if (streams.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));
        } else {
          const localStreams = this.getLiveStreams();
          if (localStreams.length > 0) {
            const { error: streamUpsertErr } = await supabase.from('fts_live_streams').upsert(localStreams);
            if (streamUpsertErr) console.warn("Supabase live streams upsert notice:", streamUpsertErr.message);
          }
        }
      }

      // 7. Sync Hero Config
      try {
        const { data: remoteHero } = await supabase.from('fts_hero_config').select('*').limit(1);
        if (remoteHero && remoteHero.length > 0) {
          const h = remoteHero[0];
          const parsedHero: HeroConfig = {
            enabled: Boolean(h.enabled ?? true),
            liveBadgeText: h.liveBadgeText || h.live_badge_text || '',
            heading: h.heading || '',
            subtitle: h.subtitle || '',
            backgroundVideoUrl: h.backgroundVideoUrl || h.background_video_url || '',
            backgroundImageUrl: h.backgroundImageUrl || h.background_image_url || '',
            overlayOpacity: Number(h.overlayOpacity ?? h.overlay_opacity ?? 0.65),
            overlayBlur: Number(h.overlayBlur ?? h.overlay_blur ?? 2),
            heroHeight: h.heroHeight || h.hero_height || 'medium',
            updated_at: h.updated_at || new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(parsedHero));
        }
      } catch (e) {
        console.warn("Supabase hero config fetch notice:", e);
      }

      // 8. Sync Registered Writers & Users (fts_users)
      try {
        const { data: remoteUsers, error: usersErr } = await supabase.from('fts_users').select('*');
        if (usersErr) {
          console.warn("Supabase fetch users notice:", usersErr.message);
        } else if (remoteUsers && remoteUsers.length > 0) {
          const parsedUsers: AdminUser[] = remoteUsers.map((u: any) => ({
            id: String(u.id),
            name: String(u.name || 'Writer'),
            email: String(u.email || '').toLowerCase().trim(),
            role: String(u.role || 'Sports Writer'),
            password: u.password ? String(u.password) : undefined,
            is_approved: u.email?.toLowerCase() === 'hananirfan91@gmail.com' ? true : Boolean(u.is_approved),
            is_writer: Boolean(u.is_writer ?? true)
          }));
          
          // Ensure main admin is always present and approved
          if (!parsedUsers.some(u => u.email.toLowerCase() === 'hananirfan91@gmail.com')) {
            parsedUsers.unshift({
              id: 'admin-super',
              name: 'Hanan Irfan',
              email: 'hananirfan91@gmail.com',
              role: 'Super Admin',
              password: 'hanan@2007.',
              is_approved: true,
              is_writer: true
            });
          }

          localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(parsedUsers));
        } else {
          const localUsers = this.getAdmins();
          if (localUsers.length > 0) {
            const dbUsers = localUsers.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email.toLowerCase().trim(),
              role: u.role,
              is_approved: u.email.toLowerCase() === 'hananirfan91@gmail.com' ? true : Boolean(u.is_approved),
              is_writer: true,
              created_at: new Date().toISOString()
            }));
            const { error: userUpsertErr } = await supabase.from('fts_users').upsert(dbUsers);
            if (userUpsertErr) console.warn("Supabase users upsert notice:", userUpsertErr.message);
          }
        }
      } catch (e) {
        console.warn("Supabase users fetch exception:", e);
      }

      // Broadcast update across listening views
      window.dispatchEvent(new CustomEvent('fts_db_sync'));
    } catch (e) {
      console.error("Supabase Sync error:", e);
    }
  }

  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(SEED_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(SEED_ADMINS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(SEED_MEDIA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RANKINGS)) {
      localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(SEED_RANKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FIXTURES)) {
      localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(SEED_FIXTURES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIVE_STREAMS)) {
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(SEED_STREAMS));
    }
    
    // Start background sync from Supabase database
    this.syncFromSupabase();

    // Setup Supabase Realtime listener for live instant cross-browser updates
    if (typeof window !== 'undefined' && !(window as any)._fts_supabase_channel) {
      try {
        (window as any)._fts_supabase_channel = supabase
          .channel('fts_posts_realtime_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'fts_posts' },
            (payload) => {
              console.log('Realtime DB update received for fts_posts:', payload);
              this.syncFromSupabase();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'fts_fan_polls' },
            (payload) => {
              console.log('Realtime DB update received for fts_fan_polls:', payload);
              this.syncFromSupabase();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Supabase Realtime subscription notice:", err);
      }

      (window as any)._fts_sync_interval = setInterval(() => {
        this.syncFromSupabase(false);
      }, 300000); // 5-minute cache interval to prevent egress overuse

      window.addEventListener('focus', () => {
        this.syncFromSupabase(false);
      });
    }
  }

  // Get Top 10 Posts for Homepage Egress Limits
  static getHomePosts(): Post[] {
    return this.getPosts().slice(0, 10);
  }

  // LIVE STREAMS MODULE
  static getLiveStreams(): LiveStreamItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.LIVE_STREAMS);
    let streams: LiveStreamItem[] = data ? JSON.parse(data) : [];
    
    // Auto-repair legacy dummy URLs if present in browser localStorage
    let updated = false;
    streams = streams.map(s => {
      if (s.embed_url?.includes('H9T9e03d_jE')) {
        updated = true;
        return { ...s, video_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', embed_url: 'https://www.youtube.com/embed/jfKfPfyJRdk' };
      }
      if (s.embed_url?.includes('6p8bV_G7u20')) {
        updated = true;
        return { ...s, video_url: 'https://www.youtube.com/watch?v=21X5lGlDOfg', embed_url: 'https://www.youtube.com/embed/21X5lGlDOfg' };
      }
      if (s.embed_url?.includes('YBzE8S5S9_U')) {
        updated = true;
        return { ...s, video_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', embed_url: 'https://www.youtube.com/embed/5qap5aO4i9A' };
      }
      return s;
    });

    // Ensure all initial SEED_STREAMS exist in local storage for existing users
    SEED_STREAMS.forEach(seed => {
      const exists = streams.some(s => s.id === seed.id);
      if (!exists) {
        streams.push(seed);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));
    }

    // Sort by created_at desc or featured first
    return streams.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  static getLiveStreamById(id: string): LiveStreamItem | null {
    const streams = this.getLiveStreams();
    return streams.find(s => s.id === id) || null;
  }

  static saveLiveStream(stream: Omit<LiveStreamItem, 'id'> & { id?: string }): LiveStreamItem {
    const streams = this.getLiveStreams();
    const nowIso = new Date().toISOString();

    if (stream.id) {
      const index = streams.findIndex(s => s.id === stream.id);
      if (index !== -1) {
        // Handle featured exclusivity if updated stream is featured
        if (stream.is_featured) {
          streams.forEach(s => { s.is_featured = false; });
        }
        const updated: LiveStreamItem = {
          ...streams[index],
          ...stream,
          updated_at: nowIso
        };
        streams[index] = updated;
        localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));

        // Attempt async sync to Supabase
        supabase.from('fts_live_streams').upsert([updated]).then(({ error }) => {
          if (error) console.warn("Supabase upsert fts_live_streams notice:", error.message);
        });

        window.dispatchEvent(new CustomEvent('fts_db_sync'));
        return updated;
      }
    }

    // Handle featured exclusivity if new stream is featured
    if (stream.is_featured) {
      streams.forEach(s => { s.is_featured = false; });
    }

    const newStream: LiveStreamItem = {
      ...stream,
      id: stream.id || `stream-${Date.now()}`,
      created_at: stream.created_at || nowIso,
      updated_at: nowIso,
      views: stream.views || 0,
    } as LiveStreamItem;

    streams.unshift(newStream);
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));

    // Async sync with Supabase
    supabase.from('fts_live_streams').insert([newStream]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_live_streams notice:", error.message);
    });

    window.dispatchEvent(new CustomEvent('fts_db_sync'));
    return newStream;
  }

  static deleteLiveStream(id: string) {
    const streams = this.getLiveStreams();
    const filtered = streams.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(filtered));

    supabase.from('fts_live_streams').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_live_streams notice:", error?.message);
    });

    window.dispatchEvent(new CustomEvent('fts_db_sync'));
  }

  static toggleLiveStreamFeatured(id: string) {
    const streams = this.getLiveStreams();
    streams.forEach(s => {
      if (s.id === id) {
        s.is_featured = !s.is_featured;
      } else if (s.is_featured) {
        s.is_featured = false;
      }
    });
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));
  }

  static incrementStreamViews(id: string) {
    const streams = this.getLiveStreams();
    const item = streams.find(s => s.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAMS, JSON.stringify(streams));
    }
  }

  // POSTS
  static getPosts(): Post[] {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = data ? JSON.parse(data) : [];
    const now = new Date().getTime();
    return posts.filter((p: Post) => {
      if (p.is_draft || p.scheduled_for === 'draft') {
        return false;
      }
      if (p.scheduled_for && p.scheduled_for.trim() !== '') {
        const scheduledTime = new Date(p.scheduled_for).getTime();
        if (!isNaN(scheduledTime) && scheduledTime > now) {
          return false;
        }
      }
      return true;
    }).sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getAdminAllPosts(): Post[] {
    // Admins can see all posts, even future scheduled ones
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts: Post[] = data ? JSON.parse(data) : [];
    let updated = false;

    SEED_POSTS.forEach(dp => {
      if (!posts.some(p => p.id === dp.id || p.slug === dp.slug)) {
        posts.push(dp);
        updated = true;
      }
    });

    if (updated || !data) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }

    return posts.sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getPostBySlug(slug: string): Post | undefined {
    if (!slug) return undefined;
    const cleanSlug = normalizeSlug(slug);
    const publicPosts = this.getPosts();
    const matchedPublic = publicPosts.find(p => normalizeSlug(p.slug) === cleanSlug || p.id === cleanSlug || normalizeSlug(p.id) === cleanSlug);
    if (matchedPublic) return matchedPublic;
    
    // Fallback to all posts (including draft or newly saved)
    return this.getAdminAllPosts().find(p => normalizeSlug(p.slug) === cleanSlug || p.id === cleanSlug || normalizeSlug(p.id) === cleanSlug);
  }

  static async getPostBySlugAsync(slug: string): Promise<Post | undefined> {
    if (!slug) return undefined;
    const cleanSlug = normalizeSlug(slug);

    // 1. Try local memory/localStorage lookup
    const localPost = this.getPostBySlug(cleanSlug);
    if (localPost) return localPost;

    // 2. Query Supabase directly if missing from local cache
    try {
      const rawTarget = decodeURIComponent(slug).trim();
      const { data, error } = await supabase
        .from('fts_posts')
        .select('*')
        .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug},slug.eq.${rawTarget},id.eq.${rawTarget}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const remotePost = this.parseRemotePost(data[0]);

        // Merge into local cache so future lookups succeed instantly
        const allPosts = this.getAdminAllPosts();
        const existingIdx = allPosts.findIndex(p => p.id === remotePost.id || normalizeSlug(p.slug) === cleanSlug);
        if (existingIdx !== -1) {
          allPosts[existingIdx] = remotePost;
        } else {
          allPosts.unshift(remotePost);
        }
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
        window.dispatchEvent(new CustomEvent('fts_db_sync'));

        return remotePost;
      } else if (error) {
        console.warn("Supabase post lookup notice:", error.message);
      }
    } catch (err) {
      console.error("Supabase getPostBySlugAsync exception:", err);
    }

    return undefined;
  }

  static async insertPost(post: Omit<Post, 'id' | 'created_at' | 'views'>): Promise<Post> {
    const posts = this.getAdminAllPosts();
    const cleanCategory = (post.category || 'cricket').toLowerCase().trim();
    const cleanSlug = normalizeSlug(post.slug || post.title);
    
    const rawPost: Post = {
      ...post,
      category: cleanCategory,
      slug: cleanSlug,
      id: cleanSlug ? `post-${cleanSlug}` : `post-${Date.now()}`,
      created_at: new Date().toISOString(),
      views: 0,
      is_draft: Boolean(post.is_draft),
      scheduled_for: post.is_draft ? 'draft' : (post.scheduled_for || ''),
    };

    const newPost = ensureFullSeoGeoAeo(rawPost);

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    // Sync with Supabase
    try {
      await this.safeUpsertPosts([newPost]);
    } catch (err: any) {
      console.error("Supabase insertPost sync error:", err);
      throw err;
    }

    newPost.is_draft ? null : this.updateSitemapRegistry();
    return newPost;
  }

  static updateSitemapRegistry() {
    try {
      const publicPosts = this.getPosts();
      const baseUrl = "https://thesportsroom.online";
      const sitemapUrls = publicPosts.map(p => `${baseUrl}/blog/${p.slug}`);
      localStorage.setItem('fts_sitemap_post_urls', JSON.stringify(sitemapUrls));
      window.dispatchEvent(new CustomEvent('fts_sitemap_updated', { detail: { urls: sitemapUrls } }));
    } catch (e) {
      console.warn("Sitemap registry update warning:", e);
    }
  }

  static async updatePost(id: string, updatedFields: Partial<Post>): Promise<Post> {
    const posts = this.getAdminAllPosts();
    const cleanId = normalizeSlug(id);
    const index = posts.findIndex(p => p.id === id || normalizeSlug(p.id) === cleanId || normalizeSlug(p.slug) === cleanId);
    if (index === -1) throw new Error('Post not found in database registry');
    
    const nextFields = { ...updatedFields, updated_at: new Date().toISOString() };
    if (nextFields.category) {
      nextFields.category = nextFields.category.toLowerCase().trim();
    }
    if (nextFields.slug || nextFields.title) {
      nextFields.slug = normalizeSlug(nextFields.slug || nextFields.title || '');
    }
    if (nextFields.is_draft !== undefined) {
      if (nextFields.is_draft) {
        nextFields.scheduled_for = 'draft';
      } else if (nextFields.scheduled_for === 'draft') {
        nextFields.scheduled_for = '';
      }
    }

    const mergedPost = { ...posts[index], ...nextFields };
    const updatedPost = ensureFullSeoGeoAeo(mergedPost);
    posts[index] = updatedPost;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    // Sync with Supabase
    try {
      await this.safeUpsertPosts([updatedPost]);
    } catch (err: any) {
      console.error("Supabase updatePost sync error:", err);
      throw err;
    }

    this.updateSitemapRegistry();
    return updatedPost;
  }

  static async deletePost(id: string) {
    const posts = this.getAdminAllPosts();
    const cleanId = normalizeSlug(id);
    const filtered = posts.filter(p => p.id !== id && p.slug !== id && normalizeSlug(p.id) !== cleanId && normalizeSlug(p.slug) !== cleanId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));
    this.updateSitemapRegistry();

    // Async sync deletion with Supabase database
    try {
      const { error: err1 } = await supabase.from('fts_posts').delete().eq('id', id);
      if (err1) {
        console.warn("Supabase delete fts_posts by id notice:", err1.message);
      }
      if (cleanId) {
        await supabase.from('fts_posts').delete().eq('slug', cleanId);
      }
    } catch (err) {
      console.error("Supabase deletePost exception:", err);
    }
  }

  static async incrementViews(id: string) {
    try {
      const posts = this.getAdminAllPosts();
      const index = posts.findIndex(p => p.id === id || p.slug === id);
      if (index !== -1) {
        const nextViews = (posts[index].views || 0) + 1;
        posts[index].views = nextViews;
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

        const targetId = posts[index].id;
        const { error } = await supabase.from('fts_posts').update({ views: nextViews }).eq('id', targetId);
        if (error) console.error("Supabase views update error:", error);
      }
    } catch (e) {
      console.error("Could not increment views:", e);
    }
  }

  // CATEGORIES
  static getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  static insertCategory(category: Category) {
    const list = this.getCategories();
    list.push(category);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));

    // Sync
    supabase.from('fts_categories').insert([category]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_categories error:", error);
    });
  }

  static updateCategory(id: string, name: string, description: string) {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index].name = name;
      list[index].description = description;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));

      // Sync
      supabase.from('fts_categories').update({ name, description }).eq('id', id).then(({ error }) => {
        if (error) console.warn("Supabase update fts_categories error:", error);
      });
    }
  }

  static deleteCategory(id: string) {
    const list = this.getCategories();
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));

    // Sync
    supabase.from('fts_categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_categories error:", error);
    });
  }

  // RANKINGS
  static getRankings(): RankingItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.RANKINGS);
    return data ? JSON.parse(data) : [];
  }

  static saveRanking(item: Omit<RankingItem, 'id'> & { id?: string }): RankingItem {
    const items = this.getRankings();
    if (item.id) {
      const idx = items.findIndex(r => r.id === item.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...item } as RankingItem;
        localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(items));

        // Sync
        supabase.from('fts_rankings').update(item).eq('id', item.id).then(({ error }) => {
          if (error) console.warn("Supabase update fts_rankings error:", error);
        });

        return items[idx];
      }
    }
    const newItem: RankingItem = {
      ...item,
      id: `rank-${Date.now()}`,
    } as RankingItem;
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(items));

    // Sync
    supabase.from('fts_rankings').insert([newItem]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_rankings error:", error);
    });

    return newItem;
  }

  static deleteRanking(id: string) {
    const list = this.getRankings();
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(filtered));

    // Sync
    supabase.from('fts_rankings').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_rankings error:", error);
    });
  }

  // FIXTURES
  static getFixtures(): FixtureItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.FIXTURES);
    return data ? JSON.parse(data) : [];
  }

  static saveFixture(item: Omit<FixtureItem, 'id'> & { id?: string }): FixtureItem {
    const items = this.getFixtures();
    if (item.id) {
      const idx = items.findIndex(f => f.id === item.id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...item } as FixtureItem;
        localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(items));

        // Sync
        supabase.from('fts_fixtures').update(item).eq('id', item.id).then(({ error }) => {
          if (error) console.warn("Supabase update fts_fixtures error:", error);
        });

        return items[idx];
      }
    }
    const newItem: FixtureItem = {
      ...item,
      id: `fix-${Date.now()}`,
    } as FixtureItem;
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(items));

    // Sync
    supabase.from('fts_fixtures').insert([newItem]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_fixtures error:", error);
    });

    return newItem;
  }

  static deleteFixture(id: string) {
    const list = this.getFixtures();
    const filtered = list.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(filtered));

    // Sync
    supabase.from('fts_fixtures').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_fixtures error:", error);
    });
  }

  // ADMINS & WRITERS MANAGEMENT
  static getAdmins(): AdminUser[] {
    const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
    let list: AdminUser[] = data ? JSON.parse(data) : [];
    
    const superEmails = ['hananirfan91@gmail.com', 'urwahfarooq303@gmail.com'];

    // Guarantee Hanan Irfan
    const hananIdx = list.findIndex(a => a.email.toLowerCase() === 'hananirfan91@gmail.com');
    if (hananIdx < 0) {
      list.unshift({
        id: 'admin-super-1',
        name: 'Hanan Irfan',
        email: 'hananirfan91@gmail.com',
        role: 'Super Admin',
        password: 'hanan@2007.',
        is_approved: true,
        is_writer: true
      });
    } else {
      list[hananIdx].is_approved = true;
      list[hananIdx].is_writer = true;
      list[hananIdx].role = 'Super Admin';
      list[hananIdx].password = 'hanan@2007.';
    }

    // Guarantee Urwah Farooq
    const urwahIdx = list.findIndex(a => a.email.toLowerCase() === 'urwahfarooq303@gmail.com');
    if (urwahIdx < 0) {
      list.push({
        id: 'admin-super-2',
        name: 'Urwah Farooq',
        email: 'urwahfarooq303@gmail.com',
        role: 'Super Admin',
        password: 'urwah@2006',
        is_approved: true,
        is_writer: true
      });
    } else {
      list[urwahIdx].is_approved = true;
      list[urwahIdx].is_writer = true;
      list[urwahIdx].role = 'Super Admin';
      list[urwahIdx].password = 'urwah@2006';
    }

    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
    return list;
  }

  static registerAdmin(admin: AdminUser) {
    const list = this.getAdmins();
    const isSuper = admin.email.toLowerCase() === 'hananirfan91@gmail.com';
    const newAdmin: AdminUser = {
      ...admin,
      email: admin.email.toLowerCase().trim(),
      is_approved: isSuper ? true : Boolean(admin.is_approved),
      is_writer: true
    };

    const idx = list.findIndex(a => a.email.toLowerCase() === newAdmin.email.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...newAdmin };
    } else {
      list.push(newAdmin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    // Async sync to Supabase
    supabase.from('fts_users').upsert([{
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      is_approved: newAdmin.is_approved,
      is_writer: true,
      created_at: new Date().toISOString()
    }]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_users notice:", error.message);
    });
  }

  static approveWriter(email: string) {
    const list = this.getAdmins();
    const target = list.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (target) {
      target.is_approved = true;
      target.is_writer = true;
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('fts_db_sync'));

      supabase.from('fts_users').update({ is_approved: true, is_writer: true }).eq('email', email.toLowerCase()).then(({ error }) => {
        if (error) console.warn("Supabase approveWriter notice:", error.message);
      });
    }
  }

  static revokeWriter(email: string) {
    if (email.toLowerCase() === 'hananirfan91@gmail.com') return; // Cannot revoke Super Admin
    const list = this.getAdmins();
    const target = list.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (target) {
      target.is_approved = false;
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('fts_db_sync'));

      supabase.from('fts_users').update({ is_approved: false }).eq('email', email.toLowerCase()).then(({ error }) => {
        if (error) console.warn("Supabase revokeWriter notice:", error.message);
      });
    }
  }

  static deleteUser(id: string, email: string) {
    if (email.toLowerCase() === 'hananirfan91@gmail.com') return;
    const list = this.getAdmins();
    const filtered = list.filter(a => a.email.toLowerCase() !== email.toLowerCase() && a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    supabase.from('fts_users').delete().eq('email', email.toLowerCase()).then(({ error }) => {
      if (error) console.warn("Supabase deleteUser notice:", error.message);
    });
  }

  static getCurrentAdmin(): AdminUser | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    return data ? JSON.parse(data) : null;
  }

  static setCurrentAdmin(admin: AdminUser | null) {
    if (admin) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }
  }

  // MEDIA LIBRARY
  static getMedia(): MediaItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    return data ? JSON.parse(data) : [];
  }

  static addMedia(item: Omit<MediaItem, 'id'>): MediaItem {
    const list = this.getMedia();
    const newItem: MediaItem = {
      ...item,
      id: `media-${Date.now()}`,
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(list));

    // Sync
    supabase.from('fts_media').insert([newItem]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_media error:", error);
    });

    return newItem;
  }

  static deleteMedia(id: string) {
    const list = this.getMedia();
    const filtered = list.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));

    // Sync
    supabase.from('fts_media').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_media error:", error);
    });
  }

  static getTickets(): TicketMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  }

  static insertTicket(ticket: Omit<TicketMessage, 'id' | 'created_at'>): TicketMessage {
    const list = this.getTickets();
    const newTicket: TicketMessage = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    list.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(list));

    // Attempt to sync with Supabase
    supabase.from('fts_tickets').insert([newTicket]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_tickets notice:", error.message);
    });

    return newTicket;
  }

  static getSubscribers(): Subscriber[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
    return data ? JSON.parse(data) : [];
  }

  static insertSubscriber(email: string): Subscriber {
    const list = this.getSubscribers();
    const emailNorm = email.trim();
    const existing = list.find(s => s.email.toLowerCase() === emailNorm.toLowerCase());
    if (existing) return existing;

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: emailNorm,
      created_at: new Date().toISOString()
    };
    list.unshift(newSub);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(list));

    // Attempt to sync with Supabase
    supabase.from('fts_subscribers').insert([newSub]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_subscribers notice:", error.message);
    });

    return newSub;
  }

  static deleteTicket(id: string) {
    const list = this.getTickets();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(filtered));

    // Async
    supabase.from('fts_tickets').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_tickets error:", error);
    });
  }

  static deleteSubscriber(id: string) {
    const list = this.getSubscribers();
    const filtered = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(filtered));

    // Async
    supabase.from('fts_subscribers').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_subscribers error:", error);
    });
  }

  // HERO CONFIG MANAGEMENT
  static DEFAULT_HERO_CONFIG: HeroConfig = {
    enabled: true,
    liveBadgeText: '🔴 LIVE STREAMS • DAILY NEWS • TACTICAL METRICS',
    heading: 'The Sports Room | Live Match Streams, Sports News Today & Tactical Analysis',
    subtitle: 'Watch every live match stream, read breaking sports news today, and dive deep into real-time telemetry and tactical breakdowns. The Sports Room brings you complete, high-precision coverage across Football, Cricket, Formula 1, and the NBA.',
    overlayOpacity: 0.65,
    overlayBlur: 2,
    heroHeight: 'medium',
  };

  static getHeroConfig(): HeroConfig {
    const data = localStorage.getItem(STORAGE_KEYS.HERO_CONFIG);
    if (!data) return this.DEFAULT_HERO_CONFIG;
    try {
      return { ...this.DEFAULT_HERO_CONFIG, ...JSON.parse(data) };
    } catch {
      return this.DEFAULT_HERO_CONFIG;
    }
  }

  static async saveHeroConfig(config: Partial<HeroConfig>): Promise<HeroConfig> {
    const current = this.getHeroConfig();
    const updated: HeroConfig = {
      ...current,
      ...config,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    try {
      const heroPayload = {
        id: 'hero_main_config',
        enabled: updated.enabled,
        live_badge_text: updated.liveBadgeText,
        heading: updated.heading,
        subtitle: updated.subtitle,
        background_video_url: updated.backgroundVideoUrl,
        background_image_url: updated.backgroundImageUrl,
        overlay_opacity: updated.overlayOpacity,
        overlay_blur: updated.overlayBlur,
        hero_height: updated.heroHeight,
        updated_at: updated.updated_at
      };
      const { error } = await supabase.from('fts_hero_config').upsert([heroPayload]);
      if (error) console.warn("Supabase saveHeroConfig notice:", error.message);
    } catch (err) {
      console.warn("Supabase hero_config upsert exception:", err);
    }
    return updated;
  }

  // FAN POLL MANAGEMENT
  static parseRemotePoll(p: any): FanPoll {
    const safeArray = (v: any) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string' && v.trim()) {
        try { return JSON.parse(v); } catch { return [v]; }
      }
      return [];
    };

    return {
      id: String(p.id || `poll-${Date.now()}`),
      matchName: String(p.matchName || p.match_name || ''),
      question: String(p.question || ''),
      teamA: String(p.teamA || p.team_a || ''),
      teamALogo: String(p.teamALogo || p.team_a_logo || ''),
      teamAVotes: Number(p.teamAVotes ?? p.team_a_votes ?? 0),
      teamB: String(p.teamB || p.team_b || ''),
      teamBLogo: String(p.teamBLogo || p.team_b_logo || ''),
      teamBVotes: Number(p.teamBVotes ?? p.team_b_votes ?? 0),
      enableDraw: Boolean(p.enableDraw ?? p.enable_draw ?? true),
      drawVotes: Number(p.drawVotes ?? p.draw_votes ?? 0),
      status: (p.status === 'scheduled' || p.status === 'ended') ? p.status : 'active',
      totalVotes: Number(p.totalVotes ?? p.total_votes ?? 0),
      votedUserIds: safeArray(p.votedUserIds || p.voted_user_ids),
      created_at: p.created_at ? String(p.created_at) : new Date().toISOString(),
      updated_at: p.updated_at ? String(p.updated_at) : new Date().toISOString(),
    };
  }

  static DEFAULT_POLL: FanPoll = {
    id: 'poll-champions-trophy-1',
    matchName: 'ICC Champions Trophy 2026 • India vs Australia',
    question: "Which team is going to win today's match?",
    teamA: 'India',
    teamALogo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
    teamAVotes: 1840,
    teamB: 'Australia',
    teamBLogo: 'https://images.unsplash.com/photo-1512719991214-e0055a98d2b9?auto=format&fit=crop&w=120&q=80',
    teamBVotes: 1120,
    enableDraw: true,
    drawVotes: 140,
    status: 'active',
    totalVotes: 3100,
    votedUserIds: [],
    created_at: new Date().toISOString()
  };

  static getFanPolls(): FanPoll[] {
    const data = localStorage.getItem(STORAGE_KEYS.FAN_POLLS);
    if (!data) return [this.DEFAULT_POLL];
    try {
      const list = JSON.parse(data);
      return Array.isArray(list) && list.length > 0 ? list.map(p => this.parseRemotePoll(p)) : [this.DEFAULT_POLL];
    } catch {
      return [this.DEFAULT_POLL];
    }
  }

  static getActivePoll(): FanPoll {
    const polls = this.getFanPolls();
    return polls.find(p => p.status === 'active') || polls[0] || this.DEFAULT_POLL;
  }

  static async saveFanPoll(poll: FanPoll): Promise<FanPoll> {
    const polls = this.getFanPolls();
    const index = polls.findIndex(p => p.id === poll.id);
    const updatedPoll = { ...poll, updated_at: new Date().toISOString() };

    if (index >= 0) {
      polls[index] = updatedPoll;
    } else {
      polls.unshift(updatedPoll);
    }

    localStorage.setItem(STORAGE_KEYS.FAN_POLLS, JSON.stringify(polls));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    try {
      // Upsert pure snake_case payload for Supabase fts_fan_polls table
      const dbPayload: any = {
        id: updatedPoll.id,
        match_name: updatedPoll.matchName,
        question: updatedPoll.question,
        team_a: updatedPoll.teamA,
        team_a_logo: updatedPoll.teamALogo,
        team_a_votes: updatedPoll.teamAVotes,
        team_b: updatedPoll.teamB,
        team_b_logo: updatedPoll.teamBLogo,
        team_b_votes: updatedPoll.teamBVotes,
        enable_draw: updatedPoll.enableDraw,
        draw_votes: updatedPoll.drawVotes,
        status: updatedPoll.status,
        total_votes: updatedPoll.totalVotes,
        voted_user_ids: updatedPoll.votedUserIds,
        created_at: updatedPoll.created_at || new Date().toISOString(),
        updated_at: updatedPoll.updated_at
      };

      let { error } = await supabase.from('fts_fan_polls').upsert([dbPayload]);
      if (error && (error.message?.includes('draw_votes') || error.message?.includes('enable_draw'))) {
        // Fallback for legacy Supabase tables missing draw columns
        delete dbPayload.draw_votes;
        delete dbPayload.enable_draw;
        const fallbackRes = await supabase.from('fts_fan_polls').upsert([dbPayload]);
        error = fallbackRes.error;
      }
      if (error) console.warn("Supabase saveFanPoll notice:", error.message);
    } catch (err) {
      console.warn("Supabase saveFanPoll exception:", err);
    }
    return updatedPoll;
  }

  static async voteFanPoll(pollId: string, option: 'teamA' | 'draw' | 'teamB', userKey: string): Promise<FanPoll> {
    const polls = this.getFanPolls();
    const poll = polls.find(p => p.id === pollId) || this.getActivePoll();

    const votedList = Array.isArray(poll.votedUserIds) ? poll.votedUserIds : [];
    if (votedList.includes(userKey)) {
      return poll;
    }

    const updatedPoll: FanPoll = {
      ...poll,
      teamAVotes: option === 'teamA' ? poll.teamAVotes + 1 : poll.teamAVotes,
      teamBVotes: option === 'teamB' ? poll.teamBVotes + 1 : poll.teamBVotes,
      drawVotes: option === 'draw' ? poll.drawVotes + 1 : poll.drawVotes,
      totalVotes: poll.totalVotes + 1,
      votedUserIds: [...votedList, userKey],
      updated_at: new Date().toISOString()
    };

    return this.saveFanPoll(updatedPoll);
  }

  static async resetFanPollVotes(pollId: string): Promise<FanPoll | null> {
    const polls = this.getFanPolls();
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return null;

    const resetPoll: FanPoll = {
      ...poll,
      teamAVotes: 0,
      teamBVotes: 0,
      drawVotes: 0,
      totalVotes: 0,
      votedUserIds: [],
      updated_at: new Date().toISOString()
    };

    return this.saveFanPoll(resetPoll);
  }

  static async deleteFanPoll(pollId: string) {
    const polls = this.getFanPolls();
    const filtered = polls.filter(p => p.id !== pollId);
    localStorage.setItem(STORAGE_KEYS.FAN_POLLS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('fts_db_sync'));

    try {
      const { error } = await supabase.from('fts_fan_polls').delete().eq('id', pollId);
      if (error) console.warn("Supabase delete fts_fan_polls error:", error.message);
    } catch (err) {
      console.warn("Supabase deleteFanPoll exception:", err);
    }
  }
}

