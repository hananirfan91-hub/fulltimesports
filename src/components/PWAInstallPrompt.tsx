import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Check if iOS device (Safari does not support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Listen for Android / Chrome / Edge / Desktop PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Check if user previously dismissed banner in this session
      const dismissed = sessionStorage.getItem('tsr_pwa_dismissed');
      if (!dismissed) {
        // Show after 3.5s delay so user sees initial page comfortably
        setTimeout(() => setShowBanner(true), 3500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Global listener to open install prompt manually from anywhere
    const handleManualOpen = () => {
      if (isIOSDevice) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowBanner(true);
      }
    };

    window.addEventListener('tsr_open_install_prompt', handleManualOpen);

    // iOS prompt after initial visit delay
    if (isIOSDevice && !standaloneMode && !sessionStorage.getItem('tsr_pwa_dismissed')) {
      const iosTimer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      return () => clearTimeout(iosTimer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('tsr_open_install_prompt', handleManualOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers that support direct installation or manual guide
      alert("To install The Sports Room app, tap your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home Screen'.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      } else {
        setShowBanner(false);
        sessionStorage.setItem('tsr_pwa_dismissed', 'true');
      }
    } catch (err) {
      console.warn("PWA install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('tsr_pwa_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* 1. Subtle Floating Install Banner for Mobile & Desktop */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#022c22]/95 border border-[#22c55e]/40 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl shadow-black/60 text-white"
            id="pwa-install-banner"
          >
            <div className="flex items-center space-x-3">
              {/* Featured App Logo */}
              <div className="relative shrink-0">
                <img
                  src="/logo-preview.png"
                  alt="The Sports Room App Logo"
                  className="w-12 h-12 rounded-xl object-contain bg-[#01140f] p-1 border border-[#22c55e]/30 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#22c55e] text-slate-950 p-0.5 rounded-full ring-2 ring-[#022c22]">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-display font-black text-sm text-white tracking-tight leading-tight truncate">
                    The Sports Room
                  </h3>
                  <span className="bg-[#22c55e]/20 text-[#22c55e] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    Free App
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  Install for fast match scores &amp; daily sports quizzes
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={handleInstallClick}
                  className="bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-mono font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1 shadow-lg shadow-[#22c55e]/20 active:scale-95 cursor-pointer"
                  id="pwa-banner-install-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition hover:bg-slate-800/40 cursor-pointer"
                  aria-label="Close install banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Success Toast when App Installed */}
      <AnimatePresence>
        {installedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#22c55e] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 font-mono font-bold text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>The Sports Room Web App installed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. iOS Installation Guide Modal (for iPhone / iPad users) */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#022c22] border border-[#22c55e]/40 max-w-sm w-full rounded-3xl p-6 shadow-2xl text-white space-y-4"
              id="ios-install-modal"
            >
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="/logo-preview.png"
                    alt="The Sports Room App"
                    className="w-8 h-8 rounded-lg object-contain bg-[#01140f] p-0.5 border border-[#22c55e]/30"
                  />
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Install on iPhone / iPad</h3>
                    <p className="text-[10px] text-slate-400 font-mono">The Sports Room Web App</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start space-x-3 bg-[#01140f] p-3 rounded-xl border border-emerald-900/40">
                  <span className="bg-[#22c55e] text-slate-950 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center">
                      Tap the <Share2 className="w-3.5 h-3.5 text-[#22c55e] mx-1 inline" /> Share button
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Located in Safari's bottom toolbar on iPhone or top bar on iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-[#01140f] p-3 rounded-xl border border-emerald-900/40">
                  <span className="bg-[#22c55e] text-slate-950 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center">
                      Select <PlusSquare className="w-3.5 h-3.5 text-[#22c55e] mx-1 inline" /> "Add to Home Screen"
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Scroll down in the share options and tap Add.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full bg-[#22c55e] text-slate-950 font-mono font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition hover:bg-[#34d399] cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
