import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { LANGUAGE_OPTIONS, SupportedLanguage } from '../utils/translations';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="language-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
      >
        {/* Modal Window in Safe Glass Shape */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-slate-950/85 border border-white/15 rounded-3xl p-4 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden"
        >
          {/* Subtle Top Glass Accent Line */}
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent pointer-events-none" />

          {/* Clean Language Grid (Only Language Names & Flags - No Extra Text) */}
          <div className="grid grid-cols-2 gap-2 max-h-[68vh] overflow-y-auto no-scrollbar py-1">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = selectedLanguage === lang.code;

              return (
                <button
                  key={lang.code}
                  id={`lang-btn-${lang.code}`}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-left active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500/25 to-pink-500/15 border-rose-500/50 text-white shadow-lg shadow-rose-500/15 ring-1 ring-rose-500/30'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-white/10 text-slate-200 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {lang.flag}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate text-white">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-[10px] text-slate-400 block truncate font-medium">
                          {lang.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/50">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
