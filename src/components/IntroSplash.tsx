import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clapperboard, Sparkles, Film, Play } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'complete'>('logo');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('complete');
      onComplete();
    }, 2400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage === 'logo' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 text-white overflow-hidden px-4"
        >
          {/* Ambient Glows */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-rose-600/30 via-indigo-600/20 to-cyan-500/30 blur-3xl pointer-events-none animate-pulse-glow" />

          {/* Glowing Animated Icon matching the video */}
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative mb-6"
          >
            {/* Outer neon pulse rings */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400 opacity-75 blur-lg animate-pulse" />
            
            {/* Icon Card Frame */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center p-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-transparent to-cyan-500/20" />
              
              {/* Animated Clapboard */}
              <div className="relative flex items-center justify-center text-rose-400">
                <Clapperboard className="w-14 h-14 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                <div className="absolute -top-1 -right-1 text-cyan-400">
                  <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              {/* Cute smiley/bot eyes underneath like video */}
              <div className="flex gap-2 mt-2 items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"></span>
                <span className="w-3 h-1 rounded-full bg-rose-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"></span>
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-1"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-white via-rose-200 to-rose-400 bg-clip-text text-transparent">
              MOVI<span className="text-rose-500">EE</span> LINK
            </h1>
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.25em] text-slate-400 uppercase">
              <span>OFFICIAL</span>
              <span className="w-1 h-1 rounded-full bg-rose-500" />
              <span className="text-rose-400">PRO STREAM</span>
            </div>
          </motion.div>

          {/* Quick Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => {
              setStage('complete');
              onComplete();
            }}
            className="mt-8 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-300 backdrop-blur-sm border border-white/10 transition-all"
          >
            Skip Intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
