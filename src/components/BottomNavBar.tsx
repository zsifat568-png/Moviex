import React, { useState, useEffect } from 'react';
import { Home, Bookmark, Calendar, Settings, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import { MovieItem } from '../types';

export type TabType = 'home' | 'favorite' | 'tools' | 'upcoming' | 'setting';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  savedCount: number;
  movies?: MovieItem[];
  language?: SupportedLanguage;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  movies = [],
  language = 'en'
}) => {
  const t = (key: string) => getTranslation(language, key);

  // Carousel state for the mini running Top Rated hero icon
  const topMovies = movies.length > 0 ? movies.slice(0, 7) : [];
  const [miniCarouselIdx, setMiniCarouselIdx] = useState(0);

  useEffect(() => {
    if (topMovies.length <= 1) return;
    const interval = setInterval(() => {
      setMiniCarouselIdx((prev) => (prev + 1) % topMovies.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [topMovies.length]);

  const currentMiniMovie = topMovies[miniCarouselIdx];

  const tabs = [
    { id: 'home' as TabType, label: t('nav_home') || 'Home', icon: Home },
    { id: 'favorite' as TabType, label: t('nav_favorite') || 'Favorites', icon: Bookmark, badge: savedCount },
    { id: 'tools' as TabType, label: 'Top Rated', isHeroIcon: true },
    { id: 'upcoming' as TabType, label: t('nav_upcoming') || 'Upcoming', icon: Calendar },
    { id: 'setting' as TabType, label: t('nav_setting') || 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 px-3 pointer-events-none flex justify-center">
      <nav className="w-full max-w-md pointer-events-auto bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] ring-1 ring-white/10 relative overflow-hidden">
        {/* Subtle glass top highlight */}
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        <div className="grid grid-cols-5 gap-1 items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            if (tab.isHeroIcon) {
              return (
                <button
                  key={tab.id}
                  id="nav-tab-toprated-btn"
                  onClick={() => onSelectTab(tab.id)}
                  className="flex flex-col items-center justify-center -mt-1.5 relative group"
                >
                  {/* Outer animated gradient ring */}
                  <div className={`w-11 h-11 rounded-2xl p-0.5 transition-transform duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 scale-105 shadow-[0_0_16px_rgba(244,63,94,0.6)]' 
                      : 'bg-gradient-to-tr from-slate-700 via-rose-500/30 to-slate-800 hover:scale-105 shadow-md'
                  }`}>
                    <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden relative flex items-center justify-center">
                      {/* Animated mini movie poster or Flame icon */}
                      {currentMiniMovie?.posterUrl ? (
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentMiniMovie.id}
                            src={currentMiniMovie.posterUrl}
                            alt=""
                            initial={{ opacity: 0, scale: 1.15 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className="w-full h-full object-cover"
                          />
                        </AnimatePresence>
                      ) : (
                        <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                  </div>
                </button>
              );
            }

            const Icon = tab.icon!;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}-btn`}
                onClick={() => onSelectTab(tab.id)}
                className={`py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-b from-rose-500/25 to-rose-600/10 rounded-2xl border border-rose-500/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-rose-400' : ''
                    }`} />

                    {/* Badge Counter (e.g. for Favorites) */}
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-4 text-[9px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-semibold tracking-tight transition-colors ${
                    isActive ? 'text-white font-bold' : 'text-slate-400'
                  }`}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
