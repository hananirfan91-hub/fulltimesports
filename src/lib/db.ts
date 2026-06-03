import { Post, Category, AdminUser, MediaItem, RankingItem, FixtureItem } from '../types';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  POSTS: 'fts_posts',
  CATEGORIES: 'fts_categories',
  ADMINS: 'fts_admins',
  MEDIA: 'fts_media',
  RANKINGS: 'fts_rankings',
  FIXTURES: 'fts_fixtures',
  CURRENT_ADMIN: 'fts_current_admin',
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
  { id: 'admin-3', name: 'Hanan Irfan', email: 'hananirfan91@gmail.com', role: 'Super Admin', password: 'hanan@2007.' },
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

*Full Time Sports Editorial Board Rating: Expert Analysis.*`,
    category: 'cricket',
    tags: ['cricket news', 'wrist spin tactics', 'T20 powerplay', 'ICC rankings', 'bowling mechanics', 'Rashid Khan analysis', 'spinning masterclass'],
    featured_image: 'https://images.unsplash.com/photo-1531415080290-b9b6e27967b8?w=1200&auto=format&fit=crop&q=80',
    video_url: 'H9T9e03d_jE',
    author: 'Sarah Patel',
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
    author: 'James Carter',
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
    author: 'James Carter',
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
    author: 'Sarah Patel',
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
    author: 'James Carter',
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
    author: 'Sarah Patel',
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
    author: 'James Carter',
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
    author: 'Sarah Patel',
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

export class DB {
  static async syncFromSupabase() {
    try {
      // 1. Sync Categories
      const { data: categories, error: catError } = await supabase.from('fts_categories').select('*');
      if (!catError && categories) {
        if (categories.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        } else {
          // Empty, seed Supabase
          const localCats = this.getCategories();
          await supabase.from('fts_categories').insert(localCats);
        }
      }

      // 2. Sync Posts
      const { data: posts, error: postError } = await supabase.from('fts_posts').select('*');
      if (!postError && posts) {
        if (posts.length > 0) {
          const parsedPosts = posts.map(p => ({
            ...p,
            tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags) : [])
          }));
          localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(parsedPosts));
        } else {
          // Empty, seed Supabase
          const localPosts = this.getAdminAllPosts();
          // Convert tags to JSON arrays for Supabase
          const dbPosts = localPosts.map(p => ({
            ...p,
            tags: JSON.stringify(p.tags) as any
          }));
          await supabase.from('fts_posts').insert(dbPosts);
        }
      }

      // 3. Sync Rankings
      const { data: rankings, error: rankError } = await supabase.from('fts_rankings').select('*');
      if (!rankError && rankings) {
        if (rankings.length > 0) {
          localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(rankings));
        } else {
          // Empty, seed Supabase
          const localRankings = this.getRankings();
          await supabase.from('fts_rankings').insert(localRankings);
        }
      }

      // 4. Sync Fixtures
      const { data: fixtures, error: fixError } = await supabase.from('fts_fixtures').select('*');
      if (!fixError && fixtures) {
        if (fixtures.length > 0) {
          localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(fixtures));
        } else {
          // Empty, seed Supabase
          const localFixtures = this.getFixtures();
          await supabase.from('fts_fixtures').insert(localFixtures);
        }
      }

      // 5. Sync Media
      const { data: media, error: mediaError } = await supabase.from('fts_media').select('*');
      if (!mediaError && media) {
        if (media.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
        } else {
          // Empty, seed Supabase
          const localMedia = this.getMedia();
          await supabase.from('fts_media').insert(localMedia);
        }
      }

      // Broadcast update across listening views
      window.dispatchEvent(new CustomEvent('fts_db_sync'));
    } catch (e) {
      console.warn("Supabase Sync Incomplete or SQL Setup Missing, using robust Local Cache:", e);
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
    
    // Start background sync from Supabase database
    this.syncFromSupabase();
  }

  // POSTS
  static getPosts(): Post[] {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = data ? JSON.parse(data) : [];
    // Filter out posts scheduled for the future
    const now = new Date().getTime();
    return posts.filter((p: Post) => {
      if (p.scheduled_for) {
        return new Date(p.scheduled_for).getTime() <= now;
      }
      return true;
    }).sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getAdminAllPosts(): Post[] {
    // Admins can see all posts, even future scheduled ones
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = data ? JSON.parse(data) : [];
    return posts.sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getPostBySlug(slug: string): Post | undefined {
    return this.getPosts().find(p => p.slug === slug);
  }

  static insertPost(post: Omit<Post, 'id' | 'created_at' | 'views'>): Post {
    const posts = this.getAdminAllPosts();
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      created_at: new Date().toISOString(),
      views: 0,
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Async sync with Supabase
    supabase.from('fts_posts').insert([{
      ...newPost,
      tags: JSON.stringify(newPost.tags) as any
    }]).then(({ error }) => {
      if (error) console.warn("Supabase insert fts_posts error:", error);
    });

    return newPost;
  }

  static updatePost(id: string, updatedFields: Partial<Post>): Post {
    const posts = this.getAdminAllPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    posts[index] = { ...posts[index], ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Async sync with Supabase
    const dbUpdateFields = { ...updatedFields };
    if (updatedFields.tags) {
      dbUpdateFields.tags = JSON.stringify(updatedFields.tags) as any;
    }
    supabase.from('fts_posts').update(dbUpdateFields).eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase update fts_posts error:", error);
    });

    return posts[index];
  }

  static deletePost(id: string) {
    const posts = this.getAdminAllPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));

    // Async sync with Supabase
    supabase.from('fts_posts').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn("Supabase delete fts_posts error:", error);
    });
  }

  static incrementViews(id: string) {
    try {
      const posts = this.getAdminAllPosts();
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        const nextViews = (posts[index].views || 0) + 1;
        posts[index].views = nextViews;
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

        // Async sync stats
        supabase.from('fts_posts').update({ views: nextViews }).eq('id', id).then(({ error }) => {
          if (error) console.warn("Supabase views update error", error);
        });
      }
    } catch (e) {
      console.warn("Could not increment views", e);
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

  // ADMINS
  static getAdmins(): AdminUser[] {
    const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
    return data ? JSON.parse(data) : [];
  }

  static registerAdmin(admin: AdminUser) {
    const list = this.getAdmins();
    list.push(admin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
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
}

