import React from 'react';
import { Search, Clapperboard } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/translations';

interface TopHeaderProps {
  onOpenSearch: () => void;
  onOpenWelcome?: () => void;
  totalMovies: number;
  language?: SupportedLanguage;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ 
  onOpenSearch, 
  language = 'en' 
}) => {
  const t = (key: string) => getTranslation(language, key);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div className="flex items-center text-lg sm:text-xl font-black tracking-tight text-white">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Movie</span>
            <span className="px-1.5 py-0.5 rounded-lg bg-rose-500 text-white text-xs uppercase font-black shadow-[0_0_14px_rgba(244,63,94,0.6)] ml-0.5">
              X
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            id="open-search-header-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white transition-all shadow-inner group cursor-pointer active:scale-95"
          >
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium hidden xs:inline text-slate-300">
              {language === 'bn' ? 'খুঁজুন...' : language === 'en' ? 'Search...' : t('nav_home')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

