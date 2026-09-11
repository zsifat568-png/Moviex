import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Film,
  Calendar,
  Star,
  Play,
  Sparkles,
  User,
  MapPin,
  Layers,
  Search,
  CheckCircle,
  Clock,
  Clapperboard,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { MovieItem, MovieActor } from '../types';
import { fetchActorFullDetails, ActorFullDetails, ActorCreditMovie, getActorAvatarFallback } from '../utils/tmdbService';
import { UPCOMING_MOVIES } from '../data/moviesData';

interface ActorMoviesModalProps {
  actor: MovieActor | null;
  isOpen: boolean;
  onClose: () => void;
  allMovies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
}

export const ActorMoviesModal: React.FC<ActorMoviesModalProps> = ({
  actor,
  isOpen,
  onClose,
  allMovies,
  onSelectMovie
}) => {
  const [actorDetails, setActorDetails] = useState<ActorFullDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'uploaded' | 'upcoming' | 'all'>('uploaded');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFullBio, setShowFullBio] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load Actor Full Details from TMDB on open
  useEffect(() => {
    if (!actor || !isOpen) {
      setActorDetails(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setShowFullBio(false);
    setSearchQuery('');

    fetchActorFullDetails(actor.id, actor.name)
      .then((details) => {
        if (!isMounted) return;
        setActorDetails(details);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching actor details:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [actor, isOpen]);

  // Find all movies uploaded on this website where this actor appears
  const uploadedMoviesForActor = useMemo(() => {
    if (!actor || !actor.name) return [];
    const targetName = actor.name.trim().toLowerCase();
    const nameTokens = targetName
      .split(/\s+/)
      .map(t => t.trim())
      .filter(t => t.length >= 3);

    return allMovies.filter((movie) => {
      // 1. Match by TMDB Actor ID if available
      if (actor.id && movie.actors && movie.actors.some(a => a.id === actor.id)) {
        return true;
      }

      // 2. Match in movie.actors list
      if (movie.actors && movie.actors.some(a => {
        const aName = a.name.trim().toLowerCase();
        if (aName === targetName || aName.includes(targetName) || targetName.includes(aName)) return true;
        return nameTokens.some(tok => aName.includes(tok));
      })) {
        return true;
      }

      // 3. Match in movie.cast string array
      if (movie.cast && movie.cast.some(castMember => {
        const cName = castMember.trim().toLowerCase();
        if (cName === targetName || cName.includes(targetName) || targetName.includes(cName)) return true;
        return nameTokens.some(tok => cName.includes(tok));
      })) {
        return true;
      }

      return false;
    });
  }, [actor, allMovies]);

  // Merge TMDB upcoming movies with local unreleased upcoming movies for this actor
  const upcomingMoviesForActor = useMemo(() => {
    const list: ActorCreditMovie[] = actorDetails ? [...actorDetails.upcomingMovies] : [];
    const seenTitles = new Set(list.map(m => m.title.toLowerCase().trim()));

    if (actor?.name) {
      const targetName = actor.name.trim().toLowerCase();
      const localMatches = UPCOMING_MOVIES.filter(m => {
        if (m.isReleased) return false;
        const titleCombined = `${m.title} ${m.titleBn || ''}`.toLowerCase();
        return titleCombined.includes(targetName);
      });

      for (const local of localMatches) {
        if (!seenTitles.has(local.title.toLowerCase().trim())) {
          list.unshift({
            id: local.tmdbId || Math.floor(Math.random() * 90000) + 10000,
            title: local.title,
            original_title: local.titleBn,
            posterUrl: local.poster,
            releaseDate: local.expectedDateFormatted || local.releaseDate || 'TBA (আসন্ন)',
            isUpcoming: true,
            overview: local.overview,
            rating: local.rating
          });
          seenTitles.add(local.title.toLowerCase().trim());
        }
      }
    }

    return list;
  }, [actorDetails, actor]);

  // Automatically select the best initial tab
  useEffect(() => {
    if (!isLoading && actor) {
      if (uploadedMoviesForActor.length > 0) {
        setActiveTab('uploaded');
      } else if (upcomingMoviesForActor.length > 0) {
        setActiveTab('upcoming');
      } else {
        setActiveTab('all');
      }
    }
  }, [isLoading, actor, uploadedMoviesForActor.length, upcomingMoviesForActor.length]);

  if (!isOpen || !actor) return null;

  const actorName = actorDetails?.name || actor.name;
  const avatarUrl = actorDetails?.profileUrl || actor.profileUrl || getActorAvatarFallback(actorName);
  const totalUploaded = uploadedMoviesForActor.length;
  const totalUpcoming = upcomingMoviesForActor.length;
  const totalReleased = actorDetails?.releasedMovies.length || 0;

  // Filter lists based on internal search query
  const filteredUploaded = uploadedMoviesForActor.filter(m =>
    !searchQuery ||
    m.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUpcoming = upcomingMoviesForActor.filter(m =>
    !searchQuery ||
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.original_title && m.original_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredReleased = (actorDetails?.releasedMovies || []).filter(m =>
    !searchQuery ||
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.original_title && m.original_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <div
        id="actor-movies-modal-backdrop"
        className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="actor-movies-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Close Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg shrink-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>অভিনয়শিল্পী প্রোফাইল</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                    Filmography
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  উপলব্ধ ও আসন্ন সকল মুভির তালিকা
                </p>
              </div>
            </div>

            <button
              id="close-actor-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Actor Header Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-950 border border-white/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                {/* Large Glowing Actor Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-rose-500/30 shadow-xl shadow-rose-500/20 bg-slate-800">
                    <img
                      src={avatarUrl}
                      alt={actorName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = getActorAvatarFallback(actorName);
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Actor Info & Bio */}
                <div className="flex-1 space-y-2.5">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {actorName}
                    </h1>
                    {actor.character && (
                      <p className="text-xs sm:text-sm text-rose-400 font-medium">
                        চরিত্র: {actor.character}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 pt-1 text-xs text-slate-300">
                    {actorDetails?.placeOfBirth && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {actorDetails.placeOfBirth}
                      </span>
                    )}
                    {actorDetails?.birthday && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {actorDetails.birthday}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      <Clapperboard className="w-3.5 h-3.5 text-rose-400" />
                      {actorDetails?.knownForDepartment || 'অভিনয়'}
                    </span>
                  </div>

                  {/* Biography Preview */}
                  {actorDetails?.biography && (
                    <div className="pt-2 text-xs sm:text-sm text-slate-300/90 leading-relaxed text-left">
                      <p className={showFullBio ? '' : 'line-clamp-2'}>
                        {actorDetails.biography}
                      </p>
                      {actorDetails.biography.length > 140 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="mt-1 text-xs text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1"
                        >
                          {showFullBio ? (
                            <>সংক্ষিপ্ত করুন <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>বিস্তারিত জীবনী পড়ুন <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stat Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 pt-4 border-t border-white/10 text-center">
                <div
                  onClick={() => setActiveTab('uploaded')}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    activeTab === 'uploaded'
                      ? 'bg-rose-500/20 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">ওয়েবসাইটে আপলোড</p>
                  <p className="text-lg sm:text-xl font-black text-rose-400 mt-0.5">{totalUploaded} টি</p>
                </div>

                <div
                  onClick={() => setActiveTab('upcoming')}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-amber-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">আসন্ন রিলিজ</p>
                  <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{totalUpcoming} টি</p>
                </div>

                <div
                  onClick={() => setActiveTab('all')}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    activeTab === 'all'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">সকল মুভি</p>
                  <p className="text-lg sm:text-xl font-black text-cyan-400 mt-0.5">
                    {isLoading ? '...' : totalReleased > 0 ? `${totalReleased} টি` : '–'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs & Search Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/10 w-full sm:w-auto">
                <button
                  id="tab-uploaded-movies-btn"
                  onClick={() => setActiveTab('uploaded')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'uploaded'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>ওয়েবসাইটে আপলোড ({totalUploaded})</span>
                </button>

                <button
                  id="tab-upcoming-movies-btn"
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'upcoming'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>আসন্ন মুভি ({totalUpcoming})</span>
                </button>

                <button
                  id="tab-all-movies-btn"
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>সকল রিলিজ ({totalReleased})</span>
                </button>
              </div>

              {/* In-modal Filter Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="মুভির নাম দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950/70 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: Uploaded on This Website */}
            {activeTab === 'uploaded' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    {actorName}-এর {filteredUploaded.length} টি মুভি এই ওয়েবসাইটে সরাসরি দেখার জন্য প্রস্তুত
                  </span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> স্ট্রিমিং ও ডাউনলোড উপলব্ধ
                  </span>
                </div>

                {filteredUploaded.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {filteredUploaded.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => {
                          onSelectMovie(movie);
                          onClose();
                        }}
                        className="group/card relative bg-slate-950/60 rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer flex flex-col"
                      >
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                          <img
                            src={movie.posterUrl}
                            alt={movie.titleBn}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                          {/* Category Tag */}
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/90 text-white shadow-md">
                            {movie.category.toUpperCase()}
                          </span>

                          {/* Rating */}
                          <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-300 flex items-center gap-0.5 border border-white/10">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {movie.rating}
                          </span>

                          {/* Hover Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 scale-90 group-hover/card:scale-100 transition-transform">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover/card:text-rose-400 transition-colors">
                              {movie.titleBn}
                            </h3>
                            {movie.titleEn && movie.titleEn !== movie.titleBn && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {movie.titleEn}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                            <span>{movie.releaseYear}</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Download className="w-2.5 h-2.5" /> {movie.sizeMb || 'HD'}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="w-full mt-1 py-1.5 text-[11px] font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm flex items-center justify-center gap-1 group-hover/card:from-rose-600 group-hover/card:to-pink-700 transition-colors"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>মুভি দেখুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/5 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                      <Film className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-300">
                      এই অভিনেতার কোনো মুভি এখনো ওয়েবসাইটে আপলোড করা হয়নি
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      তবে আপনি নিচের <strong className="text-amber-400">আসন্ন রিলিজ</strong> বা <strong className="text-cyan-400">সকল মুভি</strong> ট্যাবে গিয়ে এই অভিনেতার অন্যান্য সিনেমা ও রিলিজ তথ্য দেখতে পারেন।
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={() => setActiveTab('upcoming')}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                      >
                        আসন্ন মুভি দেখুন ({totalUpcoming})
                      </button>
                      <button
                        onClick={() => setActiveTab('all')}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                      >
                        সকল মুভি দেখুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Upcoming Movies */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    {actorName}-এর {filteredUpcoming.length} টি আসন্ন ও মুক্তির অপেক্ষায় থাকা মুভি
                  </span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> রিলিজ ডেট ও তথ্য
                  </span>
                </div>

                {filteredUpcoming.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {filteredUpcoming.map((movie) => (
                      <div
                        key={`upcoming-${movie.id}`}
                        className="relative bg-slate-950/60 rounded-2xl overflow-hidden border border-white/10 flex flex-col group/up hover:border-amber-500/50 transition-all"
                      >
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover/up:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-slate-500">
                              <Clapperboard className="w-8 h-8 mb-1 text-slate-600" />
                              <span className="text-[10px]">পোস্টার শিঘ্রই আসছে</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                          {/* Upcoming Badge */}
                          <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-md">
                            আসন্ন
                          </span>

                          {movie.releaseDate && (
                            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-amber-300 border border-amber-500/20 line-clamp-1">
                              📅 {movie.releaseDate}
                            </span>
                          )}
                        </div>

                        {/* Title & Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover/up:text-amber-400 transition-colors">
                              {movie.title}
                            </h3>
                            {movie.character && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                চরিত্র: {movie.character}
                              </p>
                            )}
                          </div>

                          {movie.overview && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {movie.overview}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-300">
                      কোনো আসন্ন মুভি পাওয়া যায়নি
                    </h4>
                    <p className="text-xs text-slate-400">
                      এই অভিনেতার নতুন কোনো আনরিলিজড মুভি তালিকাভুক্ত নেই।
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: All Released Movies / Filmography */}
            {activeTab === 'all' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    {actorName}-এর {filteredReleased.length} টি মুক্তিপ্রাপ্ত মুভি (TMDB ডাটাবেজ)
                  </span>
                  <span className="text-cyan-400 font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> সম্পূর্ণ ক্যারিয়ার তালিকা
                  </span>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">টিএমডিবি থেকে মুভি তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : filteredReleased.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {filteredReleased.map((movie) => {
                      // Check if this movie exists in our uploaded website movies
                      const matchingUploaded = allMovies.find(
                        (m) =>
                          (m.tmdbId && m.tmdbId === movie.id) ||
                          m.titleEn?.toLowerCase() === movie.title?.toLowerCase() ||
                          m.titleBn?.toLowerCase() === movie.title?.toLowerCase()
                      );

                      return (
                        <div
                          key={`released-${movie.id}`}
                          onClick={() => {
                            if (matchingUploaded) {
                              onSelectMovie(matchingUploaded);
                              onClose();
                            }
                          }}
                          className={`relative bg-slate-950/60 rounded-2xl overflow-hidden border transition-all flex flex-col group/rel ${
                            matchingUploaded
                              ? 'border-rose-500/50 hover:border-rose-400 cursor-pointer shadow-lg shadow-rose-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Poster */}
                          <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-slate-500">
                                <Film className="w-8 h-8 mb-1 text-slate-600" />
                                <span className="text-[10px]">পোস্টার পাওয়া যায়নি</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                            {/* Release Year Tag */}
                            {movie.releaseYear && (
                              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-slate-200 border border-white/10">
                                {movie.releaseYear}
                              </span>
                            )}

                            {/* Available on Site badge if matched */}
                            {matchingUploaded ? (
                              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500 text-white shadow-md flex items-center justify-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-white" /> সাইটে উপলব্ধ
                              </span>
                            ) : movie.rating ? (
                              <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-300 flex items-center gap-0.5 border border-white/10">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {movie.rating}
                              </span>
                            ) : null}
                          </div>

                          {/* Title & Info */}
                          <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1 group-hover/rel:text-cyan-400 transition-colors">
                                {movie.title}
                              </h3>
                              {movie.character && (
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  চরিত্র: {movie.character}
                                </p>
                              )}
                            </div>

                            {matchingUploaded && (
                              <p className="text-[10px] text-rose-400 font-semibold pt-1">
                                ➔ ক্লিক করে সরাসরি দেখুন
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/5 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-300">
                      কোনো মুভি তথ্য পাওয়া যায়নি
                    </h4>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Footer Bar */}
          <div className="px-5 py-3 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Moviee Link Smart Actor Network</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium transition-colors border border-white/10"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
