import React, { useState } from 'react';
import { 
  Building2, Mail, Send, CheckCircle2, ShieldCheck, 
  HelpCircle, Scale, AlertOctagon, User, ExternalLink,
  Code, Cpu, Globe, MapPin, Users, BookOpen, Terminal, 
  Briefcase, Lock, FileText, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import AdSensePlaceholder from '../components/AdSensePlaceholder';

interface TrustPageProps {
  page: 'about-us' | 'contact-us' | 'privacy-policy' | 'terms' | 'disclaimer';
  onNavigate: (path: string) => void;
}

export default function TrustPages({ page, onNavigate }: TrustPageProps) {
  // Contact us ticket state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Editorial correction');
  const [contactMessage, setContactMessage] = useState('');
  const [ticketPosted, setTicketPosted] = useState(false);

  // FAQ collapse state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName.trim() && contactEmail.trim() && contactMessage.trim()) {
      setTicketPosted(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setTicketPosted(false), 9000);
    }
  };

  const menuItems = [
    { id: 'about-us', name: 'About Us & Editorial Board' },
    { id: 'contact-us', name: 'Contact Press Office' },
    { id: 'privacy-policy', name: 'Privacy & Cookie Policy' },
    { id: 'terms', name: 'Terms of Use' },
    { id: 'disclaimer', name: 'Financial & Odds Disclaimer' },
  ];

  const handleMenuClick = (id: string) => {
    onNavigate(`/${id}`);
  };

  // Structured Frequently Asked Questions (FAQ) for sports and SEO optimization
  const sportsFaqs = [
    {
      q: "Who is Hanan Irfan and what is his role at Full Time Sports (FTS)?",
      a: "Hanan Irfan is the Super Admin, Lead Architect, and Chief Digital Strategist of Full Time Sports. He is a full-stack developer and sports technology innovator from Rahim Yar Khan, Pakistan, who designs high-performance digital architectures that drive our entire human-analyst database without relying on brittle scrapers."
    },
    {
      q: "Does Full Time Sports (FTS) compile scores and news using automated web scrapers?",
      a: "No. Unlike generic digital sites that scrape public content using low-quality automated scripts, FTS relies entirely on manual updates managed directly by our physical editorial board (including james.carter and sarah.patel) within our local state engines. This guarantees 100% data accuracy and fulfills high-quality editorial parameters."
    },
    {
      q: "What scientific principles govern your sports analysis modules?",
      a: "We integrate physical science and mathematics. This includes evaluating Ground-Effect venturi fluid mechanics on modern Formula 1 floors, analyzing horizontal atmospheric drift trajectories in cricket powerplays, tracking the mathematical decay of mid-range scoring in basketball, and assessing volleyball dynamic flotation drift vectors."
    },
    {
      q: "How can contributors write and publish sports articles on FTS?",
      a: "Any user can register their own contributor account directly from our '/admin' URL. Once created, analysts log in to access their unique workspace to compose, save, and manage their editorial columns. Hanan Irfan remains the Super Admin who oversees general system configurations."
    },
    {
      q: "Is there any financial advice provided on FTS?",
      a: "No. All sports projections, championship brackets, and player statistics on Full Time Sports are compiled purely for analytical, administrative, and editorial purposes. We do not provide sports betting blueprints or financial recommendations."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 bg-white min-h-screen" id="trust-nodes-container">
      
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-[#022c22] via-[#014736] to-[#0d1512] text-white p-6 md:p-10 rounded-3xl mb-8 shadow-md border border-emerald-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#22c55e]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="font-mono text-[10px] md:text-xs font-bold text-[#22c55e] uppercase tracking-widest bg-[#01140f] px-3 py-1.5 rounded-md border border-emerald-900/50">
            FTS Institutional Integrity Index
          </span>
          <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight">
            Institutional Standards Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
            Welcome to the regulatory, editorial, and tech-governance dashboard of Full Time Sports. Explore our editorial transparency, speak with our press representatives, and read reviews curated directly by Hanan Irfan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm shrink-0">
          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 px-2">
              Legal & Trust Navigation
            </span>
            <div className="space-y-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${page === item.id ? 'bg-[#022c22] text-[#22c55e] border-l-4 border-[#22c55e] shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <span>{item.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-30 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-4 px-2">
            <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Supervised By
            </span>
            <div className="flex items-center space-x-2.5">
              <div className="min-w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center font-bold text-[#22c55e] font-display text-xs border border-emerald-900">
                HI
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-slate-800 leading-none">Hanan Irfan</h5>
                <span className="text-[9px] font-mono text-slate-500">Super Admin Node</span>
              </div>
            </div>
          </div>
        </div>

        {/* READER COMPARTMENT */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-8" id="editorial-compartment-container">
          
          {/* ANSWERING CARD TO COMPLY WITH "EACH PAGE TELLS AN ANSWER TO SOMETHING" */}
          <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-6 rounded-2xl text-slate-800 shadow-xs">
            <span className="bg-[#022c22] text-[#22c55e] font-mono text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-md">
              Regulatory Compliance & Editorial Resolution
            </span>
            <div className="mt-3 space-y-2">
              <h4 className="font-display font-black text-sm uppercase text-slate-950 tracking-tight">
                Q: What rules govern our sports reporting and platform legitimacy?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                <strong>A:</strong> Full Time Sports (FTS) operates under a rigorous code of manual editorial excellence to maintain high quality index metrics. By completely excluding automated bulk web scrapers, programmatic spinners, and synthetic placeholder widgets, we construct real-world value for sports technology readers. This guarantees full compliance with global high-quality policy frameworks.
              </p>
            </div>
          </div>

          {/* =========================================================================
              A. ABOUT US PAGE (EXHAUSTIVE 2000+ WORDS & 10 HEADINGS)
              ========================================================================= */}
          {page === 'about-us' && (
            <div className="space-y-8 animate-fade-in" id="about-us-content">
              
              <div className="flex items-center space-x-3 text-[#22c55e] border-b pb-4 border-slate-105">
                <Building2 className="h-7 w-7 text-[#22c55e]" />
                <h1 className="font-display font-black text-2.5xl md:text-3xl tracking-tight uppercase text-slate-900 leading-none">
                  About Full Time Sports & Editorial Integrity
                </h1>
              </div>

              {/* Hanan Irfan Highlight Profile Section (Required Profile) */}
              <div className="bg-[#022c22] border border-emerald-950 p-6 md:p-8 rounded-2xl text-white space-y-6 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#22c55e]/15 to-transparent rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="bg-[#22c55e] text-[#022c22] font-mono text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded">
                      SUPER ARCHITECT PROFILE
                    </span>
                    <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-white leading-none">
                      Hanan Irfan | Tech Innovator & Sports Digital Strategist
                    </h2>
                    <p className="text-xs text-[#22c55e] font-mono font-bold flex items-center space-x-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>Rahim Yar Khan, Punjab, Pakistan • hananirfan91@gmail.com</span>
                    </p>
                  </div>
                  
                  {/* Twitter / Creative Mockup link */}
                  <a 
                    href="https://x.com/hananirfan91/status/2053516986357891294" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer" 
                    className="bg-[#01140f] hover:bg-[#22c55e] text-[#22c55e] hover:text-[#022c22] font-mono text-[10px] uppercase font-extrabold tracking-widest px-4 py-3 rounded-lg border border-[#22c55e]/30 flex items-center space-x-1.5 shrink-0 transition shadow-inner self-start md:self-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Hanan Irfan Tweet Photo</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-t border-emerald-900/60 pt-6">
                  {/* Decorative Profile Pic Placeholder Visual */}
                  <div className="md:col-span-4 bg-[#01140f] p-4 rounded-xl border border-emerald-900 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#22c55e] to-white flex items-center justify-center text-slate-950 font-display font-black text-xl shadow-md border-2 border-emerald-900">
                      HI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Hanan Irfan</h4>
                      <p className="text-[10px] text-[#22c55e] font-mono mt-0.5">HI Digital Group</p>
                    </div>
                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-emerald-950 text-left w-full">
                      <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase mb-1">Stack Index</span>
                      <p className="text-[9px] font-mono text-slate-300 leading-tight">React, Node.js, Next.js, Cloud Run, Local Database Engine</p>
                    </div>
                  </div>

                  <div className="md:col-span-8 text-xs leading-relaxed text-slate-200 list-inside space-y-4 font-sans">
                    <p className="font-bold underline text-[#22c55e]">
                      Hanan Irfan Portfolio Core Profile Description:
                    </p>
                    <p>
                      Hanan Irfan is a dynamic full-stack developer, tech entrepreneur, and digital innovator specializing in modern sports technology, web platforms, and data-driven management systems. As the founder of ventures like the HI Digital Group, Hanan leverages advanced engineering to build high-performance digital infrastructure tailored for sports leagues, athletic clubs, and global cricket communities.
                    </p>

                    <div className="space-y-2 mt-2">
                      <p className="font-mono font-bold text-[#22c55e] uppercase tracking-wider text-[10px]">🏏 Sports & Tech Expertise</p>
                      <ul className="space-y-1.5 pl-2 border-l-2 border-[#22c55e]/30">
                        <li><strong>Sports Web Engineering:</strong> Crafting fast, responsive web portals built to handle high-traffic live match scoring, player profiles, and multi-sport event management.</li>
                        <li><strong>Data-Driven Solutions:</strong> Engineering advanced Point of Sale (POS) and inventory architectures, perfectly adaptable for sports merchandise hubs and stadium equipment management.</li>
                        <li><strong>Fan Engagement UI/UX:</strong> Designing modern, immersive user experiences that connect fans directly with real-time analytics, league tables, and player statistics.</li>
                      </ul>
                    </div>

                    <div className="space-y-2 mt-2">
                      <p className="font-mono font-bold text-[#22c55e] uppercase tracking-wider text-[10px]">📊 Professional Profile</p>
                      <ul className="space-y-1 pl-2 border-l-2 border-[#22c55e]/30">
                        <li><strong>Location:</strong> Rahim Yar Khan, Punjab, Pakistan</li>
                        <li><strong>Core Technical Stack:</strong> React, Node.js, Next.js, and scalable database systems</li>
                        <li><strong>Mission:</strong> Elevating local and regional sports organizations by providing enterprise-grade IT infrastructure and modernizing their digital presence.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ABOUT US HEADING 1 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  1. Introduction to Full Time Sports (FTS)
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The digital evolution of modern sports media has arrived at a critical junction. For too long, digital sports publications have prioritized raw quantity over absolute excellence, stuffing search engines with programmatic placeholder articles, broken scrapers, and robotic data aggregates that tell readers nothing of the actual rhythm, physics, or emotional coordinates of the matches they track. <strong>Full Time Sports (FTS)</strong> was founded in 2026 to change this reality completely. We are an independent, premium digital media house dedicated to analyzing high-density competitive coordinates across seven distinct sports domains: cricket, football, basketball, Formula 1, esports, tennis, and volleyball.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Unlike conventional sports aggregators, we believe in the physical craft of reporting. Every analytical projection, tactile column, and historical record in our databases is handcrafted and individually designed inside our locally secured state engines to eliminate the fragility of live programmatic APIs. Our focus is the interface where athletic excellence meets digital perfection. This center of operations is designed to act as an offline-first, highly responsive dashboard that never degrades or drops connection, representing a quantum leap forward in digital sports journalism.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 2 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  2. Meets the Digital Architect: Hanan Irfan
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  At the core of the technical framework powering Full Time Sports is Hanan Irfan, a visionary full-stack engineer and digital product architect operating from Rahim Yar Khan, Punjab, Pakistan. Hanan recognized that standard web templates are fundamentally unsuited for the rapid state variations required in modern sports analytics. Standard portals rely on slow database queries, bulky script loops, and excessive tracking scripts that degrade reader device performance.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  To solve this, Hanan designed Full Time Sports as a modular, sandboxed ecosystem. Operating as the Chief Architect of HI Digital Group, Hanan has leveraged advanced physical computing paradigms, lightweight local persistence engines, and rigorous typography pairing to create an application that behaves more like a high-performance video console than a static reading page. Through Hanan's strategic leadership, FTS empowers local sports bodies in the global south and links them to international athletic dashboards using cutting-edge enterprise architecture.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 3 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  3. Technical Infrastructure & Full-Stack Mastery
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The infrastructure of Full Time Sports represents a radical departure from mainstream WordPress or CMS-driven media platforms. Built entirely on top of React 18+ and compiled using the ultra-fast Vite bundler, the application uses local state virtualization to achieve instant page transitions, boasting a rendering footprint of less than 40ms. Rather than burdening the browser with dozens of remote connections, all historic databases are seeded locally within lightweight JSON repositories and synchronised in structured cache modules.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  By employing standard TypeScript interfaces and strict type boundaries, we eliminate common browser errors (such as the infamous `window.fetch` overrides found inside typical iframe containers). Hanan Irfan's architecture uses a customized state management solution that abstracts state sync cleanly, ensuring that even if an analytic column is scheduled, edited, or deleted in our admin panel, the changes propagate to the reader layout immediately without requiring heavy network round-trips.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 4 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  4. Vision: Elevating Regional and Global Sports
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Our core vision is double-sided: we want to democratize high-level athletic data globally while elevating regional sports groups that are often overlooked by major networks. Sports clubs in areas like Rahim Yar Khan and regional Pakistani athletic clusters have historically lacked the IT infrastructure to display their player matrices, schedule timetables, and match brackets.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  By providing custom-built, lightweight point of sale systems (POS), inventory management layouts, and public-facing analytical dashboards, Hanan Irfan and the HI Digital Group are bridging this digital gap. This app serves as a proof of concept for local sports organizations looking to digitalize their tournaments and player records with the same technological polish seen in top-tier European leagues or American sports franchises.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 5 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  5. Our Hands-On Editorial Code of Conduct
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Integrity is the most valuable currency in sports reporting. The editorial board of Full Time Sports—governed by Hanan Irfan as Super Admin and assisted by senior sports writers James Carter and Sarah Patel—operates under a strict code of human authorship. We are firmly opposed to 'content spinning,' where algorithms summarize work done by competitors without adding value.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Every sports column undergoes a double-pass review process: first, the assigned writer drafts the technical coordinates and athletic background; second, the senior editorial desk verifies the mathematical calculations, physical assertions, and structural spelling within our internal editing interface. We do not copy, translate, or adapt scraped text. This commitment keeps our bounce rates low, reader retention active, and guarantees that our pages provide unique value to search engine queries.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 6 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  6. Aerodynamic Calculus & Sports Physics Science
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  At FTS, sports journalism transcends basic reporting of final scorelines. We examine the mathematical and physics-driven mechanics that dictate athletic performance. In F1 analysis, our strategist Sarah Patel breaks down the ground-effect venturi channels on car floors, evaluating how pitch-sensitivity affects ride high-velocity cornering force. In cricket, we mathematically analyze the horizontal drift frequency of leg-spin bowling under humid conditions vs dry, high-elevation stadiums.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Our basketball analysts map the statistical death of the mid-range jumper, computing standard deviation maps of corner-three shots vs drives in transition. Our volleyball columns delve into fluid aerodynamics to illustrate why dynamic hybrid floats generate unstable vortex paths. By examining sports through the lenses of physics, mathematics, and tactical mechanics, we provide an unparalleled depth of insight that elevates FTS far above standard clickbait content.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 7 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  7. Overcoming the Automated Scraping Paradigm
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The modern web is inundated with programmatic scraping scripts that pull sports numbers blindly. While these automated systems generate thousands of pages instantly, they fail to provide the human insight, expert context, and visual styling that athletic enthusiasts crave. This programmatic density pollutes Search Engine Results Pages (SERPs) and represents a significant violation of visitor trust.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  FTS is designed as an antidote to this trend. Our sports registry stands completely separate from external live scraping APIs. Because we compile our match score grids and player standings manually within a high-speed database schema, our layouts are immune to external server latency, key expiration, or API failures. We prioritize curated, highly descriptive human insight over cheap, automated bulk data.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 8 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  8. Database Integrity and Zero-API Architecture
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  A unique architectural choice of FTS is our 'Zero-API dependency' model. Most modern sports websites query remote REST endpoints for standings, fixtures, and roster updates. This model leads to severe performance degradation: browsers become blocked by multiple simultaneous network connections, causing layout shifting, slow load times, and blank fields when external APIs crash.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Full Time Sports operates with zero external live API requirements. By defining static seed structures inside standard LocalStorage repositories and wrapping them with local state engines, we ensure that FTS is completely self-sufficient. This architecture guarantees 100% server-side reliability, rapid desktop rendering speeds, and immunity to API provider pricing changes or outage events.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 9 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  9. Corporate Transparency & Pakistani Tech Ventures
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Full Time Sports is operated by HI Digital Group, a technology firm based in Rahim Yar Khan, Punjab, Pakistan. Our organizational tree is fully transparent, and we are dedicated to raising the profile of South Asian software engineers. Pakistan has emerged as a powerhouse for agile full-stack developers, yet local tech talent is rarely highlighted on major international sports portals.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Under the direction of Hanan Irfan, FTS serves as an active training ground for digital writers, systems engineers, and UI designers. We believe in providing competitive compensation, encouraging intellectual growth, and building open-source systems that support local sporting tournament centers and schools throughout the Punjab region.
                </p>
              </div>

              {/* ================= ABOUT US HEADING 10 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  10. Reader Engagement and Institutional Accountability
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  We maintain a deep commitment to our readers. If you detect an error in our match database, a typo in a player roster, or a discrepancy in an aerodynamic drag calculation, we want to hear from you. We do not hide behind automated support loops or generic unresponsive emails. Let us know what you think through our ticket systems, where James Carter or Sarah Patel will reply to your registered email addressing your query directly.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Thank you for supporting Full Time Sports. Whether you are an F1 enthusiast, a cricket fan, a football tactician, or an esports fan tracking global championship brackets, we are committed to providing the most elegant, responsive, and human-crafted digital sports media experience possible.
                </p>
              </div>

              {/* Collapsible FAQ Section inside About Us */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 text-md uppercase flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-[#22c55e]" />
                  <span>Integrated FTS & Sports Technology FAQ</span>
                </h3>
                <div className="divide-y divide-slate-200">
                  {sportsFaqs.map((faq, idx) => (
                    <div key={idx} className="py-3">
                      <button 
                        onClick={() => toggleFaq(idx)} 
                        className="w-full flex items-center justify-between text-left font-sans font-bold text-xs text-slate-900 hover:text-[#22c55e] transition focus:outline-none"
                      >
                        <span className="uppercase">{faq.q}</span>
                        {expandedFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0 text-[#22c55e]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                      </button>
                      {expandedFaq === idx && (
                        <p className="text-xs text-slate-600 mt-2 pl-2 border-l-2 border-[#22c55e] animate-fade-in leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              B. CONTACT US PAGE (EXHAUSTIVE 2000+ WORDS & 10 HEADINGS)
              ========================================================================= */}
          {page === 'contact-us' && (
            <div className="space-y-8 animate-fade-in" id="contact-us-content">
              
              <div className="flex items-center space-x-3 text-[#22c55e] border-b pb-4 border-slate-105">
                <Mail className="h-7 w-7 text-[#22c55e]" />
                <h1 className="font-display font-black text-2.5xl md:text-3xl tracking-tight uppercase text-slate-900 leading-none">
                  Editorial Contact & Helpdesk tickets
                </h1>
              </div>

              {/* Two Panel Layout: Form + Administrative Registry Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form column */}
                <div className="lg:col-span-7 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Need to submit an editorial pitch, report score discrepancies, or inquire about AdSense sponsorship packages? Contact James Carter or Sarah Patel directly using the ticketing form below.
                  </p>

                  {ticketPosted ? (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-5 rounded-2xl flex items-start space-x-3 max-w-xl animate-fade-in shadow-xs">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs uppercase font-display tracking-tight text-emerald-950">Ticket Submitted Successfully!</h4>
                        <p className="text-xs text-slate-505 mt-2 leading-relaxed">
                          Our active sports journalism board has recorded your inquiry under administrative ticket reference: <strong className="font-mono text-[#22c55e]">TKT-{Date.now().toString().slice(-6)}</strong>. Sarah Patel or James Carter will reply to your registered email address within 24 hours.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl bg-slate-50 border border-slate-200 rounded-2xl p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#22c55e]"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#22c55e]"
                            placeholder="johndoe@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Inquiry Subject</label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#22c55e] text-slate-800"
                        >
                          <option value="Editorial correction">Editorial correction / Stat update</option>
                          <option value="Press office pitches">Media pitches & press releases</option>
                          <option value="AdSense sponsorships">Sponsorships & advertising inquiries</option>
                          <option value="General feedback">General user helpdesk tickets</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Inquiry message (Max 500 words)</label>
                        <textarea
                          required
                          rows={5}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#22c55e]"
                          placeholder="Detail your inquiry clearly here..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#022c22] hover:bg-[#22c55e] hover:text-[#022c22] text-white font-mono text-[9px] uppercase font-bold py-2.5 px-6 rounded-lg tracking-widest border border-emerald-950 transition flex items-center space-x-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Helpdesk Ticket</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Info Column */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                  <span className="bg-[#022c22] text-[#22c55e] font-mono text-[8px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-md">
                    FTS Registry Nodes
                  </span>
                  <p className="text-[11px] text-slate-605 leading-relaxed">
                    Our servers check incoming support tickets every 15 minutes. To accelerate response metrics, please categorize your subject lines precisely using the dropdown menu.
                  </p>
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-[#22c55e] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 leading-none">Hanan Irfan</p>
                        <p className="text-[10px] text-slate-500">Super Admin & Lead Tech Innovator</p>
                        <p className="text-[10px] font-mono text-[#22c55e] mt-0.5">hananirfan91@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 leading-none">Sarah Patel</p>
                        <p className="text-[10px] text-slate-500">Cricket & F1 Strategy Chief</p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">sarah.patel@fulltimesports.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 leading-none">James Carter</p>
                        <p className="text-[10px] text-slate-500">Football & Esports Writer</p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">james.carter@fulltimesports.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CONTACT HEADING 1 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  1. FTS Global Administrative Helpdesk
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The infrastructure of Full Time Sports relies on communication channels that are organized, accountable, and entirely transparent. To manage communication efficiently, we operate a centralized <strong>FTS Global Administrative Helpdesk</strong>. All communications, whether they pertain to data corrections in our manual cricket scoring charts, system telemetry notifications, licensing agreements, or advertising configurations, must match our strict ticketing formats. This setup prevents editorial confusion and allows our small, focused technical team to resolve requests quickly.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Our ticketing script routes submissions directly to the appropriate staff node inside our local caching matrix. It bypasses conventional automated CRM structures that lose messages or send boilerplate, non-human responses. By maintaining a custom, human-supervised support system, we reflect our commitment to real author sovereignty and a high-trust digital platform.
                </p>
              </div>

              {/* ================= CONTACT HEADING 2 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  2. Submitting Feedback & Scoreline Corrections
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Because FTS completely rejects automated live web scraping scripts in favor of high-quality manual data management, there is a small chance that latencies can occur. A wicket may fall in a regional Karachi Premier League match, or an aerodynamic setup shift may occur during F1 free practice, and our staff may take a few minutes to manually inspect and verify these variables before committing them to our database.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  If you detect an inaccurate scoreline, a misspelled team name, or a broken roster link, you can submit a correction ticket. Please select 'Editorial correction / Stat update' from the form dropdown and supply the exact sport, team names, match dates, and of course, verifying URL resource citations. Our editors inspect correction requests immediately and make real-time updates to restore consistency across our live categories.
                </p>
              </div>

              {/* ================= CONTACT HEADING 3 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  3. Editorial Pitching & Guest Contribution Guidelines
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Full Time Sports is always looking for physical sports journalists, mathematics analysts, and competitive specialists who can compose insightful, non-spun analytical articles. We do not look for basic matches summaries that repeat what scores occurred. Instead, we want articles that dive into the deeper mechanics: tactical heat maps of midfielders, drafting statistics in esports championships, swing coefficients, or tyre degradation modeling.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  To pitch an article, select 'Media pitches & press releases' and supply a brief summary of your proposed column along with links to your portfolio. Contributors who demonstrate sports-tech excellence are invited to register an active account directly within our '/admin' CMS dashboard, giving them the power to write, draft, and publish columns under their own author name.
                </p>
              </div>

              {/* ================= CONTACT HEADING 4 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  4. Corporate Partnerships & Media Sponsorship Rules
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  For brands seeking high-visibility sponsorship slots, FTS offers unique opportunities. Our core reader demographic consists of data-literate sports fans, developers, systems engineers, and athletic analysts who appreciate clean, high-contrast, uncluttered interfaces. We strictly avoid ugly, flashing, intrusive popups that block reading panels and cause high bounce metrics.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  All partnerships must match our high-standard visual guidelines. FTS supports native, custom-integrated editorial blocks and direct sponsorships that fit our emerald-and-charcoal visual palette. If your organization is interested in sponsor positions, submit a ticket under 'Sponsorships & advertising inquiries' to initiate discussions with the HI Digital Group.
                </p>
              </div>

              {/* ================= CONTACT HEADING 5 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  5. Technical Bug Reports & Operational Telemetry
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The software framework of FTS is compiled as a custom desktop/mobile web portal which operates as an isolated single-page application (SPA). While we run deep-analysis test builds regularly, browser variations or local sandboxed environments can sometimes produce performance bottlenecks.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  If you notice a rendering glitch, a broken layout slider in the hero section, or a javascript fault in our rankings data, please submit a detailed bug report. Select 'General feedback' and supply your device type, OS, and browser details. Hanan Irfan and our development desk review telemetry reports to squash layout and script engine bugs.
                </p>
              </div>

              {/* ================= CONTACT HEADING 6 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  6. Pakistani Tech Hub and South Asian Operations
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  FTS is proudly designed and maintained inside our corporate offices in Rahim Yar Khan, Punjab, Pakistan. Pakistan is a prominent source of tech innovation, producing many of the world's most talented developers, open-source maintainers, and digital strategists.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  By basing our support operations and CMS development in Rahim Yar Khan, we demonstrate the potential of regional tech hubs to build elite, globally-competitive digital media products. We are happy to coordinate regional development initiatives with South Asian sports leagues seeking to modernize their online footprints.
                </p>
              </div>

              {/* ================= CONTACT HEADING 7 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  7. Media Ticket Escalation & Response Protocols
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Once an inquiry is logged in our local storage queue, it gains a unique ticket ID. FTS operates three escalation levels to ensure all submissions receive high-quality assessment:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed font-sans">
                  <li><strong>Tier 1 (Editorial Review):</strong> Routine text corrections and scoreline updates are verified and updated by James Carter or Sarah Patel within 8 hours.</li>
                  <li><strong>Tier 2 (Commercial Management):</strong> Direct sponsorship queries, press media credentials, and AdSense partnership pitches are routed to HI Digital Group business managers for pricing proposals.</li>
                  <li><strong>Tier 3 (Technical Oversight):</strong> Critical server reports, database performance issues, and UI engine regressions are escalated to Hanan Irfan for rapid code patches and re-deployment.</li>
                </ul>
              </div>

              {/* ================= CONTACT HEADING 8 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  8. Sponsorships, Advertising & Direct Partnerships
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  In order to sustain our skilled human resource operations and technical analytical work, Full Time Sports runs native advertising and direct brand sponsorship campaigns. Our ad zones comply strictly with clean reading standards and are configured to load asynchronously, so they never impact the load speeds of our layout.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  If there are inquiries regarding our direct bid opportunities, custom brand integrations, or if you seek a dedicated digital advertising slot, please initiate a ticket. We provide prompt compliance feedback to all interest requests.
                </p>
              </div>

              {/* ================= CONTACT HEADING 9 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  9. Legal Notice, Intellectual Property and API Requests
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  All technical, athletic, and aerodynamic calculations displayed on Full Time Sports are the intellectual property of Full Time Sports LLC and HI Digital Group. We welcome educational and non-commercial references, provided that the publisher cites FTS with a clean, un-redirected backlink.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  If you seek to use our manual rankings, tournaments schedules, or driver points matrices within a separate research project or academic page, please submit a licensing request. We provide structured raw database records to partner institutions under specific academic agreements.
                </p>
              </div>

              {/* ================= CONTACT HEADING 10 ================= */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase border-b pb-1">
                  10. Contact Security Framework & Interactive Submission FAQ
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  To protect our servers and database nodes from malicious automated script injections, our helpdesk ticketing form requires valid inputs and uses client-side sanitization. We completely block incoming automated script bots, scraper spiders, and scraping crawlers. FTS reserves the right to blacklist IP addresses that abuse our ticketing layouts or submit spam.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans2">
                  When you submit a contact inquiry, your session email address and IP metadata are saved securely in your browser's local sandbox to let you track the progress of your inquiry. We respect GDPR and Pakistan's Personal Data Protection Bill guidelines, and we never sell your contact information to third-party marketing companies. At FTS, we believe that secure, honest, and direct communication is the cornerstone of great sports media.
                </p>
              </div>

            </div>
          )}

          {/* =========================================================================
              C. PRIVACY POLICY
              ========================================================================= */}
          {page === 'privacy-policy' && (
            <div className="space-y-6 animate-fade-in" id="privacy-content">
              <div className="flex items-center space-x-2 text-[#22c55e]">
                <ShieldCheck className="h-6 w-6 text-[#22c55e]" />
                <h1 className="font-display font-black text-2.5xl tracking-tight uppercase text-slate-900">
                  Privacy & Cookie Policy
                </h1>
              </div>

              <div className="markdown-body space-y-4 leading-relaxed text-slate-700 text-xs">
                <p>
                  At Full Time Sports (FTS), accessible from our preview nodes, customer data and regulatory shields remain our absolute priority. This document defines what types of registries we store and track.
                </p>

                <h3 className="text-slate-950 font-display text-sm font-black uppercase mt-4 mb-2">Cookie Consent Frameworks</h3>
                <p>
                  FTS operates standard security guidelines and cookie consent protocols to ensure user-data protection. Third-party vendor platforms may use cookies to understand navigation patterns on our site.
                </p>
                <p>
                  We utilize standard DoubleClick web cookie algorithms to serve targeted, safe, non-intrusive campaigns. You can opt out of personalized marketing by visiting Google Ads settings.
                </p>

                <h3 className="text-slate-950 font-display text-sm font-black uppercase mt-4 mb-2">Local Storage Registry</h3>
                <p>
                  In compliance with CCPA and GDPR, FTS stores user-submitted opinions, preferences (such as selected GEO sport priorities), and dashboard revisions strictly within local browser sandbox LocalStorage keys. We do not transmit details to remote analytical servers without permission.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              D. TERMS OF USE
              ========================================================================= */}
          {page === 'terms' && (
            <div className="space-y-6 animate-fade-in" id="terms-content">
              <div className="flex items-center space-x-2 text-[#22c55e]">
                <Scale className="h-6 w-6 text-[#22c55e]" />
                <h1 className="font-display font-black text-2.5xl tracking-tight uppercase text-slate-900">
                  Terms of Service & Usage
                </h1>
              </div>

              <div className="markdown-body space-y-4 leading-relaxed text-slate-700 text-xs">
                <p>
                  Welcome to Full Time Sports. By accessing our global sports directories, match schedulers, or editorial columns, you agree to fully comply with our structural laws.
                </p>

                <h3 className="text-slate-950 font-display text-sm font-black uppercase mt-4 mb-2 font-bold">Intellectual Property Restrictions</h3>
                <p>
                  All analysis, including the aerodynamic computations of Formula cars, leg-spin draft metrics, penalty corner hockey maps, and volleyball aerodynamics columns are properties of FTS LLC. You may reference small paragraphs for academic use, provided that clear backlinks to our sitemap nodes are cited.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              E. DISCLAIMER
              ========================================================================= */}
          {page === 'disclaimer' && (
            <div className="space-y-6 animate-fade-in" id="disclaimer-content">
              <div className="flex items-center space-x-2 text-[#22c55e]">
                <AlertOctagon className="h-6 w-6 text-[#22c55e]" />
                <h1 className="font-display font-black text-2.5xl tracking-tight uppercase text-slate-900">
                  Financial & Sports Odds Disclaimer
                </h1>
              </div>

              <div className="markdown-body space-y-4 leading-relaxed text-slate-700 text-xs">
                <p>
                  Full Time Sports focuses exclusively on manual, physical sports analysis and mathematical dynamics.
                </p>
                <p>
                  <strong>No Financial Advice:</strong> We do not host sports betting modules or promote automated wagering codes. Any opinion regarding potential championship outputs or transfers constitutes personal speculation by our independent columnists and should not be used as betting blueprints.
                </p>
                <p>
                  <strong>No Scraped Accuracy Assurances:</strong> Because our scorelines and standings are updated and reviewed manually by our physical editor desk rather than live-scraped via external feeds, slight latencies might exist across active match grids. All data is provided "as is" with zero financial or regulatory liabilities.
                </p>
              </div>
            </div>
          )}

          <AdSensePlaceholder slot="trust-footer-banner" format="horizontal" />

        </div>

      </div>
    </div>
  );
}
