import React from 'react';
import { motion } from 'motion/react';
import { Play, Bookmark, Flame, Star } from 'lucide-react';
import { MovieItem } from '../types';

interface MovieCardProps {
  movie: MovieItem;
  onSelect: (movie: MovieItem) => void;
  onToggleLike?: (movieId: string, e: React.MouseEvent) => void;
  onToggleFavorite: (movieId: string, e: React.MouseEvent) => void;
  isSaved: boolean;
  isPinned?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onToggleFavorite,
  isSaved,
  isPinned
}) => {
  const displayImage = movie.posterUrl || movie.backdropUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(movie)}
      className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/40 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
    >
      {/* Top Banner / Image Section - sleek 16:9 ratio */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
        <img
          src={displayImage}
          alt={movie.titleBn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (movie.backdropUrl && target.src !== movie.backdropUrl) {
              target.src = movie.backdropUrl;
            } else {
              target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />

        {/* Gradient Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Top Badges: Pinned, Trending, New, Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 📌 PROMINENT PINNED BADGE */}
            {isPinned && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-yellow-300 animate-pulse">
                <span>📌 পিন করা</span>
              </span>
            )}

            {/* 🔥 PROMINENT TRENDING BADGE */}
            {movie.isTrending && !isPinned && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400/40">
                <Flame className="w-3 h-3 fill-white text-white" />
                <span>TRENDING</span>
              </span>
            )}

            {movie.isNew && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                NEW
              </span>
            )}

            {movie.episodeBadge && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
                {movie.episodeBadge}
              </span>
            )}

            <span className="px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/10 flex items-center gap-0.5 shadow-md">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{movie.rating}</span>
            </span>
          </div>

          {/* Bookmark / Favorite quick button */}
          <button
            id={`bookmark-btn-${movie.id}`}
            onClick={(e) => onToggleFavorite(movie.id, e)}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto shadow-md ${
              isSaved 
                ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105' 
                : 'bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/10'
            }`}
            title="Save to Favorites"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
          <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge & Size on bottom right of image */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
          <div className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10 shadow-md">
            {movie.duration}
          </div>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.titleBn}
          </h3>
          <span className="text-[11px] font-bold text-rose-400 shrink-0">
            {movie.releaseYear}
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
          {movie.titleEn}
        </p>
      </div>
    </motion.div>
  );
};
