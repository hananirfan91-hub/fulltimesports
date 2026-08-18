import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Only show once per session or on standalone PWA launch
    const hasSeenSplash = sessionStorage.getItem('tsr_splash_shown');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (hasSeenSplash && !isStandalone) {
      setIsVisible(false);
      return;
    }

    // Animate progress smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 120);

    // Auto-dismiss after 1.1s for crisp, fast app launch experience
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('tsr_splash_shown', 'true');
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="app-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#01140f] text-white select-none overflow-hidden p-6 cursor-pointer"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 35%, rgba(34, 197, 94, 0.15), transparent 70%)',
          }}
        >
          {/* Top subtle badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="pt-6 flex items-center space-x-2 text-[11px] font-mono text-[#22c55e] font-semibold uppercase tracking-widest bg-[#022c22]/80 border border-[#22c55e]/20 px-3.5 py-1.5 rounded-full backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span>Official Web Application</span>
          </motion.div>

          {/* Central Logo & Brand Showcase */}
          <div className="flex flex-col items-center text-center space-y-5 max-w-xs mx-auto">
            {/* Logo with energetic glowing ring */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-[#22c55e] to-emerald-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
              
              <div className="relative bg-[#022c22] p-3 rounded-3xl border border-[#22c55e]/40 shadow-2xl shadow-[#22c55e]/20 flex items-center justify-center">
                <img
                  src="/logo-preview.png"
                  alt="The Sports Room App Featured Logo"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl drop-shadow-md"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="space-y-1"
            >
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase text-white">
                THE SPORTS <span className="text-[#22c55e]">ROOM</span>
              </h1>
              <p className="text-xs text-slate-300 font-mono tracking-wider uppercase font-medium">
                Live Sports • Telemetry • Daily Quiz
              </p>
            </motion.div>

            {/* Animated Progress Bar */}
            <div className="w-48 h-1.5 bg-[#022c22] rounded-full overflow-hidden border border-[#22c55e]/20 mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-[#22c55e] to-emerald-300 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>
          </div>

          {/* Bottom Security / Trust Mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="pb-4 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Fast, Secure & Offline Enabled PWA</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
