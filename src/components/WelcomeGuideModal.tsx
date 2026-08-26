import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clapperboard, Search, Music, Mail, Check, Heart } from 'lucide-react';
import { SupportedLanguage } from '../utils/translations';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({ isOpen, onClose, language = 'en' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-slate-900/95 border border-rose-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Top subtle decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400" />
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-1 mb-5">
            <div className="inline-flex p-3 rounded-2xl bg-rose-500/15 text-rose-400 mb-2 border border-rose-500/20">
              <Clapperboard className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Welcome to MovieLink Bot!
            </h2>
            <p className="text-xs text-rose-300 font-medium">
              আপনার প্রিয় মুভি ও নাটকের সেরা সংগ্রহশালা
            </p>
          </div>

          {/* Guidelines matching the video */}
          <div className="space-y-3.5 text-xs text-slate-200">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-base leading-none">🎬</span>
              <p className="leading-relaxed">
                এখানে আপনি হাজারো <strong>Movie, Web Series, Drama ও Anime</strong> দেখতে ও ডাউনলোড করতে পারবেন।
              </p>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-base leading-none">🔍</span>
              <p className="leading-relaxed">
                আপনার পছন্দের Movie সহজে খুঁজতে উপরের <strong>Search</strong> অপশনটি ব্যবহার করুন।
              </p>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-base leading-none">🎵</span>
              <p className="leading-relaxed">
                ভিডিওতে সাউন্ড বা অডিও ট্র্যাক সংক্রান্ত সমস্যা হলে, ভিডিওটি ডাউনলোড করে <strong>VLC Player</strong> অথবা <strong>MX Player</strong> দিয়ে প্লে করুন।
              </p>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-base leading-none">📩</span>
              <p className="leading-relaxed">
                কোনো Movie খুঁজে না পেলে <strong>Movie Request</strong> পাঠান, আমরা দ্রুত যোগ করার চেষ্টা করব।
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-1.5 my-4 text-xs font-semibold text-rose-400">
            <span>Happy Watching!</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </div>

          {/* OK Button matching video */}
          <button
            id="welcome-modal-ok-btn"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>OK</span>
            <Check className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
