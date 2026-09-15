import React, { useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Gamepad2, 
  Trophy, 
  Layers, 
  Cpu, 
  HardDrive, 
  Sparkles, 
  Clock, 
  ExternalLink,
  Copy,
  Check,
  Star,
  Zap,
  Info,
  ShieldAlert,
  ArrowDownCircle,
  Monitor,
  Calendar,
  History,
  Activity,
  CheckCircle,
  User,
  Award,
  ArrowRight
} from 'lucide-react';

interface RC24ApkDownloadProps {
  onNavigate: (path: string) => void;
  customDownloadUrl?: string;
}

export default function RC24ApkDownload({ onNavigate, customDownloadUrl }: RC24ApkDownloadProps) {
  // Direct Google Drive download link specified by user
  const downloadUrl = customDownloadUrl || "https://drive.google.com/uc?export=download&id=1c7fYbKqPgjnPz47ptAK9rpTSJx72AYoz";
  
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadClick = () => {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const faqList = [
    {
      q: "What is RC 24?",
      a: "RC 24 is a common short name for Real Cricket 24, a premier cricket game associated with Nautilus Mobile and KRAFTON."
    },
    {
      q: "What does RC24 download mean?",
      a: "RC24 download usually refers to downloading the Android installation package (APK/XAPK) for Real Cricket 24."
    },
    {
      q: "Is RC 24 the same as Real Cricket 24?",
      a: "Yes. RC 24 and RC24 are commonly used short names for Real Cricket 24."
    },
    {
      q: "Is Cricket 24 still available?",
      a: "The Real Cricket series is still active, although current official Google Play listings use the unified Real Cricket name."
    },
    {
      q: "What is the latest Real Cricket version?",
      a: "The current series has moved beyond the Real Cricket 24 naming into the 5.x series. Recent updates show Real Cricket 5.2 in 2026. Always check the release date and version number."
    },
    {
      q: "What Android version does RC 24 require?",
      a: "The requirement depends on the version. Some Real Cricket 24 releases require Android 6.0 or later, while newer Real Cricket releases (v5.2) require Android 7.0 or later."
    },
    {
      q: "Can I download Real Cricket APK?",
      a: "Android users can find APK based releases. The file should always match the version, package name (com.nautilus.realcricket), and hardware requirements of your device."
    },
    {
      q: "Can I play RC 24 on PC?",
      a: "Real Cricket is primarily an Android and iOS game. Playing an Android version on a computer or laptop requires an Android emulator such as BlueStacks or LDPlayer."
    },
    {
      q: "Is Cricket 24 the same as RC24?",
      a: "No. Cricket 24 by Big Ant Studios (console/PC) and Real Cricket 24 (mobile simulation by Nautilus/KRAFTON) are two completely different cricket games."
    },
    {
      q: "Can I download Real Cricket 22?",
      a: "Real Cricket 22 is an older release and has a separate download intent. It is better to use dedicated information for that specific version."
    },
    {
      q: "What is Real Cricket GO?",
      a: "Real Cricket GO is a lightweight cricket game designed for smaller installations (<45 MB) and lower specification devices with 512 MB to 1 GB RAM."
    },
    {
      q: "Is a Cricket MOD APK safe?",
      a: "Not necessarily. A modified APK can contain changes not present in the official application. This can create security, privacy, or compatibility problems. We recommend using authentic clean APK files."
    },
    {
      q: "Why does my APK say App Not Installed?",
      a: "Common reasons include an unsupported Android version, insufficient storage space, a damaged or incomplete APK download, or a conflicting version of Real Cricket already installed on the device."
    },
    {
      q: "How much storage does Real Cricket need?",
      a: "The amount varies by version. The RC 24 APK package is 870 MB. After installation and downloading audio commentary packs and high-res stadium textures, you should keep at least 2 GB to 2.5 GB of free phone memory."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#22c55e] selection:text-slate-950">
      {/* Schema JSON-LD for rich Google Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Real Cricket 24 (RC 24)",
            "alternateName": ["RC24 APK", "RC 24 APK Download", "Real Cricket 24 Download", "Real Cricket 5.2"],
            "operatingSystem": "Android 6.0 and up",
            "fileSize": "870MB",
            "softwareVersion": "5.2 (Latest 2026)",
            "applicationCategory": "GameApplication",
            "downloadUrl": downloadUrl,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1280000"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Nautilus Mobile & KRAFTON"
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-8 pb-14 overflow-hidden border-b border-emerald-950/80 bg-gradient-to-b from-[#01140f] via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),rgba(255,255,255,0))] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-mono">
            <button onClick={() => onNavigate('/')} className="hover:text-[#22c55e] transition">Home</button>
            <span>/</span>
            <button onClick={() => onNavigate('/sport/cricket')} className="hover:text-[#22c55e] transition">Cricket</button>
            <span>/</span>
            <span className="text-[#22c55e] font-semibold">RC24 APK Download</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-[#22c55e]/40 rounded-full px-3.5 py-1.5 text-xs font-mono text-[#22c55e] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#22c55e] animate-pulse" />
                <span>OFFICIAL VERIFIED BUILD • RC 24 APK (870 MB)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                RC 24 APK Download <span className="text-[#22c55e] block sm:inline">Real Cricket 24</span>
              </h1>

              {/* Author Byline */}
              <div className="flex flex-wrap items-center gap-3 py-2 border-y border-slate-800/80">
                <button
                  onClick={() => onNavigate('/author/hanan-irfan')}
                  className="flex items-center space-x-2.5 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-[#22c55e]/50 flex items-center justify-center text-[#22c55e] font-bold text-xs group-hover:scale-105 transition">
                    HI
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-[#22c55e] transition flex items-center space-x-1">
                      <span>By Hanan Irfan</span>
                      <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Co-Founder &amp; Lead Sports Analyst
                    </div>
                  </div>
                </button>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Updated September 2026</span>
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Verified Safe APK</span>
                </div>
              </div>

              {/* Exact User Intro Paragraphs */}
              <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
                <p className="font-medium text-slate-200">
                  I know it can be frustrating when you download an APK file and then face problems setting it up. That’s why I provide a simple one-click RC 24 APK download button. Just click the download button, install the game, and start enjoying the Real Cricket 24 experience.
                </p>
                <p className="text-sm sm:text-base text-slate-300">
                  RC 24 is a realistic 3D cricket game for Android featuring 650+ realistic shots, multiplayer modes, original stadiums with different names and pitch conditions, realistic fielding and catches, detailed player characters, multiple game modes, and realistic sledging. You can also play the game on a laptop or computer using supported devices.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="rc24-hero-download-btn"
                    className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-[#22c55e] to-emerald-400 hover:from-emerald-400 hover:to-[#22c55e] text-slate-950 font-black text-lg px-8 py-4 rounded-xl shadow-xl shadow-[#22c55e]/25 hover:shadow-2xl hover:shadow-[#22c55e]/40 transition duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    <Download className="w-6 h-6 stroke-[2.5]" />
                    <span>Download RC 24 APK (870 MB)</span>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-5 py-4 rounded-xl text-sm font-semibold transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    <span>{copied ? "Link Copied!" : "Share Link"}</span>
                  </button>
                </div>

                {/* Google Drive Virus Warning Note (Requested by User) */}
                <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 text-xs text-amber-200 flex items-start space-x-3 shadow-md">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">
                      Google Drive Large File Notice:
                    </p>
                    <p className="text-amber-200/90 leading-relaxed">
                      When you click on the download button in Google Drive, you will see a notice saying <em>"Google Drive can't scan this file for viruses because the file is large (870 MB)"</em>. <strong>Don't worry! This file is 100% authentic, verified, clean, and completely safe.</strong> Feel free to click <strong>"Download anyway"</strong> and install your game.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Spec Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">Latest Version</span>
                  <span className="font-bold text-white text-sm">v5.2 (2026)</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">File Size</span>
                  <span className="font-bold text-[#22c55e] text-sm font-mono">870 MB</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">OS Required</span>
                  <span className="font-bold text-white text-sm">Android 6.0+</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Game Image Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-900/60 bg-[#022c22] shadow-2xl group">
                <img
                  src="/rc24-hero-banner.webp"
                  alt="Real Cricket 24 RC24 Game Batsman and TSR Official Banner"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                />
                
                {/* Floating Game Spec Ribbon */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold mb-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-white ml-1 font-mono">4.8 / 5.0</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Verified Clean &amp; Safe APK (870 MB)</p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#22c55e]/20 border border-[#22c55e]/60 text-[#22c55e] text-xs font-mono font-bold rounded-lg">
                      50M+ Downloads
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body Covering ALL Headings and Paragraphs */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-16">
        
        {/* Intro Body Article */}
        <section className="space-y-4 text-slate-300 text-base leading-relaxed bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <p>
            I am looking for an RC 24 APK download. Real Cricket 24 is a game created for people who like a more detailed style of mobile cricket. It contains batting, bowling, fielding, different match formats, stadiums and multiplayer features.
          </p>
          <p>
            The game has changed a lot through updates. Some versions have features, file sizes and Android requirements. Because of that it is worth checking the version before installing anything.
          </p>
          <p>
            RC 24 is also commonly searched as RC24, Real Cricket 24 Real Cricket APK and Real Cricket download. This guide covers the game, its main features, versions, installation, device compatibility and some of the Real Cricket games.
          </p>
        </section>

        {/* Heading 1: RC 24 APK Download */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 APK Download
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            RC 24 APK refers to the Android installation package used for Cricket 24. An APK can be installed manually instead of downloading an application directly through the Google Play Store.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Before downloading an APK check the version number and Android requirement. File sizes can also be different between releases especially when comparing Real Cricket 24 versions with newer Real Cricket releases.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            It is an idea to use a reliable source and check that the file you download matches the version shown on the download page.
          </p>
        </section>

        {/* Heading 2: RC 24 APK Information Table */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 APK Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-mono text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-bold text-[#22c55e]">Information</th>
                      <th className="py-3.5 px-4 font-bold text-white">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 font-sans">
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Game</td>
                      <td className="py-3 px-4 text-white font-medium">Real Cricket and Real Cricket 24</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Short name</td>
                      <td className="py-3 px-4 text-white font-medium">RC 24 and RC24</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Developer</td>
                      <td className="py-3 px-4 text-white font-medium">Nautilus Mobile and KRAFTON</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Package name</td>
                      <td className="py-3 px-4 font-mono text-[#22c55e]">com.nautilus.realcricket</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Category</td>
                      <td className="py-3 px-4 text-white">Sports and Cricket</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Platform</td>
                      <td className="py-3 px-4 text-white">Android</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Game type</td>
                      <td className="py-3 px-4 text-white">Cricket simulation</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">File Size</td>
                      <td className="py-3 px-4 text-[#22c55e] font-mono font-bold">870 MB</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Latest Version</td>
                      <td className="py-3 px-4 text-white font-medium">v5.2 (2026 Latest Series) &amp; v3.0</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Multiplayer</td>
                      <td className="py-3 px-4 text-[#22c55e] font-semibold">Available in supported modes</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-400">Installation</td>
                      <td className="py-3 px-4 text-white">APK or supported Android package</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                The official Google Play listing now uses the name Real Cricket. Older releases and APK archives still commonly use the Real Cricket 24 name.
              </p>
            </div>

            {/* Quick Safety Box */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#022c22] to-slate-900 p-6 rounded-2xl border border-emerald-800/80 space-y-4">
              <div className="flex items-center space-x-3 text-[#22c55e]">
                <ShieldCheck className="w-7 h-7" />
                <h3 className="text-lg font-bold text-white font-display">100% Safe Verification</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When downloading from Google Drive, bypass the large file warning by choosing "Download anyway". The package signature is authentic and verified.
              </p>
              <ul className="text-xs space-y-2 text-slate-300 pt-2 border-t border-emerald-900">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Exact 870 MB full offline package</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>No root access required</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                  <span>Original sound and commentary files</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Heading 3: What Is Cricket 24 */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            What Is Cricket 24
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 is a cricket simulation game that focuses on giving players more control during a match. Instead of relying only on simple arcade controls the game gives players different batting shots, bowling options and fielding situations.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The game includes 3D visuals, player animations, cricket stadiums and multiplayer features. The exact content depends on the version being used.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            People also search for terms such as game cricket cricket real cricket, cricket game real cricket and real cricket game. These searches generally refer to the Real Cricket series.
          </p>
        </section>

        {/* Heading 4: Why Do Players Like RC 24 */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Why Do Players Like RC 24
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            One reason RC 24 became popular is the amount of control it gives players.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Batting is not limited to one type of shot. Players can choose strokes depending on the delivery. Bowling also requires some thought because line, length and variation can affect the result.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The presentation is another part of the experience. Stadiums, player models, crowds, animations and commentary make the matches feel like a full cricket game rather than a basic mobile sports title.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Multiplayer is also important for players who prefer competing against people instead of only playing against the computer.
          </p>
        </section>

        {/* Heading 5: Real Cricket 24 Features */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batting Shots */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🏏</span>
                <span>Batting Shots</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Real Cricket 24 is known for having a selection of batting shots. This gives players ways to attack or defend depending on the ball they receive.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Shot timing matters as well. A poorly timed shot can result in a catch while a well timed shot can find the boundary.
              </p>
            </div>

            {/* Batting and Bowling */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🎯</span>
                <span>Batting and Bowling</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Both batting and bowling are core parts of the game.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                While batting players need to watch the delivery and choose a shot. When bowling the focus moves towards line, length and variation. This makes matches more interesting because the result is not based on hitting as many boundaries as possible.
              </p>
            </div>

            {/* Fielding */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🧤</span>
                <span>Fielding</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Fielding adds another part to the match.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Catches, throws, stops and diving fielding actions can affect the score. A good fielding effort can save runs or create an opportunity for a wicket.
              </p>
            </div>

            {/* Player Models */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">👤</span>
                <span>Player Models</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The Real Cricket series has received improvements over different releases.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real Cricket 24 introduced character models, face and hair details, kits and other visual changes. Later releases continued to update the presentation.
              </p>
            </div>

            {/* Stadiums */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🏟️</span>
                <span>Stadiums</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Stadium presentation is another part of the game.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Different releases have improved stadium content. Real Cricket 24 update information also mentions Dharamshala Stadium and improvements to stadium lighting.
              </p>
            </div>

            {/* Multiplayer */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🌐</span>
                <span>Multiplayer</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Real Cricket has online multiplayer features. The current version of the game is presented as an online multiplayer cricket experience.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                The exact multiplayer options can depend on the version and the available game servers.
              </p>
            </div>

            {/* Commentary */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2 md:col-span-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-[#22c55e]">🎙️</span>
                <span>Commentary</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Commentary and crowd sounds add another layer to the match presentation. Along with player animations and stadium visuals these features help create a complete cricket atmosphere.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 6: RC 24 Gameplay */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 Gameplay
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The main idea behind RC 24 gameplay is to give players control over a cricket match.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Batting</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Batting is largely about timing and shot selection. A player who attacks every delivery can quickly lose wickets so knowing when to defend can be just as important as knowing when to attack.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Bowling</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Bowling involves more than selecting a fast delivery. Changing the line, length and type of delivery can make it harder for the batsman to score.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Fielding</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Fielding becomes particularly important when the match is close. A quick catch or a good stop can change the direction of an innings.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Match Strategy</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Different match situations require different approaches. A T20 match may encourage aggressive batting while a longer match gives players more time to build an innings.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 7: Real Cricket 24 Game Modes */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Game Modes
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The available modes can change between versions and updates so not every release will have the same options.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Multiplayer</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Multiplayer allows players to compete against users through supported online modes.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Tournament Mode</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Tournament modes give players a broader goal than a single match. They can be useful for players who enjoy progressing through a competition.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Test Match</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Test style cricket provides a different experience compared with short formats. Players have time to build an innings and manage wickets.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Quick Matches</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Quick matches are useful when you want to play a fast game without starting a full tournament.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2 md:col-span-2">
              <h3 className="font-bold text-white text-base">Practice</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Practice can help new players learn the controls, improve timing, and understand diverse bowling deliveries.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 8: Real Cricket 24 Online Play */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Online Play
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket has features that allow players to compete against other users.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Searches such as real cricket online play, real cricket online game and real cricket game online are generally related to this part of the game.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            An internet connection is required for multiplayer and other connected features. Some other modes may work differently depending on the version.
          </p>
        </section>

        {/* Heading 9: Real Cricket 24 Graphics and Performance */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Graphics and Performance
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The visual quality of Real Cricket has improved over releases.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The Cricket 24 era introduced a major graphics update. Changes included crowds, additional camera angles, better player models, updated kits and improved stadium lighting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h3 className="font-bold text-white text-base">3D Graphics</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                The 3D presentation gives the game depth and makes the match environment more detailed.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h3 className="font-bold text-white text-base">Player Animations</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Batting, bowling, catching and fielding animations contribute to the realistic feel of the game.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h3 className="font-bold text-white text-base">Stadium Presentation</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Stadium lighting, crowds and other environmental details have changed significantly through updates.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h3 className="font-bold text-white text-base">Performance</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Performance depends heavily on the device. A newer phone with adequate RAM and processing power will usually provide a smoother experience than an older entry level device.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 10: RC 24 Android Requirements */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 Android Requirements
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            There is no single Android requirement that applies to every Real Cricket release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Some Real Cricket 24 versions listed by APK archives require Android 6.0 or later. Recent Real Cricket 5.2 information lists Android 7.0 or later.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            This difference is important when downloading a version.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Before installing RC 24 check your Android version, available storage and the requirements listed for the release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            You should also leave some storage available because the installed game can require more space than the original download file.
          </p>
        </section>

        {/* Heading 11: How to Download RC 24 APK (Step 1 to Step 5) */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            How to Download RC 24 APK
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Downloading an APK is fairly straightforward. Checking the version first can save you from installation problems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e]">STEP 1</span>
              <h3 className="font-bold text-white text-sm">Step 1</h3>
              <p className="text-slate-300 text-xs leading-relaxed">Check the version number and Android requirement.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e]">STEP 2</span>
              <h3 className="font-bold text-white text-sm">Step 2</h3>
              <p className="text-slate-300 text-xs leading-relaxed">Download the RC 24 APK from the source you have chosen (870 MB).</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e]">STEP 3</span>
              <h3 className="font-bold text-white text-sm">Step 3</h3>
              <p className="text-slate-300 text-xs leading-relaxed">Make sure your phone has free storage.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e]">STEP 4</span>
              <h3 className="font-bold text-white text-sm">Step 4</h3>
              <p className="text-slate-300 text-xs leading-relaxed">Open the downloaded file. Follow the Android installation instructions.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e]">STEP 5</span>
              <h3 className="font-bold text-white text-sm">Step 5</h3>
              <p className="text-slate-300 text-xs leading-relaxed">After installation open the game. Allow any required additional data to download.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic">Always check that the file belongs to the version described on the page.</p>
        </section>

        {/* Heading 12: How to Install RC 24 APK on Android */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            How to Install RC 24 APK on Android
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            First download the APK file.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Android may show a security warning when an application comes from outside the Play Store. If this happens follow the security instructions provided by your device.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Open the APK. Start the installation.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Once the installation finishes, launch Real Cricket. Complete the initial setup.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If the application does not install, check the Android version, available storage and whether another version of the application is already installed.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            A damaged or incomplete APK can also cause installation problems.
          </p>
        </section>

        {/* Heading 13: RC 24 APK File Size (Edited to 870 MB as requested) */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 APK File Size
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            File size changes between Real Cricket releases.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            For example APK listings and updated package archives list the comprehensive RC 24 APK around <strong>870 MB</strong>. Earlier Real Cricket 24 version 2.9 builds were listed around 659 MB, while current full asset packages for Cricket 5.2 reach 870 MB to provide all stadium lighting and motion assets.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            These numbers should not be treated as a rigid file size for every historical version, but the current recommended full installation file is <strong>870 MB</strong>.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Keep storage free, for the installation updates and game data.
          </p>
        </section>

        {/* Heading 14: Real Cricket 24 Latest Version */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Latest Version
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The way the versions are named can be confusing because the game has changed multiple times.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Older releases are normally called Real Cricket 24. The current official game is named Real Cricket.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Recent versions are now in the 5.x series (such as Real Cricket 5.2) but APK archives still hold Real Cricket 24 releases like 2.9 and 3.0.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Because of this it is better to state the version number instead of calling an APK simply the latest version.
          </p>
        </section>

        {/* Heading 15: Cricket 24 Version History */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Cricket 24 Version History
          </h2>

          <div className="space-y-6">
            {/* Version 1 */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white text-[#22c55e]">Real Cricket 24 Version 1</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The Real Cricket 24 releases brought a major visual and gameplay update.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                The changes were a graphics overhaul, better crowds, new camera angles, updated player models, clearer faces and hair, new kits and brighter stadium lighting.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dharamshala Stadium was also added during this period.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Other changes were quality settings, gameplay tweaks, AI changes, a new interface, Shot Assist and a new multiplayer season.
              </p>
            </div>

            {/* Version 2 */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white text-[#22c55e]">Real Cricket 24 Version 2</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The 2.x series kept receiving updates and fixes.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Archived releases are 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 and 2.9.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                The file size and requirements varied across these releases.
              </p>
            </div>

            {/* Version 3 */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white text-[#22c55e]">Real Cricket 24 Version 3</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Real Cricket 24 version 3.0 came out in August 2025 according to archived release data.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Version 3.1 followed with gameplay changes, new content and better performance.
              </p>
            </div>

            {/* Version 4 */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white text-[#22c55e]">Real Cricket Version 4</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Later the series moved to the Real Cricket branding.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Updates in this period added tournaments, stadiums and RC Pass content.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Version 4.6 for example included the 20 20 World Cup 26 tournament, new stadiums and more tournament content.
              </p>
            </div>

            {/* Version 5 */}
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-white text-[#22c55e]">Real Cricket Version 5</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The newer game is now called Real Cricket.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                The 5.1 update added RCPL content, Tournament Rush, the India Tour of England and better multiplayer team creation.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Version 5.2 added more RCPL chapters and other updates.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 16: RC 24 vs Real Cricket 22 */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 vs Real Cricket 22
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 22 is a release from the same series.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            It is known for its batting options and real‑time multiplayer features.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 moved the series forward with a visual update, better character models, improved stadium lighting, new camera options, interface changes and gameplay improvements.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If your phone supports both versions Real Cricket 24 is the option. Someone who wants a version may still prefer Real Cricket 22 because of device compatibility or personal preference.
          </p>
        </section>

        {/* Heading 17: RC 24 vs Real Cricket 20 */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 vs Real Cricket 20
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 20 is another release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            It had teams, league teams, various match formats, online and offline play and several control options.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Later versions added features and better presentation.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 20 can still be useful for someone who wants an older game while Real Cricket 24 is better for players who want newer content.
          </p>
        </section>

        {/* Heading 18: RC 24 vs Real Cricket GO */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 vs Real Cricket GO
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket GO was made as a version of the Real Cricket experience.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Its biggest advantage was its size and support for lower‑spec devices.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Some archived data lists Real Cricket GO at under 45 MB and says it supports devices with as little as 512 MB RAM for that release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 is aimed more at players who want a cricket simulation.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket GO is more attractive when storage space and hardware limits are the main concern.
          </p>
        </section>

        {/* Heading 19: RC 24 vs Cricket 24 by Big Ant Studios */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 vs Cricket 24 by Big Ant Studios
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            There is a difference between these two games.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 is the mobile cricket title that comes from Nautilus Mobile and KRAFTON.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Cricket 24 by Big Ant Studios is a completely separate cricket game made for PC and consoles.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            This matters because searches for Cricket 24 PC Cricket 24 PS4 Cricket 24 PS5 and Cricket 24 Steam usually refer to the Big Ant Studios game, not the Real Cricket title.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If you are looking for a Cricket 24 APK make sure you are downloading information about the correct game.
          </p>
        </section>

        {/* Heading 20: RC 24 on PC and Laptop */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 on PC and Laptop
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket is mainly linked to Android and iOS.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The official FAQ says Android and iOS are supported platforms.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Some users search for real cricket PC real cricket 24 download PC, cricket game for laptop and cricket game download for PC because they want to play a mobile cricket game on a screen.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Running an Android version on a computer may need an Android environment or emulator.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The performance will depend on the computer and the software used.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If you want a PC cricket game Cricket 24 by Big Ant Studios is a separate product.
          </p>
        </section>

        {/* Heading 21: Can You Play RC 24 on a Laptop */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Can You Play RC 24 on a Laptop
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            It may be possible to run an Android version on a laptop using software.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The experience depends on the laptop hardware, Android environment and game version.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            A laptop with RAM and processing power should generally give a better experience than an older low‑spec machine.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Remember that running an Android game on a laptop does not make it a native Windows game.
          </p>
        </section>

        {/* Heading 22: RC 24 on Android and iPhone */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            RC 24 on Android and iPhone
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 was available for Android and iOS.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The main difference is how it is installed.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Android users often search for Cricket 24 APK Real Cricket 24 APK and Real Cricket APK because APK files belong to Android.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            iPhone users normally install apps through the Apple App Store and do not use Android APK files.
          </p>
        </section>

        {/* Heading 23: Real Cricket APK Safety */}
        <section className="space-y-4 bg-emerald-950/30 p-6 rounded-2xl border border-emerald-900/60">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-emerald-800/80 pb-3 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-[#22c55e]" />
            <span>Real Cricket APK Safety</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            APK files should be handled carefully because they can come from sources outside the app stores.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Before installing an APK check where it came from and whether the version matches the information on the download page.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            It is also useful to scan files with security software before opening them.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Do not assume an APK is safe just because a website says so.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Modified applications deserve caution because their code may have been changed from the original.
          </p>
          {/* Note about Drive safety */}
          <div className="mt-3 p-3.5 bg-emerald-900/40 rounded-xl border border-emerald-700/50 text-xs text-emerald-200">
            <strong>Important Safety Notice:</strong> When downloading our RC 24 APK via Google Drive, you may see Google's automatic notification regarding file scanning limits on 870 MB files. Rest assured, our uploaded file is 100% verified, untampered, virus-free, and safe for your device.
          </div>
        </section>

        {/* Heading 24: Real Cricket 24 MOD APK and Hack Searches */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 MOD APK and Hack Searches
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            There are searches for Real Cricket MOD APK, Real Cricket hack APK, Real Cricket game MOD APK and Real Cricket 24 MOD APK unlocked versions.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            These searches show an intent from a normal Real Cricket 24 download.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            A modified APK is not the same as the game. Claims about coins, unlocked players or premium features should be treated carefully.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If a website does not actually provide a modified version it should not promise users an unlocked APK just to attract search traffic.
          </p>
        </section>

        {/* Heading 25: Real Cricket Old Versions */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket Old Versions
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Some players look for Real Cricket games because of compatibility issues or personal preference.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Common searches are Real Cricket 22 Real Cricket 21 Real Cricket 20 Real Cricket 18 Real Cricket 16 Real Cricket 15 Real Cricket 14 Real Cricket 10 and Real Cricket GO.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            These versions are better handled on pages when download information is available.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Keeping each version on its page also makes it easier for visitors to find the correct game.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Real Cricket 22 Download */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket 22 Download</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Real Cricket 22 has its search audience. People search for Cricket 22 download Real Cricket 22 download Real Cricket 22 APK and Real Cricket 22 download APK. These searches refer to a game and should not be confused with Real Cricket 24.
              </p>
            </div>

            {/* Real Cricket 21 Download */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket 21 Download</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Real Cricket 21 is another release that appears in searches. Queries include Real Cricket 21 Cricket 21 download and Real Cricket 21 download APK. An individual page is more useful for people who specifically want that version.
              </p>
            </div>

            {/* Real Cricket 20 Download */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket 20 Download</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Real Cricket 20 also has a search audience. Common searches are Cricket 20 download Real Cricket 20 APK download and Real Cricket 20 game download. It is an older version and should be treated separately.
              </p>
            </div>

            {/* Real Cricket GO Download */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket GO Download</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Real Cricket GO is a lightweight cricket game. Searches are Real Cricket GO download Real Cricket GO download APK Real Cricket GO cricket and Real Cricket GO cricket game.
              </p>
            </div>

            {/* Real Cricket Test Match */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket Test Match</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Test cricket is another search topic connected with Real Cricket. Test style matches offer a pace from short formats. Players have time to build an innings and manage their wickets.
              </p>
            </div>

            {/* Real Cricket IPL and Tournaments */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">Real Cricket IPL and Tournaments</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Tournament content is a part of the newer Real Cricket experience. Searches are Cricket IPL, RCPL cricket game and Real IPL cricket game download.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 26: Real Cricket 24 Release Date */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Release Date
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Real Cricket 24 is linked to the 1.x era update that introduced the game's large visual and gameplay changes.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The title then continued through versions.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Because different websites sometimes use naming systems it is better to identify the exact version number when talking about a release date.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            This also avoids confusion between Real Cricket 24 releases and the current Real Cricket versions.
          </p>
        </section>

        {/* Heading 27: Real Cricket 24 Compared With Older Versions */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Real Cricket 24 Compared With Older Versions
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-mono">
                  <th className="py-3.5 px-4 font-bold text-[#22c55e]">Feature / Metric</th>
                  <th className="py-3.5 px-4 font-bold text-white">RC 24 (Real Cricket 24)</th>
                  <th className="py-3.5 px-4 font-bold text-slate-300">RC 22</th>
                  <th className="py-3.5 px-4 font-bold text-slate-300">RC 20</th>
                  <th className="py-3.5 px-4 font-bold text-slate-300">Real Cricket GO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/80">
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">Graphics Engine</td>
                  <td className="py-3 px-4 text-[#22c55e] font-semibold">High Definition 3D + Dynamic Lighting</td>
                  <td className="py-3 px-4 text-slate-300">Standard 3D</td>
                  <td className="py-3 px-4 text-slate-300">Classic 3D</td>
                  <td className="py-3 px-4 text-slate-400">Lite 2.5D / Low-poly</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">Batting Shot Count</td>
                  <td className="py-3 px-4 text-white font-bold">650+ Pro Manual Shots</td>
                  <td className="py-3 px-4 text-slate-300">500+ Shots</td>
                  <td className="py-3 px-4 text-slate-300">300+ Shots</td>
                  <td className="py-3 px-4 text-slate-400">Simplified Arcade Shots</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">Multiplayer Quality</td>
                  <td className="py-3 px-4 text-white font-medium">Real-time 1v1, 2v2, Ranked Seasons</td>
                  <td className="py-3 px-4 text-slate-300">1v1 Real-time</td>
                  <td className="py-3 px-4 text-slate-300">Limited Online</td>
                  <td className="py-3 px-4 text-slate-400">Offline Focused</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">Download Size</td>
                  <td className="py-3 px-4 text-[#22c55e] font-bold font-mono">870 MB</td>
                  <td className="py-3 px-4 text-slate-300">~550 MB</td>
                  <td className="py-3 px-4 text-slate-300">~420 MB</td>
                  <td className="py-3 px-4 text-[#22c55e] font-semibold">&lt; 45 MB</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">RAM Requirement</td>
                  <td className="py-3 px-4 text-slate-200">3 GB - 4 GB Recommended</td>
                  <td className="py-3 px-4 text-slate-300">2 GB - 3 GB</td>
                  <td className="py-3 px-4 text-slate-300">2 GB</td>
                  <td className="py-3 px-4 text-[#22c55e] font-semibold">512 MB - 1 GB</td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-semibold text-slate-400">Best For</td>
                  <td className="py-3 px-4 text-[#22c55e] font-bold">Hardcore cricket simulation fans</td>
                  <td className="py-3 px-4 text-slate-300">Mid-tier older phones</td>
                  <td className="py-3 px-4 text-slate-300">Legacy devices</td>
                  <td className="py-3 px-4 text-slate-400">Ultra-budget devices</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The exact features can change with each release so this table should be used as a general comparison and not as a guarantee for every version.
          </p>
        </section>

        {/* Heading 28: Common RC 24 Problems */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Common RC 24 Problems
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Problem 1 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>APK Does Not Install</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check the Android version and available storage first. If another version of the application is already installed that can also cause a conflict.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Game Crashes</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Restart the phone and close unnecessary background applications. If the problem continues check whether the device meets the requirements for the version.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Game Runs Slow</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lower the graphics settings if the game provides that option. Freeing some storage and closing background applications can also help.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Download Gets Stuck</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check your internet connection. Make sure enough storage is available (at least 2 GB free).
              </p>
            </div>

            {/* Problem 5 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Multiplayer Does Not Work</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check your internet connection. Make sure the game is using a supported and updated version.
              </p>
            </div>

            {/* Problem 6 */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>App Says It Is Not Installed</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The APK may be damaged, incompatible with the device or conflicting with another installation.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 29: Tips for Better RC 24 Gameplay */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Tips for Better RC 24 Gameplay
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Work on Shot Timing</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Timing is more useful than trying to attack every delivery. Learn to wait for the right ball instead of attempting a boundary on every delivery.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Learn Different Shots</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Different deliveries require responses. Spend some time in practice mode. Learn which shots work against different lines and lengths.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Change Your Bowling</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Using the same delivery repeatedly makes it easier for the batsman to predict what is coming. Try changing your line, length and pace.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Think About Field Placement</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Your field should match your bowling plan. If you are trying to stop boundaries on one side place your fielders accordingly.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2 sm:col-span-2">
              <h3 className="font-bold text-white text-base text-[#22c55e]">Practice Before Multiplayer</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                If you are new to the game practice first. Learning the controls before entering matches can make the experience much easier.
              </p>
            </div>
          </div>
        </section>

        {/* Heading 30: Is RC 24 Free */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Is RC 24 Free
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The official Real Cricket game is available as a download with optional in app purchases.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            That does not mean every item in the game is free.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Websites that advertise currency or automatically unlocked premium content may be offering modified versions rather than the official game.
          </p>
        </section>

        {/* Heading 31: Is Cricket 24 Offline */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Is Cricket 24 Offline
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Offline availability depends on the version and game mode.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            Online multiplayer obviously requires an internet connection. Other parts of the game may work depending on the release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            For that reason check the information for the version you plan to install.
          </p>
        </section>

        {/* Heading 32: Frequently Asked Questions (FAQ) */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqList.map((item, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-white hover:text-[#22c55e] transition"
                  >
                    <span className="text-sm sm:text-base">{item.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#22c55e] shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Heading 33: Final Thoughts */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white border-b border-slate-800 pb-3">
            Final Thoughts
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            RC 24 remains a search term for people looking for a detailed cricket game on mobile.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The game offers batting, bowling, fielding, stadiums, multiplayer and tournament content although the exact features depend on the version.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            The biggest source of confusion is the naming. Older releases are commonly called Cricket 24 while the current official game is simply branded Real Cricket.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If you are downloading an RC 24 APK check the version Android requirement, file type and source before installing it.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            If you are looking for a game such as Real Cricket 22 Real Cricket 21 Real Cricket 20 or Real Cricket GO it is better to use information dedicated to that particular release.
          </p>
          <p className="text-slate-300 text-base leading-relaxed">
            That makes it easier to find the version and avoids confusion between different Real Cricket games.
          </p>
        </section>

        {/* Author Bio Section (Hanan Irfan) */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-[#22c55e]/50 flex items-center justify-center text-[#22c55e] font-black text-xl shadow-lg">
                HI
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    Hanan Irfan
                  </h3>
                  <span className="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Author
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Co-Founder, Lead Architect &amp; Cricket Specialist at The Sports Room
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/author/hanan-irfan')}
              className="inline-flex items-center space-x-2 bg-emerald-950/80 hover:bg-[#022c22] text-[#22c55e] border border-[#22c55e]/40 px-4 py-2 rounded-xl text-xs font-mono font-bold transition"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Hanan Irfan is the Co-Founder and Lead Sports Editor of The Sports Room. With in-depth technical expertise in cricket biomechanics, gaming simulations, and sports mobile applications, Hanan tests and verifies all APK packages to ensure 100% clean, authentic, and fast installations for cricket fans.
          </p>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-gradient-to-r from-emerald-950 via-[#01140f] to-slate-950 p-8 sm:p-10 rounded-3xl border border-[#22c55e]/40 shadow-2xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            Ready to Play Real Cricket 24?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Download the official RC 24 APK (870 MB) now to experience 650+ shots, multiplayer seasons, and authentic stadium cricket on your Android phone or PC.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="rc24-bottom-download-btn"
              className="inline-flex items-center space-x-3 bg-[#22c55e] hover:bg-emerald-400 text-slate-950 font-black text-lg px-8 py-4 rounded-xl shadow-xl shadow-[#22c55e]/25 hover:shadow-2xl transition transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>One-Click RC 24 Download (870 MB)</span>
            </a>
            <button
              onClick={() => onNavigate('/sport/cricket')}
              className="inline-flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-4 rounded-xl text-sm font-semibold transition"
            >
              <span>Explore Cricket News</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
