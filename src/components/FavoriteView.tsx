import React from 'react';
import { Bookmark } from 'lucide-react';
import { MovieItem } from '../types';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import { MovieCard } from './MovieCard';

interface FavoriteViewProps {
  savedMovies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onRemoveFavorite: (movieId: string, e: React.MouseEvent) => void;
  onGoHome: () => void;
  language?: SupportedLanguage;
}

export const FavoriteView: React.FC<FavoriteViewProps> = ({
  savedMovies,
  onSelectMovie,
  onRemoveFavorite,
  onGoHome,
  language = 'en'
}) => {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      {/* Empty State */}
      {savedMovies.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 shadow-xl">
            <Bookmark className="w-10 h-10 stroke-1" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-base font-bold text-white">{t('no_favorites')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('no_favorites_sub')}
            </p>
          </div>
          <button
            onClick={onGoHome}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 hover:opacity-95 transition-all"
          >
            {t('explore_movies')}
          </button>
        </div>
      ) : (
        /* Saved List - 1 movie per row matching home style */
        <div className="space-y-3.5">
          {savedMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onToggleLike={() => {}}
              onToggleFavorite={(id, e) => onRemoveFavorite(id, e!)}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
