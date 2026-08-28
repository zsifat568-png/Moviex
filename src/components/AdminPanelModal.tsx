import React, { useState } from 'react';
import { 
  X, UploadCloud, Image as ImageIcon, Sparkles, 
  Trash2, Plus, Check, Sliders, Edit3, Search,
  Flame, Zap, ArrowLeft, Shield, ChevronRight,
  Film, ExternalLink, CheckCircle2, Star, Eye, Pin, PinOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MovieItem, MovieActor } from '../types';
import { 
  searchTMDBMovies, 
  getTMDBMovieDetails, 
  mapTMDBToCategory, 
  getActorAvatarFallback 
} from '../utils/tmdbService';
import { extractTelegramMessageId } from '../utils/telegramService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: MovieItem[];
  onAddMovie: (movie: MovieItem) => void;
  onUpdateMovie: (movie: MovieItem) => void;
  onDeleteMovie: (movieId: string) => void;
  onUpdateHeroCarousel: (movieIds: string[]) => void;
  onUpdateTrendingHeroCarousel?: (movieIds: string[]) => void;
  onUpdatePinnedMovies?: (movieIds: string[]) => void;
  onToggleTrending?: (movieId: string) => void;
  onUpdateCategories: (categories: { id: string; label: string; icon?: string }[]) => void;
  categories: { id: string; label: string; icon?: string }[];
  trendingHeroIds?: string[];
  pinnedMovieIds?: string[];
}

type AdminPage = 'dashboard' | 'upload_movie' | 'customize_hero' | 'customize_trending' | 'customize_pinned' | 'manage_movies';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  movies,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
  onUpdateHeroCarousel,
  onUpdateTrendingHeroCarousel,
  onUpdatePinnedMovies,
  trendingHeroIds = [],
  pinnedMovieIds = []
}) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  // 1. Movie Upload & Auto-fetch State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Movie Fields
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime'>('bengali');
  const [releaseYear, setReleaseYear] = useState('2024');
  const [duration, setDuration] = useState('2h 15m');
  const [rating, setRating] = useState('8.5');
  const [director, setDirector] = useState('Famous Director');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [additionalPosters, setAdditionalPosters] = useState<string[]>([]);
  const [newPosterInput, setNewPosterInput] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [overview, setOverview] = useState('');
  const [castNames, setCastNames] = useState<string[]>([]);
  const [actorsList, setActorsList] = useState<MovieActor[]>([]);
  const [isTrending, setIsTrending] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // 2. Manage / Edit search state
  const [manageSearch, setManageSearch] = useState('');
  const [trendingSearch, setTrendingSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 3. Home Hero Carousel Selection
  const [selectedHomeHeroIds, setSelectedHomeHeroIds] = useState<string[]>(() => {
    return movies.slice(0, 6).map(m => m.id);
  });

  // 4. Trending Hero Carousel Selection
  const [selectedTrendingHeroIds, setSelectedTrendingHeroIds] = useState<string[]>(() => {
    if (trendingHeroIds && trendingHeroIds.length > 0) return trendingHeroIds;
    return movies.filter(m => m.isTrending).slice(0, 6).map(m => m.id);
  });

  // 5. Pinned Movies Selection
  const [selectedPinnedMovieIds, setSelectedPinnedMovieIds] = useState<string[]>(() => {
    return pinnedMovieIds;
  });
  const [pinnedSearch, setPinnedSearch] = useState('');

  if (!isOpen) return null;

  // TMDB Auto-Fetch Search
  const handleSearchTMDB = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingTMDB(true);
    try {
      const res = await searchTMDBMovies(searchQuery.trim());
      const mapped = res.map(m => ({
        id: m.id,
        title: m.title,
        original_title: m.original_title,
        overview: m.overview,
        release_date: m.release_date,
        vote_average: m.vote_average,
        original_language: m.original_language,
        genre_ids: m.genre_ids,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : ''
      }));
      setTmdbResults(mapped);
    } catch (e) {
      console.error('TMDB Search error:', e);
    } finally {
      setIsSearchingTMDB(false);
    }
  };

  // Full Details Auto-Fill from TMDB API
  const handleSelectTMDBResult = async (item: any) => {
    setIsLoadingDetails(true);
    try {
      const details = await getTMDBMovieDetails(item.id);
      
      const pUrl = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : item.posterUrl;
      const bUrl = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : (pUrl || '');

      setTitleBn(item.title);
      setTitleEn(item.original_title || item.title);
      setPosterUrl(pUrl);
      setBackdropUrl(bUrl);

      // Auto-extract Release Year
      const year = item.release_date ? item.release_date.split('-')[0] : '2024';
      setReleaseYear(year);

      // Auto-extract Rating
      const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : '8.0';
      setRating(voteAvg);

      // Auto-extract Overview / Storyline
      setOverview(item.overview || '');

      // Auto-extract Category
      const autoCat = mapTMDBToCategory(item.original_language, details?.genres);
      setCategory(autoCat);

      // Auto-extract Duration / Runtime
      if (details?.runtime) {
        const h = Math.floor(details.runtime / 60);
        const m = details.runtime % 60;
        setDuration(h > 0 ? `${h}h ${m}m` : `${m}m`);
      } else {
        setDuration('2h 10m');
      }

      // Auto-extract Director & Cast
      if (details?.credits) {
        const dirObj = (details.credits.crew || []).find((c: any) => c.job === 'Director');
        if (dirObj) setDirector(dirObj.name);

        const castArr = (details.credits.cast || []).slice(0, 10).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character || 'Actor',
          profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : getActorAvatarFallback(c.name)
        }));
        setActorsList(castArr);
        setCastNames(castArr.map(a => a.name));
      }

      // Auto-extract All Additional Posters & Backdrops for the Movie Details Carousel
      const extraPosters: string[] = [];
      if (bUrl) extraPosters.push(bUrl);
      if (pUrl && !extraPosters.includes(pUrl)) extraPosters.push(pUrl);

      if (details?.images?.backdrops && details.images.backdrops.length > 0) {
        details.images.backdrops.slice(0, 8).forEach((img: any) => {
          if (img.file_path) {
            const url = `https://image.tmdb.org/t/p/original${img.file_path}`;
            if (!extraPosters.includes(url)) extraPosters.push(url);
          }
        });
      }
      if (details?.images?.posters && details.images.posters.length > 0) {
        details.images.posters.slice(0, 5).forEach((img: any) => {
          if (img.file_path) {
            const url = `https://image.tmdb.org/t/p/w780${img.file_path}`;
            if (!extraPosters.includes(url)) extraPosters.push(url);
          }
        });
      }
      setAdditionalPosters(extraPosters);

      setTmdbResults([]);
    } catch (err) {
      console.error('Failed to load full movie details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Add a manual extra poster URL
  const handleAddExtraPoster = () => {
    if (!newPosterInput.trim()) return;
    if (!additionalPosters.includes(newPosterInput.trim())) {
      setAdditionalPosters(prev => [...prev, newPosterInput.trim()]);
    }
    setNewPosterInput('');
  };

  const handleRemoveExtraPoster = (urlToRemove: string) => {
    setAdditionalPosters(prev => prev.filter(u => u !== urlToRemove));
  };

  // Populate form with existing movie for editing
  const handleStartEditMovie = (movie: MovieItem) => {
    setEditingMovieId(movie.id);
    setTitleBn(movie.titleBn);
    setTitleEn(movie.titleEn);
    setCategory(movie.category);
    setReleaseYear(movie.releaseYear.toString());
    setDuration(movie.duration);
    setRating(movie.rating.toString());
    setDirector(movie.director || '');
    setPosterUrl(movie.posterUrl);
    setBackdropUrl(movie.backdropUrl);
    setOverview(movie.synopsisBn);
    setIsTrending(!!movie.isTrending);
    setIsNew(!!movie.isNew);
    setCastNames(movie.cast || []);
    setActorsList(movie.actors || []);
    
    const existingPosters = Array.from(new Set([
      movie.posterUrl,
      movie.backdropUrl,
      ...(movie.additionalPosters || [])
    ].filter(Boolean)));
    setAdditionalPosters(existingPosters);

    const tgLink = movie.messageId || 
      movie.streamLinks?.find(l => l.type === 'telegram')?.messageId || 
      extractTelegramMessageId(movie.streamLinks?.find(l => l.type === 'telegram')?.url) || 
      movie.streamLinks?.find(l => l.type === 'telegram')?.url || '';
    setTelegramUrl(tgLink);

    setCurrentPage('upload_movie');
  };

  const handleCancelEdit = () => {
    setEditingMovieId(null);
    setTitleBn('');
    setTitleEn('');
    setPosterUrl('');
    setBackdropUrl('');
    setAdditionalPosters([]);
    setTelegramUrl('');
    setSearchQuery('');
    setOverview('');
  };

  // Save new movie or update existing movie
  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim() || !posterUrl.trim()) {
      alert('দয়া করে মুভির নাম এবং পোস্টার লিঙ্ক দিন!');
      return;
    }

    const compiledPosters = Array.from(new Set([
      backdropUrl || posterUrl,
      posterUrl,
      ...additionalPosters
    ].filter(Boolean)));

    const rawTgInput = telegramUrl.trim();
    const extractedMsgId = extractTelegramMessageId(rawTgInput);
    const finalMsgId = extractedMsgId || rawTgInput;

    const moviePayload: MovieItem = {
      id: editingMovieId || `custom-movie-${Date.now()}`,
      titleBn: titleBn.trim(),
      titleEn: titleEn.trim() || titleBn.trim(),
      category: category,
      genres: ['Action', 'Drama', 'Thriller'],
      releaseYear: parseInt(releaseYear.trim(), 10) || 2024,
      duration: duration.trim() || '2h 10m',
      sizeMb: '1.4 GB',
      likesCount: 650,
      downloadsCount: 2100,
      commentsCount: 18,
      rating: parseFloat(rating) || 8.0,
      posterUrl: posterUrl.trim(),
      backdropUrl: backdropUrl.trim() || posterUrl.trim(),
      synopsisBn: overview.trim() || `${titleBn} মুভিটি এখন চমৎকার প্রিন্টে ডাউনলোড ও দেখার জন্য উপলব্ধ।`,
      cast: castNames.length > 0 ? castNames : ['Lead Actor', 'Co-Star'],
      actors: actorsList.length > 0 ? actorsList : [],
      director: director.trim() || 'Famous Director',
      isTrending: Boolean(isTrending),
      isNew: Boolean(isNew),
      additionalPosters: compiledPosters,
      targetLikes: {
        current: 650,
        target: 1000
      },
      messageId: finalMsgId || '',
      streamLinks: [
        {
          serverName: 'Telegram Bot Fast Download',
          quality: '1080p Full HD',
          size: '1.2 GB',
          type: 'telegram',
          messageId: finalMsgId || '2',
          url: rawTgInput.startsWith('http') ? rawTgInput : `https://t.me/c/movie/${finalMsgId || '2'}`
        }
      ],
      comments: []
    };

    if (editingMovieId) {
      onUpdateMovie(moviePayload);
      setSaveSuccessMsg(`'${titleBn}' মুভিটি সফলভাবে আপডেট করা হয়েছে! ✨`);
    } else {
      onAddMovie(moviePayload);
      setSaveSuccessMsg(`'${titleBn}' মুভি সফলভাবে অ্যাপে যুক্ত হয়েছে! 🎉`);
    }

    setTimeout(() => setSaveSuccessMsg(''), 4000);
    handleCancelEdit();
  };

  // Toggle Home Hero Selection
  const toggleHomeHeroMovie = (movieId: string) => {
    let updated: string[];
    if (selectedHomeHeroIds.includes(movieId)) {
      updated = selectedHomeHeroIds.filter(id => id !== movieId);
    } else {
      updated = [...selectedHomeHeroIds, movieId];
    }
    setSelectedHomeHeroIds(updated);
    onUpdateHeroCarousel(updated);
  };

  // Toggle Trending Hero Selection
  const toggleTrendingHeroMovie = (movieId: string) => {
    let updated: string[];
    if (selectedTrendingHeroIds.includes(movieId)) {
      updated = selectedTrendingHeroIds.filter(id => id !== movieId);
    } else {
      updated = [...selectedTrendingHeroIds, movieId];
    }
    setSelectedTrendingHeroIds(updated);
    if (onUpdateTrendingHeroCarousel) {
      onUpdateTrendingHeroCarousel(updated);
    }
  };

  // Toggle Movie Trending Status (Instant Live Toggle)
  const handleToggleMovieTrending = (movie: MovieItem) => {
    const newStatus = !movie.isTrending;
    const updatedMovie: MovieItem = {
      ...movie,
      isTrending: newStatus
    };
    onUpdateMovie(updatedMovie);

    // If making untrending, remove from trending hero carousel too
    if (!newStatus) {
      const updatedHeroes = selectedTrendingHeroIds.filter(id => id !== movie.id);
      setSelectedTrendingHeroIds(updatedHeroes);
      if (onUpdateTrendingHeroCarousel) {
        onUpdateTrendingHeroCarousel(updatedHeroes);
      }
    }
  };

  // Toggle Pinned Movie Status
  const togglePinnedMovie = (movieId: string) => {
    let updated: string[];
    if (selectedPinnedMovieIds.includes(movieId)) {
      updated = selectedPinnedMovieIds.filter(id => id !== movieId);
    } else {
      updated = [...selectedPinnedMovieIds, movieId];
    }
    setSelectedPinnedMovieIds(updated);
    if (onUpdatePinnedMovies) {
      onUpdatePinnedMovies(updated);
    }
  };

  const filteredManageMovies = movies.filter(m => 
    m.titleBn.toLowerCase().includes(manageSearch.toLowerCase()) ||
    m.titleEn.toLowerCase().includes(manageSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(manageSearch.toLowerCase())
  );

  const filteredTrendingMovies = movies.filter(m => 
    m.titleBn.toLowerCase().includes(trendingSearch.toLowerCase()) ||
    m.titleEn.toLowerCase().includes(trendingSearch.toLowerCase())
  );

  const filteredPinnedMovies = movies.filter(m => 
    m.titleBn.toLowerCase().includes(pinnedSearch.toLowerCase()) ||
    m.titleEn.toLowerCase().includes(pinnedSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(pinnedSearch.toLowerCase())
  );

  const totalTrendingCount = movies.filter(m => m.isTrending).length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden"
    >
      {/* 🌟 TOP FIXED ADMIN APP BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 shrink-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {currentPage !== 'dashboard' ? (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">ড্যাশবোর্ড</span>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white">
                {currentPage === 'dashboard' && 'মুভি হাব অ্যাডমিন প্যানেল'}
                {currentPage === 'upload_movie' && (editingMovieId ? 'মুভি এডিট পেইজ' : 'মুভি আপলোড ও TMDB ফেচ')}
                {currentPage === 'customize_hero' && 'হোম হিরো ব্যানার কন্ট্রোল'}
                {currentPage === 'customize_trending' && 'ট্রেন্ডিং ও হট ক্যারোসেল'}
                {currentPage === 'customize_pinned' && '📌 পিন মুভি সেট ও কন্ট্রোল'}
                {currentPage === 'manage_movies' && 'সকল মুভি ম্যানেজমেন্ট'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Full Page Master
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentPage === 'dashboard' ? 'সকল কন্ট্রোল ও সেটিংস পরিচালনা করুন' : 'তাত্ক্ষণিক রিয়েল-টাইম আপডেট'}
            </p>
          </div>
        </div>

        {/* Exit Admin Button */}
        <button
          onClick={onClose}
          className="px-3.5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>অ্যাপে ফিরুন</span>
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* QUICK SUB-NAVIGATION PILLS (When not in dashboard) */}
      {currentPage !== 'dashboard' && (
        <div className="bg-slate-900/50 border-b border-white/10 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 shrink-0"
          >
            🏠 ড্যাশবোর্ড
          </button>
          <button
            onClick={() => setCurrentPage('upload_movie')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              currentPage === 'upload_movie'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>১. আপলোড</span>
          </button>

          <button
            onClick={() => setCurrentPage('customize_hero')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              currentPage === 'customize_hero'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>২. হোম ব্যানার</span>
          </button>

          <button
            onClick={() => setCurrentPage('customize_trending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              currentPage === 'customize_trending'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>৩. ট্রেন্ডিং ({totalTrendingCount})</span>
          </button>

          <button
            onClick={() => setCurrentPage('customize_pinned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              currentPage === 'customize_pinned'
                ? 'bg-yellow-500 text-slate-950 shadow-sm font-black'
                : 'bg-slate-800/80 text-yellow-300 hover:bg-slate-700'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>📌 ৫. পিন মুভি ({selectedPinnedMovieIds.length})</span>
          </button>

          <button
            onClick={() => setCurrentPage('manage_movies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              currentPage === 'manage_movies'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>৪. এডিট/ডিলিট ({movies.length})</span>
          </button>
        </div>
      )}

      {/* 🌟 SCROLLABLE MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* 🌟 MAIN DASHBOARD PAGE (4 DISTINCT INTERACTIVE MODULES) */}
          {/* ======================================================== */}
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">মোট মুভি সংখ্যা</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-white">{movies.length}</span>
                    <span className="text-[10px] text-emerald-400">লাইভ ডাটাবেজ</span>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">হোম ব্যানার একটিভ</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-rose-400">{selectedHomeHeroIds.length}</span>
                    <span className="text-[10px] text-slate-400">স্লাইডার মুভি</span>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">ট্রেন্ডিং মুভি</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-amber-400">{totalTrendingCount}</span>
                    <span className="text-[10px] text-amber-300">হট লিস্ট</span>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">টেলিগ্রাম বট সাপোর্ট</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-sky-400">সক্রিয়</span>
                    <span className="text-[10px] text-sky-300">মিনি অ্যাপ</span>
                  </div>
                </div>
              </div>

              {/* 4 Large Full-Page Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Movie Upload Card */}
                <div
                  onClick={() => setCurrentPage('upload_movie')}
                  className="group p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-500/80 cursor-pointer transition-all hover:shadow-xl hover:shadow-rose-500/10 active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-md">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                        ১. মুভি আপলোড পেইজ
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                        অটো-ফেচ
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      TMDB থেকে এক ক্লিকে সম্পূর্ণ তথ্য, 9:16 পোস্টার, 16:9 ব্যানার ও মাল্টি-পোস্টার ক্যারোসেল সহ নতুন মুভি আপলোড করুন।
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
                    <span>আপলোড পেইজে প্রবেশ করুন</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Hero Carousel Card */}
                <div
                  onClick={() => setCurrentPage('customize_hero')}
                  className="group p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-pink-500/30 hover:border-pink-500/80 cursor-pointer transition-all hover:shadow-xl hover:shadow-pink-500/10 active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-md">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white group-hover:text-pink-300 transition-colors">
                        ২. হোম ব্যানার পেইজ
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                        16:9 Slider
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      হোম পেজের উপরের বড় ১৬:৯ স্লাইডারে কোন কোন মুভিগুলো প্রদর্শন হবে তা টিকচিহ্ন দিয়ে নির্ধারণ করুন।
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-pink-400 group-hover:text-pink-300">
                    <span>ব্যানার পেইজে প্রবেশ করুন</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Trending Manager Card */}
                <div
                  onClick={() => setCurrentPage('customize_trending')}
                  className="group p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-500/80 cursor-pointer transition-all hover:shadow-xl hover:shadow-amber-500/10 active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-md">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                        ৩. ট্রেন্ডিং ও হট ক্যারোসেল
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        {totalTrendingCount} Hot
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      ১-ক্লিকে যেকোনো মুভিকে ট্রেন্ডিং বা আনট্রেন্ডিং করুন এবং ট্রেন্ডিং পেজের টপ ক্যারোসেল ব্যানার কন্ট্রোল করুন।
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>ট্রেন্ডিং পেইজে প্রবেশ করুন</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Edit & Delete Library Manager Card */}
                <div
                  onClick={() => setCurrentPage('manage_movies')}
                  className="group p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-500/80 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-500/10 active:scale-[0.99] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-md">
                      <Edit3 className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                        ৪. মুভি এডিট ও ডিলিট
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        {movies.length} টি মুভি
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      অ্যাপের সকল মুভির তালিকা খুঁজুন, লিঙ্ক বা তথ্য দ্রুত পরিবর্তন করুন অথবা অপ্রয়োজনীয় মুভি ডিলিট করুন।
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    <span>ম্যানেজার পেইজে প্রবেশ করুন</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 5. Set Pinned / Top Movie Manager Card */}
                <div
                  onClick={() => setCurrentPage('customize_pinned')}
                  className="group p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-yellow-500/40 hover:border-yellow-400 cursor-pointer transition-all hover:shadow-xl hover:shadow-yellow-500/10 active:scale-[0.99] flex flex-col justify-between relative overflow-hidden sm:col-span-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-300 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-all shadow-lg shrink-0">
                        <Pin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white group-hover:text-yellow-300 transition-colors">
                            📌 ৫. পিন মুভি সেট ও কন্ট্রোল (Pinned to Top)
                          </h3>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-black border border-yellow-400/40">
                            {selectedPinnedMovieIds.length}টি পিন করা
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                          যেকোনো মুভিকে সবসময় হোম পেজের সকল ইউজারের একদম সবার উপরে পিন করে রাখুন। ১-ক্লিকে যেকোনো সময় অন অথবা অফ করুন।
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 text-xs font-bold flex items-center gap-2 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-all shrink-0">
                      <span>পিন ম্যানেজার খুলুন</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🌟 1. FULL PAGE: MOVIE UPLOAD & TMDB AUTO-FETCH          */}
          {/* ======================================================== */}
          {currentPage === 'upload_movie' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {editingMovieId && (
                <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>আপনি <b>{titleBn}</b> মুভিটি এডিট করছেন</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1 rounded-xl bg-amber-500/30 hover:bg-amber-500 text-white font-bold transition-colors"
                  >
                    নতুন আপলোডে যান
                  </button>
                </div>
              )}

              {/* TMDB Quick Search Box */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>TMDB লাইভ সার্চ (ক্লিক করলেই পোস্টার, ব্যানার ও সকল তথ্য অটো-সিলেক্ট হবে)</span>
                  </label>
                  {isLoadingDetails && (
                    <span className="text-[11px] text-cyan-400 animate-pulse font-bold">
                      লোড হচ্ছে...
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTMDB()}
                    placeholder="যেমন: Toofan, Jawan, Avatar, Demon Slayer, Stranger Things..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleSearchTMDB}
                    disabled={isSearchingTMDB}
                    className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearchingTMDB ? 'খোঁজা হচ্ছে...' : 'সার্চ করুন'}</span>
                  </button>
                </div>

                {/* TMDB Results Dropdown */}
                {tmdbResults.length > 0 && (
                  <div className="max-h-72 overflow-y-auto space-y-2 pt-2 pr-1">
                    <p className="text-[11px] text-slate-400 font-semibold">মুভিটিতে ক্লিক করলে সাথে সাথে সব ফিল্ড পূরণ হবে:</p>
                    {tmdbResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectTMDBResult(item)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
                      >
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-12 h-18 object-cover rounded-xl shrink-0 bg-slate-800 shadow"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            📅 {item.release_date || 'N/A'} • ⭐ {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.0'}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                            {item.overview || 'কোনো বিবরণ নেই'}
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-[11px] font-black group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                          অটো সিলেক্ট
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Form */}
              <form onSubmit={handleSaveMovie} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">মুভির নাম (বাংলা)*</label>
                    <input
                      type="text"
                      required
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                      placeholder="যেমন: তুফান (Toofan)"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">মুভির নাম (English)</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Toofan"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Auto Filled Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">ক্যাটাগরি (Auto)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="bengali">🇧🇩 বাংলা মুভি</option>
                      <option value="bollywood">🇮🇳 বলিউড</option>
                      <option value="hollywood">🇺🇸 হলিউড</option>
                      <option value="south">💥 সাউথ ইন্ডিয়ান</option>
                      <option value="anime">⚡ অ্যানিমে (Anime)</option>
                      <option value="natok">🎭 নাটক</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">মুক্তির সাল (Auto)</label>
                    <input
                      type="text"
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(e.target.value)}
                      placeholder="2024"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">সময়কাল (Auto)</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="2h 15m"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">রেটিং (Auto)</label>
                    <input
                      type="text"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="8.5"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Poster & Backdrop (9:16 & 16:9) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      পোস্টার ইমেজ URL (9:16 বা ২:৩)*
                    </label>
                    <input
                      type="url"
                      required
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://image.tmdb.org/t/p/w780/..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    {posterUrl && (
                      <div className="mt-2 flex items-center gap-2.5 bg-slate-950 p-2 rounded-xl border border-white/10">
                        <img src={posterUrl} alt="Preview" className="w-10 h-14 object-cover rounded-lg border border-white/10" />
                        <span className="text-xs text-emerald-400 font-semibold">✓ ৯:১৬ পোস্টার রেডি</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      হিরো ব্যাকড্রপ ব্যানার (16:9)
                    </label>
                    <input
                      type="url"
                      value={backdropUrl}
                      onChange={(e) => setBackdropUrl(e.target.value)}
                      placeholder="https://image.tmdb.org/t/p/original/..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    {backdropUrl && (
                      <div className="mt-2 flex items-center gap-2.5 bg-slate-950 p-2 rounded-xl border border-white/10">
                        <img src={backdropUrl} alt="Backdrop Preview" className="w-20 h-11 object-cover rounded-lg border border-white/10" />
                        <span className="text-xs text-emerald-400 font-semibold">✓ ১৬:৯ ব্যানার রেডি</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multi-Poster Carousel in Movie Details System */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-rose-500/30 space-y-3">
                  <label className="text-xs font-bold text-rose-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-rose-400" />
                      <span>মুভি ডিটেইলস পেজের ক্যারোসেল পোস্টার সমূহ ({additionalPosters.length}টি)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (অটো-ফেচ বা কাস্টম যোগ)
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPosterInput}
                      onChange={(e) => setNewPosterInput(e.target.value)}
                      placeholder="আরেকটি পোস্টার বা ব্যানারের লিঙ্ক দিন..."
                      className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraPoster}
                      className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shrink-0"
                    >
                      + যোগ করুন
                    </button>
                  </div>

                  {additionalPosters.length > 0 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                      {additionalPosters.map((url, idx) => (
                        <div key={idx} className="relative group shrink-0">
                          <img
                            src={url}
                            alt={`Slide ${idx + 1}`}
                            className="w-18 h-12 object-cover rounded-xl border border-white/15 shadow"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraPoster(url)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telegram Bot Link / Message ID / Hidden Text */}
                <div className="p-4 rounded-3xl bg-sky-950/30 border border-sky-500/40 space-y-2">
                  <label className="text-xs font-bold text-sky-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>✈️ বটের জন্য লুকানো মেসেজ / Message ID (যেমন: #post2 বা 2)</span>
                    </span>
                    <span className="text-[10px] text-sky-300/80 font-normal">
                      (Auto Send to Bot)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="যেমন: #post2 অথবা 2 অথবা /get 2"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <p className="text-[10px] text-sky-200/70">
                    এখানে আপনার প্রাইভেট চ্যানেলের পোস্ট ট্যাগ বা মেসেজ দিন (যেমন: <b>#post2</b> বা <b>2</b>)। ইউজার ডাউনলোডে ক্লিক করলেই স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে এই মেসেজটি বটের ইনবক্সে সেন্ড হয়ে যাবে।
                  </p>
                </div>

                {/* Overview / Storyline */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">মুভির কাহিনি / বিবরণ (Auto)</label>
                  <textarea
                    rows={3}
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    placeholder="মুভির গল্প সংক্ষেপে লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Badges & Checkboxes */}
                <div className="flex flex-wrap gap-4 py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>🔥 ট্রেন্ডিং লিস্টে দেখাও</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span>✨ নতুন মুভি ব্যাজ (NEW)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  {editingMovieId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-1/3 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                    >
                      বাতিল করুন
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black shadow-lg shadow-rose-500/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {editingMovieId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingMovieId ? 'মুভি তথ্য সেভ ও আপডেট করুন' : 'মুভি অ্যাপে আপলোড ও পাবলিশ করুন'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🌟 2. FULL PAGE: HOME HERO CAROUSEL CUSTOMIZER           */}
          {/* ======================================================== */}
          {currentPage === 'customize_hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">হোম পেজের হিরো ক্যারোসেল নির্বাচন</h3>
                  <p className="text-[11px] text-slate-400">
                    যেসব মুভিতে টিকচিহ্ন (Checkmark) থাকবে, সেগুলো হোম পেজের টপ ১৬:৯ স্লাইডারে স্বয়ংক্রিয়ভাবে দেখাবে।
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs shrink-0">
                  সিলেক্টেড: {selectedHomeHeroIds.length}টি
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {movies.map(movie => {
                  const isSelected = selectedHomeHeroIds.includes(movie.id);

                  return (
                    <div
                      key={movie.id}
                      onClick={() => toggleHomeHeroMovie(movie.id)}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/60 text-white shadow-md'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={movie.backdropUrl || movie.posterUrl}
                        alt={movie.titleBn}
                        className="w-20 h-12 object-cover rounded-xl shrink-0 border border-white/10 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{movie.titleBn}</h4>
                        <p className="text-[10px] text-slate-400">{movie.releaseYear} • {movie.category}</p>
                      </div>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🌟 3. FULL PAGE: TRENDING & TRENDING HERO CAROUSEL       */}
          {/* ======================================================== */}
          {currentPage === 'customize_trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>ট্রেন্ডিং মুভি ও ট্রেন্ডিং হট ক্যারোসেল কন্ট্রোল</span>
                  </p>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40">
                    বর্তমানে ট্রেন্ডিং: {totalTrendingCount}টি
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/70">
                  • <b>ট্রেন্ডিং অন/অফ বাটনে</b> চাপ দিয়ে যেকোনো মুভি সাথে সাথে ট্রেন্ডিং বা আনট্রেন্ডিং করুন।<br/>
                  • <b>ক্যারোসেল স্লাইডারে</b> টিকচিহ্ন দিয়ে ট্রেন্ডিং পেজের টপ ব্যানারে সেট করুন।
                </p>
              </div>

              {/* Search in Trending Tab */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={trendingSearch}
                  onChange={(e) => setTrendingSearch(e.target.value)}
                  placeholder="মুভি সার্চ করুন..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Trending Movies Controller List */}
              <div className="space-y-2.5">
                {filteredTrendingMovies.map(movie => {
                  const isTrendingNow = !!movie.isTrending;
                  const isTrendingHero = selectedTrendingHeroIds.includes(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                        isTrendingNow 
                          ? 'bg-amber-950/20 border-amber-500/30' 
                          : 'bg-slate-900 border-white/10 opacity-80'
                      }`}
                    >
                      <img
                        src={movie.posterUrl || movie.backdropUrl}
                        alt={movie.titleBn}
                        className="w-12 h-16 object-cover rounded-xl shrink-0 bg-slate-800 shadow"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{movie.titleBn}</h4>
                          {isTrendingNow && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30 shrink-0 flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 fill-amber-400" />
                              <span>TRENDING</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{movie.titleEn} • {movie.releaseYear}</p>
                        
                        {/* Trending Hero Toggle Checkbox */}
                        {isTrendingNow && (
                          <button
                            type="button"
                            onClick={() => toggleTrendingHeroMovie(movie.id)}
                            className={`mt-1.5 px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                              isTrendingHero
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Check className={`w-3 h-3 ${isTrendingHero ? 'stroke-[3]' : ''}`} />
                            <span>{isTrendingHero ? '✓ ট্রেন্ডিং ব্যানার স্লাইডারে আছে' : '+ ট্রেন্ডিং ব্যানারে যোগ করুন'}</span>
                          </button>
                        )}
                      </div>

                      {/* 1-Click Toggle Trending / Untrending Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleMovieTrending(movie)}
                        className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
                          isTrendingNow
                            ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40'
                            : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40'
                        }`}
                      >
                        {isTrendingNow ? (
                          <>
                            <Flame className="w-3.5 h-3.5" />
                            <span>আনট্রেন্ডিং করুন</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>ট্রেন্ডিং বানান</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🌟 5. FULL PAGE: PINNED MOVIES (TOP OF FEED) MANAGER     */}
          {/* ======================================================== */}
          {currentPage === 'customize_pinned' && (
            <motion.div
              key="pinned"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-3xl bg-yellow-950/30 border border-yellow-500/40 text-xs text-yellow-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-yellow-300 flex items-center gap-2 text-sm">
                    <Pin className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span>📌 পিন মুভি সেট ও কন্ট্রোল (Pinned to Top)</span>
                  </p>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-black text-xs border border-yellow-500/40">
                    বর্তমানে পিন করা: {selectedPinnedMovieIds.length}টি
                  </span>
                </div>
                <p className="text-[11px] text-yellow-200/80 leading-relaxed">
                  • <b>পিন করুন বাটনে</b> চাপ দিলে সেই মুভিটি সকল ইউজারের হোম ফিডের <b>একদম সবার উপরে</b> সর্বদা শো করবে।<br/>
                  • আপনি যেকোনো সময় <b>১-ক্লিক দিয়ে পিন অন অথবা অফ</b> করতে পারবেন।
                </p>
              </div>

              {/* Search in Pinned Tab */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pinnedSearch}
                  onChange={(e) => setPinnedSearch(e.target.value)}
                  placeholder="মুভির নাম লিখে খুঁজুন..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Pinned Movies Controller List */}
              <div className="space-y-2.5">
                {filteredPinnedMovies.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-white/10">
                    কোনো মুভি পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredPinnedMovies.map(movie => {
                    const isPinnedNow = selectedPinnedMovieIds.includes(movie.id);

                    return (
                      <div
                        key={movie.id}
                        className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                          isPinnedNow 
                            ? 'bg-yellow-950/20 border-yellow-500/50 shadow-md shadow-yellow-500/5' 
                            : 'bg-slate-900 border-white/10 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={movie.posterUrl || movie.backdropUrl}
                          alt={movie.titleBn}
                          className="w-12 h-16 object-cover rounded-xl shrink-0 bg-slate-800 shadow"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{movie.titleBn}</h4>
                            {isPinnedNow && (
                              <span className="px-2 py-0.5 rounded-md bg-yellow-400 text-slate-950 text-[9px] font-black shrink-0 flex items-center gap-1 shadow-sm">
                                <Pin className="w-2.5 h-2.5 fill-slate-950" />
                                <span>সবার উপরে পিন করা</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {movie.titleEn} • {movie.releaseYear} • {movie.category}
                          </p>
                          {movie.isNew && (
                            <span className="inline-block mt-1 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              ✨ NEW
                            </span>
                          )}
                        </div>

                        {/* 1-Click Toggle Pin / Unpin Button */}
                        <button
                          type="button"
                          onClick={() => togglePinnedMovie(movie.id)}
                          className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                            isPinnedNow
                              ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40'
                              : 'bg-yellow-500/20 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 border border-yellow-400/40'
                          }`}
                        >
                          {isPinnedNow ? (
                            <>
                              <PinOff className="w-3.5 h-3.5" />
                              <span>আনপিন (অফ) করুন</span>
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5" />
                              <span>📌 সবার উপরে পিন করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🌟 4. FULL PAGE: MANAGE, EDIT & DELETE ALL MOVIES         */}
          {/* ======================================================== */}
          {currentPage === 'manage_movies' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">সকল মুভি এডিট ও ডিলিট</h3>
                  <p className="text-[11px] text-slate-400">মুভির তথ্য, লিঙ্ক পরিবর্তন বা মুছে ফেলার জন্য এডিট বা ডিলিট বাটনে চাপ দিন।</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs shrink-0">
                  মোট: {movies.length} টি মুভি
                </span>
              </div>

              {/* Search Bar inside Manage */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="মুভির নাম বা ক্যাটাগরি লিখে খুঁজুন..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Movies List */}
              <div className="space-y-2.5">
                {filteredManageMovies.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    কোনো মুভি পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredManageMovies.map(movie => {
                    const isDeleting = deleteConfirmId === movie.id;

                    return (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-white/20 transition-all shadow-sm"
                      >
                        <img
                          src={movie.posterUrl || movie.backdropUrl}
                          alt={movie.titleBn}
                          className="w-12 h-16 object-cover rounded-xl shrink-0 bg-slate-800 shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{movie.titleBn}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{movie.titleEn}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-semibold">
                              {movie.releaseYear}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-semibold">
                              {movie.category}
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">
                              ⭐ {movie.rating}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isDeleting ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/80 p-1.5 rounded-xl border border-rose-500/50">
                              <span className="text-[10px] text-rose-300 font-bold px-1">মুছবেন?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteMovie(movie.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors"
                              >
                                হ্যাঁ
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                              >
                                না
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditMovie(movie)}
                                title="এডিট করুন"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(movie.id)}
                                title="ডিলিট করুন"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

    </motion.div>
  );
};
