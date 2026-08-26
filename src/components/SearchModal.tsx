import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, X, Clapperboard, Play, Loader2, Sparkles, Flame, History, Trash2 } from 'lucide-react';
import { MovieItem } from '../types';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import { searchTMDBMovies, mapTMDBToCategory } from '../utils/tmdbService';

const SEARCH_HISTORY_KEY = 'moviex_search_history';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  language?: SupportedLanguage;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  onSelectMovie,
  language = 'en'
}) => {
  const [query, setQuery] = useState('');
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);
  const [tmdbResults, setTmdbResults] = useState<MovieItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : ['তুফান', 'Jawan', 'Oppenheimer'];
    } catch {
      return ['তুফান', 'Jawan', 'Oppenheimer'];
    }
  });

  const t = (key: string) => getTranslation(language, key);

  const quickTags = [
    'ব্যাচেলর পয়েন্ট', 'তুফান', 'Oppenheimer', 'Dune', 
    'Jawan', 'Pushpa', 'Interstellar', 'Demon Slayer'
  ];

  // Save history helper
  const saveQueryToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save search history:', e);
      }
      return updated;
    });
  };

  // Remove single history item
  const removeHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== itemToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not update search history:', err);
      }
      return updated;
    });
  };

  // Clear all search history
  const clearAllHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) {
      console.warn('Could not clear search history:', err);
    }
  };

  const filteredLocalMovies = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return movies.filter(m => 
      (m.titleBn && m.titleBn.toLowerCase().includes(q)) ||
      (m.titleEn && m.titleEn.toLowerCase().includes(q)) ||
      (Array.isArray(m.genres) && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(q))) ||
      (Array.isArray(m.cast) && m.cast.some(c => typeof c === 'string' && c.toLowerCase().includes(q))) ||
      (m.director && typeof m.director === 'string' && m.director.toLowerCase().includes(q))
    );
  }, [query, movies]);

  // Live TMDB API Search debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setTmdbResults([]);
      setIsSearchingTMDB(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingTMDB(true);
      try {
        const rawResults = await searchTMDBMovies(query.trim());
        const localTitles = new Set(
          movies.map(m => ((m.titleEn || m.titleBn || '')).toLowerCase().trim())
        );

        // Filter and convert top 6 TMDB results
        const items: MovieItem[] = (rawResults || [])
          .filter(r => r.poster_path && !localTitles.has((r.title || '').toLowerCase().trim()))
          .slice(0, 6)
          .map(r => {
            const year = r.release_date ? parseInt(r.release_date.split('-')[0], 10) : 2024;
            const category = mapTMDBToCategory(r.original_language, r.genre_ids ? [] : []);
            return {
              id: `tmdb-live-${r.id}`,
              tmdbId: r.id,
              titleBn: r.title,
              titleEn: r.original_title || r.title,
              posterUrl: `https://image.tmdb.org/t/p/w780${r.poster_path}`,
              backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : `https://image.tmdb.org/t/p/w780${r.poster_path}`,
              category,
              genres: ['TMDB Cinema', category.toUpperCase()],
              releaseYear: year,
              duration: '2 Hours (FHD)',
              sizeMb: '2.4 GB',
              likesCount: Math.floor((r.vote_count || 100) / 2) + 200,
              userLiked: false,
              downloadsCount: (r.vote_count || 50) * 15,
              commentsCount: Math.floor((r.vote_count || 20) / 5),
              rating: Number((r.vote_average || 8.0).toFixed(1)),
              isNew: year >= 2024,
              isTrending: true,
              synopsisBn: r.overview || `Watch ${r.title} in Full HD print on Moviex.`,
              cast: ['Lead Actor', 'Featured Star'],
              director: 'Director Selection',
              targetLikes: { current: 300, target: 500 },
              streamLinks: [
                { quality: '1080p FHD HQ', size: '2.4 GB', serverName: 'Fast Google Cloud CDN', url: '#', type: 'direct' },
                { quality: '720p HD Dual Audio', size: '1.2 GB', serverName: 'Telegram SuperFast Server', url: '#', type: 'telegram' }
              ],
              comments: []
            };
          });

        setTmdbResults(items);
        saveQueryToHistory(query.trim());
      } catch (e) {
        console.error('TMDB Search error:', e);
      } finally {
        setIsSearchingTMDB(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, movies]);

  const allDisplayMovies = useMemo(() => {
    return [...filteredLocalMovies, ...tmdbResults];
  }, [filteredLocalMovies, tmdbResults]);

  const handleSelect = (movie: MovieItem) => {
    if (query.trim()) {
      saveQueryToHistory(query.trim());
    }
    onSelectMovie(movie);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      saveQueryToHistory(query.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
      {/* Top Search Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/80 border-b border-white/10 flex items-center gap-3">
        <button
          id="close-search-btn"
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Input container */}
        <div className="relative flex-1">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 p-[1px] opacity-70">
            <div className="w-full h-full bg-slate-900 rounded-2xl" />
          </div>
          <div className="relative flex items-center px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              id="search-main-input"
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search_placeholder') || 'Search movies, series, actors from TMDB...'}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
            {isSearchingTMDB && (
              <Loader2 className="w-4 h-4 text-rose-400 animate-spin mr-2" />
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-5 no-scrollbar">
        {/* 🌟 1. Search History Section (Recent Searches) */}
        {searchHistory.length > 0 && !query.trim() && (
          <div className="space-y-2.5 bg-slate-900/60 p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>সাম্প্রতিক সার্চ (Search History)</span>
              </div>
              <button
                onClick={clearAllHistory}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="সকল ইতিহাস মুছুন"
              >
                <Trash2 className="w-3 h-3" />
                <span>সব মুছুন (All Clear)</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {searchHistory.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  onClick={() => setQuery(item)}
                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 text-xs border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer select-none"
                >
                  <History className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
                  <span>{item}</span>
                  <button
                    onClick={(e) => removeHistoryItem(e, item)}
                    className="p-0.5 rounded-full hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors ml-0.5"
                    title="মুছুন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tag Pills */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">Popular Suggestions:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  saveQueryToHistory(tag);
                }}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs border border-white/10 hover:border-rose-500/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* State 1: Initial Empty / Clapper prompt */}
        {!query.trim() && searchHistory.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-800/60 border border-white/10 flex items-center justify-center text-indigo-400 shadow-xl">
              <Clapperboard className="w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Live TMDB Movie Search</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Type any movie or drama name to search across the official TMDB database in real-time.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Query entered, but NO MATCHES */}
        {query.trim() && !isSearchingTMDB && allDisplayMovies.length === 0 && (
          <div className="py-16 text-center space-y-3 animate-in fade-in">
            <div className="text-6xl">🥺</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No Results Found</h3>
              <p className="text-xs text-slate-400">
                Please try with different keywords or movie titles.
              </p>
            </div>
            <button
              onClick={() => setQuery('')}
              className="mt-2 px-4 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-rose-400 hover:bg-white/20"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* State 3: Matching results */}
        {query.trim() && allDisplayMovies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{allDisplayMovies.length} {t('items_count') || 'results found'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allDisplayMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleSelect(movie)}
                  className="flex gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all hover:bg-slate-800/80 group relative overflow-hidden"
                >
                  <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    <img 
                      src={movie.posterUrl || movie.backdropUrl} 
                      alt={movie.titleBn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {movie.isTrending && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600/90 text-white text-[9px] font-black tracking-wider flex items-center gap-0.5 shadow-md">
                        <Flame className="w-2.5 h-2.5 fill-white text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                        {movie.titleBn}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{movie.titleEn}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="text-amber-400 font-bold">⭐ {movie.rating}</span>
                      <span>•</span>
                      <span>{movie.releaseYear}</span>
                      <span>•</span>
                      <span className="text-rose-400 uppercase font-semibold text-[10px]">{movie.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
