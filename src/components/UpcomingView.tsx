import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Play, RefreshCw, Loader2, Calendar, Film, Search, X, Flame, Clapperboard, Sparkles } from 'lucide-react';
import { UPCOMING_MOVIES } from '../data/moviesData';
import { fetchTMDBUpcomingMovies } from '../utils/tmdbService';
import { SupportedLanguage, getTranslation } from '../utils/translations';
import confetti from 'canvas-confetti';

export interface UpcomingMovieViewItem {
  id: string;
  tmdbId?: number;
  title: string;
  titleBn?: string;
  poster: string;
  backdrop?: string;
  country: string;
  language: string;
  releaseDate: string;
  rating: number;
  isReleased: boolean;
  overview?: string;
  genres?: string[];
  isTrending?: boolean;
}

interface UpcomingViewProps {
  language?: SupportedLanguage;
  onOpenSearch?: () => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({ language = 'en', onOpenSearch }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
  const [selectedTrailer, setSelectedTrailer] = useState<UpcomingMovieViewItem | null>(null);
  const [upcomingList, setUpcomingList] = useState<UpcomingMovieViewItem[]>(UPCOMING_MOVIES);
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: string) => getTranslation(language, key);

  // Fetch real upcoming movies across ALL categories from TMDB API on load
  const loadApiUpcoming = async () => {
    setIsLoading(true);
    try {
      const apiMovies = await fetchTMDBUpcomingMovies();
      const unreleasedApi = (apiMovies || []).filter(m => !m.isReleased);
      if (unreleasedApi.length > 0) {
        const combined: UpcomingMovieViewItem[] = [...unreleasedApi];
        for (const local of UPCOMING_MOVIES) {
          if (!local.isReleased && !combined.some(m => m.title.toLowerCase() === local.title.toLowerCase())) {
            combined.push(local);
          }
        }
        setUpcomingList(combined);
      } else {
        setUpcomingList(UPCOMING_MOVIES.filter(m => !m.isReleased));
      }
    } catch (e) {
      console.error('Failed to load TMDB upcoming:', e);
      setUpcomingList(UPCOMING_MOVIES.filter(m => !m.isReleased));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiUpcoming();
  }, []);

  const categoryFilters = [
    { id: 'All', label: '🎬 ' + t('cat_all'), matchKey: 'All' },
    { id: 'Hollywood', label: '🇺🇸 ' + (language === 'bn' ? 'হলিউড' : 'Hollywood'), matchKey: 'Hollywood' },
    { id: 'Bollywood', label: '🇮🇳 ' + (language === 'bn' ? 'বলিউড' : 'Bollywood'), matchKey: 'Bollywood' },
    { id: 'Dhallywood', label: '🇧🇩 ' + (language === 'bn' ? 'ঢালিউড/বাংলা' : 'Bengali/Dhallywood'), matchKey: 'Dhallywood' },
    { id: 'South', label: '💥 ' + (language === 'bn' ? 'সাউথ ইন্ডিয়ান' : 'South Indian'), matchKey: 'South' },
    { id: 'Japanese', label: '⚡ ' + (language === 'bn' ? 'অ্যানিমে/জাপান' : 'Anime/Japan'), matchKey: 'Japanese' }
  ];

  const filteredUpcoming = useMemo(() => {
    let list = upcomingList;

    // Filter by Category
    if (selectedCategory !== 'All') {
      list = list.filter(m => {
        const country = (m.country || '').toLowerCase();
        const cat = selectedCategory.toLowerCase();
        if (cat === 'all') return true;
        if (cat === 'dhallywood' || cat === 'bengali') {
          return country.includes('dhallywood') || country.includes('bengali') || (m.language && m.language.toLowerCase().includes('bn'));
        }
        if (cat === 'japanese' || cat === 'anime') {
          return country.includes('japanese') || country.includes('anime') || (m.language && m.language.toLowerCase().includes('ja'));
        }
        if (cat === 'bollywood') {
          return country.includes('bollywood') || (m.language && m.language.toLowerCase().includes('hi'));
        }
        if (cat === 'south') {
          return country.includes('south') || (m.language && ['te', 'ta', 'ml', 'kn'].includes(m.language.toLowerCase()));
        }
        if (cat === 'hollywood') {
          return country.includes('hollywood') || (m.language && m.language.toLowerCase().includes('en'));
        }
        return country.includes(cat);
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.titleBn && m.titleBn.toLowerCase().includes(q)) ||
        (m.country && m.country.toLowerCase().includes(q)) ||
        (m.language && m.language.toLowerCase().includes(q)) ||
        (Array.isArray(m.genres) && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(q))) ||
        (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    return list;
  }, [upcomingList, selectedCategory, searchQuery]);

  const toggleNotify = (id: string) => {
    if ((notifiedIds || []).includes(id)) {
      setNotifiedIds(prev => (prev || []).filter(item => item !== id));
    } else {
      setNotifiedIds(prev => [...(prev || []), id]);
      confetti({ particleCount: 35, spread: 60 });
    }
  };

  return (
    <div className="space-y-3.5 pb-24 max-w-xl mx-auto animate-in fade-in duration-300">
      {/* Search Bar for Upcoming Movies */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/30 via-purple-500/20 to-cyan-500/30 p-[1px] pointer-events-none" />
          <div className="relative flex items-center bg-slate-900/90 rounded-2xl px-3.5 py-2.5 border border-white/10 shadow-lg backdrop-blur-md">
            <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <input
              id="upcoming-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'আপকামিং মুভি খুঁজুন (নাম, হিরো, ভাষা)...' : 'Search upcoming releases, actors, genres...'}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-white/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 hidden sm:inline">
                {filteredUpcoming.length} টি মুভি
              </span>
            )}
          </div>
        </div>

        {/* Refresh TMDB Button */}
        <button
          onClick={loadApiUpcoming}
          disabled={isLoading}
          id="refresh-upcoming-btn"
          title="Refresh Upcoming TMDB List"
          className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Filter Chips Across All Movie Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categoryFilters.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedCategory(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategory === f.id
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center space-y-2 bg-slate-900/40 rounded-2xl border border-white/5 p-6">
          <Loader2 className="w-7 h-7 text-rose-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'টিএমডিবি এপিআই থেকে আপকামিং মুভি ফেচ হচ্ছে...' : 'Fetching upcoming movies from TMDB API...'}
          </p>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {filteredUpcoming.length > 0 ? (
            filteredUpcoming.map(movie => {
              const isNotified = (notifiedIds || []).includes(movie.id);

              return (
                <motion.div
                  layout
                  key={movie.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-rose-500/40 backdrop-blur-md shadow-lg space-y-2.5 flex flex-col justify-between group transition-all"
                >
                  <div className="flex gap-3 items-start">
                    <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 shadow-inner">
                      <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <button
                        onClick={() => setSelectedTrailer(movie)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                        title="Watch teaser"
                      >
                        <Play className="w-6 h-6 fill-white text-white drop-shadow" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-extrabold uppercase border border-cyan-500/30">
                          {movie.country}
                        </span>
                        <span>{movie.language}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
                        {movie.title}
                      </h3>
                      {movie.titleBn && movie.titleBn !== movie.title && (
                        <p className="text-xs text-slate-300 font-medium line-clamp-1">{movie.titleBn}</p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{movie.releaseDate}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <span>⭐ {movie.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Notification button */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span>⏳</span>
                      <span>{language === 'bn' ? 'আসন্ন রিলিজ' : 'Upcoming Premiere'}</span>
                    </span>

                    <button
                      id={`notify-btn-${movie.id}`}
                      onClick={() => toggleNotify(movie.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                        isNotified
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-white/10 hover:bg-white/20 text-slate-300'
                      }`}
                    >
                      <Bell className={`w-3.5 h-3.5 ${isNotified ? 'fill-slate-950' : ''}`} />
                      <span>{isNotified ? t('reminded') : t('remind_me')}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center space-y-2 bg-slate-900/50 rounded-2xl border border-white/5 p-6">
              <Film className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                {searchQuery 
                  ? `"${searchQuery}" এর সাথে কোনো আপকামিং মুভি পাওয়া যায়নি।` 
                  : 'এই ক্যাটাগরির আপকামিং মুভি খুব শীঘ্রই যুক্ত হবে।'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  সার্চ রিসেট করুন
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trailer Teaser Modal */}
      {selectedTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-sm line-clamp-1">{selectedTrailer.title} - Official Preview</h3>
              <button 
                onClick={() => setSelectedTrailer(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/10">
              <img 
                src={selectedTrailer.poster} 
                alt="" 
                className="w-full h-full object-cover opacity-40" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute text-center space-y-2 p-4">
                <Play className="w-10 h-10 text-rose-500 mx-auto fill-rose-500 animate-pulse" />
                <p className="text-xs font-semibold text-slate-100">{selectedTrailer.title}</p>
                <p className="text-[11px] text-slate-400">Official trailer premiering soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
