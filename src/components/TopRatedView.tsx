import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MovieItem } from '../types';
import { MovieCard } from './MovieCard';
import { HeroCarousel } from './HeroCarousel';
import { Flame, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../utils/translations';

interface TopRatedViewProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onToggleLike: (movieId: string, e?: React.MouseEvent) => void;
  onToggleFavorite: (movieId: string, e?: React.MouseEvent) => void;
  savedMovieIds: string[];
  trendingHeroIds?: string[];
  language?: SupportedLanguage;
}

export const TopRatedView: React.FC<TopRatedViewProps> = ({
  movies,
  onSelectMovie,
  onToggleLike,
  onToggleFavorite,
  savedMovieIds,
  trendingHeroIds = [],
  language = 'en'
}) => {
  // Filter movies that are explicitly marked as Trending
  const trendingMovies = useMemo(() => movies.filter((m) => m.isTrending), [movies]);
  const displayMovies = trendingMovies.length > 0 ? trendingMovies : movies;

  // Instant sub-second batch pagination (20 initial, +10 on scroll)
  const INITIAL_BATCH = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [displayMovies.length]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(() => {
            setVisibleCount(prev => prev + 10);
          });
        }
      },
      { rootMargin: '350px 0px', threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [displayMovies.length]);

  const paginatedMovies = useMemo(() => {
    return displayMovies.slice(0, visibleCount);
  }, [displayMovies, visibleCount]);

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto animate-in fade-in duration-300">
      
      {/* 🌟 Trending Hero Carousel at the top */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>ট্রেন্ডিং হট ক্যারোসেল</span>
          </h3>
          <span className="text-[11px] font-bold text-amber-400/90 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Hot Picks</span>
          </span>
        </div>

        <HeroCarousel
          movies={displayMovies}
          onSelectMovie={onSelectMovie}
          heroMovieIds={trendingHeroIds.length > 0 ? trendingHeroIds : undefined}
          language={language}
        />
      </div>

      {/* Trending Header Info */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h4 className="text-xs font-bold text-slate-300">
          সর্বাধিক দেখা ট্রেন্ডিং মুভি ({displayMovies.length}টি)
        </h4>
        <span className="text-[10px] text-slate-400">
          রিয়েল-টাইম ট্রেন্ডিং
        </span>
      </div>

      {/* 1 Movie per row Feed with sub-second lazy pagination */}
      <div className="space-y-3.5">
        {paginatedMovies.length > 0 ? (
          paginatedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onToggleLike={onToggleLike}
              onToggleFavorite={onToggleFavorite}
              isSaved={(savedMovieIds || []).includes(movie.id)}
            />
          ))
        ) : (
          <div className="py-12 text-center space-y-2 bg-slate-900/40 rounded-3xl border border-white/5 p-6">
            <p className="text-xs text-slate-400">এখনো কোনো ট্রেন্ডিং মুভি নেই। নতুন মুভি যোগ করলে এখানে তালিকাভুক্ত হবে।</p>
          </div>
        )}

        {visibleCount < displayMovies.length && (
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>আরও ট্রেন্ডিং মুভি লোড হচ্ছে ({paginatedMovies.length}/{displayMovies.length})...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
