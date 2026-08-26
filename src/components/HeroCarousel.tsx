import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Flame, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MovieItem } from '../types';
import { SupportedLanguage, getTranslation } from '../utils/translations';

interface HeroCarouselProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  language?: SupportedLanguage;
  heroMovieIds?: string[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  movies, 
  onSelectMovie,
  language = 'en',
  heroMovieIds
}) => {
  const featured = React.useMemo(() => {
    if (heroMovieIds && heroMovieIds.length > 0) {
      const selected = movies.filter(m => heroMovieIds.includes(m.id));
      if (selected.length > 0) return selected;
    }
    return movies.slice(0, 6);
  }, [movies, heroMovieIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = (key: string) => getTranslation(language, key);

  useEffect(() => {
    if (isPaused || featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length, isPaused]);

  if (!featured.length) return null;
  const current = featured[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const activeImage = current.backdropUrl || current.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';

  return (
    <div 
      onClick={() => onSelectMovie(current)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 mb-3.5 cursor-pointer group select-none bg-slate-950 backdrop-blur-xl ring-1 ring-white/10"
    >
      {/* Top Subtle Glass Shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />

      {/* Main Image Stage with Cinematic Fade & Ken Burns Zoom */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-${current.id}-${currentIndex}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ 
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeImage}
              alt={current.titleBn}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (current.posterUrl && target.src !== current.posterUrl) {
                  target.src = current.posterUrl;
                } else {
                  target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Sophisticated Dark Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Top Badges: Compact Trending Badge and Rating */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {/* 🔥 TRENDING BADGE (Compact & Subtle) */}
          <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[9px] font-bold tracking-tight flex items-center gap-0.5 shadow-md shadow-rose-600/30 border border-rose-400/30">
            <Flame className="w-2.5 h-2.5 fill-white text-white" />
            <span>{language === 'bn' ? 'ট্রেন্ডিং' : 'TRENDING'}</span>
          </div>

          <div className="px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[9px] font-semibold border border-white/15 flex items-center gap-0.5 shadow-md">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{current.rating}</span>
          </div>

          {current.isNew && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[8.5px] font-black uppercase tracking-tight shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Manual Prev / Next Chevron Arrows (Visible on hover/touch) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-20 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-20 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Bottom Content Info Area */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 flex items-end justify-between gap-2.5 z-10">
          <div className="space-y-0.5 flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate">
              {current.titleBn}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              <span className="truncate max-w-[150px] sm:max-w-xs font-normal text-slate-300">{current.titleEn}</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{current.releaseYear}</span>
            </div>
          </div>

          {/* Glowing Play Action Button */}
          <button
            id={`hero-watch-btn-${current.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(current);
            }}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg shadow-rose-600/40 backdrop-blur-md shrink-0 transition-all border border-rose-400/40"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{t('watch_now')}</span>
          </button>
        </div>

        {/* Progress Bar Line on Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-20">
          <motion.div
            key={`progress-${currentIndex}-${isPaused}`}
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? '0%' : '100%' }}
            transition={{ duration: isPaused ? 0 : 5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-rose-500 to-amber-400"
          />
        </div>
      </div>
    </div>
  );
};
